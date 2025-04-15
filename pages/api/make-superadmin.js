import { connectToDatabase } from '../../src/lib/mongodb';
import { ObjectId } from 'mongodb';
import { setupCORS, handleOptionsRequest, sendSuccess, sendError, logRequest } from '../../src/lib/api-utils';

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
    // Veritabanına bağlan
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // Güncellenecek kullanıcı e-posta adresi
    const email = 'mert@tasiapp.com';
    
    // Kullanıcıyı bul
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      return sendError(res, `${email} e-posta adresine sahip kullanıcı bulunamadı`, 404);
    }
    
    // Mevcut kullanıcı bilgilerini göster
    console.log('Mevcut kullanıcı bilgileri:', {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role || 'Yok',
      roles: user.roles || 'Yok'
    });
    
    // Kullanıcı rolünü her durumda güncelle
    const result = await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { 
          role: 'admin',
          roles: ['admin', 'super_admin'],
          updatedAt: new Date() 
        } 
      }
    );
    
    if (result.modifiedCount === 1) {
      // Güncellenmiş kullanıcıyı getir
      const updatedUser = await db.collection('users').findOne({ _id: user._id });
      
      return sendSuccess(res, { user: {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        roles: updatedUser.roles
      }}, 200, `${email} kullanıcısının rolü başarıyla super_admin olarak güncellendi`);
    } else {
      return sendError(res, 'Rol güncellemesi yapılamadı', 500);
    }
  } catch (error) {
    console.error('API hatası:', error);
    return sendError(res, 'Sunucu hatası', 500);
  }
} 