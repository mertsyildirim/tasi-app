import { MongoClient } from 'mongodb';
import { requireAdmin } from '../../../middleware/authCheck';

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ 
      success: false,
      error: `Method ${req.method} not allowed` 
    });
  }

  try {
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
      console.log('MongoDB bağlantısı başarılı');
      
      // Veritabanını seç
      const db = client.db('tasiapp');
      
      // Tüm istatistikleri paralel olarak al
      const [
        totalUsers,
        totalCompanies,
        totalDrivers,
        totalVehicles,
        totalTransportRequests,
        activeTransports,
        completedTransports,
        pendingTransports,
        recentTransportRequests,
        recentCompanies,
        recentUsers
      ] = await Promise.all([
        // Toplam kullanıcı sayısı
        db.collection('users').countDocuments(),
        
        // Toplam şirket sayısı
        db.collection('companies').countDocuments(),
        
        // Toplam sürücü sayısı
        db.collection('drivers').countDocuments(),
        
        // Toplam araç sayısı
        db.collection('vehicles').countDocuments({ status: { $ne: 'deleted' } }),
        
        // Toplam taşıma isteği
        db.collection('transport_requests').countDocuments(),
        
        // Aktif taşıma sayısı
        db.collection('transport_requests').countDocuments({ 
          status: { $in: ['accepted', 'in_progress'] }
        }),
        
        // Tamamlanan taşıma sayısı
        db.collection('transport_requests').countDocuments({ 
          status: 'completed'
        }),
        
        // Bekleyen taşıma isteği sayısı
        db.collection('transport_requests').countDocuments({ 
          status: 'pending'
        }),
        
        // Son 10 taşıma isteği
        db.collection('transport_requests')
          .find({})
          .sort({ createdAt: -1 })
          .limit(10)
          .toArray(),
        
        // Son 5 kayıt olan şirket
        db.collection('companies')
          .find({})
          .sort({ createdAt: -1 })
          .limit(5)
          .toArray(),
        
        // Son 10 kayıt olan kullanıcı
        db.collection('users')
          .find({})
          .sort({ createdAt: -1 })
          .limit(10)
          .project({ password: 0 })
          .toArray()
      ]);
      
      // Son 6 aydaki taşıma isteği trendleri
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);
      
      const monthlyTransportData = await db.collection('transport_requests').aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
              }
            },
            cancelled: {
              $sum: {
                $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
              }
            }
          }
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1
          }
        }
      ]).toArray();
      
      // API cevabını hazırla
      return res.status(200).json({
        success: true,
        data: {
          counts: {
            users: totalUsers,
            companies: totalCompanies,
            drivers: totalDrivers,
            vehicles: totalVehicles,
            transportRequests: totalTransportRequests,
            activeTransports,
            completedTransports,
            pendingTransports
          },
          recent: {
            transportRequests: recentTransportRequests,
            companies: recentCompanies,
            users: recentUsers
          },
          trends: {
            monthlyTransportData
          }
        }
      });
    } finally {
      // Bağlantıyı kapat
      await client.close();
    }
  } catch (error) {
    console.error('Get admin dashboard data error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Dashboard verileri getirilirken hata oluştu',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export default requireAdmin(handler); 