import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    console.log('Oturum bilgisi:', JSON.stringify(session, null, 2));

    if (!session) {
      console.log('Oturum bulunamadı');
      return res.status(401).json({ error: 'Oturum bulunamadı' });
    }

    // Admin yetkisi kontrolü
    const userRoles = session?.user?.roles || [];
    const userRole = session?.user?.role;
    const isAdmin = userRoles.includes('admin') || userRole === 'admin';
    
    console.log('Kullanıcı rolleri:', userRoles);
    console.log('Kullanıcı rolü:', userRole);
    console.log('Admin yetkisi:', isAdmin);

    if (!isAdmin) {
      console.log('Yetkisiz erişim denemesi:', {
        userId: session?.user?.id,
        email: session?.user?.email,
        roles: userRoles,
        role: userRole
      });
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }

    const { method } = req;
    let db;

    try {
      const { db: database } = await connectToDatabase();
      db = database;
    } catch (error) {
      console.error('Veritabanı bağlantı hatası:', error);
      return res.status(500).json({ error: 'Veritabanına bağlanılamadı' });
    }

    switch (method) {
      case 'GET': {
        try {
          const { page = 1, limit = 10, search = '', status = 'all', type = 'all' } = req.query;
          const skip = (parseInt(page) - 1) * parseInt(limit);
          
          const filter = {
            ...(search && {
              $or: [
                { plate: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { model: { $regex: search, $options: 'i' } },
                { driver: { $regex: search, $options: 'i' } }
              ]
            }),
            ...(status !== 'all' && { status }),
            ...(type !== 'all' && { type })
          };

          console.log('MongoDB sorgu filtresi:', JSON.stringify(filter, null, 2));

          const [vehicles, total] = await Promise.all([
            db.collection('vehicles')
              .find(filter)
              .skip(skip)
              .limit(parseInt(limit))
              .toArray(),
            db.collection('vehicles').countDocuments(filter)
          ]);

          console.log('Bulunan araç sayısı:', vehicles.length);

          return res.status(200).json({
            success: true,
            vehicles,
            pagination: {
              total,
              pages: Math.ceil(total / parseInt(limit)),
              current: parseInt(page)
            }
          });
        } catch (error) {
          console.error('Araçları getirme hatası:', error);
          return res.status(500).json({ error: 'Araçlar getirilirken bir hata oluştu' });
        }
      }

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('API hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
} 