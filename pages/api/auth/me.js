import { connectToDatabase } from '../../../src/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
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
  
  // Sadece GET isteklerine izin ver
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return sendError(res, `Method ${req.method} not allowed`, 405);
  }
  
  try {
    // Authorization header'dan token'ı al
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Yetkilendirme başlığı geçersiz', 401);
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tasiapp-secret-key2024');
      
      // Veritabanına bağlan
      const conn = await connectToDatabase();
      const db = conn.connection.db;
      
      // Kullanıcıyı bul
      let userId;
      try {
        userId = new ObjectId(decoded.userId);
      } catch (e) {
        userId = decoded.userId; // Eğer ObjectId formatında değilse
      }
      
      const user = await db.collection('users').findOne({ _id: userId });
      
      if (!user) {
        return sendError(res, 'Kullanıcı bulunamadı', 404);
      }
      
      // Kullanıcı bilgilerini döndür (şifre hariç)
      const { password, ...userWithoutPassword } = user;
      
      // Roller bilgisini kontrol et ve formatlı şekilde gönder
      const userData = {
        ...userWithoutPassword,
        id: userWithoutPassword._id.toString(),
        roles: userWithoutPassword.roles || [userWithoutPassword.role || 'customer']
      };
      
      return sendSuccess(res, { user: userData });
    } catch (error) {
      console.error('Token doğrulama hatası:', error);
      return sendError(res, 'Geçersiz veya süresi dolmuş token', 401);
    }
  } catch (error) {
    console.error('API hatası:', error);
    return sendError(res, 'Sunucu hatası', 500);
  }
} 