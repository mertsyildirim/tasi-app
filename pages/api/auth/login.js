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
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    
    console.log('Giriş denemesi:', { email });

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email ve şifre gereklidir' });
    }

    // MongoDB bağlantı dizesi
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tasiapp';
    console.log('MongoDB URI:', uri);
    
    // Bağlantı oluştur
    const client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    try {
      // Bağlan
      await client.connect();
      console.log('MongoDB bağlantısı başarılı');
      
      // Veritabanını seç
      const db = client.db('tasiapp');
      
      // Kullanıcıyı email ile bul
      const user = await db.collection('users').findOne({ email });
      console.log('Kullanıcı bulundu mu:', !!user);

      // Kullanıcı bulunamadı
      if (!user) {
        console.log('Kullanıcı bulunamadı:', email);
        await client.close();
        return res.status(401).json({ success: false, error: 'Geçersiz email veya şifre' });
      }

      // Şifre kontrolü detayları
      console.log('Kullanıcı şifre alanları:', {
        hasPasswordField: !!user.password,
        hasRawPasswordField: !!user.rawPassword
      });

      // Şifre hashlenmiş değilse (eski kayıtlar için), doğrudan karşılaştır
      let isValidPassword = false;
      if (user.password) {
        console.log('Şifre hashlenmiş, karşılaştırılıyor');
        isValidPassword = await bcrypt.compare(password, user.password);
        console.log('Hashlenmiş şifre karşılaştırma sonucu:', isValidPassword);
      } else if (user.rawPassword) {
        console.log('Ham şifre kullanılıyor');
        isValidPassword = password === user.rawPassword;
        console.log('Ham şifre karşılaştırma sonucu:', isValidPassword);
      } else {
        console.log('Şifre alanı bulunamadı');
      }
      
      if (!isValidPassword) {
        console.log('Şifre doğrulaması başarısız');
        await client.close();
        return res.status(401).json({ success: false, error: 'Geçersiz email veya şifre' });
      }

      // Kullanıcı aktif değilse
      if (user.isActive === false) {
        await client.close();
        return res.status(403).json({ success: false, error: 'Hesabınız aktif değil' });
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
          userId: user._id,
          email: user.email,
          name: user.name,
          roles: user.roles || [],
          role: user.role
        },
        API_CONFIG.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Token detaylarını konsola yazdır
      console.log('Oluşturulan token içeriği:', {
        userId: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles || [],
        role: user.role
      });

      // Şifreyi yanıttan çıkar
      const { password: _, ...userWithoutPassword } = user;

      // Token ve kullanıcı bilgilerini döndür
      await client.close();
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          roles: user.roles || [],
          role: user.role
        }
      });
    } finally {
      // Bağlantıyı kapat
      await client.close();
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Giriş yapılırken bir hata oluştu' });
  }
} 