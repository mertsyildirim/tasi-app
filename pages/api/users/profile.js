import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Token doğrulama
    const token = req.cookies.auth;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Token doğrulama
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'tasi-app-jwt-secret-key');
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // MongoDB bağlantı dizesi
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      return res.status(500).json({ error: 'MONGODB_URI tanımlı değil' });
    }
    
    // Bağlantı oluştur
    const client = new MongoClient(uri);
    
    // Bağlan
    await client.connect();
    
    // Veritabanını seç
    const db = client.db('tasiapp');
    
    // Kullanıcı bilgilerini getir
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(decoded.userId) },
      { projection: { password: 0 } } // Şifreyi hariç tut
    );

    // Bağlantıyı kapat
    await client.close();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Avatar URL'ini yerel bir değer ile değiştir
    if (user.avatarUrl && user.avatarUrl.includes('ui-avatars.com')) {
      // CSP hatası nedeniyle dışarıdan resim yüklenemiyor, yerel bir avatar kullanıyoruz
      user.avatarUrl = `/images/default-avatar.png`;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 