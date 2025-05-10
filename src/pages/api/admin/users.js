import { connectToDatabase } from '../../../lib/mongodb';
import { authMiddleware } from '../../../middleware/auth';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  try {
    await authMiddleware(req, res, async () => {
      // Yalnızca admin erişebilir
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Bu işlem için yetkiniz bulunmamaktadır' });
      }

      const { method } = req;
      const { db } = await connectToDatabase();

      switch (method) {
        case 'GET':
          return await getUsers(req, res, db);
        case 'POST':
          return await createUser(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'POST']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Admin users API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Kullanıcı listesini getir
async function getUsers(req, res, db) {
  try {
    const { role, status, page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Filtre oluştur
    const filter = {};
    
    // Role göre filtrele
    if (role) {
      filter.role = role;
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
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Kullanıcıları getir
    const users = await db.collection('users')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .project({ password: 0 }) // Şifreleri gönderme
      .toArray();
    
    // Toplam sayıyı hesapla
    const total = await db.collection('users').countDocuments(filter);
    
    return res.status(200).json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Kullanıcı bilgileri getirilirken hata oluştu' });
  }
}

// Yeni kullanıcı oluştur
async function createUser(req, res, db) {
  try {
    const { name, surname, email, phone, password, role } = req.body;
    
    // Temel bilgileri kontrol et
    if (!name || !surname || !email || !password || !role) {
      return res.status(400).json({ error: 'Lütfen tüm zorunlu alanları doldurun' });
    }
    
    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Geçerli bir email adresi girin' });
    }
    
    // Email kontrolü
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu email adresi ile kayıtlı bir kullanıcı zaten var' });
    }
    
    // Role kontrolü
    const validRoles = ['admin', 'company', 'driver', 'customer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Geçersiz rol' });
    }
    
    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Kullanıcı bilgilerini hazırla
    const userData = {
      name,
      surname,
      email,
      role,
      password: hashedPassword,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Opsiyonel alanları ekle
    if (phone) userData.phone = phone;
    
    // Kullanıcıyı veritabanına ekle
    const result = await db.collection('users').insertOne(userData);
    
    // Role göre ek işlemler
    if (role === 'company' && req.body.company) {
      const { company } = req.body;
      
      // Temel şirket bilgilerini kontrol et
      if (!company.name) {
        return res.status(400).json({ error: 'Şirket adı belirtilmelidir' });
      }
      
      // Şirket bilgilerini hazırla
      const companyData = {
        name: company.name,
        userId: result.insertedId,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Opsiyonel şirket alanlarını ekle
      const companyFields = ['email', 'phone', 'address', 'website', 'taxNumber', 'contactPerson'];
      companyFields.forEach(field => {
        if (company[field]) companyData[field] = company[field];
      });
      
      // Şirketi veritabanına ekle
      const companyResult = await db.collection('companies').insertOne(companyData);
      
      // Kullanıcıyı güncelle
      await db.collection('users').updateOne(
        { _id: result.insertedId },
        { $set: { companyId: companyResult.insertedId } }
      );
      
      return res.status(201).json({
        success: true,
        userId: result.insertedId,
        companyId: companyResult.insertedId,
        message: 'Kullanıcı ve şirket başarıyla oluşturuldu'
      });
    } else if (role === 'driver' && req.body.driver) {
      const { driver } = req.body;
      
      // Sürücü bilgilerini hazırla
      const driverData = {
        name,
        surname,
        email,
        userId: result.insertedId,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Opsiyonel sürücü alanlarını ekle
      const driverFields = ['phone', 'address', 'licenseInfo', 'birthDate', 'emergencyContact', 'companyId'];
      driverFields.forEach(field => {
        if (driver[field]) {
          if (field === 'birthDate') {
            driverData[field] = new Date(driver[field]);
          } else if (field === 'companyId' && ObjectId.isValid(driver[field])) {
            driverData[field] = new ObjectId(driver[field]);
          } else {
            driverData[field] = driver[field];
          }
        }
      });
      
      // Sürücüyü veritabanına ekle
      const driverResult = await db.collection('drivers').insertOne(driverData);
      
      // Kullanıcıyı güncelle
      await db.collection('users').updateOne(
        { _id: result.insertedId },
        { $set: { driverId: driverResult.insertedId } }
      );
      
      return res.status(201).json({
        success: true,
        userId: result.insertedId,
        driverId: driverResult.insertedId,
        message: 'Kullanıcı ve sürücü başarıyla oluşturuldu'
      });
    }
    
    return res.status(201).json({
      success: true,
      userId: result.insertedId,
      message: 'Kullanıcı başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ error: 'Kullanıcı oluşturulurken hata oluştu' });
  }
} 