import { connectToDatabase } from '../../../src/lib/mongodb';
import { ObjectId } from 'mongodb';
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
    if (req.method !== 'PUT' && req.method !== 'POST') {
      res.setHeader('Allow', ['PUT', 'POST']);
      return sendError(res, `Metod ${req.method} izin verilmiyor`, 405);
    }
    
    // Veritabanına bağlan
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    const { userId, role } = req.body;
    
    // Gerekli alanları kontrol et
    if (!userId || !role) {
      return sendError(res, 'Kullanıcı ID ve rol alanları zorunludur', 400);
    }
    
    // ObjectId kontrolü
    let objectId;
    try {
      objectId = new ObjectId(userId);
    } catch (error) {
      return sendError(res, 'Geçersiz kullanıcı ID formatı', 400);
    }
    
    // Kullanıcıyı bul
    const user = await db.collection('users').findOne({ _id: objectId });
    
    if (!user) {
      return sendError(res, 'Belirtilen ID ile kullanıcı bulunamadı', 404);
    }
    
    // Kullanıcı rolünü güncelle
    const result = await db.collection('users').updateOne(
      { _id: objectId },
      { 
        $set: { 
          role: role,
          roles: [role],
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.modifiedCount === 0) {
      return sendError(res, 'Rol güncellenemedi', 400);
    }
    
    // Güncellenmiş kullanıcıyı al
    const updatedUser = await db.collection('users').findOne({ _id: objectId });
    
    return sendSuccess(res, {
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        roles: updatedUser.roles || [updatedUser.role]
      }
    }, 200, 'Kullanıcı rolü başarıyla güncellendi');
    
  } catch (error) {
    console.error('API hatası:', error);
    return sendError(res, 'Sunucu hatası: ' + error.message, 500);
  }
} 