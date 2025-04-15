import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// API konfigürasyon ayarları
const API_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'tasiapp-super-gizli-jwt-anahtar',
  JWT_EXPIRE: '7d', // 7 gün
  COOKIE_EXPIRE: 7, // 7 gün
  SALT_ROUNDS: 10, // Şifre hashleme için salt rounds
  PAGE_LIMIT: 10 // Sayfalama için limit
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-posta ve şifre gereklidir' });
    }

    // MongoDB bağlantı dizesi
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tasiapp';
    
    // Bağlantı oluştur
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    try {
      // Bağlan
      await client.connect();
      
      // Veritabanını seç
      const db = client.db('tasiapp');
      
      // Kullanıcıyı email ile bul
      const user = await db.collection('users').findOne({ email });

      // Kullanıcı bulunamadı
      if (!user) {
        return res.status(401).json({ error: 'Geçersiz e-posta veya şifre' });
      }

      // Şifreyi kontrol et
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Geçersiz e-posta veya şifre' });
      }

      // Kullanıcı aktif değilse
      if (user.isActive === false) {
        return res.status(401).json({ error: 'Hesabınız aktif değil. Lütfen yöneticiyle iletişime geçin.' });
      }

      // Kullanıcı rollerini konsola yazdır (debug için)
      console.log('Giriş yapan kullanıcı:', { 
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || 'customer',
        roles: user.roles || [user.role || 'customer']
      });

      // JWT token oluştur
      const token = jwt.sign(
        { 
          userId: user._id.toString(),
          email: user.email,
          // Role kontrolü - hem role hem de roles varsa ikisini de ekle
          role: user.role || (user.roles && user.roles.length > 0 ? user.roles[0] : 'customer'),
          roles: user.roles || [user.role || 'customer'],
          name: user.name
        },
        API_CONFIG.JWT_SECRET,
        { expiresIn: API_CONFIG.JWT_EXPIRE }
      );

      // Token detaylarını konsola yazdır
      console.log('Oluşturulan token içeriği:', {
        userId: user._id.toString(),
        email: user.email,
        role: user.role || (user.roles && user.roles.length > 0 ? user.roles[0] : 'customer'),
        roles: user.roles || [user.role || 'customer']
      });

      // Şifreyi yanıttan çıkar
      const { password: _, ...userWithoutPassword } = user;

      // Token ve kullanıcı bilgilerini döndür
      return res.status(200).json({
        token,
        user: userWithoutPassword
      });
    } finally {
      // Her durumda bağlantıyı kapat
      await client.close();
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.' });
  }
} 