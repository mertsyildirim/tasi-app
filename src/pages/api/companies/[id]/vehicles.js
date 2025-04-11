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
          return await getVehicles(req, res, db);
        case 'POST':
          return await addVehicle(req, res, db);
        case 'PUT':
          return await updateVehicle(req, res, db);
        case 'DELETE':
          return await deleteVehicle(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Company vehicles API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Araçları getir
async function getVehicles(req, res, db) {
  try {
    const { id } = req.query;
    const { page = 1, limit = 10, status, search } = req.query;
    const { role, id: userId } = req.user;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz şirket ID' });
    }

    // Şirket kontrolü
    const company = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    });

    if (!company) {
      return res.status(404).json({ error: 'Şirket bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && company.userId?.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Bu şirketin araçlarını görüntüleme yetkiniz yok' });
    }

    const skip = (page - 1) * limit;
    const query = { companyId: new ObjectId(id) };

    // Durum filtresi
    if (status && status !== 'all') {
      query.status = status;
    }

    // Arama filtresi
    if (search) {
      query.$or = [
        { plate: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    }

    const vehicles = await db.collection('vehicles')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('vehicles')
      .countDocuments(query);

    // Sürücü bilgilerini ekle
    const vehiclesWithDriver = await Promise.all(vehicles.map(async (vehicle) => {
      const driver = await db.collection('drivers').findOne(
        { vehicleId: vehicle._id },
        { projection: { name: 1, phone: 1, licenseNumber: 1 } }
      );
      return {
        ...vehicle,
        driver: driver || null
      };
    }));

    return res.status(200).json({
      vehicles: vehiclesWithDriver,
      metadata: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    return res.status(500).json({ error: 'Araçlar getirilirken hata oluştu' });
  }
}

// Yeni araç ekle
async function addVehicle(req, res, db) {
  try {
    const { id } = req.query;
    const { role, id: userId } = req.user;
    const vehicleData = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz şirket ID' });
    }

    // Zorunlu alanları kontrol et
    const requiredFields = ['plate', 'brand', 'model', 'type', 'capacity', 'year'];
    const missingFields = requiredFields.filter(field => !vehicleData[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Eksik alanlar var',
        fields: missingFields
      });
    }

    // Şirket kontrolü
    const company = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    });

    if (!company) {
      return res.status(404).json({ error: 'Şirket bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && company.userId?.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Bu şirkete araç ekleme yetkiniz yok' });
    }

    // Plaka benzersiz olmalı
    const existingVehicle = await db.collection('vehicles').findOne({
      plate: vehicleData.plate.toUpperCase()
    });

    if (existingVehicle) {
      return res.status(400).json({ error: 'Bu plaka ile kayıtlı bir araç zaten var' });
    }

    // Yeni araç oluştur
    const newVehicle = {
      ...vehicleData,
      plate: vehicleData.plate.toUpperCase(),
      companyId: new ObjectId(id),
      status: 'active',
      lastMaintenance: null,
      nextMaintenance: null,
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('vehicles').insertOne(newVehicle);

    if (!result.insertedId) {
      return res.status(400).json({ error: 'Araç eklenemedi' });
    }

    return res.status(201).json({
      message: 'Araç başarıyla eklendi',
      vehicle: newVehicle
    });
  } catch (error) {
    console.error('Add vehicle error:', error);
    return res.status(500).json({ error: 'Araç eklenirken hata oluştu' });
  }
}

// Araç güncelle
async function updateVehicle(req, res, db) {
  try {
    const { id } = req.query;
    const { vehicleId, ...updateData } = req.body;
    const { role, id: userId } = req.user;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Şirket kontrolü
    const company = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    });

    if (!company) {
      return res.status(404).json({ error: 'Şirket bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && company.userId?.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Bu aracı güncelleme yetkiniz yok' });
    }

    // Aracı bul
    const vehicle = await db.collection('vehicles').findOne({
      _id: new ObjectId(vehicleId),
      companyId: new ObjectId(id)
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }

    // Plaka değişmişse benzersizlik kontrolü
    if (updateData.plate && updateData.plate.toUpperCase() !== vehicle.plate) {
      const existingVehicle = await db.collection('vehicles').findOne({
        plate: updateData.plate.toUpperCase(),
        _id: { $ne: new ObjectId(vehicleId) }
      });

      if (existingVehicle) {
        return res.status(400).json({ error: 'Bu plaka ile kayıtlı başka bir araç var' });
      }
      updateData.plate = updateData.plate.toUpperCase();
    }

    // Aracı güncelle
    const result = await db.collection('vehicles').updateOne(
      { _id: new ObjectId(vehicleId) },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: 'Araç güncellenemedi' });
    }

    return res.status(200).json({
      message: 'Araç başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    return res.status(500).json({ error: 'Araç güncellenirken hata oluştu' });
  }
}

// Araç sil
async function deleteVehicle(req, res, db) {
  try {
    const { id } = req.query;
    const { vehicleId } = req.body;
    const { role, id: userId } = req.user;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Şirket kontrolü
    const company = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    });

    if (!company) {
      return res.status(404).json({ error: 'Şirket bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && company.userId?.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Bu aracı silme yetkiniz yok' });
    }

    // Aktif sürücü kontrolü
    const activeDriver = await db.collection('drivers').findOne({
      vehicleId: new ObjectId(vehicleId),
      status: 'active'
    });

    if (activeDriver) {
      return res.status(400).json({ error: 'Bu araca atanmış aktif sürücü var. Önce sürücüyü başka bir araca atayın.' });
    }

    // Aktif taşıma kontrolü
    const activeTransport = await db.collection('transports').findOne({
      vehicleId: new ObjectId(vehicleId),
      status: { $in: ['pending', 'in_progress'] }
    });

    if (activeTransport) {
      return res.status(400).json({ error: 'Aktif taşıması olan araç silinemez' });
    }

    // Aracı sil
    const result = await db.collection('vehicles').deleteOne({
      _id: new ObjectId(vehicleId),
      companyId: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(400).json({ error: 'Araç silinemedi' });
    }

    return res.status(200).json({
      message: 'Araç başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return res.status(500).json({ error: 'Araç silinirken hata oluştu' });
  }
} 