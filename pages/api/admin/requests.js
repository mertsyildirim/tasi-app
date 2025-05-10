import { connectToDatabase } from '../../../src/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  let conn = null;
  
  try {
    // API isteği bilgilerini kaydet
    console.log('---------------------------------------------');
    console.log(`API isteği alındı: ${req.method} ${req.url}`);
    console.log('Query parametreleri:', req.query);
    
    // Token kontrolü
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader ? `Mevcut (${authHeader.substring(0, 15)}...)` : 'Bulunamadı');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Geçersiz authorization header formatı veya token bulunamadı');
      return res.status(401).json({ 
        success: false, 
        message: 'Yetkilendirme başarısız. Geçerli bir Bearer token sağlanmalıdır.' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('Bearer token içeriği boş');
      return res.status(401).json({ 
        success: false, 
        message: 'Yetkilendirme başarısız. Token bulunamadı.' 
      });
    }
    
    // JWT SECRET kontrol
    const jwtSecret = process.env.JWT_SECRET || 'tasiapp-super-gizli-jwt-anahtar';
    console.log('JWT secret kullanılıyor:', jwtSecret.substring(0, 5) + '...');
    
    // Token doğrulama
    console.log('Token doğrulanıyor...');
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Token başarıyla doğrulandı. Kullanıcı bilgileri:', {
      id: decoded._id || 'Belirtilmemiş',
      email: decoded.email || 'Belirtilmemiş',
      roles: decoded.roles || []
    });
    
    // Admin rolü kontrolü
    const userRoles = decoded.roles || [];
    const userEmail = decoded.email || '';
    console.log('Kullanıcı rolleri:', userRoles);
    console.log('Kullanıcı email:', userEmail);
    
    // Özel erişim izni olan kullanıcılar
    const specialAccessUsers = ['mert@tasiapp.com', 'admin@tasiapp.com'];
    
    if (!userRoles.includes('admin') && !specialAccessUsers.includes(userEmail)) {
      console.log('Yetkisiz erişim, kullanıcı admin rolüne sahip değil ve özel erişim listesinde değil');
      return res.status(403).json({ 
        success: false, 
        message: 'Bu sayfaya erişim yetkiniz bulunmamaktadır. Sadece yöneticiler erişebilir.' 
      });
    }
    
    // Veritabanı bağlantısı
    console.log('Veritabanına bağlanılıyor...');
    conn = await connectToDatabase();
    
    if (!conn || !conn.connection) {
      throw new Error('Veritabanı bağlantısı oluşturulamadı');
    }
    
    const db = conn.connection.db;
    console.log('Veritabanı bağlantısı başarılı');
    
    // GET metodu - Talepleri getir
    if (req.method === 'GET') {
      console.log('GET isteği işleniyor, query:', req.query);
      const { status, search, page = 1, limit = 10 } = req.query;
      
      // Filtreleme koşulları
      let query = {};
      
      if (status) {
        if (status === 'new') {
          query.status = 'Yeni';
        } else if (status === 'awaiting') {
          query.status = 'Taşıyıcı Onayı Bekleniyor';
        } else if (status === 'rejected') {
          query.status = 'Taşıyıcı Onayı Olmadı';
        } else if (status === 'payment') {
          query.status = 'Ödeme Bekleniyor';
        } else if (status === 'canceled') {
          query.status = 'İptal Edildi';
        } else if (status === 'sms') {
          query.status = 'İndirim SMS Gönderildi';
        }
      }
      
      if (search) {
        query.$or = [
          { customerName: { $regex: search, $options: 'i' } },
          { id: { $regex: search, $options: 'i' } },
          { pickupLocation: { $regex: search, $options: 'i' } },
          { deliveryLocation: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Talepleri getir
      try {
        // Sayfalama için hesaplamalar
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        
        // Toplam talep sayısını getir
        const totalRequests = await db.collection('requests').countDocuments(query);
        
        // Talepleri getir
        const requests = await db.collection('requests')
          .find(query)
          .sort({ createdAt: -1 }) // En yeni talepler önce
          .skip(skip)
          .limit(limitNum)
          .toArray();
        
        console.log(`${requests.length} talep bulundu`);
        
        // Talepler için ek veri işlemleri
        const enrichedRequests = await Promise.all(requests.map(async request => {
          let carrier = null;
          
          // Eğer taşıyıcı ID'si varsa, taşıyıcı bilgilerini getir
          if (request.carrierId) {
            try {
              carrier = await db.collection('carriers').findOne({
                _id: new ObjectId(request.carrierId)
              });
            } catch (err) {
              console.error(`Taşıyıcı bilgileri alınırken hata: ${err.message}`);
            }
          }
          
          return {
            id: request.id || request._id.toString(),
            customerName: request.customerName || '',
            customerPhone: request.customerPhone || '',
            pickupLocation: request.pickupLocation || '',
            deliveryLocation: request.deliveryLocation || '',
            distance: request.distance || '',
            vehicle: request.vehicle || '',
            status: request.status || 'Yeni',
            date: request.date || (request.createdAt ? new Date(request.createdAt).toLocaleDateString('tr-TR') : ''),
            time: request.time || (request.createdAt ? new Date(request.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''),
            price: request.price || '',
            description: request.description || '',
            carrierId: request.carrierId || null,
            carrier: carrier ? carrier.name : (request.carrier || null),
            payment: request.payment || null
          };
        }));
        
        console.log('Talep verileri başarıyla hazırlandı, yanıt gönderiliyor');
        return res.status(200).json({
          success: true,
          requests: enrichedRequests,
          pagination: {
            total: totalRequests,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(totalRequests / limitNum)
          }
        });
      } catch (err) {
        console.error('Talep verileri alınırken hata:', err);
        return res.status(500).json({
          success: false,
          message: 'Talep verileri alınırken bir hata oluştu',
          error: err.message
        });
      }
    }
    
    // POST metodu - Yeni talep ekle
    if (req.method === 'POST') {
      const requestData = req.body;
      
      // Zorunlu alanlar kontrolü
      if (!requestData.customerName || !requestData.customerPhone || !requestData.pickupLocation || !requestData.deliveryLocation) {
        return res.status(400).json({
          success: false,
          message: 'Müşteri adı, telefon, alım ve teslimat lokasyonları zorunludur.'
        });
      }
      
      // Talep ID oluştur (TL-XXXX formatında)
      const lastRequest = await db.collection('requests')
        .find()
        .sort({ _id: -1 })
        .limit(1)
        .toArray();
      
      let requestNumber = 1000;
      if (lastRequest.length > 0 && lastRequest[0].id) {
        const lastIdNumber = parseInt(lastRequest[0].id.split('-')[1]);
        if (!isNaN(lastIdNumber)) {
          requestNumber = lastIdNumber + 1;
        }
      }
      
      const requestId = `TL-${requestNumber}`;
      
      // Yeni talep oluştur
      const newRequest = {
        id: requestId,
        customerName: requestData.customerName,
        customerPhone: requestData.customerPhone,
        pickupLocation: requestData.pickupLocation,
        deliveryLocation: requestData.deliveryLocation,
        distance: requestData.distance || '',
        vehicle: requestData.vehicle || '',
        status: requestData.status || 'Yeni',
        date: requestData.date || new Date().toLocaleDateString('tr-TR'),
        time: requestData.time || new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        price: requestData.price || '',
        description: requestData.description || '',
        carrierId: requestData.carrierId || null,
        carrier: requestData.carrier || null,
        payment: requestData.payment || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Veritabanına ekle
      const result = await db.collection('requests').insertOne(newRequest);
      
      if (result.acknowledged) {
        return res.status(201).json({
          success: true,
          message: 'Talep başarıyla eklendi.',
          request: {
            _id: result.insertedId,
            ...newRequest
          }
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Talep eklenirken bir hata oluştu.'
        });
      }
    }
    
    // PUT metodu - Talep güncelle
    if (req.method === 'PUT') {
      const { id } = req.query;
      const updateData = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Talep ID\'si gereklidir.'
        });
      }
      
      // Güncelleme verilerini hazırla
      const updatedData = {
        ...updateData,
        updatedAt: new Date()
      };
      
      // ID'ye göre iki şekilde kontrol et (string ID veya ObjectId)
      const filter = id.startsWith('TL-') 
        ? { id: id } 
        : { _id: new ObjectId(id) };
      
      const result = await db.collection('requests').updateOne(
        filter,
        { $set: updatedData }
      );
      
      if (result.matchedCount > 0) {
        return res.status(200).json({
          success: true,
          message: 'Talep başarıyla güncellendi.'
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Talep bulunamadı.'
        });
      }
    }
    
    // DELETE metodu - Talep sil
    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Talep ID\'si gereklidir.'
        });
      }
      
      // ID'ye göre iki şekilde kontrol et (string ID veya ObjectId)
      const filter = id.startsWith('TL-') 
        ? { id: id } 
        : { _id: new ObjectId(id) };
      
      const result = await db.collection('requests').deleteOne(filter);
      
      if (result.deletedCount > 0) {
        return res.status(200).json({
          success: true,
          message: 'Talep başarıyla silindi.'
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Talep bulunamadı.'
        });
      }
    }
    
    // Desteklenmeyen metot
    return res.status(405).json({
      success: false,
      message: 'Metot izin verilmiyor'
    });
    
  } catch (error) {
    console.error('API hatası:', error);
    
    if (error.name === 'JsonWebTokenError') {
      console.log('JWT doğrulama hatası:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token formatı: ' + error.message
      });
    } else if (error.name === 'TokenExpiredError') {
      console.log('Token süresi dolmuş:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Token süresi dolmuş. Lütfen yeniden giriş yapın.'
      });
    } else if (error.name === 'MongoServerError' || error.name === 'MongoError') {
      console.error('MongoDB hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Veritabanı işlemi başarısız oldu: ' + error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası: ' + error.message
    });
  } finally {
    // Veritabanı bağlantısını kapat
    if (conn && conn.connection) {
      try {
        console.log('Veritabanı bağlantısı kapatılıyor...');
        // MongoDB bağlantısını kapat
        // Not: Bazı MongoDB istemcileri için bu adım gerekli olmayabilir
      } catch (err) {
        console.error('Veritabanı bağlantısı kapatılırken hata:', err);
      }
    }
  }
} 