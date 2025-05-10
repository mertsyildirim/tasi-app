import { connectToDatabase } from '../../../lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock kullanıcılar - gerçek veritabanı entegrasyonu öncesi test için
const MOCK_USERS = [
  {
    id: 'cust_123',
    email: 'ahmet@example.com',
    password: 'Test123!',
    name: 'Ahmet Yılmaz',
    role: 'customer',
    phone: '+90 555 123 4567',
    address: 'Kadıköy, İstanbul',
    isActive: true
  },
  {
    id: 'carrier_456',
    email: 'testbelge@test.com',
    password: 'test123',
    name: 'Test Taşıyıcı',
    role: 'carrier',
    phone: '+90 555 987 6543',
    address: 'Üsküdar, İstanbul',
    isActive: true,
    documentStatus: 'WAITING_DOCUMENTS'
  },
  {
    id: 'driver_789',
    email: 'driver@tasiapp.com',
    password: 'Driver123!',
    name: 'Sürücü Kullanıcı',
    role: 'driver',
    phone: '+90 555 789 1234',
    address: 'Beşiktaş, İstanbul',
    isActive: true
  },
  {
    id: 'admin_101',
    email: 'admin@tasiapp.com',
    password: 'Admin123!',
    name: 'Admin Kullanıcı',
    role: 'admin',
    phone: '+90 555 222 3333',
    address: 'Şişli, İstanbul',
    isActive: true
  }
];

export default async function handler(req, res) {
  // Sadece POST istekleri
    if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email, password } = req.body;

  // Gerekli alanları kontrol et
    if (!email || !password) {
    return res.status(400).json({ error: 'E-posta ve şifre gereklidir' });
    }

  let client;

  try {
    client = await connectToDatabase();
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Kullanıcıyı e-posta ile bul
    const user = await usersCollection.findOne({ email });

    // Kullanıcı yoksa veya hesap aktif değilse
    if (!user) {
      return res.status(401).json({ error: 'Geçersiz e-posta veya şifre' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Hesabınız aktif değil. Lütfen yönetici ile iletişime geçin.' });
    }

    // Şifreyi doğrula
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Geçersiz e-posta veya şifre' });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Son giriş tarihini güncelle
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    // Kullanıcı bilgilerini döndür (şifre hariç)
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 