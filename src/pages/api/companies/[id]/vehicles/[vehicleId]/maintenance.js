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
          return await getMaintenanceRecords(req, res, db);
        case 'POST':
          return await addMaintenanceRecord(req, res, db);
        case 'PUT':
          return await updateMaintenanceRecord(req, res, db);
        case 'DELETE':
          return await deleteMaintenanceRecord(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Vehicle maintenance API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Bakım kayıtlarını getir
async function getMaintenanceRecords(req, res, db) {
  try {
    const { id, vehicleId } = req.query;
    const { role, id: userId } = req.user;
    const { status, startDate, endDate, limit = 50 } = req.query;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Şirket ve araç kontrolü
    const company = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    });

    if (!company) {
      return res.status(404).json({ error: 'Şirket bulunamadı' });
    }

    const vehicle = await db.collection('vehicles').findOne({
      _id: new ObjectId(vehicleId),
      companyId: new ObjectId(id)
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && company.userId?.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Bu aracın bakım kayıtlarını görüntüleme yetkiniz yok' });
    }

    // Filtreleri oluştur
    const query = {
      vehicleId: new ObjectId(vehicleId)
    };

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Bakım kayıtlarını getir
    const maintenanceRecords = await db.collection('vehicle_maintenance')
      .find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .toArray();

    // Yaklaşan bakımları hesapla
    const upcomingMaintenance = await db.collection('vehicle_maintenance')
      .find({
        vehicleId: new ObjectId(vehicleId),
        date: { $gt: new Date() },
        status: 'scheduled'
      })
      .sort({ date: 1 })
      .limit(5)
      .toArray();

    // Toplam maliyeti hesapla
    const totalCost = maintenanceRecords
      .filter(record => record.status === 'completed')
      .reduce((sum, record) => sum + (record.cost || 0), 0);

    return res.status(200).json({
      records: maintenanceRecords,
      metadata: {
        total: maintenanceRecords.length,
        totalCost,
        upcomingMaintenance,
        lastMaintenance: maintenanceRecords.find(r => r.status === 'completed'),
        nextMaintenance: upcomingMaintenance[0] || null
      }
    });
  } catch (error) {
    console.error('Get maintenance records error:', error);
    return res.status(500).json({ error: 'Bakım kayıtları getirilirken hata oluştu' });
  }
}

// Yeni bakım kaydı ekle
async function addMaintenanceRecord(req, res, db) {
  try {
    const { id, vehicleId } = req.query;
    const { role, id: userId } = req.user;
    const maintenanceData = req.body;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Zorunlu alanları kontrol et
    const requiredFields = ['type', 'description', 'date', 'cost'];
    const missingFields = requiredFields.filter(field => !maintenanceData[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Eksik alanlar var',
        fields: missingFields
      });
    }

    // Şirket ve araç kontrolü
    const company = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    });

    if (!company) {
      return res.status(404).json({ error: 'Şirket bulunamadı' });
    }

    const vehicle = await db.collection('vehicles').findOne({
      _id: new ObjectId(vehicleId),
      companyId: new ObjectId(id)
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && company.userId?.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Bu araca bakım kaydı ekleme yetkiniz yok' });
    }

    // Bakım durumunu belirle
    const maintenanceDate = new Date(maintenanceData.date);
    const status = maintenanceDate > new Date() ? 'scheduled' : 'completed';

    // Yeni bakım kaydı oluştur
    const newMaintenance = {
      vehicleId: new ObjectId(vehicleId),
      companyId: new ObjectId(id),
      type: maintenanceData.type,
      description: maintenanceData.description,
      date: maintenanceDate,
      cost: parseFloat(maintenanceData.cost),
      status,
      notes: maintenanceData.notes || '',
      provider: maintenanceData.provider || '',
      documents: maintenanceData.documents || [],
      createdAt: new Date(),
      createdBy: new ObjectId(userId),
      updatedAt: new Date(),
      updatedBy: new ObjectId(userId)
    };

    // Bakım kaydını ekle
    const result = await db.collection('vehicle_maintenance')
      .insertOne(newMaintenance);

    if (!result.insertedId) {
      return res.status(400).json({ error: 'Bakım kaydı eklenemedi' });
    }

    // Aracın bakım bilgilerini güncelle
    if (status === 'completed') {
      await db.collection('vehicles').updateOne(
        { _id: new ObjectId(vehicleId) },
        {
          $set: {
            lastMaintenance: {
              date: maintenanceDate,
              type: maintenanceData.type
            },
            updatedAt: new Date()
          }
        }
      );
    }

    return res.status(201).json({
      message: 'Bakım kaydı başarıyla eklendi',
      maintenance: newMaintenance
    });
  } catch (error) {
    console.error('Add maintenance record error:', error);
    return res.status(500).json({ error: 'Bakım kaydı eklenirken hata oluştu' });
  }
}

// Bakım kaydını güncelle
async function updateMaintenanceRecord(req, res, db) {
  try {
    const { id, vehicleId } = req.query;
    const { maintenanceId } = req.body;
    const { role, id: userId } = req.user;
    const updateData = req.body;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(vehicleId) || !ObjectId.isValid(maintenanceId)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Şirket ve araç kontrolü
    const company = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    });

    if (!company) {
      return res.status(404).json({ error: 'Şirket bulunamadı' });
    }

    const vehicle = await db.collection('vehicles').findOne({
      _id: new ObjectId(vehicleId),
      companyId: new ObjectId(id)
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && company.userId?.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Bu bakım kaydını güncelleme yetkiniz yok' });
    }

    // Bakım kaydını kontrol et
    const existingMaintenance = await db.collection('vehicle_maintenance').findOne({
      _id: new ObjectId(maintenanceId),
      vehicleId: new ObjectId(vehicleId)
    });

    if (!existingMaintenance) {
      return res.status(404).json({ error: 'Bakım kaydı bulunamadı' });
    }

    // Güncellenecek alanları hazırla
    const updateFields = {};
    ['type', 'description', 'date', 'cost', 'status', 'notes', 'provider', 'documents']
      .forEach(field => {
        if (updateData[field] !== undefined) {
          updateFields[field] = field === 'date' ? new Date(updateData[field]) :
            field === 'cost' ? parseFloat(updateData[field]) :
            updateData[field];
        }
      });

    // Bakım kaydını güncelle
    const result = await db.collection('vehicle_maintenance').updateOne(
      { _id: new ObjectId(maintenanceId) },
      {
        $set: {
          ...updateFields,
          updatedAt: new Date(),
          updatedBy: new ObjectId(userId)
        }
      }
    );

    if (!result.modifiedCount) {
      return res.status(400).json({ error: 'Bakım kaydı güncellenemedi' });
    }

    // Eğer tamamlanmış bir bakımsa ve tarih en sonuncu ise aracın son bakım bilgisini güncelle
    if (updateFields.status === 'completed' || (existingMaintenance.status === 'completed' && updateFields.date)) {
      const lastMaintenance = await db.collection('vehicle_maintenance')
        .findOne(
          {
            vehicleId: new ObjectId(vehicleId),
            status: 'completed'
          },
          { sort: { date: -1 } }
        );

      if (lastMaintenance?._id.toString() === maintenanceId) {
        await db.collection('vehicles').updateOne(
          { _id: new ObjectId(vehicleId) },
          {
            $set: {
              lastMaintenance: {
                date: lastMaintenance.date,
                type: lastMaintenance.type
              },
              updatedAt: new Date()
            }
          }
        );
      }
    }

    return res.status(200).json({
      message: 'Bakım kaydı başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Update maintenance record error:', error);
    return res.status(500).json({ error: 'Bakım kaydı güncellenirken hata oluştu' });
  }
}

// Bakım kaydını sil
async function deleteMaintenanceRecord(req, res, db) {
  try {
    const { id, vehicleId } = req.query;
    const { maintenanceId } = req.body;
    const { role, id: userId } = req.user;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(vehicleId) || !ObjectId.isValid(maintenanceId)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Şirket ve araç kontrolü
    const company = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    });

    if (!company) {
      return res.status(404).json({ error: 'Şirket bulunamadı' });
    }

    const vehicle = await db.collection('vehicles').findOne({
      _id: new ObjectId(vehicleId),
      companyId: new ObjectId(id)
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && company.userId?.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Bu bakım kaydını silme yetkiniz yok' });
    }

    // Bakım kaydını kontrol et
    const maintenance = await db.collection('vehicle_maintenance').findOne({
      _id: new ObjectId(maintenanceId),
      vehicleId: new ObjectId(vehicleId)
    });

    if (!maintenance) {
      return res.status(404).json({ error: 'Bakım kaydı bulunamadı' });
    }

    // Bakım kaydını sil
    const result = await db.collection('vehicle_maintenance').deleteOne({
      _id: new ObjectId(maintenanceId)
    });

    if (!result.deletedCount) {
      return res.status(400).json({ error: 'Bakım kaydı silinemedi' });
    }

    // Eğer silinen kayıt son bakım kaydı ise aracın son bakım bilgisini güncelle
    if (maintenance.status === 'completed') {
      const lastMaintenance = await db.collection('vehicle_maintenance')
        .findOne(
          {
            vehicleId: new ObjectId(vehicleId),
            status: 'completed',
            _id: { $ne: new ObjectId(maintenanceId) }
          },
          { sort: { date: -1 } }
        );

      await db.collection('vehicles').updateOne(
        { _id: new ObjectId(vehicleId) },
        {
          $set: {
            lastMaintenance: lastMaintenance ? {
              date: lastMaintenance.date,
              type: lastMaintenance.type
            } : null,
            updatedAt: new Date()
          }
        }
      );
    }

    return res.status(200).json({
      message: 'Bakım kaydı başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete maintenance record error:', error);
    return res.status(500).json({ error: 'Bakım kaydı silinirken hata oluştu' });
  }
} 