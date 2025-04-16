import { connectToDatabase } from '../../../lib/mongodb';
import { authMiddleware } from '../../../middleware/auth';
import { useState, useEffect } from 'react';

export default async function handler(req, res) {
  try {
    await authMiddleware(req, res, async () => {
      // Yalnızca admin erişebilir
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Bu bilgilere erişim yetkiniz bulunmamaktadır' });
      }

      const { method } = req;
      const { db } = await connectToDatabase();

      switch (method) {
        case 'GET':
          return await getDashboardData(req, res, db);
        default:
          res.setHeader('Allow', ['GET']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Admin dashboard API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Dashboard verilerini getir
async function getDashboardData(req, res, db) {
  try {
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
    });
  } catch (error) {
    console.error('Get admin dashboard data error:', error);
    return res.status(500).json({ error: 'Dashboard verileri getirilirken hata oluştu' });
  }
}

// Bildirimleri getir
const fetchNotifications = async () => {
  try {
    const response = await api.get('/api/admin/notifications?limit=5&read=false');
    if (response.data && response.data.notifications) {
      setNotifications(response.data.notifications);
    }
  } catch (error) {
    console.error('Bildirim getirme hatası:', error);
    setNotificationError('Bildirimler alınırken bir hata oluştu');
  }
};

useEffect(() => {
  // Admin veya super_admin rolüne sahip kullanıcıları kontrol et
  const isAdmin = session?.user?.roles?.includes('admin') || session?.user?.roles?.includes('super_admin');
  
  if (status === 'authenticated' && isAdmin) {
    fetchDashboardData();
    fetchNotifications();
  }
}, [status, session]); 