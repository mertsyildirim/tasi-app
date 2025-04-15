import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../src/lib/mongodb';
import { setupCORS, handleOptionsRequest, sendSuccess, sendError, logRequest } from '../../../src/lib/api-utils';

export default async function handler(req, res) {
  // CORS ayarlarını ekle
  setupCORS(res);
  
  // OPTIONS isteğini işle
  if (handleOptionsRequest(req, res)) {
    return;
  }
  
  // İsteği logla
  logRequest(req);
  
  try {
    if (req.method !== 'PUT') {
      res.setHeader('Allow', ['PUT']);
      return sendError(res, `Method ${req.method} not allowed`, 405);
    }
    
    // Gövde kontrolü
    if (!req.body || Object.keys(req.body).length === 0) {
      return sendError(res, 'Geçersiz istek: Boş gövde', 400);
    }
    
    return await updateUserRole(req, res);
  } catch (error) {
    console.error('API Hatası:', error);
    return sendError(res, 'Sunucu hatası', 500, error);
  }
}

// Kullanıcı rollerini güncelle
async function updateUserRole(req, res) {
  try {
    console.log('Kullanıcı rolü güncelleme isteği alındı');
    
    // Veritabanına bağlan
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // Kullanıcı ID ve yeni rolleri al
    const { userId, roles } = req.body;
    
    if (!userId) {
      return sendError(res, 'Kullanıcı ID gereklidir', 400);
    }
    
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return sendError(res, 'Geçerli roller dizisi gereklidir', 400);
    }
    
    // ObjectId formatına dönüştür
    let objectId;
    try {
      objectId = new ObjectId(userId);
    } catch (error) {
      return sendError(res, 'Geçersiz kullanıcı ID formatı', 400);
    }
    
    // Kullanıcıyı bul
    const user = await db.collection('users').findOne({ _id: objectId });
    
    if (!user) {
      return sendError(res, 'Kullanıcı bulunamadı', 404);
    }
    
    console.log('Kullanıcı bulundu:', user.email);
    console.log('Mevcut roller:', user.roles);
    console.log('Yeni roller:', roles);
    
    // Rolleri güncelle
    const updateResult = await db.collection('users').updateOne(
      { _id: objectId },
      { 
        $set: { 
          roles: roles,
          updatedAt: new Date()
        } 
      }
    );
    
    if (updateResult.matchedCount === 0) {
      return sendError(res, 'Kullanıcı bulunamadı', 404);
    }
    
    if (updateResult.modifiedCount === 0) {
      return sendError(res, 'Roller zaten aynı', 200);
    }
    
    console.log('Roller başarıyla güncellendi');
    
    return sendSuccess(res, {
      userId: userId,
      roles: roles
    }, 200, 'Kullanıcı rolleri başarıyla güncellendi');
    
  } catch (error) {
    console.error('Rol güncelleme hatası:', error);
    return sendError(res, 'Kullanıcı rolleri güncellenirken bir hata oluştu', 500, error);
  }
} 