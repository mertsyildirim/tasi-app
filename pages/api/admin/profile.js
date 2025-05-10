import { MongoClient } from 'mongodb';
import { verify } from 'jsonwebtoken';

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
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

    if (!hasAllowedRole && decoded.email !== 'mert@tasiapp.com') {
      return res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok' });
    }

    // MongoDB bağlantısı
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db();
    const collection = db.collection('users');

    // Güncellenecek alanları kontrol et
    const { name, email, phone, company } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Ad ve e-posta alanları zorunludur' });
    }

    // E-posta benzersizliğini kontrol et
    if (email !== decoded.email) {
      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor' });
      }
    }

    // Kullanıcıyı güncelle
    const result = await collection.updateOne(
      { _id: decoded.id },
      {
        $set: {
          name,
          email,
          phone: phone || null,
          company: company || null,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    // Güncellenmiş kullanıcı bilgilerini getir
    const updatedUser = await collection.findOne({ _id: decoded.id });
    
    // Hassas bilgileri temizle
    const sanitizedUser = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      company: updatedUser.company,
      roles: updatedUser.roles,
      role: updatedUser.role
    };

    return res.status(200).json({
      success: true,
      user: sanitizedUser
    });

  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
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