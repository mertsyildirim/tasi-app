const { connectToDatabase } = require('../../../lib/mongodb');
const jwt = require('jsonwebtoken');
const { API_CONFIG } = require('../config');

// Test fatura verileri
const TEST_INVOICES = [
  {
    id: 'inv_12345',
    invoiceNumber: 'FTR2024-0001',
    date: '2024-06-01T10:30:00Z',
    dueDate: '2024-06-15T23:59:59Z',
    customerId: 'cust_789',
    customerName: 'Ahmet Yılmaz',
    customerCompany: 'ABC Elektronik Ltd. Şti.',
    amount: 2500,
    tax: 450,
    totalAmount: 2950,
    currency: 'TRY',
    status: 'PAID',
    paymentDate: '2024-06-10T15:20:00Z',
    shipmentId: 'shp_12340',
    shipmentDetails: {
      from: 'İstanbul, Kadıköy',
      to: 'Ankara, Çankaya',
      date: '2024-05-28T09:00:00Z'
    },
    createdAt: '2024-06-01T10:30:00Z'
  },
  {
    id: 'inv_12346',
    invoiceNumber: 'FTR2024-0002',
    date: '2024-06-02T14:15:00Z',
    dueDate: '2024-06-16T23:59:59Z',
    customerId: 'cust_790',
    customerName: 'Mehmet Demir',
    customerCompany: 'Demir Tekstil A.Ş.',
    amount: 3200,
    tax: 576,
    totalAmount: 3776,
    currency: 'TRY',
    status: 'PENDING',
    shipmentId: 'shp_12346',
    shipmentDetails: {
      from: 'İzmir, Karşıyaka',
      to: 'İstanbul, Beşiktaş',
      date: '2024-06-12T08:00:00Z'
    },
    createdAt: '2024-06-02T14:15:00Z'
  },
  {
    id: 'inv_12347',
    invoiceNumber: 'FTR2024-0003',
    date: '2024-06-03T09:20:00Z',
    dueDate: '2024-06-17T23:59:59Z',
    customerId: 'cust_791',
    customerName: 'Ayşe Kaya',
    customerCompany: 'Kaya Mobilya',
    amount: 4500,
    tax: 810,
    totalAmount: 5310,
    currency: 'TRY',
    status: 'PROCESSING',
    shipmentId: 'shp_12347',
    shipmentDetails: {
      from: 'Bursa, Nilüfer',
      to: 'Antalya, Muratpaşa',
      date: '2024-06-08T10:00:00Z'
    },
    createdAt: '2024-06-03T09:20:00Z'
  },
  {
    id: 'inv_12348',
    invoiceNumber: 'FTR2024-0004',
    date: '2024-06-04T11:45:00Z',
    dueDate: '2024-06-18T23:59:59Z',
    customerId: 'cust_792',
    customerName: 'Hasan Özdemir',
    customerCompany: 'Özdemir Otomotiv',
    amount: 1800,
    tax: 324,
    totalAmount: 2124,
    currency: 'TRY',
    status: 'OVERDUE',
    shipmentId: 'shp_12348',
    shipmentDetails: {
      from: 'Kocaeli, İzmit',
      to: 'İstanbul, Ümraniye',
      date: '2024-06-01T08:30:00Z'
    },
    createdAt: '2024-06-04T11:45:00Z'
  },
  {
    id: 'inv_12349',
    invoiceNumber: 'FTR2024-0005',
    date: '2024-06-05T13:10:00Z',
    dueDate: '2024-06-19T23:59:59Z',
    customerId: 'cust_793',
    customerName: 'Ayşe Kılıç',
    customerCompany: 'Kılıç Gıda Ltd. Şti.',
    amount: 2900,
    tax: 522,
    totalAmount: 3422,
    currency: 'TRY',
    status: 'CANCELLED',
    cancellationReason: 'Sipariş iptali',
    shipmentId: 'shp_12349',
    shipmentDetails: {
      from: 'Ankara, Keçiören',
      to: 'Konya, Selçuklu',
      date: '2024-06-15T10:00:00Z'
    },
    createdAt: '2024-06-05T13:10:00Z'
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
        data: TEST_INVOICES
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
        let filteredInvoices = [...TEST_INVOICES];
        
        // Status filtresi varsa uygula
        if (status) {
          filteredInvoices = filteredInvoices.filter(invoice => invoice.status === status);
        }
        
        // Sayfalama
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedResults = filteredInvoices.slice(startIndex, endIndex);
        
        return res.status(200).json({
          success: true,
          data: paginatedResults,
          pagination: {
            total: filteredInvoices.length,
            page,
            limit,
            pages: Math.ceil(filteredInvoices.length / limit)
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
      
      // MongoDB'den verileri çek
      // Gerçek uygulamada burada veritabanı sorguları olacak
      
      // Test verileri döndür
      let filteredInvoices = [...TEST_INVOICES];
      
      // Status filtresi varsa uygula
      if (status) {
        filteredInvoices = filteredInvoices.filter(invoice => invoice.status === status);
      }
      
      // Sayfalama
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedResults = filteredInvoices.slice(startIndex, endIndex);
      
      return res.status(200).json({
        success: true,
        data: paginatedResults,
        pagination: {
          total: filteredInvoices.length,
          page,
          limit,
          pages: Math.ceil(filteredInvoices.length / limit)
        }
      });
      
    } catch (dbError) {
      console.error('Veritabanı bağlantı hatası:', dbError);
      
      // Veritabanı hatası durumunda test verileri döndür
      let filteredInvoices = [...TEST_INVOICES];
      
      // Status filtresi varsa uygula
      if (status) {
        filteredInvoices = filteredInvoices.filter(invoice => invoice.status === status);
      }
      
      // Sayfalama
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedResults = filteredInvoices.slice(startIndex, endIndex);
      
      return res.status(200).json({
        success: true,
        data: paginatedResults,
        pagination: {
          total: filteredInvoices.length,
          page,
          limit,
          pages: Math.ceil(filteredInvoices.length / limit)
        }
      });
    }
    
  } catch (error) {
    console.error('Faturalar alınırken hata:', error);
    return res.status(500).json({ 
      message: 'Sunucu hatası', 
      error: error.message 
    });
  }
} 