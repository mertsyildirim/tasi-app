import { connectToDatabase } from '@/lib/mongodb';
import { authMiddleware } from '@/middleware/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    await authMiddleware(req, res, async () => {
      const { method } = req;
      const { db } = await connectToDatabase();

      switch (method) {
        case 'GET':
          return await getVehicle(req, res, db);
        case 'PUT':
          return await updateVehicle(req, res, db);
        case 'DELETE':
          return await deleteVehicle(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Vehicle API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Araç bilgilerini getir
async function getVehicle(req, res, db) {
  try {
    const { id } = req.query;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz araç ID' });
    }
    
    const vehicle = await db.collection('vehicles').findOne({
      _id: new ObjectId(id)
    });
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }
    
    // Yetki kontrolü
    if (req.user.role === 'company' && vehicle.companyId.toString() !== req.user.companyId) {
      return res.status(403).json({ error: 'Bu araç bilgilerine erişim izniniz yok' });
    }
    
    if (req.user.role === 'driver' && (!vehicle.driverId || vehicle.driverId.toString() !== req.user.driverId)) {
      return res.status(403).json({ error: 'Bu araç bilgilerine erişim izniniz yok' });
    }
    
    // Araç sahibi şirket bilgisini getir
    let company = null;
    if (vehicle.companyId) {
      company = await db.collection('companies').findOne({ 
        _id: new ObjectId(vehicle.companyId) 
      }, { 
        projection: { name: 1, email: 1, phone: 1 } 
      });
    }
    
    // Sürücü bilgisini getir
    let driver = null;
    if (vehicle.driverId) {
      driver = await db.collection('drivers').findOne({
        _id: new ObjectId(vehicle.driverId)
      }, {
        projection: { name: 1, surname: 1, email: 1, phone: 1, licenseInfo: 1 }
      });
    }
    
    // İstatistikler
    const transports = await db.collection('transport_requests').find({
      vehicleId: new ObjectId(id)
    }).toArray();
    
    const stats = {
      totalTransports: transports.length,
      completedTransports: transports.filter(t => t.status === 'completed').length,
      activeTransports: transports.filter(t => ['accepted', 'in_progress'].includes(t.status)).length,
      cancelledTransports: transports.filter(t => t.status === 'cancelled').length
    };
    
    return res.status(200).json({
      vehicle,
      company,
      driver,
      stats
    });
  } catch (error) {
    console.error('Get vehicle error:', error);
    return res.status(500).json({ error: 'Araç bilgileri getirilirken hata oluştu' });
  }
}

// Araç bilgilerini güncelle
async function updateVehicle(req, res, db) {
  try {
    const { id } = req.query;
    const updateData = req.body;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz araç ID' });
    }
    
    // Aracı kontrol et
    const vehicle = await db.collection('vehicles').findOne({
      _id: new ObjectId(id)
    });
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }
    
    // Yetki kontrolü
    if (req.user.role === 'company' && vehicle.companyId.toString() !== req.user.companyId) {
      return res.status(403).json({ error: 'Bu aracı güncelleme izniniz yok' });
    }
    
    if (req.user.role === 'driver') {
      return res.status(403).json({ error: 'Sürücüler araç bilgilerini güncelleyemez' });
    }
    
    // Plaka değişikliği varsa kontrol et
    if (updateData.licensePlate && updateData.licensePlate !== vehicle.licensePlate) {
      const existingVehicle = await db.collection('vehicles').findOne({
        licensePlate: updateData.licensePlate,
        _id: { $ne: new ObjectId(id) },
        status: { $ne: 'deleted' }
      });
      
      if (existingVehicle) {
        return res.status(400).json({ error: 'Bu plaka numarası başka bir araç tarafından kullanılıyor' });
      }
    }
    
    // Güncelleme verilerini hazırla
    const vehicleUpdate = {
      $set: {
        updatedAt: new Date()
      }
    };
    
    // İzin verilen alanları güncelle
    const allowedFields = [
      'brand', 'model', 'type', 'year', 'licensePlate', 
      'capacity', 'status', 'specifications', 'maintenanceInfo'
    ];
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'year' && updateData[field]) {
          vehicleUpdate.$set[field] = parseInt(updateData[field]);
        } else if (field === 'capacity' && updateData[field]) {
          vehicleUpdate.$set[field] = parseFloat(updateData[field]);
        } else {
          vehicleUpdate.$set[field] = updateData[field];
        }
      }
    });
    
    // Sadece admin şirket veya sürücü değiştirebilir
    if (req.user.role === 'admin') {
      if (updateData.companyId && ObjectId.isValid(updateData.companyId)) {
        vehicleUpdate.$set.companyId = new ObjectId(updateData.companyId);
      }
      
      if (updateData.driverId) {
        if (updateData.driverId === null) {
          vehicleUpdate.$set.driverId = null;
        } else if (ObjectId.isValid(updateData.driverId)) {
          const driver = await db.collection('drivers').findOne({
            _id: new ObjectId(updateData.driverId)
          });
          
          if (!driver) {
            return res.status(404).json({ error: 'Belirtilen sürücü bulunamadı' });
          }
          
          vehicleUpdate.$set.driverId = new ObjectId(updateData.driverId);
        } else {
          return res.status(400).json({ error: 'Geçersiz sürücü ID' });
        }
      }
    } else if (req.user.role === 'company') {
      if (updateData.driverId) {
        if (updateData.driverId === null) {
          vehicleUpdate.$set.driverId = null;
        } else if (ObjectId.isValid(updateData.driverId)) {
          const driver = await db.collection('drivers').findOne({
            _id: new ObjectId(updateData.driverId),
            companyId: new ObjectId(req.user.companyId)
          });
          
          if (!driver) {
            return res.status(404).json({ error: 'Belirtilen sürücü bulunamadı veya bu şirkete ait değil' });
          }
          
          vehicleUpdate.$set.driverId = new ObjectId(updateData.driverId);
        } else {
          return res.status(400).json({ error: 'Geçersiz sürücü ID' });
        }
      }
    }
    
    // Aracı güncelle
    const result = await db.collection('vehicles').updateOne(
      { _id: new ObjectId(id) },
      vehicleUpdate
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Araç güncellenemedi' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Araç bilgileri başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    return res.status(500).json({ error: 'Araç güncellenirken hata oluştu' });
  }
}

// Aracı sil
async function deleteVehicle(req, res, db) {
  try {
    const { id } = req.query;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz araç ID' });
    }
    
    // Aracı kontrol et
    const vehicle = await db.collection('vehicles').findOne({
      _id: new ObjectId(id)
    });
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }
    
    // Yetki kontrolü
    if (req.user.role === 'company' && vehicle.companyId.toString() !== req.user.companyId) {
      return res.status(403).json({ error: 'Bu aracı silme izniniz yok' });
    }
    
    if (req.user.role === 'driver') {
      return res.status(403).json({ error: 'Sürücüler araç silemez' });
    }
    
    // Aracın aktif taşıması var mı kontrol et
    const activeTransport = await db.collection('transport_requests').findOne({
      vehicleId: new ObjectId(id),
      status: { $in: ['accepted', 'in_progress'] }
    });
    
    if (activeTransport) {
      return res.status(400).json({ error: 'Aktif taşıma isteği olan araç silinemez' });
    }
    
    // Fiziksel silme yerine durum güncellemesi yapabilirsiniz
    const result = await db.collection('vehicles').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: 'deleted',
          driverId: null,
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Araç silinemedi' });
    }
    
    // Araç ile ilişkili taşıma isteklerini güncelle
    await db.collection('transport_requests').updateMany(
      { vehicleId: new ObjectId(id) },
      { $set: { vehicleId: null, updatedAt: new Date() } }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Araç başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return res.status(500).json({ error: 'Araç silinirken hata oluştu' });
  }
} 