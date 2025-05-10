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
          return await getDriver(req, res, db);
        case 'PUT':
          return await updateDriver(req, res, db);
        case 'DELETE':
          return await deleteDriver(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Driver API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Sürücü bilgilerini getir
async function getDriver(req, res, db) {
  try {
    const { id } = req.query;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz sürücü ID' });
    }
    
    const driver = await db.collection('drivers').findOne({
      _id: new ObjectId(id)
    });
    
    if (!driver) {
      return res.status(404).json({ error: 'Sürücü bulunamadı' });
    }
    
    // Yetki kontrolü
    if (req.user.role === 'company' && driver.companyId.toString() !== req.user.companyId) {
      return res.status(403).json({ error: 'Bu sürücü bilgilerine erişim izniniz yok' });
    }
    
    // İstatistikler
    const transports = await db.collection('transport_requests').find({
      driverId: new ObjectId(id)
    }).toArray();
    
    const stats = {
      totalTransports: transports.length,
      completedTransports: transports.filter(t => t.status === 'completed').length,
      activeTransports: transports.filter(t => ['accepted', 'in_progress'].includes(t.status)).length,
      cancelledTransports: transports.filter(t => t.status === 'cancelled').length
    };
    
    // Şirket bilgisini getir
    let company = null;
    if (driver.companyId) {
      company = await db.collection('companies').findOne({ 
        _id: new ObjectId(driver.companyId) 
      }, { 
        projection: { name: 1, email: 1, phone: 1 } 
      });
    }
    
    // Sürücünün kullandığı araçları getir
    const vehicles = await db.collection('vehicles').find({
      driverId: new ObjectId(id)
    }).toArray();
    
    return res.status(200).json({
      driver,
      company,
      vehicles,
      stats
    });
  } catch (error) {
    console.error('Get driver error:', error);
    return res.status(500).json({ error: 'Sürücü bilgileri getirilirken hata oluştu' });
  }
}

// Sürücü bilgilerini güncelle
async function updateDriver(req, res, db) {
  try {
    const { id } = req.query;
    const updateData = req.body;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz sürücü ID' });
    }
    
    // Sürücüyü kontrol et
    const driver = await db.collection('drivers').findOne({
      _id: new ObjectId(id)
    });
    
    if (!driver) {
      return res.status(404).json({ error: 'Sürücü bulunamadı' });
    }
    
    // Yetki kontrolü
    if (req.user.role === 'company' && driver.companyId.toString() !== req.user.companyId) {
      return res.status(403).json({ error: 'Bu sürücüyü güncelleme izniniz yok' });
    }
    
    // Email değişikliği varsa kontrol et
    if (updateData.email && updateData.email !== driver.email) {
      const existingDriver = await db.collection('drivers').findOne({
        email: updateData.email,
        _id: { $ne: new ObjectId(id) }
      });
      
      if (existingDriver) {
        return res.status(400).json({ error: 'Bu email adresi zaten başka bir sürücü tarafından kullanılıyor' });
      }
    }
    
    // Güncelleme verilerini hazırla
    const driverUpdate = {
      $set: {
        updatedAt: new Date()
      }
    };
    
    // İzin verilen alanları güncelle
    const allowedFields = [
      'name', 'surname', 'email', 'phone', 'licenseInfo', 
      'address', 'birthDate', 'status', 'emergencyContact'
    ];
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'birthDate' && updateData[field]) {
          driverUpdate.$set[field] = new Date(updateData[field]);
        } else {
          driverUpdate.$set[field] = updateData[field];
        }
      }
    });
    
    // Sadece admin şirket değiştirebilir
    if (req.user.role === 'admin' && updateData.companyId) {
      if (ObjectId.isValid(updateData.companyId)) {
        driverUpdate.$set.companyId = new ObjectId(updateData.companyId);
      } else {
        return res.status(400).json({ error: 'Geçersiz şirket ID' });
      }
    }
    
    // Sürücüyü güncelle
    const result = await db.collection('drivers').updateOne(
      { _id: new ObjectId(id) },
      driverUpdate
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Sürücü güncellenemedi' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Sürücü bilgileri başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Update driver error:', error);
    return res.status(500).json({ error: 'Sürücü güncellenirken hata oluştu' });
  }
}

// Sürücüyü sil
async function deleteDriver(req, res, db) {
  try {
    const { id } = req.query;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz sürücü ID' });
    }
    
    // Sürücüyü kontrol et
    const driver = await db.collection('drivers').findOne({
      _id: new ObjectId(id)
    });
    
    if (!driver) {
      return res.status(404).json({ error: 'Sürücü bulunamadı' });
    }
    
    // Yetki kontrolü
    if (req.user.role === 'company' && driver.companyId.toString() !== req.user.companyId) {
      return res.status(403).json({ error: 'Bu sürücüyü silme izniniz yok' });
    }
    
    // Sürücünün aktif taşıması var mı kontrol et
    const activeTransport = await db.collection('transport_requests').findOne({
      driverId: new ObjectId(id),
      status: { $in: ['accepted', 'in_progress'] }
    });
    
    if (activeTransport) {
      return res.status(400).json({ error: 'Aktif taşıma isteği olan sürücü silinemez' });
    }
    
    // Sürücüyü sil
    const result = await db.collection('drivers').deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Sürücü silinemedi' });
    }
    
    // Sürücüye ait taşıma isteklerini ve araç bilgilerini güncelle
    await Promise.all([
      // Sürücünün taşıma isteklerini güncelle
      db.collection('transport_requests').updateMany(
        { driverId: new ObjectId(id) },
        { $set: { driverId: null, updatedAt: new Date() } }
      ),
      
      // Sürücünün araçlarını güncelle
      db.collection('vehicles').updateMany(
        { driverId: new ObjectId(id) },
        { $set: { driverId: null, updatedAt: new Date() } }
      )
    ]);
    
    return res.status(200).json({
      success: true,
      message: 'Sürücü başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete driver error:', error);
    return res.status(500).json({ error: 'Sürücü silinirken hata oluştu' });
  }
} 