import jwt from 'jsonwebtoken';
import { connectToDatabase, ensureCollection } from '../../../src/lib/mongodb';
import { ObjectId } from 'mongodb';

// CORS middleware
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  return await fn(req, res);
};

// Ana işleyici fonksiyonu
async function handler(req, res) {
  try {
    console.log('Payments API isteği alındı');
    
    // Token kontrolü yap
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Token bulunamadı veya yanlış format');
      return res.status(401).json({ success: false, message: 'Yetkilendirme başarısız: Token bulunamadı' });
    }
    
    const token = authHeader.split(' ')[1];
    console.log('Token alındı:', token.substring(0, 15) + '...');
    
    // Token'ı doğrula
    try {
      // JWT secret tanımlı değilse varsayılan değer kullan
      if (!process.env.JWT_SECRET) {
        console.warn('UYARI: JWT_SECRET çevresel değişkeni tanımlanmamış, varsayılan değer kullanılıyor!');
        process.env.JWT_SECRET = 'tasiapp-super-gizli-jwt-anahtar';
      }
      
      console.log('JWT doğrulaması yapılıyor...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token doğrulandı, kullanıcı:', decoded.email);
      
      // Admin kontrolü - farklı formatlara destek
      const isAdmin = decoded.role === 'admin' || 
                     (decoded.roles && decoded.roles.includes('admin'));
      
      console.log('Kullanıcı bilgileri:', { 
        email: decoded.email,
        role: decoded.role || 'belirtilmemiş', 
        roles: decoded.roles || [], 
        isAdmin 
      });
                      
      if (!isAdmin) {
        console.log('Yetkisiz erişim, kullanıcı rolü:', decoded.role || decoded.roles);
        return res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok' });
      }
      
      // MongoDB bağlantısı
      console.log('Veritabanı bağlantısı kuruluyor...');
      
      try {
        // Veritabanı bağlantısı kur
        console.log('connectToDatabase() fonksiyonu çağrılıyor...');
        const connection = await connectToDatabase();
        console.log('connectToDatabase() tamamlandı, dönüş değerleri:', {
          hasConnection: !!connection,
          hasConn: !!connection?.conn,
          hasDb: !!connection?.db,
          keys: Object.keys(connection || {})
        });
        
        // db nesnesini elde etmeye çalış
        const db = connection.db || (connection.conn && connection.conn.db) || 
                 (connection.connection && connection.connection.db);
        
        if (!db) {
          console.error('DB nesnesi alınamadı, connection objesi:', JSON.stringify(connection));
          throw new Error('Veritabanı bağlantısı başarısız: DB nesnesi alınamadı');
        }
        
        console.log('DB nesnesi başarıyla alındı');
        
        // Payments koleksiyonunun varlığını kontrol et
        console.log('ensureCollection() fonksiyonu çağrılıyor...');
        try {
          await ensureCollection('payments');
          console.log('ensureCollection() tamamlandı');
        } catch (collectionError) {
          console.error('ensureCollection hatası:', collectionError);
          // ensureCollection hata verirse de devam et
        }
        
        console.log('Veritabanı bağlantısı kuruldu, metod:', req.method);
        
        // HTTP metodu kontrolü
        switch(req.method) {
          case 'GET':
            return await getPayments(req, res, db);
          
          case 'POST':
            return await createPayment(req, res, db);
          
          case 'PUT':
            return await updatePayment(req, res, db);
          
          case 'DELETE':
            return await deletePayment(req, res, db);
          
          default:
            console.log('Desteklenmeyen HTTP metodu:', req.method);
            return res.status(405).json({ success: false, message: 'Metod izni yok' });
        }
      } catch (dbError) {
        console.error('Veritabanı bağlantı hatası:', dbError);
        return res.status(500).json({ 
          success: false, 
          message: 'Veritabanı bağlantı hatası', 
          error: dbError.message, 
          stack: process.env.NODE_ENV === 'development' ? dbError.stack : undefined 
        });
      }
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        console.log('Token doğrulama hatası:', error.message);
        return res.status(401).json({ success: false, message: 'Geçersiz veya süresi dolmuş token' });
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Payments API sunucu hatası:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Tüm ödemeleri getir
async function getPayments(req, res, db) {
  console.log('getPayments fonksiyonu çağrıldı');
  
  try {
    // Tüm ödeme verilerini temizle (sadece customer ve carrier ödemeleri)
    console.log('Mevcut ödeme verilerini temizliyorum...');
    await db.collection('payments').deleteMany({
      payment_type: { $in: ['customer', 'carrier'] }
    });
    console.log('Ödeme verileri temizlendi');
    
    // Tüm ödeme verilerini sildikten sonra boş veri döndür
    return res.status(200).json({
      success: true,
      data: {
        payments: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        },
        stats: {
          customer: {
            total: 0,
            paid: 0,
            pending: 0,
            canceled: 0,
            revenue: 0,
            pendingRevenue: 0
          },
          carrier: {
            total: 0,
            paid: 0,
            pending: 0,
            waitingDate: 0,
            canceled: 0,
            payment: 0,
            pendingPayment: 0
          }
        }
      }
    });
    
    // Aşağıdaki kodlar artık çalışmaz, bu bir erken dönüş
    // Query parametrelerini al
    const { 
      type = 'all', // customer veya carrier veya all
      status, // ödendi, beklemede, tarih_bekliyor, iptal (array olabilir)
      search, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    console.log('Query parametreleri:', { type, status, search, page, limit });
    
    // Sayfalandırma için sayıları parse et
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;
    
    // Filtre oluştur
    const filter = {};
    
    // Ödeme tipi filtreleme
    if (type && type !== 'all') {
      filter.payment_type = type;
    }
    
    // Durum filtreleme
    if (status) {
      // Birden fazla durum seçilebilir
      const statusList = Array.isArray(status) ? status : [status];
      if (statusList.length > 0 && statusList[0] !== 'all') {
        filter.status = { $in: statusList };
      }
    }
    
    // Arama filtresi
    if (search && search.trim() !== '') {
      filter.$or = [
        { payment_id: { $regex: search, $options: 'i' } },
        { order_id: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'carrier.name': { $regex: search, $options: 'i' } },
        { shipment_id: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('Uygulanan filtre:', JSON.stringify(filter));
    
    // Payments koleksiyonun durumunu kontrol et
    const collections = await db.listCollections().toArray();
    const hasPayments = collections.some(c => c.name === 'payments');
    
    if (!hasPayments) {
      // Koleksiyonu oluştur ama örnek veri ekleme
      console.log('Payments koleksiyonu bulunamadı, oluşturuluyor');
      await ensureCollection('payments');
      console.log('Payments koleksiyonu oluşturuldu');
    }
    
    // Verileri getir
    console.log('Ödeme verileri getiriliyor...');
    
    const payments = await db.collection('payments')
      .find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limitNumber)
      .toArray();
    
    console.log(`${payments.length} adet ödeme bulundu`);
    
    // Toplam sayı bilgilerini getir
    const totalCount = await db.collection('payments').countDocuments(filter);
    
    // Durum istatistikleri için veriler
    const customerPaymentCountPromise = db.collection('payments').countDocuments({ payment_type: 'customer' });
    const carrierPaymentCountPromise = db.collection('payments').countDocuments({ payment_type: 'carrier' });
    
    const customerPaidCountPromise = db.collection('payments').countDocuments({ 
      payment_type: 'customer', 
      status: 'ödendi' 
    });
    
    const customerPendingCountPromise = db.collection('payments').countDocuments({ 
      payment_type: 'customer', 
      status: 'beklemede' 
    });
    
    const customerCanceledCountPromise = db.collection('payments').countDocuments({ 
      payment_type: 'customer', 
      status: 'iptal' 
    });
    
    const carrierPaidCountPromise = db.collection('payments').countDocuments({ 
      payment_type: 'carrier', 
      status: 'ödendi' 
    });
    
    const carrierPendingCountPromise = db.collection('payments').countDocuments({ 
      payment_type: 'carrier', 
      status: 'beklemede' 
    });
    
    const carrierWaitingDateCountPromise = db.collection('payments').countDocuments({ 
      payment_type: 'carrier', 
      status: 'tarih_bekliyor' 
    });
    
    const carrierCanceledCountPromise = db.collection('payments').countDocuments({ 
      payment_type: 'carrier', 
      status: 'iptal' 
    });
    
    // Parasal istatistikler
    const customerRevenuePipeline = [
      { $match: { payment_type: 'customer', status: 'ödendi' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ];
    
    const customerPendingRevenuePipeline = [
      { $match: { payment_type: 'customer', status: 'beklemede' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ];
    
    const carrierPaymentPipeline = [
      { $match: { payment_type: 'carrier', status: 'ödendi' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ];
    
    const carrierPendingPaymentPipeline = [
      { $match: { payment_type: 'carrier', $or: [{ status: 'beklemede' }, { status: 'tarih_bekliyor' }] } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ];
    
    // Tüm verileri aynı anda al
    const [
      customerPaymentCount,
      carrierPaymentCount,
      customerPaidCount,
      customerPendingCount,
      customerCanceledCount,
      carrierPaidCount,
      carrierPendingCount,
      carrierWaitingDateCount,
      carrierCanceledCount,
      customerRevenueResult,
      customerPendingRevenueResult,
      carrierPaymentResult,
      carrierPendingPaymentResult
    ] = await Promise.all([
      customerPaymentCountPromise,
      carrierPaymentCountPromise,
      customerPaidCountPromise,
      customerPendingCountPromise,
      customerCanceledCountPromise,
      carrierPaidCountPromise,
      carrierPendingCountPromise,
      carrierWaitingDateCountPromise,
      carrierCanceledCountPromise,
      db.collection('payments').aggregate(customerRevenuePipeline).toArray(),
      db.collection('payments').aggregate(customerPendingRevenuePipeline).toArray(),
      db.collection('payments').aggregate(carrierPaymentPipeline).toArray(),
      db.collection('payments').aggregate(carrierPendingPaymentPipeline).toArray()
    ]);
    
    // Parasal değerleri hesapla
    const customerRevenue = customerRevenueResult.length > 0 ? customerRevenueResult[0].total : 0;
    const customerPendingRevenue = customerPendingRevenueResult.length > 0 ? customerPendingRevenueResult[0].total : 0;
    const carrierPayment = carrierPaymentResult.length > 0 ? carrierPaymentResult[0].total : 0;
    const carrierPendingPayment = carrierPendingPaymentResult.length > 0 ? carrierPendingPaymentResult[0].total : 0;
    
    // İstatistik verileri
    const stats = {
      customer: {
        total: customerPaymentCount,
        paid: customerPaidCount,
        pending: customerPendingCount,
        canceled: customerCanceledCount,
        revenue: customerRevenue,
        pendingRevenue: customerPendingRevenue
      },
      carrier: {
        total: carrierPaymentCount,
        paid: carrierPaidCount,
        pending: carrierPendingCount,
        waitingDate: carrierWaitingDateCount,
        canceled: carrierCanceledCount,
        payment: carrierPayment,
        pendingPayment: carrierPendingPayment
      }
    };
    
    // Sayfa verilerini formatla
    const formattedPayments = payments.map(payment => {
      // Eksik alanlar için varsayılan değerler kullan
      const formattedPayment = {
        id: payment.payment_id || payment._id?.toString() || 'Bilinmiyor',
        amount: payment.amount ? `${payment.amount.toLocaleString('tr-TR')} ₺` : '0 ₺',
        status: payment.status === 'ödendi' ? 'Ödendi' : 
                payment.status === 'beklemede' ? 'Beklemede' : 
                payment.status === 'tarih_bekliyor' ? 'Tarih Bekliyor' : 
                payment.status === 'iptal' ? 'İptal Edildi' : (payment.status || 'Beklemede'),
        date: payment.date ? new Date(payment.date).toLocaleDateString('tr-TR') : 'Belirsiz',
        method: payment.payment_method === 'kredi_kartı' ? 'Kredi Kartı' :
                payment.payment_method === 'havale' ? 'Havale/EFT' :
                payment.payment_method === 'nakit' ? 'Nakit' : (payment.payment_method || 'Havale/EFT')
      };
      
      // Müşteri veya taşıyıcı bilgilerini güvenli şekilde ekle
      if (payment.payment_type === 'customer' && payment.customer) {
        formattedPayment.customerName = payment.customer.name || 'İsim Yok';
        formattedPayment.company = payment.customer.company || '';
        formattedPayment.orderId = payment.order_id || 'Sipariş Yok';
      } else if (payment.payment_type === 'carrier' && payment.carrier) {
        formattedPayment.carrierName = payment.carrier.name || 'İsim Yok';
        formattedPayment.driverName = payment.carrier.driver || '';
        formattedPayment.shipmentId = payment.shipment_id || 'Taşıma Yok';
      } else {
        // Tip bilgisi eksikse veya customer/carrier nesne eksikse
        formattedPayment.customerName = 'Bilgi Yok';
        formattedPayment.company = '';
        formattedPayment.orderId = 'Bilgi Yok';
        formattedPayment.carrierName = 'Bilgi Yok';
        formattedPayment.driverName = '';
        formattedPayment.shipmentId = 'Bilgi Yok';
      }
      
      return formattedPayment;
    });
    
    // Sonuçları döndür
    return res.status(200).json({
      success: true,
      data: {
        payments: formattedPayments,
        pagination: {
          total: totalCount,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalCount / limitNumber)
        },
        stats
      }
    });
  } catch (error) {
    console.error('Ödeme getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Ödeme verileri getirilirken bir hata oluştu',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Ödeme oluştur
async function createPayment(req, res, db) {
  console.log('createPayment fonksiyonu çağrıldı');
  
  try {
    const { 
      payment_type, // customer veya carrier
      customer, // { name, company }
      carrier, // { name, driver } 
      amount,
      status,
      date,
      payment_method,
      order_id,
      shipment_id
    } = req.body;
    
    // Zorunlu alanları kontrol et
    if (!payment_type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ödeme tipi gerekli' 
      });
    }
    
    if (payment_type !== 'customer' && payment_type !== 'carrier') {
      return res.status(400).json({ 
        success: false, 
        message: 'Geçersiz ödeme tipi. "customer" veya "carrier" olmalıdır' 
      });
    }
    
    if (!amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ödeme tutarı gerekli' 
      });
    }
    
    if (payment_type === 'customer' && !customer) {
      return res.status(400).json({ 
        success: false, 
        message: 'Müşteri bilgileri gerekli' 
      });
    }
    
    if (payment_type === 'carrier' && !carrier) {
      return res.status(400).json({ 
        success: false, 
        message: 'Taşıyıcı bilgileri gerekli' 
      });
    }
    
    if (payment_type === 'customer' && !order_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sipariş numarası gerekli' 
      });
    }
    
    if (payment_type === 'carrier' && !shipment_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Taşıma numarası gerekli' 
      });
    }
    
    // Ödeme ID oluştur
    const prefix = payment_type === 'customer' ? 'PAY-' : 'CRP-';
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    const paymentId = `${prefix}${randomNumber}`;
    
    // Yeni ödeme nesnesi oluştur
    const newPayment = {
      payment_id: paymentId,
      payment_type,
      amount: parseFloat(amount),
      status: status || 'beklemede',
      date: date ? new Date(date) : null,
      payment_method: payment_method || 'havale',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    if (payment_type === 'customer') {
      newPayment.customer = customer;
      newPayment.order_id = order_id;
    } else {
      newPayment.carrier = carrier;
      newPayment.shipment_id = shipment_id;
    }
    
    // Ödemeyi veritabanına ekle
    const result = await db.collection('payments').insertOne(newPayment);
    
    if (!result.acknowledged) {
      throw new Error('Ödeme eklenirken bir hata oluştu');
    }
    
    return res.status(201).json({
      success: true,
      message: 'Ödeme başarıyla oluşturuldu',
      data: {
        payment_id: paymentId
      }
    });
  } catch (error) {
    console.error('Ödeme oluşturma hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Ödeme oluşturulurken bir hata oluştu',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Ödeme güncelle
async function updatePayment(req, res, db) {
  console.log('updatePayment fonksiyonu çağrıldı');
  
  try {
    const { payment_id } = req.query;
    
    if (!payment_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ödeme ID gerekli'
      });
    }
    
    // Güncellenecek özellikler
    const updateFields = {};
    
    // Güncellenebilecek alanlar
    const { status, date, payment_method, amount } = req.body;
    
    if (status) updateFields.status = status;
    if (date) updateFields.date = new Date(date);
    if (payment_method) updateFields.payment_method = payment_method;
    if (amount) updateFields.amount = parseFloat(amount);
    
    // Güncelleme zamanı
    updateFields.updated_at = new Date();
    
    // Ödemeyi güncelle
    const result = await db.collection('payments').updateOne(
      { payment_id },
      { $set: updateFields }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ödeme bulunamadı'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Ödeme başarıyla güncellendi',
      data: {
        payment_id,
        updated: result.modifiedCount > 0
      }
    });
  } catch (error) {
    console.error('Ödeme güncelleme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Ödeme güncellenirken bir hata oluştu',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Ödeme sil
async function deletePayment(req, res, db) {
  console.log('deletePayment fonksiyonu çağrıldı');
  
  try {
    const { payment_id } = req.query;
    
    if (!payment_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ödeme ID gerekli'
      });
    }
    
    // Ödemeyi sil
    const result = await db.collection('payments').deleteOne({ payment_id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ödeme bulunamadı'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Ödeme başarıyla silindi'
    });
  } catch (error) {
    console.error('Ödeme silme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Ödeme silinirken bir hata oluştu',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// CORS middleware ile sarılmış handler fonksiyonu
export default allowCors(handler); 