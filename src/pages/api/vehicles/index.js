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
          return await createVehicle(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'POST']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Vehicles API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Araç listesini getir
async function getVehicles(req, res, db) {
  try {
    const { companyId, driverId, status, type, page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Filtre oluştur
    const filter = {};
    
    // Şirket ID'sine göre filtrele
    if (companyId) {
      filter.companyId = new ObjectId(companyId);
    }
    
    // Sürücü ID'sine göre filtrele
    if (driverId) {
      filter.driverId = new ObjectId(driverId);
    }
    
    // Duruma göre filtrele
    if (status) {
      filter.status = status;
    }
    
    // Araç tipine göre filtrele
    if (type) {
      filter.type = type;
    }
    
    // Arama terimlerine göre filtrele
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { licensePlate: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Yetki kontrolü
    if (req.user.role === 'company') {
      filter.companyId = new ObjectId(req.user.companyId);
    } else if (req.user.role === 'driver') {
      filter.driverId = new ObjectId(req.user.driverId);
    }
    
    // Araçları getir
    const vehicles = await db.collection('vehicles')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    // Toplam sayıyı hesapla
    const total = await db.collection('vehicles').countDocuments(filter);
    
    return res.status(200).json({
      vehicles,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    return res.status(500).json({ error: 'Araç bilgileri getirilirken hata oluştu' });
  }
}

// Yeni araç oluştur
async function createVehicle(req, res, db) {
  try {
    // Sadece şirket ve admin araç ekleyebilir
    if (req.user.role !== 'company' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz bulunmamaktadır' });
    }
    
    const { brand, model, type, year, licensePlate, capacity, driverId, companyId } = req.body;
    
    // Temel bilgileri kontrol et
    if (!brand || !model || !type || !licensePlate) {
      return res.status(400).json({ error: 'Lütfen tüm zorunlu alanları doldurun' });
    }
    
    // Plaka kontrolü
    const existingVehicle = await db.collection('vehicles').findOne({ 
      licensePlate,
      status: { $ne: 'deleted' }
    });
    
    if (existingVehicle) {
      return res.status(400).json({ error: 'Bu plaka numarası ile kayıtlı bir araç zaten var' });
    }
    
    // Şirket kontrolü
    const effectiveCompanyId = req.user.role === 'company' ? req.user.companyId : companyId;
    
    if (!effectiveCompanyId) {
      return res.status(400).json({ error: 'Geçerli bir şirket ID\'si belirtilmelidir' });
    }
    
    if (!ObjectId.isValid(effectiveCompanyId)) {
      return res.status(400).json({ error: 'Geçersiz şirket ID' });
    }
    
    // Şirket kontrolü
    const company = await db.collection('companies').findOne({
      _id: new ObjectId(effectiveCompanyId)
    });
    
    if (!company) {
      return res.status(404).json({ error: 'Belirtilen şirket bulunamadı' });
    }
    
    // Sürücü kontrolü
    let driver = null;
    if (driverId) {
      if (!ObjectId.isValid(driverId)) {
        return res.status(400).json({ error: 'Geçersiz sürücü ID' });
      }
      
      driver = await db.collection('drivers').findOne({
        _id: new ObjectId(driverId),
        companyId: new ObjectId(effectiveCompanyId)
      });
      
      if (!driver) {
        return res.status(404).json({ error: 'Belirtilen sürücü bulunamadı veya bu şirkete ait değil' });
      }
    }
    
    // Araç bilgilerini hazırla
    const vehicleData = {
      brand,
      model,
      type,
      licensePlate,
      companyId: new ObjectId(effectiveCompanyId),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Opsiyonel alanları ekle
    if (year) vehicleData.year = parseInt(year);
    if (capacity) vehicleData.capacity = parseFloat(capacity);
    if (driver) vehicleData.driverId = new ObjectId(driverId);
    
    // Aracı veritabanına ekle
    const result = await db.collection('vehicles').insertOne(vehicleData);
    
    return res.status(201).json({
      success: true,
      vehicleId: result.insertedId,
      message: 'Araç başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    return res.status(500).json({ error: 'Araç oluşturulurken hata oluştu' });
  }
} 