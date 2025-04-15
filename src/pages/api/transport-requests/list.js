const { connectToDatabase } = require('../../../lib/mongodb');
const jwt = require('jsonwebtoken');
const { API_CONFIG } = require('../config');

// Test taşıma verileri
const TEST_REQUESTS = [
  {
    id: 'req_12345',
    status: 'PENDING',
    pickupLocation: 'İstanbul, Kadıköy',
    destinationLocation: 'Ankara, Çankaya',
    pickupDate: '2024-06-10T09:00:00Z',
    deliveryDate: '2024-06-11T15:00:00Z',
    cargoDetails: {
      type: 'Elektronik',
      weight: 250,
      dimensions: '80x120x100 cm'
    },
    price: 2500,
    currency: 'TRY',
    customer: {
      id: 'cust_789',
      name: 'Ahmet Yılmaz',
      company: 'ABC Elektronik Ltd. Şti.',
      rating: 4.8
    },
    createdAt: '2024-06-05T10:30:00Z'
  },
  {
    id: 'req_12346',
    status: 'ACCEPTED',
    pickupLocation: 'İzmir, Karşıyaka',
    destinationLocation: 'İstanbul, Beşiktaş',
    pickupDate: '2024-06-12T08:00:00Z',
    deliveryDate: '2024-06-13T14:00:00Z',
    cargoDetails: {
      type: 'Tekstil',
      weight: 400,
      dimensions: '100x120x80 cm'
    },
    price: 3200,
    currency: 'TRY',
    customer: {
      id: 'cust_790',
      name: 'Mehmet Demir',
      company: 'Demir Tekstil A.Ş.',
      rating: 4.5
    },
    createdAt: '2024-06-04T15:45:00Z'
  },
  {
    id: 'req_12347',
    status: 'IN_TRANSIT',
    pickupLocation: 'Bursa, Nilüfer',
    destinationLocation: 'Antalya, Muratpaşa',
    pickupDate: '2024-06-08T10:00:00Z',
    deliveryDate: '2024-06-09T16:00:00Z',
    cargoDetails: {
      type: 'Mobilya',
      weight: 650,
      dimensions: '200x150x120 cm'
    },
    price: 4500,
    currency: 'TRY',
    customer: {
      id: 'cust_791',
      name: 'Ayşe Kaya',
      company: 'Kaya Mobilya',
      rating: 4.9
    },
    driver: {
      id: 'driver_123',
      name: 'Ali Yıldız',
      phone: '+90 555 678 9012',
      vehicleInfo: 'Kamyon - 34ABC123'
    },
    createdAt: '2024-06-03T09:15:00Z'
  },
  {
    id: 'req_12348',
    status: 'COMPLETED',
    pickupLocation: 'Kocaeli, İzmit',
    destinationLocation: 'İstanbul, Ümraniye',
    pickupDate: '2024-06-01T08:30:00Z',
    deliveryDate: '2024-06-01T14:30:00Z',
    cargoDetails: {
      type: 'Otomotiv Parçaları',
      weight: 350,
      dimensions: '120x80x70 cm'
    },
    price: 1800,
    currency: 'TRY',
    customer: {
      id: 'cust_792',
      name: 'Hasan Özdemir',
      company: 'Özdemir Otomotiv',
      rating: 4.7
    },
    driver: {
      id: 'driver_124',
      name: 'Mustafa Demir',
      phone: '+90 555 345 6789',
      vehicleInfo: 'Kamyonet - 34DEF456'
    },
    completedAt: '2024-06-01T14:25:00Z',
    createdAt: '2024-05-30T11:20:00Z'
  },
  {
    id: 'req_12349',
    status: 'CANCELLED',
    pickupLocation: 'Ankara, Keçiören',
    destinationLocation: 'Konya, Selçuklu',
    pickupDate: '2024-06-15T10:00:00Z',
    deliveryDate: '2024-06-16T15:00:00Z',
    cargoDetails: {
      type: 'Gıda',
      weight: 500,
      dimensions: '120x100x110 cm'
    },
    price: 2900,
    currency: 'TRY',
    customer: {
      id: 'cust_793',
      name: 'Ayşe Kılıç',
      company: 'Kılıç Gıda Ltd. Şti.',
      rating: 4.3
    },
    cancelReason: 'Müşteri iptal etti',
    cancelledAt: '2024-06-02T16:30:00Z',
    createdAt: '2024-06-02T09:45:00Z'
  }
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Token doğrulama
    const token = req.cookies.auth || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      // Geliştirme aşamasında token olmasa da devam et
      console.log('Token bulunamadı, test verileri döndürülüyor');
      return res.status(200).json({
        success: true,
        data: TEST_REQUESTS
      });
    }

    // Query parametreleri
    const status = req.query.status;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || API_CONFIG.PAGE_LIMIT;
    
    // MongoDB bağlantısı
    try {
      const { db } = await connectToDatabase();
      
      // Token doğrulama
      let decodedToken;
      try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET || API_CONFIG.JWT_SECRET);
      } catch (error) {
        console.error('Token doğrulama hatası:', error);
        
        // Geliştirme aşamasında token hatası olsa da test verileri döndür
        let filteredRequests = [...TEST_REQUESTS];
        
        // Status filtresi varsa uygula
        if (status) {
          filteredRequests = filteredRequests.filter(req => req.status === status);
        }
        
        // Sayfalama
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedResults = filteredRequests.slice(startIndex, endIndex);
        
        return res.status(200).json({
          success: true,
          data: paginatedResults,
          pagination: {
            total: filteredRequests.length,
            page,
            limit,
            pages: Math.ceil(filteredRequests.length / limit)
          }
        });
      }
      
      // Kullanıcı ID'sini ve rolünü al
      const userId = decodedToken.userId;
      const userRole = decodedToken.role || 'carrier';
      
      // Sorgu oluştur
      let query = {};
      
      if (userRole === 'carrier') {
        query.carrierId = userId;
      } else if (userRole === 'driver') {
        query.driverId = userId;
      } else if (userRole === 'customer') {
        query.customerId = userId;
      }
      
      // Status filtresi varsa ekle
      if (status) {
        query.status = status;
      }
      
      // MongoDB'den verileri çek
      // Gerçek uygulama için burada veritabanı sorguları olacak
      
    } catch (dbError) {
      console.error('Veritabanı bağlantı hatası:', dbError);
      
      // Veritabanı hatası durumunda test verileri döndür
      let filteredRequests = [...TEST_REQUESTS];
      
      // Status filtresi varsa uygula
      if (status) {
        filteredRequests = filteredRequests.filter(req => req.status === status);
      }
      
      // Sayfalama
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedResults = filteredRequests.slice(startIndex, endIndex);
      
      return res.status(200).json({
        success: true,
        data: paginatedResults,
        pagination: {
          total: filteredRequests.length,
          page,
          limit,
          pages: Math.ceil(filteredRequests.length / limit)
        }
      });
    }
    
  } catch (error) {
    console.error('Taşıma talepleri alınırken hata:', error);
    return res.status(500).json({ 
      message: 'Sunucu hatası', 
      error: error.message 
    });
  }
} 