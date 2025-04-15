const { connectToDatabase } = require('../../../lib/mongodb');
const jwt = require('jsonwebtoken');
const { API_CONFIG } = require('../config');

// Test verileri
const TEST_DATA = {
  carrier: {
    pendingRequests: 5,
    activeShipments: 8,
    completedShipments: 12,
    earnings: 15750,
    recentActivity: [
      { id: 'act1', date: '2024-06-05T14:30:00Z', type: 'shipment_assigned', message: 'Yeni taşıma talebi atandı: #SHP12345' },
      { id: 'act2', date: '2024-06-04T10:15:00Z', type: 'request_completed', message: 'Taşıma tamamlandı: #SHP12340' },
      { id: 'act3', date: '2024-06-03T16:45:00Z', type: 'payment_received', message: '2.500₺ ödeme alındı: #PMT98765' },
      { id: 'act4', date: '2024-06-02T09:20:00Z', type: 'shipment_started', message: 'Taşıma başladı: #SHP12338' }
    ]
  },
  driver: {
    pendingRequests: 2,
    activeShipments: 3,
    completedShipments: 15,
    earnings: 9500,
    recentActivity: [
      { id: 'act1', date: '2024-06-05T13:10:00Z', type: 'shipment_assigned', message: 'Yeni taşıma atandı: #SHP45678' },
      { id: 'act2', date: '2024-06-04T19:30:00Z', type: 'shipment_completed', message: 'Taşıma tamamlandı: #SHP45672' },
      { id: 'act3', date: '2024-06-03T08:15:00Z', type: 'location_updated', message: 'Konum güncellendi: Kadıköy, İstanbul' }
    ]
  },
  admin: {
    totalUsers: 125,
    activeDrivers: 28,
    pendingApprovals: 5,
    totalRevenue: 125000,
    recentActivity: [
      { id: 'act1', date: '2024-06-05T15:45:00Z', type: 'user_registered', message: 'Yeni kullanıcı kaydı: Mehmet Yılmaz' },
      { id: 'act2', date: '2024-06-05T11:20:00Z', type: 'document_approval', message: 'Belge onaylandı: Aras Taşımacılık' },
      { id: 'act3', date: '2024-06-04T14:30:00Z', type: 'payment_processed', message: 'Ödeme işlendi: 5.000₺' }
    ]
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Token doğrulama
    const token = req.cookies.auth || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Yetkilendirme hatası: Token bulunamadı' });
    }

    // Token'ı doğrula
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || API_CONFIG.JWT_SECRET);
    } catch (error) {
      console.error('Token doğrulama hatası:', error);
      
      // Geliştirme aşamasında test verileri döndür
      return res.status(200).json({
        success: true,
        data: TEST_DATA.carrier
      });
    }

    // MongoDB bağlantısı
    const { db } = await connectToDatabase();
    
    // Kullanıcı rolünü al
    const userRole = decodedToken.role || 'carrier';
    
    // Role göre dashboard verilerini getir
    let dashboardData;
    
    switch(userRole) {
      case 'carrier':
        // Normalde taşıyıcı için veritabanından veri çekme kodu burada olacak
        dashboardData = TEST_DATA.carrier;
        break;
        
      case 'driver':
        // Normalde sürücü için veritabanından veri çekme kodu burada olacak
        dashboardData = TEST_DATA.driver;
        break;
        
      case 'admin':
        // Normalde admin için veritabanından veri çekme kodu burada olacak
        dashboardData = TEST_DATA.admin;
        break;
        
      default:
        dashboardData = TEST_DATA.carrier;
    }
    
    // Başarılı yanıt
    return res.status(200).json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    console.error('Dashboard verisi alınırken hata:', error);
    return res.status(500).json({ 
      message: 'Sunucu hatası', 
      error: error.message 
    });
  }
} 