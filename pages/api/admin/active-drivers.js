import { MongoClient } from 'mongodb';
import { verify } from 'jsonwebtoken';

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  let client;
  try {
    // Token doğrulama
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Yetkilendirme başarısız' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Geçersiz token' });
    }

    // Rol kontrolü
    const allowedRoles = ['admin', 'super_admin', 'editor', 'support'];
    const hasAllowedRole = decoded.roles?.some(role => allowedRoles.includes(role)) || allowedRoles.includes(decoded.role);

    if (!hasAllowedRole && decoded.email !== 'mert@tasipp.com') {
      return res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok' });
    }

    // MongoDB bağlantısı
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db();
    const collection = db.collection('drivers');

    // Sayfalama ve arama parametreleri
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const searchTerm = req.query.search || '';

    // Aktif sürücü filtresi
    const filter = {
      $or: [
        { status: { $in: ['active', 'online', 'Aktif'] } },
        { status: 'on_delivery' }
      ]
    };

    if (searchTerm) {
      filter.$or.push(
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
        { licensePlate: { $regex: searchTerm, $options: 'i' } }
      );
    }

    // Sürücüleri getir
    const drivers = await collection
      .find(filter)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Toplam sayıları hesapla
    const total = await collection.countDocuments(filter);
    const active = await collection.countDocuments({
      status: { $in: ['active', 'online', 'Aktif'] }
    });
    const onDelivery = await collection.countDocuments({
      status: 'on_delivery'
    });

    // Hassas bilgileri temizle
    const sanitizedDrivers = drivers.map(driver => ({
      id: driver._id.toString(),
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      company: driver.company,
      vehicleType: driver.vehicleType,
      licensePlate: driver.licensePlate,
      location: driver.location,
      status: driver.status
    }));

    return res.status(200).json({
      success: true,
      drivers: sanitizedDrivers,
      total,
      active,
      onDelivery,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });

  } catch (error) {
    console.error('Aktif sürücüler API hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu'
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 