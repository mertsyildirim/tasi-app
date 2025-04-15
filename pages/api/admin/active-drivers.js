import { connectToDatabase } from '../../../src/lib/mongodb';
import { setupCORS, handleOptionsRequest, sendSuccess, sendError, logRequest } from '../../../src/lib/api-utils';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

/**
 * Kullanıcı yetkilendirme kontrolü
 */
async function isAuthorized(req) {
  try {
    // Token kontrolü
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authorized: false, message: 'Yetkilendirme başlığı gereklidir' };
    }

    // Token doğrulama
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
    
    // Admin sayfaları için gerekli roller
    const allowedRoles = ['admin', 'super_admin', 'editor', 'support'];
    if (!decoded.role || !allowedRoles.includes(decoded.role)) {
      return { authorized: false, message: 'Bu işlem için yeterli yetkiniz yok' };
    }

    return { authorized: true, userId: decoded.id, role: decoded.role };
  } catch (error) {
    console.error('Yetkilendirme hatası:', error);
    return { authorized: false, message: 'Geçersiz veya süresi dolmuş token' };
  }
}

/**
 * Aktif sürücüleri getir
 */
async function getActiveDrivers(req, res) {
  try {
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // Sorgu parametreleri
    const status = req.query.status || 'active'; // Varsayılan olarak aktif sürücüler
    const limit = parseInt(req.query.limit) || 50;
    const companyId = req.query.companyId || null;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    
    // Sorgu filtresi oluştur
    const filter = {};
    
    // Durum filtresi
    if (status === 'all') {
      // Tüm sürücüler
    } else if (status === 'active') {
      // Aktif sürücüler (online veya taşıma sırasında)
      filter.status = { $in: ['active', 'online', 'on_delivery', 'busy'] };
    } else {
      // Belirli bir durumdaki sürücüler
      filter.status = status;
    }
    
    // Şirket filtresi
    if (companyId) {
      filter.companyId = companyId;
    }
    
    // Arama filtresi
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { 'vehicle.licensePlate': { $regex: search, $options: 'i' } },
        { licensePlate: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { 'company.name': { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Toplam sürücü sayısını öğren
    let totalDrivers = 0;
    let drivers = [];
    
    // Önce "drivers" koleksiyonunu dene
    try {
      // Toplam sayı
      totalDrivers = await db.collection('drivers').countDocuments(filter);
      
      // Sürücü verileri
      if (totalDrivers > 0) {
        drivers = await db.collection('drivers')
          .find(filter)
          .skip(skip)
          .limit(limit)
          .sort({ lastActive: -1 })
          .toArray();
      }
    } catch (driversError) {
      console.error('Drivers koleksiyonu hatası:', driversError);
    }
    
    // Drivers koleksiyonunda veri bulunamadıysa users koleksiyonunu dene
    if (drivers.length === 0) {
      try {
        const userFilter = { role: 'driver', ...filter };
        
        // Toplam sayı
        totalDrivers = await db.collection('users').countDocuments(userFilter);
        
        // Kullanıcı verileri
        if (totalDrivers > 0) {
          drivers = await db.collection('users')
            .find(userFilter)
            .skip(skip)
            .limit(limit)
            .sort({ lastActive: -1 })
            .toArray();
        }
      } catch (usersError) {
        console.error('Users koleksiyonu hatası:', usersError);
        return sendError(res, 'Veritabanı bağlantı hatası. Lütfen sistem yöneticinize bildirin.', 500);
      }
    }
    
    // Hiç veri bulunamadıysa boş dizi döndür
    if (drivers.length === 0) {
      try {
        // Koleksiyonları kontrol et, yoksa oluştur
        const driversCollection = db.collection('drivers');
        if (!driversCollection) {
          await db.createCollection('drivers');
        }
        
        console.log('Veritabanında sürücü verisi bulunamadı, boş yanıt döndürülüyor');
        
        // Boş yanıt döndür
        return sendSuccess(res, {
          drivers: [],
          total: 0,
          active: 0,
          onDelivery: 0,
          page: page,
          totalPages: 0,
          hasMore: false
        });
      } catch (error) {
        console.error('Koleksiyon oluşturma hatası:', error);
        return sendError(res, 'Veritabanı işlemi sırasında bir hata oluştu', 500);
      }
    }
    
    // Sürücü verilerini formatla
    const formattedDrivers = drivers.map(driver => formatDriverData(driver)).filter(driver => driver !== null);
    
    // Yanıt gönder
    return sendSuccess(res, {
      drivers: formattedDrivers,
      total: totalDrivers,
      active: formattedDrivers.filter(d => d.status === 'active' || d.status === 'online').length,
      onDelivery: formattedDrivers.filter(d => d.status === 'on_delivery' || d.status === 'busy').length,
      page: page,
      totalPages: Math.ceil(totalDrivers / limit),
      hasMore: skip + limit < totalDrivers
    });
  } catch (error) {
    console.error('Aktif sürücüler getirilirken hata:', error);
    return sendError(res, 'Aktif sürücüler getirilirken bir hata oluştu', 500);
  }
}

/**
 * Sürücü verisini formatla
 */
function formatDriverData(driver) {
  // Geçersiz sürücü verisi kontrolü
  if (!driver) {
    return null;
  }

  // Son aktif zamanı formatla
  let lastActive = 'Bilinmiyor';
  if (driver.lastActive || driver.lastSeen) {
    try {
      const lastActiveDate = new Date(driver.lastActive || driver.lastSeen);
      const now = new Date();
      const diffMs = now - lastActiveDate;
      const diffMins = Math.round(diffMs / 60000);
      
      if (diffMins < 60) {
        lastActive = `${diffMins} dakika önce`;
      } else if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        lastActive = `${hours} saat önce`;
      } else {
        const days = Math.floor(diffMins / 1440);
        lastActive = `${days} gün önce`;
      }
    } catch (e) {
      console.error('Son aktif zaman hesaplama hatası:', e);
      lastActive = 'Bilinmiyor';
    }
  }
  
  // ID değerini güvenli bir şekilde elde et
  let id = '';
  if (driver._id) {
    try {
      id = typeof driver._id === 'string' ? driver._id : driver._id.toString();
    } catch (e) {
      console.error('ID dönüştürme hatası:', e);
    }
  }
  
  // Ad alanını formatla
  let name = driver.name || '';
  if (!name && (driver.firstName || driver.lastName)) {
    name = `${driver.firstName || ''} ${driver.lastName || ''}`.trim();
  }
  
  // Şirket bilgisi
  let companyId = null;
  if (driver.companyId) {
    companyId = driver.companyId;
  } else if (driver.company && driver.company._id) {
    try {
      companyId = typeof driver.company._id === 'string' ? driver.company._id : driver.company._id.toString();
    } catch (e) {
      console.error('Şirket ID dönüştürme hatası:', e);
    }
  }
  
  // Temel veri alanlarını oluştur
  return {
    id: id,
    name: name,
    phone: driver.phone || driver.phoneNumber || 'Belirtilmemiş',
    email: driver.email || 'Belirtilmemiş',
    status: driver.status || 'inactive',
    vehicleType: driver.vehicleType || (driver.vehicle ? driver.vehicle.type : null) || 'Belirtilmemiş',
    licensePlate: driver.licensePlate || (driver.vehicle ? driver.vehicle.licensePlate : null) || 'Belirtilmemiş',
    location: driver.location || driver.lastLocation || 'Bilinmiyor',
    lastActive: lastActive,
    lastActiveRaw: driver.lastActive || driver.lastSeen,
    company: (driver.company ? driver.company.name : null) || driver.companyName || 'Bağımsız',
    companyId: companyId
  };
}

/**
 * API ana işleyici
 */
export default async function handler(req, res) {
  // CORS ayarları
  setupCORS(res);
  
  // OPTIONS isteği kontrolü
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest(req, res);
  }
  
  // İstek logunu kaydet
  logRequest(req);
  
  // Yetkilendirme kontrolü
  const authResult = await isAuthorized(req);
  if (!authResult.authorized) {
    return sendError(res, authResult.message, 401);
  }
  
  // HTTP metodu kontrolü
  if (req.method === 'GET') {
    return getActiveDrivers(req, res);
  } else {
    return sendError(res, 'Geçersiz istek metodu', 405);
  }
} 