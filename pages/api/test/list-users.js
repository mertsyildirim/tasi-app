import { connectToDatabase } from '../../../src/lib/mongodb';

export default async function handler(req, res) {
  // CORS ayarları 
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Veritabanına bağlan
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    // Tüm kullanıcıları getir
    const users = await usersCollection
      .find({})
      .project({ password: 0 }) // Şifreleri dahil etme
      .sort({ createdAt: -1 })
      .toArray();
    
    // Kullanıcı verilerini formatlayarak döndür
    return res.status(200).json({
      success: true,
      total: users.length,
      users: users.map(user => ({
        id: user._id.toString(),
        name: user.name || 'İsimsiz Kullanıcı',
        email: user.email || 'E-posta Yok',
        roles: user.roles || [],
        role: user.role || (user.roles && user.roles.length > 0 ? user.roles[0] : 'customer'),
        isActive: user.isActive !== false,
        createdAt: user.createdAt,
      }))
    });
  } catch (error) {
    console.error('Kullanıcı listeleme hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası', details: error.message });
  }
} 