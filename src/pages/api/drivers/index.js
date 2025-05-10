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
          return await getDrivers(req, res, db);
        case 'POST':
          return await createDriver(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'POST']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Drivers API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Sürücü listesini getir
async function getDrivers(req, res, db) {
  try {
    const { companyId, status, page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Filtre oluştur
    const filter = {};
    
    // Şirket ID'sine göre filtrele
    if (companyId) {
      filter.companyId = new ObjectId(companyId);
    }
    
    // Duruma göre filtrele
    if (status) {
      filter.status = status;
    }
    
    // Arama terimlerine göre filtrele
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { surname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { 'licenseInfo.licenseNumber': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Yetki kontrolü - Admin her şeyi görebilir, şirket sadece kendi sürücülerini görebilir
    if (req.user.role === 'company') {
      filter.companyId = new ObjectId(req.user.companyId);
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz bulunmamaktadır' });
    }
    
    // Sürücüleri getir
    const drivers = await db.collection('drivers')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    // Toplam sayıyı hesapla
    const total = await db.collection('drivers').countDocuments(filter);
    
    return res.status(200).json({
      drivers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get drivers error:', error);
    return res.status(500).json({ error: 'Sürücü bilgileri getirilirken hata oluştu' });
  }
}

// Yeni sürücü oluştur
async function createDriver(req, res, db) {
  try {
    // Sadece şirket ve admin sürücü ekleyebilir
    if (req.user.role !== 'company' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz bulunmamaktadır' });
    }
    
    const { name, surname, email, phone, licenseInfo, address, birthDate, companyId } = req.body;
    
    // Temel bilgileri kontrol et
    if (!name || !surname || !email || !phone || !licenseInfo) {
      return res.status(400).json({ error: 'Lütfen tüm zorunlu alanları doldurun' });
    }
    
    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Geçerli bir email adresi girin' });
    }
    
    // Email kontrolü
    const existingUser = await db.collection('drivers').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu email adresi ile kayıtlı bir sürücü zaten var' });
    }
    
    // Sürücü bilgilerini hazırla
    const driverData = {
      name,
      surname,
      email,
      phone,
      licenseInfo,
      companyId: req.user.role === 'company' 
        ? new ObjectId(req.user.companyId) 
        : new ObjectId(companyId),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Opsiyonel alanları ekle
    if (address) driverData.address = address;
    if (birthDate) driverData.birthDate = new Date(birthDate);
    
    // Sürücüyü veritabanına ekle
    const result = await db.collection('drivers').insertOne(driverData);
    
    return res.status(201).json({
      success: true,
      driverId: result.insertedId,
      message: 'Sürücü başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Create driver error:', error);
    return res.status(500).json({ error: 'Sürücü oluşturulurken hata oluştu' });
  }
} 