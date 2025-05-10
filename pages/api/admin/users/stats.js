import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { connectToDatabase } from '../../../../lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req, res) {
  try {
    // Token kontrolü
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Yetkilendirme başarısız' });
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;

    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('Token doğrulama hatası:', error);
      return res.status(401).json({ error: 'Geçersiz token' });
    }

    // Admin yetkisi kontrolü
    const userRoles = decodedToken.roles || [];
    const userRole = decodedToken.role;
    const isAdmin = userRoles.includes('admin') || userRole === 'admin';
    
    console.log('Kullanıcı rolleri:', userRoles);
    console.log('Kullanıcı rolü:', userRole);
    console.log('Admin yetkisi:', isAdmin);

    if (!isAdmin) {
      console.log('Yetkisiz erişim denemesi:', {
        userId: decodedToken.id,
        email: decodedToken.email,
        roles: userRoles,
        role: userRole
      });
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    let db;
    try {
      const { db: database } = await connectToDatabase();
      db = database;
    } catch (error) {
      console.error('Veritabanı bağlantı hatası:', error);
      return res.status(500).json({ error: 'Veritabanına bağlanılamadı' });
    }

    try {
      const adminFilter = {
        $or: [
          { role: 'admin' },
          { roles: 'admin' }
        ]
      };

      console.log('İstatistik sorgu filtresi:', JSON.stringify(adminFilter, null, 2));

      const [total, active, inactive] = await Promise.all([
        db.collection('users').countDocuments(adminFilter),
        db.collection('users').countDocuments({ ...adminFilter, status: 'active' }),
        db.collection('users').countDocuments({ ...adminFilter, status: 'inactive' })
      ]);

      console.log('İstatistik sonuçları:', { total, active, inactive });

      return res.status(200).json({
        total,
        active,
        inactive
      });
    } catch (error) {
      console.error('İstatistik hesaplama hatası:', error);
      return res.status(500).json({ error: 'İstatistikler hesaplanırken bir hata oluştu' });
    }
  } catch (error) {
    console.error('API hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
} 