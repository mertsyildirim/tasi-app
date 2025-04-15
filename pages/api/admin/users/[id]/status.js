import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../../../src/lib/mongodb';
import jwt from 'jsonwebtoken';

// Token kontrolü için middleware
const authenticateToken = (req, res) => {
  return new Promise((resolve, reject) => {
    try {
      // Authorization header'dan token'ı al
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'Yetkilendirme başarısız: Token bulunamadı' });
      }
      
      // Token'ı doğrula
      jwt.verify(token, process.env.JWT_SECRET || 'tasiapp-super-gizli-jwt-anahtar', (err, user) => {
        if (err) {
          return res.status(403).json({ error: 'Yetkilendirme başarısız: Geçersiz token' });
        }
        req.user = user;
        resolve();
      });
    } catch (error) {
      console.error('Token doğrulama hatası:', error);
      reject(error);
    }
  });
};

export default async function handler(req, res) {
  // CORS desteği ekle
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  // OPTIONS isteğine cevap ver
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const { id } = req.query;
    const { method } = req;
    
    // PATCH metodu dışındaki istekleri reddet
    if (method !== 'PATCH') {
      res.setHeader('Allow', ['PATCH']);
      return res.status(405).json({ error: `Method ${method} not allowed` });
    }
    
    // Token kontrolü
    await authenticateToken(req, res);
    
    // ObjectId kontrolü
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz kullanıcı ID' });
    }
    
    // Veritabanına bağlan
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // Kullanıcı durumunu güncelle
    const { status } = req.body;
    
    if (status !== 'active' && status !== 'inactive') {
      return res.status(400).json({ error: 'Geçersiz durum değeri. "active" veya "inactive" olmalıdır' });
    }
    
    const updateResult = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: status === 'active', updatedAt: new Date() } }
    );
    
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    return res.status(200).json({
      success: true,
      message: `Kullanıcı durumu "${status}" olarak güncellendi`
    });
    
  } catch (error) {
    console.error('Kullanıcı durumu güncelleme hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası', details: error.message });
  }
} 