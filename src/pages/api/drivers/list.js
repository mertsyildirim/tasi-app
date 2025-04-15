const { connectToDatabase } = require('../../../lib/mongodb');
const jwt = require('jsonwebtoken');
const { API_CONFIG } = require('../config');

// Test sürücü verileri
const TEST_DRIVERS = [
  {
    id: 'driver_123',
    name: 'Ali Yıldız',
    phone: '+90 555 678 9012',
    email: 'ali.yildiz@example.com', 
    status: 'ACTIVE',
    vehicleInfo: {
      plateNumber: '34ABC123',
      type: 'Kamyon',
      brand: 'Ford',
      model: 'Cargo',
      year: 2020,
      capacity: '10 ton'
    },
    currentLocation: {
      lat: 41.0082,
      lng: 28.9784,
      address: 'İstanbul, Kadıköy'
    },
    completedShipments: 45,
    rating: 4.8,
    createdAt: '2023-05-15T10:00:00Z',
    lastActive: '2024-06-05T14:30:00Z'
  },
  {
    id: 'driver_124',
    name: 'Mustafa Demir',
    phone: '+90 555 345 6789',
    email: 'mustafa.demir@example.com',
    status: 'ON_DUTY',
    vehicleInfo: {
      plateNumber: '34DEF456',
      type: 'Kamyonet',
      brand: 'Mercedes',
      model: 'Atego',
      year: 2022,
      capacity: '5 ton'
    },
    currentLocation: {
      lat: 39.9334,
      lng: 32.8597,
      address: 'Ankara, Çankaya'
    },
    completedShipments: 32,
    rating: 4.6,
    createdAt: '2023-07-20T09:30:00Z',
    lastActive: '2024-06-05T13:45:00Z'
  },
  {
    id: 'driver_125',
    name: 'Mehmet Yılmaz',
    phone: '+90 555 123 4567',
    email: 'mehmet.yilmaz@example.com',
    status: 'ACTIVE',
    vehicleInfo: {
      plateNumber: '06GHI789',
      type: 'Tır',
      brand: 'Volvo',
      model: 'FH16',
      year: 2021,
      capacity: '20 ton'
    },
    currentLocation: {
      lat: 38.4192,
      lng: 27.1287,
      address: 'İzmir, Bornova'
    },
    completedShipments: 58,
    rating: 4.9,
    createdAt: '2023-03-10T11:15:00Z',
    lastActive: '2024-06-04T16:20:00Z'
  },
  {
    id: 'driver_126',
    name: 'Ayşe Kara',
    phone: '+90 555 987 6543',
    email: 'ayse.kara@example.com',
    status: 'OFF_DUTY',
    vehicleInfo: {
      plateNumber: '34JKL012',
      type: 'Kamyon',
      brand: 'Scania',
      model: 'R450',
      year: 2019,
      capacity: '15 ton'
    },
    currentLocation: {
      lat: 40.1885,
      lng: 29.0610,
      address: 'Bursa, Nilüfer'
    },
    completedShipments: 37,
    rating: 4.7,
    createdAt: '2023-09-05T08:45:00Z',
    lastActive: '2024-06-03T19:10:00Z'
  },
  {
    id: 'driver_127',
    name: 'Hasan Özkan',
    phone: '+90 555 456 7890',
    email: 'hasan.ozkan@example.com',
    status: 'INACTIVE',
    vehicleInfo: {
      plateNumber: '01MNO345',
      type: 'Kamyonet',
      brand: 'Iveco',
      model: 'Daily',
      year: 2018,
      capacity: '3.5 ton'
    },
    currentLocation: {
      lat: 36.8969,
      lng: 30.7133,
      address: 'Antalya, Muratpaşa'
    },
    completedShipments: 25,
    rating: 4.5,
    createdAt: '2023-11-20T13:30:00Z',
    lastActive: '2024-05-28T10:40:00Z'
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
        data: TEST_DRIVERS
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
        
        // Geliştirme aşamasında token hatası olsa da test verileri döndür
        let filteredDrivers = [...TEST_DRIVERS];
        
        // Status filtresi varsa uygula
        if (status) {
          filteredDrivers = filteredDrivers.filter(driver => driver.status === status);
        }
        
        // Sayfalama
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedResults = filteredDrivers.slice(startIndex, endIndex);
        
        return res.status(200).json({
          success: true,
          data: paginatedResults,
          pagination: {
            total: filteredDrivers.length,
            page,
            limit,
            pages: Math.ceil(filteredDrivers.length / limit)
          }
        });
      }
      
      // Kullanıcı rolünü kontrol et
      const userRole = decodedToken.role;
      
      // Sadece carrier veya admin rolündeki kullanıcılar erişebilir
      if (userRole !== 'carrier' && userRole !== 'admin') {
        return res.status(403).json({ 
          message: 'Bu kaynağa erişim izniniz yok'
        });
      }
      
      // Eğer carrier rolündeyse, sadece kendi sürücülerini görebilir
      let query = {};
      if (userRole === 'carrier') {
        query.carrierId = decodedToken.userId;
      }
      
      // Status filtresi varsa ekle
      if (status) {
        query.status = status;
      }
      
      // MongoDB'den verileri çek
      // Gerçek uygulamada burada veritabanı sorguları olacak
      
      // Test verileri döndür
      let filteredDrivers = [...TEST_DRIVERS];
      
      // Status filtresi varsa uygula
      if (status) {
        filteredDrivers = filteredDrivers.filter(driver => driver.status === status);
      }
      
      // Sayfalama
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedResults = filteredDrivers.slice(startIndex, endIndex);
      
      return res.status(200).json({
        success: true,
        data: paginatedResults,
        pagination: {
          total: filteredDrivers.length,
          page,
          limit,
          pages: Math.ceil(filteredDrivers.length / limit)
        }
      });
      
    } catch (dbError) {
      console.error('Veritabanı bağlantı hatası:', dbError);
      
      // Veritabanı hatası durumunda test verileri döndür
      let filteredDrivers = [...TEST_DRIVERS];
      
      // Status filtresi varsa uygula
      if (status) {
        filteredDrivers = filteredDrivers.filter(driver => driver.status === status);
      }
      
      // Sayfalama
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedResults = filteredDrivers.slice(startIndex, endIndex);
      
      return res.status(200).json({
        success: true,
        data: paginatedResults,
        pagination: {
          total: filteredDrivers.length,
          page,
          limit,
          pages: Math.ceil(filteredDrivers.length / limit)
        }
      });
    }
    
  } catch (error) {
    console.error('Sürücüler alınırken hata:', error);
    return res.status(500).json({ 
      message: 'Sunucu hatası', 
      error: error.message 
    });
  }
} 