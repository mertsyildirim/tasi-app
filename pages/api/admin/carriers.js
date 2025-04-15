import { connectToDatabase } from '../../../src/lib/mongodb';
import { ObjectId } from 'mongodb';
import { 
  setupCORS, 
  handleOptionsRequest, 
  sendSuccess, 
  sendError, 
  logRequest 
} from '../../../src/lib/api-utils';

// İzin verilen roller
const allowedRoles = ['admin', 'super_admin', 'editor', 'support'];

// Yetkilendirme kontrolü
async function isAuthorized(req) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return { authorized: false, message: 'Yetkilendirme başarısız. Token bulunamadı.' };
  }
  
  try {
    // Token doğrulama
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tasiapp-super-gizli-jwt-anahtar');
    const userRoles = decoded.roles || [];
    
    // Admin kontrolü
    if (!userRoles.some(role => allowedRoles.includes(role))) {
      return { 
        authorized: false, 
        message: 'Bu sayfaya erişim yetkiniz bulunmamaktadır. Sadece yöneticiler erişebilir.' 
      };
    }
    
    return { authorized: true, user: decoded };
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return { authorized: false, message: 'Geçersiz veya süresi dolmuş token.' };
    }
    
    return { authorized: false, message: 'Yetkilendirme kontrolünde bir hata oluştu.' };
  }
}

export default async function handler(req, res) {
  // CORS ayarları
  setupCORS(res);
  
  // OPTIONS isteği için erken yanıt
  if (handleOptionsRequest(req, res)) {
    return;
  }
  
  // İstek logla
  logRequest(req);
  
  // Yetkilendirme kontrolü
  const authResult = await isAuthorized(req);
  
  if (!authResult.authorized) {
    return sendError(res, authResult.message, 401);
  }
  
  try {
    // Veritabanı bağlantısı
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // GET metodu - Taşıyıcıları getir
    if (req.method === 'GET') {
      return getCarriers(req, res, db);
    }
    
    // POST metodu - Yeni taşıyıcı ekle
    if (req.method === 'POST') {
      return createCarrier(req, res, db);
    }
    
    // PUT metodu - Taşıyıcı güncelle
    if (req.method === 'PUT') {
      return updateCarrier(req, res, db);
    }
    
    // DELETE metodu - Taşıyıcı sil
    if (req.method === 'DELETE') {
      return deleteCarrier(req, res, db);
    }
    
    // Desteklenmeyen metot
    return sendError(res, 'Metot izin verilmiyor', 405);
    
  } catch (error) {
    console.error('API hatası:', error);
    return sendError(res, 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.', 500);
  }
}

// Taşıyıcıları getir
async function getCarriers(req, res, db) {
  try {
    const { status, search, companyId } = req.query;
      
      // Filtreleme koşulları
      let query = { roles: { $in: ['carrier'] } };
      
      if (status) {
        if (status === 'active') {
          query.isActive = true;
        } else if (status === 'inactive') {
          query.isActive = false;
        } else if (status === 'pendingdocs') {
          query.pendingDocuments = true;
        }
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }
    
    if (companyId) {
      query._id = new ObjectId(companyId);
    }
      
      // Taşıyıcıları getir
      const carriers = await db.collection('companies').find(query).toArray();
      
      // Ek bilgileri almak için taşıyıcı başına sürücü ve araç sayısını al
      const carriersWithDetails = await Promise.all(carriers.map(async carrier => {
        // Bu şirkete bağlı sürücü sayısını bul
        const driversCount = await db.collection('drivers')
          .countDocuments({ companyId: new ObjectId(carrier._id) });
        
        // Bu şirkete bağlı araç sayısını bul
        const vehiclesCount = await db.collection('vehicles')
          .countDocuments({ companyId: new ObjectId(carrier._id) });
        
        // Bu şirketin tamamlanmış taşıma sayısını bul
        const completedShipmentsCount = await db.collection('transports')
          .countDocuments({ 
            carrierId: new ObjectId(carrier._id), 
            status: 'completed' 
          });
        
        // Bu şirketin aktif taşıma sayısını bul
        const activeShipmentsCount = await db.collection('transports')
          .countDocuments({ 
            carrierId: new ObjectId(carrier._id), 
            status: { $in: ['active', 'in_progress', 'assigned'] } 
          });
        
        return {
          id: carrier._id.toString(),
          name: carrier.contactPerson || carrier.name,
          company: carrier.name,
          phone: carrier.phone || '',
          email: carrier.email || '',
          vehicles: vehiclesCount,
          drivers: driversCount,
          status: carrier.isActive ? 'Aktif' : 'Pasif',
          joinDate: carrier.createdAt ? new Date(carrier.createdAt).toLocaleDateString('tr-TR') : '',
          address: carrier.address || '',
          completedShipments: completedShipmentsCount,
          activeShipments: activeShipmentsCount,
          pendingDocuments: carrier.pendingDocuments || false,
          taxOffice: carrier.taxOffice || '',
          taxNumber: carrier.taxNumber || '',
          companyType: carrier.companyType || '',
          registrationNumber: carrier.registrationNumber || ''
        };
      }));
      
    // Doğru şekilde API yanıtı döndür - sendSuccess'e durum kodu yerine veri gönder
    return sendSuccess(res, {
        carriers: carriersWithDetails
    });
  } catch (error) {
    console.error('Taşıyıcıları getirme hatası:', error);
    return sendError(res, 'Taşıyıcı verileri alınırken bir hata oluştu', 500);
  }
}
    
// Yeni taşıyıcı oluştur
async function createCarrier(req, res, db) {
  try {
      const carrierData = req.body;
      
      // Zorunlu alanlar kontrolü
      if (!carrierData.name || !carrierData.phone || !carrierData.email) {
      return sendError(res, 'İsim, telefon ve e-posta alanları zorunludur.', 400);
    }
    
    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(carrierData.email)) {
      return sendError(res, 'Geçerli bir e-posta adresi giriniz.', 400);
    }
    
    // E-posta ile kullanıcı var mı kontrolü
    const existingCarrier = await db.collection('companies').findOne({ email: carrierData.email });
    if (existingCarrier) {
      return sendError(res, 'Bu e-posta adresi ile kayıtlı bir taşıyıcı zaten mevcut.', 400);
      }
      
      // Yeni taşıyıcı oluştur
      const newCarrier = {
        name: carrierData.company || carrierData.name,
        contactPerson: carrierData.name,
        phone: carrierData.phone,
        email: carrierData.email,
        address: carrierData.address || '',
        taxOffice: carrierData.taxOffice || '',
        taxNumber: carrierData.taxNumber || '',
        companyType: carrierData.companyType || '',
        registrationNumber: carrierData.registrationNumber || '',
        roles: ['carrier'],
        isActive: true,
        pendingDocuments: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Veritabanına ekle
      const result = await db.collection('companies').insertOne(newCarrier);
      
      if (result.acknowledged) {
      return sendSuccess(res, {
          message: 'Taşıyıcı başarıyla eklendi.',
          carrier: {
            _id: result.insertedId,
            ...newCarrier
          }
        }, 201);
      } else {
      return sendError(res, 'Taşıyıcı eklenirken bir hata oluştu.', 500);
    }
  } catch (error) {
    console.error('Taşıyıcı oluşturma hatası:', error);
    return sendError(res, 'Taşıyıcı eklenirken bir hata oluştu', 500);
      }
    }
    
// Taşıyıcı güncelle
async function updateCarrier(req, res, db) {
  try {
    const { id } = req.query;
    const carrierData = req.body;
    
    if (!id) {
      return sendError(res, 'Taşıyıcı ID belirtilmedi', 400);
    }
    
    if (!ObjectId.isValid(id)) {
      return sendError(res, 'Geçersiz taşıyıcı ID formatı', 400);
    }
    
    // Önceki taşıyıcı verilerini al
    const existingCarrier = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    });
    
    if (!existingCarrier) {
      return sendError(res, 'Taşıyıcı bulunamadı', 404);
    }
    
    // Güncelleme verileri hazırla
    const updateData = {
      ...carrierData,
      updatedAt: new Date()
    };
    
    // Veritabanında güncelle
    const result = await db.collection('companies').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return sendError(res, 'Taşıyıcı bulunamadı', 404);
    }
    
    // Güncellenmiş verileri getir
    const updatedCarrier = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    });
    
    return sendSuccess(res, {
      message: 'Taşıyıcı başarıyla güncellendi',
      carrier: updatedCarrier
    });
  } catch (error) {
    console.error('Taşıyıcı güncelleme hatası:', error);
    return sendError(res, 'Taşıyıcı güncellenirken bir hata oluştu', 500);
  }
}
    
// Taşıyıcı sil
async function deleteCarrier(req, res, db) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return sendError(res, 'Taşıyıcı ID belirtilmedi', 400);
    }
    
    if (!ObjectId.isValid(id)) {
      return sendError(res, 'Geçersiz taşıyıcı ID formatı', 400);
    }
    
    // İlişkili kaynaklar var mı kontrol et
    const drivers = await db.collection('drivers').countDocuments({
      companyId: new ObjectId(id)
    });
    
    const vehicles = await db.collection('vehicles').countDocuments({
      companyId: new ObjectId(id)
    });
    
    const activeTransports = await db.collection('transports').countDocuments({
      carrierId: new ObjectId(id),
      status: { $in: ['active', 'in_progress', 'assigned'] }
    });
    
    if (activeTransports > 0) {
      return sendError(res, 'Bu taşıyıcıya ait aktif taşımalar var. Önce bu taşımaları tamamlayın veya iptal edin.', 400);
    }
    
    // Önce sürücü ve araçları güncelle
    if (drivers > 0) {
      await db.collection('drivers').updateMany(
        { companyId: new ObjectId(id) },
        { $set: { companyId: null, companyName: null } }
      );
    }
    
    if (vehicles > 0) {
      await db.collection('vehicles').updateMany(
        { companyId: new ObjectId(id) },
        { $set: { companyId: null, companyName: null } }
      );
    }
    
    // Taşıyıcıyı sil
    const result = await db.collection('companies').deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return sendError(res, 'Taşıyıcı bulunamadı', 404);
    }
    
    return sendSuccess(res, {
      message: 'Taşıyıcı başarıyla silindi',
      affectedResources: {
        drivers,
        vehicles
      }
    });
  } catch (error) {
    console.error('Taşıyıcı silme hatası:', error);
    return sendError(res, 'Taşıyıcı silinirken bir hata oluştu', 500);
  }
} 