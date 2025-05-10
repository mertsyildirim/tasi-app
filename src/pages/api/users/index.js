import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  try {
    // MongoDB bağlantısı
    await connectToDatabase();

    // HTTP metoduna göre işlemler
    switch (req.method) {
      case 'GET':
        return await getUsers(req, res);
      case 'POST':
        return await createUser(req, res);
      default:
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
}

/**
 * Kullanıcı listesini getiren fonksiyon (GET /api/users)
 */
async function getUsers(req, res) {
  try {
    // Query parametreleri
    const { page = 1, limit = 10, role, isActive, search } = req.query;
    
    // Filtreleme koşulları
    const filter = {};
    
    // Rol filtresi
    if (role) {
      filter.role = role;
    }
    
    // Aktiflik durumu filtresi
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    // Arama filtresi (ad, email veya şirket adına göre)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sayfalama
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 }, // En yeni oluşturulanlar önce
      select: '-password' // Şifre alanını hariç tut
    };
    
    // Kullanıcıları getir
    const users = await User.find(filter)
      .select('-password')
      .limit(options.limit)
      .skip((options.page - 1) * options.limit)
      .sort(options.sort);
    
    // Toplam kullanıcı sayısı
    const total = await User.countDocuments(filter);
    
    // Sonuç döndür
    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      users
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    return res.status(500).json({ message: 'Kullanıcılar getirilirken hata oluştu', error: error.message });
  }
}

/**
 * Yeni kullanıcı oluşturan fonksiyon (POST /api/users)
 */
async function createUser(req, res) {
  try {
    const { name, email, password, phone, role, company, address, taxNumber, taxOffice } = req.body;
    
    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
    }
    
    // Yeni kullanıcı oluştur
    const user = await User.create({
      name,
      email,
      password, // Not: Gerçek uygulamada şifre hashlenmelidir!
      phone,
      role,
      company,
      address,
      taxNumber,
      taxOffice
    });
    
    // Şifreyi gizleyerek yanıt döndür
    const userResponse = { ...user._doc };
    delete userResponse.password;
    
    return res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: userResponse
    });
  } catch (error) {
    console.error('Create User Error:', error);
    
    // Validation hatalarını işle
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validasyon hatası', errors: validationErrors });
    }
    
    return res.status(500).json({ message: 'Kullanıcı oluşturulurken hata oluştu', error: error.message });
  }
} 