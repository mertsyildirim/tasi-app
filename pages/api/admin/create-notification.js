import { connectToDatabase } from '../../../src/lib/mongodb';
import { setupCORS, handleOptionsRequest, sendSuccess, sendError, logRequest } from '../../../src/lib/api-utils';
import jwt from 'jsonwebtoken';

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
    
    return { authorized: true, userId: decoded.id, role: decoded.role };
  } catch (error) {
    console.error('Yetkilendirme hatası:', error);
    return { authorized: false, message: 'Geçersiz veya süresi dolmuş token' };
  }
}

/**
 * Bildirim oluştur
 */
async function createNotification(req, res, userId) {
  try {
    // Bildirim verilerini al
    const { text, description, type, url, recipientId } = req.body;
    
    // Zorunlu alanları kontrol et
    if (!text || !type) {
      return sendError(res, 'Bildirim metni ve türü zorunludur', 400);
    }
    
    // Veritabanına bağlan
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // Bildirim verisi oluştur
    const notification = {
      text,
      description: description || '',
      type,
      url: url || '',
      userId: recipientId || userId, // Alıcı belirtilmemişse bildirimi oluşturan kullanıcıya gönder
      read: false,
      createdAt: new Date(),
      createdBy: userId
    };
    
    // Bildirimi ekle
    const result = await db.collection('notifications').insertOne(notification);
    
    console.log('Bildirim oluşturuldu, ID:', result.insertedId);
    
    return sendSuccess(res, {
      success: true,
      notificationId: result.insertedId.toString()
    }, 201, 'Bildirim başarıyla oluşturuldu');
  } catch (error) {
    console.error('Bildirim oluşturulurken hata:', error);
    return sendError(res, 'Bildirim oluşturulurken bir hata oluştu', 500);
  }
}

/**
 * API işleyici
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
  
  // Sadece POST isteğine izin ver
  if (req.method === 'POST') {
    return createNotification(req, res, authResult.userId);
  } else {
    return sendError(res, 'Geçersiz istek metodu', 405);
  }
} 