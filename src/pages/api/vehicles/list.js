const { connectToDatabase } = require('../../../lib/mongodb');
const jwt = require('jsonwebtoken');
const { API_CONFIG } = require('../config');

// Test araç verileri
const TEST_VEHICLES = [
  {
    id: 'veh_12345',
    plateNumber: '34ABC123',
    brand: 'Ford',
    model: 'Cargo',
    type: 'Kamyon',
    year: 2020,
    capacity: '10 ton',
    dimensions: '6.5m x 2.4m x 2.6m',
    status: 'ACTIVE',
    driverId: 'driver_123',
    driverName: 'Ali Yıldız',
    lastMaintenance: '2024-02-15',
    nextMaintenance: '2024-08-15',
    fuelType: 'Dizel',
    documents: {
      insurance: {
        status: 'VALID',
        expiryDate: '2024-12-31'
      },
      technical: {
        status: 'VALID',
        expiryDate: '2025-03-15'
      }
    },
    currentLocation: {
      lat: 41.0082,
      lng: 28.9784,
      address: 'İstanbul, Kadıköy',
      lastUpdated: '2024-06-05T14:30:00Z'
    },
    createdAt: '2023-05-15T10:00:00Z'
  },
  {
    id: 'veh_12346',
    plateNumber: '34DEF456',
    brand: 'Mercedes',
    model: 'Atego',
    type: 'Kamyonet',
    year: 2022,
    capacity: '5 ton',
    dimensions: '5.2m x 2.2m x 2.4m',
    status: 'ON_DUTY',
    driverId: 'driver_124',
    driverName: 'Mustafa Demir',
    lastMaintenance: '2024-04-10',
    nextMaintenance: '2024-10-10',
    fuelType: 'Dizel',
    documents: {
      insurance: {
        status: 'VALID',
        expiryDate: '2025-01-20'
      },
      technical: {
        status: 'VALID',
        expiryDate: '2025-05-22'
      }
    },
    currentLocation: {
      lat: 39.9334,
      lng: 32.8597,
      address: 'Ankara, Çankaya',
      lastUpdated: '2024-06-05T13:45:00Z'
    },
    createdAt: '2023-07-20T09:30:00Z'
  },
  {
    id: 'veh_12347',
    plateNumber: '06GHI789',
    brand: 'Volvo',
    model: 'FH16',
    type: 'Tır',
    year: 2021,
    capacity: '20 ton',
    dimensions: '13.6m x 2.5m x 2.7m',
    status: 'ACTIVE',
    driverId: 'driver_125',
    driverName: 'Mehmet Yılmaz',
    lastMaintenance: '2024-03-20',
    nextMaintenance: '2024-09-20',
    fuelType: 'Dizel',
    documents: {
      insurance: {
        status: 'VALID',
        expiryDate: '2024-12-15'
      },
      technical: {
        status: 'VALID',
        expiryDate: '2025-02-10'
      }
    },
    currentLocation: {
      lat: 38.4192,
      lng: 27.1287,
      address: 'İzmir, Bornova',
      lastUpdated: '2024-06-04T16:20:00Z'
    },
    createdAt: '2023-03-10T11:15:00Z'
  },
  {
    id: 'veh_12348',
    plateNumber: '34JKL012',
    brand: 'Scania',
    model: 'R450',
    type: 'Kamyon',
    year: 2019,
    capacity: '15 ton',
    dimensions: '9.5m x 2.5m x 2.8m',
    status: 'MAINTENANCE',
    driverId: 'driver_126',
    driverName: 'Ayşe Kara',
    lastMaintenance: '2024-06-01',
    nextMaintenance: '2024-12-01',
    fuelType: 'Dizel',
    documents: {
      insurance: {
        status: 'VALID',
        expiryDate: '2024-11-30'
      },
      technical: {
        status: 'VALID',
        expiryDate: '2025-01-15'
      }
    },
    maintenanceDetails: 'Motor bakımı ve yağ değişimi',
    currentLocation: {
      lat: 40.1885,
      lng: 29.0610,
      address: 'Bursa, Nilüfer',
      lastUpdated: '2024-06-03T19:10:00Z'
    },
    createdAt: '2023-09-05T08:45:00Z'
  },
  {
    id: 'veh_12349',
    plateNumber: '01MNO345',
    brand: 'Iveco',
    model: 'Daily',
    type: 'Kamyonet',
    year: 2018,
    capacity: '3.5 ton',
    dimensions: '4.5m x 2.0m x 2.2m',
    status: 'INACTIVE',
    driverId: null,
    driverName: null,
    lastMaintenance: '2024-01-15',
    nextMaintenance: '2024-07-15',
    fuelType: 'Dizel',
    documents: {
      insurance: {
        status: 'EXPIRING',
        expiryDate: '2024-07-10'
      },
      technical: {
        status: 'VALID',
        expiryDate: '2024-12-20'
      }
    },
    currentLocation: {
      lat: 36.8969,
      lng: 30.7133,
      address: 'Antalya, Muratpaşa',
      lastUpdated: '2024-05-28T10:40:00Z'
    },
    createdAt: '2023-11-20T13:30:00Z'
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
        data: TEST_VEHICLES
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
        let filteredVehicles = [...TEST_VEHICLES];
        
        // Status filtresi varsa uygula
        if (status) {
          filteredVehicles = filteredVehicles.filter(vehicle => vehicle.status === status);
        }
        
        // Sayfalama
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedResults = filteredVehicles.slice(startIndex, endIndex);
        
        return res.status(200).json({
          success: true,
          data: paginatedResults,
          pagination: {
            total: filteredVehicles.length,
            page,
            limit,
            pages: Math.ceil(filteredVehicles.length / limit)
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
      
      // Eğer carrier rolündeyse, sadece kendi araçlarını görebilir
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
      let filteredVehicles = [...TEST_VEHICLES];
      
      // Status filtresi varsa uygula
      if (status) {
        filteredVehicles = filteredVehicles.filter(vehicle => vehicle.status === status);
      }
      
      // Sayfalama
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedResults = filteredVehicles.slice(startIndex, endIndex);
      
      return res.status(200).json({
        success: true,
        data: paginatedResults,
        pagination: {
          total: filteredVehicles.length,
          page,
          limit,
          pages: Math.ceil(filteredVehicles.length / limit)
        }
      });
      
    } catch (dbError) {
      console.error('Veritabanı bağlantı hatası:', dbError);
      
      // Veritabanı hatası durumunda test verileri döndür
      let filteredVehicles = [...TEST_VEHICLES];
      
      // Status filtresi varsa uygula
      if (status) {
        filteredVehicles = filteredVehicles.filter(vehicle => vehicle.status === status);
      }
      
      // Sayfalama
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedResults = filteredVehicles.slice(startIndex, endIndex);
      
      return res.status(200).json({
        success: true,
        data: paginatedResults,
        pagination: {
          total: filteredVehicles.length,
          page,
          limit,
          pages: Math.ceil(filteredVehicles.length / limit)
        }
      });
    }
    
  } catch (error) {
    console.error('Araçlar alınırken hata:', error);
    return res.status(500).json({ 
      message: 'Sunucu hatası', 
      error: error.message 
    });
  }
} 