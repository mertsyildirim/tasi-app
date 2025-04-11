import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const { email, password } = req.body;

    // Zorunlu alan kontrolü
    if (!email || !password) {
      return res.status(400).json({
        error: 'Eksik bilgi',
        fields: ['email', 'password']
      });
    }

    // Kullanıcıyı bul
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre' });
    }

    // Şifre kontrolü
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre' });
    }

    // Hesap durumu kontrolü
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Hesabınız aktif değil' });
    }

    // JWT token oluştur
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Refresh token oluştur
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Son giriş zamanını güncelle
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          lastLogin: new Date(),
          refreshToken
        }
      }
    );

    // Giriş logunu kaydet
    await db.collection('login_logs').insertOne({
      userId: user._id,
      email: user.email,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      timestamp: new Date()
    });

    // Kullanıcı bilgilerini döndür
    delete user.password;
    delete user.refreshToken;

    return res.status(200).json({
      message: 'Giriş başarılı',
      user,
      token,
      refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
} 