const { connectToDatabase } = require('../../../lib/mongodb');
const jwt = require('jsonwebtoken');
const { API_CONFIG } = require('../config');

// Test ödeme verileri
const TEST_PAYMENTS = [];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Token doğrulama
    const token = req.cookies.auth || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      // Boş veri döndür
      console.log('Token bulunamadı, boş veri döndürülüyor');
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: API_CONFIG.PAGE_LIMIT,
          pages: 0
        }
      });
    }

    // Query parametreleri
    const status = req.query.status;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || API_CONFIG.PAGE_LIMIT;
    
    try {
      // MongoDB bağlantısı
      const { db } = await connectToDatabase();
      
      // Token doğrulama
      let decodedToken;
      try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET || API_CONFIG.JWT_SECRET);
      } catch (error) {
        console.error('Token doğrulama hatası:', error);
        
        // Boş veri döndür
        return res.status(200).json({
          success: true,
          data: [],
          pagination: {
            total: 0,
            page,
            limit,
            pages: 0
          }
        });
      }
      
      // Kullanıcı rolünü ve ID'sini al
      const userRole = decodedToken.role;
      const userId = decodedToken.userId;
      
      // Sorgu oluştur
      let query = {};
      
      if (userRole === 'carrier') {
        query.carrierId = userId;
      } else if (userRole === 'customer') {
        query.customerId = userId;
      } else if (userRole !== 'admin') {
        return res.status(403).json({ 
          message: 'Bu kaynağa erişim izniniz yok'
        });
      }
      
      // Status filtresi varsa ekle
      if (status) {
        query.status = status;
      }
      
      // Burada gerçek veritabanı sorgusu yapılacak
      // Şimdi için boş veri döndür
      
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0
        }
      });
      
    } catch (dbError) {
      console.error('Veritabanı bağlantı hatası:', dbError);
      
      // Boş veri döndür
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0
        }
      });
    }
    
  } catch (error) {
    console.error('Ödemeler alınırken hata:', error);
    return res.status(500).json({ 
      message: 'Sunucu hatası', 
      error: error.message 
    });
  }
} 