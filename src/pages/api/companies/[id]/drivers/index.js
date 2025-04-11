import { connectToDatabase } from '@/lib/mongodb';
import { authMiddleware } from '@/middleware/auth';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

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

// Sürücüleri listele
async function getDrivers(req, res, db) {
  try {
    const { id } = req.query;
    const { role, companyId } = req.user;
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && id !== companyId?.toString()) {
      return res.status(403).json({ error: 'Bu şirketin sürücülerini görüntüleme yetkiniz yok' });
    }

    // Filtreleri oluştur
    const query = {
      companyId: new ObjectId(id)
    };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Toplam sayıyı hesapla
    const total = await db.collection('drivers').countDocuments(query);

    // Sıralama ayarları
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Sayfalama
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sürücüleri getir
    const drivers = await db.collection('drivers')
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Aktif taşımaları getir
    const activeTransports = await db.collection('transport_requests')
      .find({
        driverId: { $in: drivers.map(d => d._id) },
        status: { $in: ['accepted', 'in_progress'] }
      })
      .toArray();

    // Sürücü istatistiklerini hesapla
    const stats = {
      total,
      active: await db.collection('drivers').countDocuments({ ...query, status: 'active' }),
      inactive: await db.collection('drivers').countDocuments({ ...query, status: 'inactive' }),
      onTransport: activeTransports.length,
      licenseTypes: await db.collection('drivers')
        .aggregate([
          { $match: query },
          { $group: { _id: '$licenseType', count: { $sum: 1 } } }
        ]).toArray()
    };

    // Sürücüleri aktif taşıma bilgileriyle birleştir
    const driversWithTransport = drivers.map(driver => ({
      ...driver,
      activeTransport: activeTransports.find(t => t.driverId.toString() === driver._id.toString())
    }));

    return res.status(200).json({
      drivers: driversWithTransport,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      stats
    });

  } catch (error) {
    console.error('Get drivers error:', error);
    return res.status(500).json({ error: 'Sürücüler listelenirken hata oluştu' });
  }
}

// Yeni sürücü oluştur
async function createDriver(req, res, db) {
  try {
    const { id } = req.query;
    const { role, companyId } = req.user;
    const {
      name,
      email,
      phone,
      password,
      licenseType,
      licenseNumber,
      licenseExpiry,
      birthDate,
      address,
      emergencyContact,
      documents
    } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && id !== companyId?.toString()) {
      return res.status(403).json({ error: 'Bu şirkete sürücü ekleme yetkiniz yok' });
    }

    // Zorunlu alan kontrolü
    const requiredFields = ['name', 'email', 'phone', 'password', 'licenseType', 'licenseNumber', 'licenseExpiry'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Eksik bilgi',
        fields: missingFields
      });
    }

    // Email kontrolü
    const existingDriver = await db.collection('drivers').findOne({ email });
    if (existingDriver) {
      return res.status(400).json({ error: 'Bu email adresi zaten kullanımda' });
    }

    // Şirket kontrolü
    const company = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    });

    if (!company) {
      return res.status(404).json({ error: 'Şirket bulunamadı' });
    }

    // Şifre hashleme
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni sürücü oluştur
    const newDriver = {
      companyId: new ObjectId(id),
      name,
      email,
      phone,
      password: hashedPassword,
      licenseType,
      licenseNumber,
      licenseExpiry: new Date(licenseExpiry),
      birthDate: birthDate ? new Date(birthDate) : null,
      address: address || null,
      emergencyContact: emergencyContact || null,
      documents: documents || [],
      status: 'active',
      rating: 0,
      totalRatings: 0,
      completedTransports: 0,
      cancelledTransports: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      settings: {
        notifications: {
          email: true,
          sms: true,
          push: true
        },
        language: 'tr'
      }
    };

    const result = await db.collection('drivers').insertOne(newDriver);

    if (!result.insertedId) {
      return res.status(500).json({ error: 'Sürücü kaydı oluşturulamadı' });
    }

    // Kullanıcı hesabı oluştur
    const user = {
      email,
      password: hashedPassword,
      name: name.split(' ')[0],
      surname: name.split(' ').slice(1).join(' '),
      phone,
      role: 'driver',
      companyId: new ObjectId(id),
      driverId: result.insertedId,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('users').insertOne(user);

    // Hassas bilgileri temizle
    delete newDriver.password;

    return res.status(201).json({
      message: 'Sürücü başarıyla oluşturuldu',
      driver: newDriver
    });

  } catch (error) {
    console.error('Create driver error:', error);
    return res.status(500).json({ error: 'Sürücü oluşturulurken hata oluştu' });
  }
} 