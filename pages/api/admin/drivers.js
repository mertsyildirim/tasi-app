import { connectToDatabase } from '../../../src/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { setupCORS, handleOptionsRequest, sendSuccess, sendError, logRequest } from '../../../src/lib/api-utils';

// Admin yetkisi kontrolü
const isAuthorized = (req) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authorized: false, error: 'Yetkilendirme başlığı geçersiz' };
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tasiapp-secret-key2024');
    
    // Admin paneline erişim için izin verilen roller
    const allowedRoles = ['super_admin', 'editor', 'support'];
    
    // Hem role hem de roles alanını kontrol et
    const userRole = decoded.role;
    const userRoles = decoded.roles || [userRole];
    
    // Kullanıcının herhangi bir rolü izin verilen rollerden biriyse erişime izin ver
    const hasAllowedRole = userRoles.some(role => allowedRoles.includes(role)) || allowedRoles.includes(userRole);
    
    if (!hasAllowedRole) {
      return { authorized: false, error: 'Bu işlem için yönetici yetkileri gereklidir' };
    }
    
    return { authorized: true, user: decoded };
  } catch (error) {
    console.error('Yetkilendirme hatası:', error);
    return { authorized: false, error: 'Yetkilendirme hatası' };
  }
};

export default async function handler(req, res) {
  // CORS ayarlarını ekle
  setupCORS(res);
  
  // OPTIONS isteğini işle
  if (handleOptionsRequest(req, res)) {
    return;
  }
  
  // İsteği logla
  logRequest(req);

  // Yetkilendirme kontrolü
  const auth = isAuthorized(req);
  if (!auth.authorized) {
    return sendError(res, auth.error, 401);
  }
  
  try {
    // İstek metoduna göre işlem yap
    switch (req.method) {
      case 'GET':
        return await getDrivers(req, res);
      case 'POST':
        return await createDriver(req, res);
      case 'PUT':
        return await updateDriver(req, res);
      case 'DELETE':
        return await deleteDriver(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return sendError(res, `Method ${req.method} not allowed`, 405);
    }
  } catch (error) {
    console.error('Sürücüler API hatası:', error);
    return sendError(res, 'Sunucu hatası', 500, error);
  }
}

/**
 * Tüm sürücüleri getir
 */
async function getDrivers(req, res) {
  try {
    // Veritabanına bağlan
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // Filtreleri al
    const { status, search, companyId, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Arama filtresi oluştur
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (companyId) {
      filter.companyId = companyId;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { plateNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { 'vehicle.licensePlate': { $regex: search, $options: 'i' } },
        { licensePlate: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { 'company.name': { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('Sürücü filtresi:', filter);
    
    // Toplam sayıyı getir ve sürücü verileri
    let total = 0;
    let drivers = [];
    
    // Önce "drivers" koleksiyonunu dene
    try {
      // Toplam sayı
      total = await db.collection('drivers').countDocuments(filter);
      
      // Sürücü verileri
      if (total > 0) {
        drivers = await db.collection('drivers')
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
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
        total = await db.collection('users').countDocuments(userFilter);
        
        // Kullanıcı verileri
        if (total > 0) {
          drivers = await db.collection('users')
            .find(userFilter)
            .sort({ lastActive: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .toArray();
        }
      } catch (usersError) {
        console.error('Users koleksiyonu hatası:', usersError);
        return sendError(res, 'Veritabanı bağlantı hatası. Lütfen sistem yöneticinize bildirin.', 500);
      }
    }
    
    console.log(`${drivers.length} sürücü bulundu.`);
    
    // Sürücü formatını düzenle
    const formattedDrivers = drivers.map(driver => {
      // Sürücü nesnesini güvenli bir şekilde işle
      if (!driver) return null;
      
      // _id değerini güvenli bir şekilde işle
      let driverId = '';
      if (driver._id) {
        driverId = typeof driver._id === 'string' ? driver._id : driver._id.toString();
      }
      
      // Ad alanını formatla
      let driverName = driver.name || '';
      if (!driverName && (driver.firstName || driver.lastName)) {
        driverName = `${driver.firstName || ''} ${driver.lastName || ''}`.trim();
      }
      
      return {
        id: driverId,
        name: driverName,
        phone: driver.phone || driver.phoneNumber || '',
        plateNumber: driver.plateNumber || driver.licensePlate || (driver.vehicle ? driver.vehicle.licensePlate : '') || '',
        companyId: driver.companyId || (driver.company && driver.company._id ? driver.company._id.toString() : '') || '',
        companyName: driver.companyName || (driver.company ? driver.company.name : '') || '',
        status: driver.status || 'active',
        createdAt: driver.createdAt || driver.created || new Date(),
        updatedAt: driver.updatedAt || driver.updated || new Date()
      };
    }).filter(driver => driver !== null);
    
    return sendSuccess(res, { 
      drivers: formattedDrivers,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Sürücüler getirme hatası:', error);
    return sendError(res, 'Sürücü verileri yüklenirken bir hata oluştu', 500, error);
  }
}

/**
 * Yeni bir sürücü oluştur
 */
async function createDriver(req, res) {
  try {
    // Gövde kontrolü
    if (!req.body || Object.keys(req.body).length === 0) {
      return sendError(res, 'Geçersiz istek: Boş gövde', 400);
    }
    
    // Veritabanına bağlan
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    const { name, phone, plateNumber, companyId, companyName } = req.body;
    
    // Zorunlu alanları kontrol et
    if (!name || !phone || !plateNumber) {
      return sendError(res, 'Tüm zorunlu alanları doldurun (isim, telefon, plaka)', 400);
    }
    
    // Telefon numarası formatını kontrol et
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return sendError(res, 'Geçerli bir telefon numarası giriniz', 400);
    }
    
    // Plaka numarası zaten kullanılıyor mu kontrol et
    const existingDriver = await db.collection('drivers').findOne({ plateNumber });
    if (existingDriver) {
      return sendError(res, 'Bu plaka numarası zaten kullanılıyor', 400);
    }
    
    // Şirket bilgilerini kontrol et
    if (companyId) {
      const company = await db.collection('companies').findOne({ _id: new ObjectId(companyId) });
      if (!company) {
        return sendError(res, 'Belirtilen şirket bulunamadı', 400);
      }
    }
    
    // Yeni sürücü nesnesini oluştur
    const newDriver = {
      name,
      phone,
      plateNumber,
      companyId: companyId || null,
      companyName: companyName || null,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Sürücüyü veritabanına ekle
    const result = await db.collection('drivers').insertOne(newDriver);
    
    const driverToReturn = {
      ...newDriver,
      id: result.insertedId.toString()
    };
    
    return sendSuccess(res, { driver: driverToReturn }, 201, 'Sürücü başarıyla oluşturuldu');
  } catch (error) {
    console.error('Sürücü ekleme hatası:', error);
    return sendError(res, 'Sürücü eklenirken bir hata oluştu', 500, error);
  }
}

/**
 * Sürücü güncelle
 */
async function updateDriver(req, res) {
  try {
    // Gövde kontrolü
    if (!req.body || Object.keys(req.body).length === 0) {
      return sendError(res, 'Geçersiz istek: Boş gövde', 400);
    }
    
    // Sürücü ID'sini al
    const driverId = req.query.id;
    if (!driverId) {
      return sendError(res, 'Sürücü ID gereklidir', 400);
    }
    
    // ID formatını kontrol et
    let objectId;
    try {
      objectId = new ObjectId(driverId);
    } catch (error) {
      return sendError(res, 'Geçersiz sürücü ID formatı', 400);
    }
    
    // Veritabanına bağlan
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // Sürücü var mı kontrol et
    const existingDriver = await db.collection('drivers').findOne({ _id: objectId });
    if (!existingDriver) {
      return sendError(res, 'Sürücü bulunamadı', 404);
    }
    
    const updateData = { ...req.body };
    
    // Plaka değişiyorsa ve zaten kullanılıyorsa kontrol et
    if (updateData.plateNumber && updateData.plateNumber !== existingDriver.plateNumber) {
      const plateInUse = await db.collection('drivers').findOne({ 
        plateNumber: updateData.plateNumber,
        _id: { $ne: objectId }
      });
      
      if (plateInUse) {
        return sendError(res, 'Bu plaka numarası zaten kullanılıyor', 400);
      }
    }
    
    // Şirket bilgilerini kontrol et
    if (updateData.companyId && updateData.companyId !== existingDriver.companyId) {
      const company = await db.collection('companies').findOne({ _id: new ObjectId(updateData.companyId) });
      if (!company) {
        return sendError(res, 'Belirtilen şirket bulunamadı', 400);
      }
    }
    
    // Güncelleme tarihini ekle
    updateData.updatedAt = new Date();
    
    // Sürücü bilgilerini güncelle
    await db.collection('drivers').updateOne(
      { _id: objectId },
      { $set: updateData }
    );
    
    // Güncellenmiş sürücüyü getir
    const updatedDriver = await db.collection('drivers').findOne({ _id: objectId });
    
    const driverToReturn = {
      ...updatedDriver,
      id: updatedDriver._id.toString(),
      _id: undefined
    };
    
    return sendSuccess(res, { driver: driverToReturn }, 200, 'Sürücü başarıyla güncellendi');
  } catch (error) {
    console.error('Sürücü güncelleme hatası:', error);
    return sendError(res, 'Sürücü güncellenirken bir hata oluştu', 500, error);
  }
}

/**
 * Sürücü sil
 */
async function deleteDriver(req, res) {
  try {
    // Sürücü ID'sini al
    const driverId = req.query.id;
    if (!driverId) {
      return sendError(res, 'Sürücü ID gereklidir', 400);
    }
    
    // ID formatını kontrol et
    let objectId;
    try {
      objectId = new ObjectId(driverId);
    } catch (error) {
      return sendError(res, 'Geçersiz sürücü ID formatı', 400);
    }
    
    // Veritabanına bağlan
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // Sürücüyü sil
    const result = await db.collection('drivers').deleteOne({ _id: objectId });
    
    if (result.deletedCount === 0) {
      return sendError(res, 'Sürücü bulunamadı', 404);
    }
    
    return sendSuccess(res, null, 200, 'Sürücü başarıyla silindi');
  } catch (error) {
    console.error('Sürücü silme hatası:', error);
    return sendError(res, 'Sürücü silinirken bir hata oluştu', 500, error);
  }
} 