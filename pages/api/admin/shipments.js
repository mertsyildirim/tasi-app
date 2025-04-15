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
    console.log('Shipments API isteği alındı');
    
    // Token kontrolü yap
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Token bulunamadı veya yanlış format');
      return res.status(401).json({ success: false, message: 'Yetkilendirme başarısız: Token bulunamadı' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Token'ı doğrula
    try {
      // JWT secret tanımlı değilse varsayılan değer kullan
      if (!process.env.JWT_SECRET) {
        console.warn('UYARI: JWT_SECRET çevresel değişkeni tanımlanmamış, varsayılan değer kullanılıyor!');
        process.env.JWT_SECRET = 'tasiapp-super-gizli-jwt-anahtar';
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token doğrulandı, kullanıcı:', decoded.email);
      
      // Admin kontrolü - farklı formatlara destek
      const isAdmin = decoded.role === 'admin' || 
                     (decoded.roles && decoded.roles.includes('admin'));
                      
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
        
        // Shipments koleksiyonunun varlığını kontrol et
        console.log('ensureCollection() fonksiyonu çağrılıyor...');
        try {
          await ensureCollection('shipments');
          console.log('ensureCollection() tamamlandı');
        } catch (collectionError) {
          console.error('ensureCollection hatası:', collectionError);
          // ensureCollection hata verirse de devam et
        }
        
        console.log('Veritabanı bağlantısı kuruldu, metod:', req.method);
        
        // HTTP metodu kontrolü
        switch(req.method) {
          case 'GET':
            return await getShipments(req, res, db);
          
          case 'POST':
            return await createShipment(req, res, db);
          
          case 'PUT':
            return await updateShipment(req, res, db);
          
          case 'DELETE':
            return await deleteShipment(req, res, db);
          
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
    console.error('Shipments API sunucu hatası:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Decorating the handler with CORS middleware
export default allowCors(handler);

// Tüm sevkiyatları getir
async function getShipments(req, res, db) {
  console.log('getShipments fonksiyonu çağrıldı');
  
  try {
    // Query parametrelerini al
    const { status, search, page = 1, limit = 10 } = req.query;
    console.log('Query parametreleri:', { status, search, page, limit });
    
    // Sayfalandırma için sayıları parse et
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;
    
    // Filtre oluştur
    const filter = {};
    
    // Durum filtreleme
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Arama filtresi
    if (search && search.trim() !== '') {
      filter.$or = [
        { shipment_number: { $regex: search, $options: 'i' } },
        { 'sender_info.name': { $regex: search, $options: 'i' } },
        { 'sender_info.phone': { $regex: search, $options: 'i' } },
        { 'receiver_info.name': { $regex: search, $options: 'i' } },
        { 'receiver_info.phone': { $regex: search, $options: 'i' } },
        { current_location: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('Uygulanan filtre:', JSON.stringify(filter));
    
    // Shipments koleksiyonun durumunu kontrol et
    const collections = await db.listCollections().toArray();
    const hasShipments = collections.some(c => c.name === 'shipments');
    
    if (!hasShipments) {
      // Koleksiyonu oluştur ama örnek veri ekleme
      console.log('Shipments koleksiyonu bulunamadı, oluşturuluyor');
      await ensureCollection('shipments');
      console.log('Shipments koleksiyonu oluşturuldu');
    }
    
    // Verileri getir
    console.log('Sevkiyat verileri getiriliyor...');
    
    const shipments = await db.collection('shipments')
      .find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limitNumber)
      .toArray();
    
    console.log(`${shipments.length} adet sevkiyat bulundu`);
    
    // Toplam sayı bilgilerini getir
    const totalCount = await db.collection('shipments').countDocuments(filter);
    const pendingCount = await db.collection('shipments').countDocuments({ ...filter, status: 'bekleniyor' });
    const inTransitCount = await db.collection('shipments').countDocuments({ ...filter, status: 'taşınıyor' });
    const completedCount = await db.collection('shipments').countDocuments({ ...filter, status: 'tamamlandı' });
    const cancelledCount = await db.collection('shipments').countDocuments({ ...filter, status: 'iptal' });
    
    // Sonuçları döndür
    return res.status(200).json({
      success: true,
      data: {
        shipments,
        pagination: {
          total: totalCount,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalCount / limitNumber)
        },
        counts: {
          total: totalCount,
          pending: pendingCount,
          inTransit: inTransitCount,
          completed: completedCount,
          cancelled: cancelledCount
        }
      }
    });
  } catch (error) {
    console.error('Sevkiyat getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sevkiyat verileri getirilirken bir hata oluştu',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Taşıma ekle
async function addShipment(req, res, db) {
  try {
    const {
      customer,
      customerCompany,
      customerEmail,
      carrier,
      carrierCompany,
      from,
      to,
      amount,
      carrierPayment,
      cargoType,
      vehicleType,
      vehicle,
      weight,
      notes,
      status = 'Tarih Bekliyor'
    } = req.body;
    
    // Zorunlu alanları kontrol et
    if (!customer || !carrier || !from || !to || !amount || !cargoType || !vehicleType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Eksik bilgi gönderildi. Müşteri, taşıyıcı, kalkış, varış, tutar, yük tipi ve araç tipi bilgileri zorunludur.' 
      });
    }
    
    // Yeni taşıma oluştur
    const newShipment = {
      customer,
      customerCompany,
      customerEmail,
      carrier,
      carrierCompany,
      from,
      to,
      amount,
      carrierPayment,
      cargoType,
      vehicleType,
      vehicle,
      weight,
      notes,
      status,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Taşımayı veritabanına ekle
    const result = await db.collection('shipments').insertOne(newShipment);
    
    return res.status(201).json({
      success: true,
      message: 'Taşıma başarıyla eklendi',
      data: { ...newShipment, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Add shipment error:', error);
    return res.status(500).json({ success: false, message: 'Taşıma eklenirken hata oluştu', error: error.message });
  }
}

// Taşıma güncelle
async function updateShipment(req, res, db) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'Taşıma ID bilgisi eksik' });
    }
    
    // ID formatını kontrol et
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Geçersiz taşıma ID formatı' });
    }
    
    // Güncellenecek alanlar
    const { 
      customer,
      customerCompany,
      customerEmail,
      carrier,
      carrierCompany,
      from,
      to,
      amount,
      carrierPayment,
      cargoType,
      vehicleType,
      vehicle,
      weight,
      notes,
      status
    } = req.body;
    
    // Güncelleme nesnesi
    const updateData = {};
    
    // Sadece gönderilen alanları güncelle
    if (customer !== undefined) updateData.customer = customer;
    if (customerCompany !== undefined) updateData.customerCompany = customerCompany;
    if (customerEmail !== undefined) updateData.customerEmail = customerEmail;
    if (carrier !== undefined) updateData.carrier = carrier;
    if (carrierCompany !== undefined) updateData.carrierCompany = carrierCompany;
    if (from !== undefined) updateData.from = from;
    if (to !== undefined) updateData.to = to;
    if (amount !== undefined) updateData.amount = amount;
    if (carrierPayment !== undefined) updateData.carrierPayment = carrierPayment;
    if (cargoType !== undefined) updateData.cargoType = cargoType;
    if (vehicleType !== undefined) updateData.vehicleType = vehicleType;
    if (vehicle !== undefined) updateData.vehicle = vehicle;
    if (weight !== undefined) updateData.weight = weight;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;
    
    // Güncelleme zamanını ekle
    updateData.updatedAt = new Date();
    
    // Taşımayı güncelle
    const result = await db.collection('shipments').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Taşıma bulunamadı' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Taşıma başarıyla güncellendi',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Update shipment error:', error);
    return res.status(500).json({ success: false, message: 'Taşıma güncellenirken hata oluştu', error: error.message });
  }
}

// Taşıma sil
async function deleteShipment(req, res, db) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'Taşıma ID bilgisi eksik' });
    }
    
    // ID formatını kontrol et
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Geçersiz taşıma ID formatı' });
    }
    
    // Taşımayı sil
    const result = await db.collection('shipments').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Taşıma bulunamadı' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Taşıma başarıyla silindi',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Delete shipment error:', error);
    return res.status(500).json({ success: false, message: 'Taşıma silinirken hata oluştu', error: error.message });
  }
}

// Sevkiyat oluştur
async function createShipment(req, res, db) {
  console.log('Yeni sevkiyat oluşturma işlemi başlatıldı');
  
  try {
    // Request body'den verileri al
    const { 
      sender_info, 
      receiver_info, 
      cargo_details,
      pickup_date,
      estimated_delivery,
      current_location
    } = req.body;
    
    console.log('Gelen sevkiyat verileri:', {
      sender: sender_info ? 'var' : 'yok',
      receiver: receiver_info ? 'var' : 'yok',
      cargo: cargo_details ? 'var' : 'yok'
    });
    
    // Zorunlu alanları kontrol et
    if (!sender_info) {
      return res.status(400).json({ 
        success: false, 
        message: 'Gönderici bilgileri gerekli' 
      });
    }
    
    if (!receiver_info) {
      return res.status(400).json({ 
        success: false, 
        message: 'Alıcı bilgileri gerekli' 
      });
    }
    
    if (!cargo_details) {
      return res.status(400).json({ 
        success: false, 
        message: 'Kargo detayları gerekli' 
      });
    }
    
    // Gerekli alt alanları kontrol et
    if (!sender_info.name || !sender_info.phone || !sender_info.address) {
      return res.status(400).json({ 
        success: false, 
        message: 'Gönderici adı, telefonu ve adresi gerekli' 
      });
    }
    
    if (!receiver_info.name || !receiver_info.phone || !receiver_info.address) {
      return res.status(400).json({ 
        success: false, 
        message: 'Alıcı adı, telefonu ve adresi gerekli' 
      });
    }
    
    if (!cargo_details.weight || !cargo_details.dimensions || !cargo_details.type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Kargo ağırlığı, boyutları ve tipi gerekli' 
      });
    }
    
    // Sevkiyat numarası oluştur
    const shipmentNumber = 'SHP' + Math.floor(1000000 + Math.random() * 9000000);
    console.log('Sevkiyat numarası oluşturuldu:', shipmentNumber);
    
    // Yeni sevkiyat verisi
    const newShipment = {
      shipment_number: shipmentNumber,
      status: 'bekleniyor',
      sender_info: {
        name: sender_info.name,
        phone: sender_info.phone,
        email: sender_info.email || '',
        address: sender_info.address,
        company: sender_info.company || ''
      },
      receiver_info: {
        name: receiver_info.name,
        phone: receiver_info.phone,
        email: receiver_info.email || '',
        address: receiver_info.address,
        company: receiver_info.company || ''
      },
      cargo_details: {
        weight: cargo_details.weight,
        dimensions: cargo_details.dimensions,
        type: cargo_details.type,
        description: cargo_details.description || '',
        value: cargo_details.value || 0,
        is_fragile: cargo_details.is_fragile || false
      },
      pickup_date: pickup_date ? new Date(pickup_date) : new Date(),
      estimated_delivery: estimated_delivery ? new Date(estimated_delivery) : new Date(Date.now() + 3*24*60*60*1000),
      current_location: current_location || 'Merkez Depo',
      tracking_history: [
        {
          timestamp: new Date(),
          status: 'bekleniyor',
          location: current_location || 'Merkez Depo',
          notes: 'Sevkiyat oluşturuldu'
        }
      ],
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // DB'ye ekle
    const result = await db.collection('shipments').insertOne(newShipment);
    
    if (result.acknowledged) {
      console.log('Sevkiyat başarıyla eklendi, ID:', result.insertedId);
      return res.status(201).json({
        success: true,
        message: 'Sevkiyat başarıyla oluşturuldu',
        data: {
          _id: result.insertedId,
          shipment_number: shipmentNumber,
          status: 'bekleniyor'
        }
      });
    } else {
      console.error('Sevkiyat eklenirken bir hata oluştu');
      return res.status(500).json({ 
        success: false, 
        message: 'Sevkiyat eklenirken bir hata oluştu' 
      });
    }
  } catch (error) {
    console.error('Sevkiyat oluşturma hatası:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Sevkiyat oluşturulurken bir hata oluştu', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 