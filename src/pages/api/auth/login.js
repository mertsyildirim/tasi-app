import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';
import { API_CONFIG } from '../config';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  try {
    // MongoDB bağlantısı
    await connectToDatabase();

    // Sadece POST metoduna izin ver
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Login işlemini gerçekleştir
    await loginUser(req, res);
  } catch (error) {
    console.error('Login API Error:', error);
    return res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
}

/**
 * Kullanıcı girişi işlemini gerçekleştiren fonksiyon
 */
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // Gerekli alanları kontrol et
    if (!email || !password) {
      return res.status(400).json({ message: 'E-posta ve şifre gereklidir' });
    }

    // Kullanıcıyı email ile bul
    const user = await User.findOne({ email });

    // Kullanıcı bulunamadı
    if (!user) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }

    // Kullanıcı aktif değil
    if (!user.isActive) {
      return res.status(401).json({ message: 'Hesabınız aktif değil, lütfen yönetici ile iletişime geçin' });
    }

    // Şifreyi kontrol et (Gerçek uygulamada şifre karşılaştırması yapılmalıdır!)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      API_CONFIG.JWT_SECRET,
      { expiresIn: API_CONFIG.JWT_EXPIRE }
    );

    // Şifreyi yanıttan çıkar
    const userResponse = { ...user._doc };
    delete userResponse.password;

    // Token ve kullanıcı bilgilerini döndür
    return res.status(200).json({
      success: true,
      message: 'Giriş başarılı',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Giriş yapılırken hata oluştu', error: error.message });
  }
} 