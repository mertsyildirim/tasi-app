import { connectToDatabase } from '../../../src/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { setupCORS, handleOptionsRequest, sendSuccess, sendError, logRequest } from '../../../src/lib/api-utils';

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
 * Tüm bildirimleri getir
 */
async function getNotifications(req, res, userId) {
  try {
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // Sayfalama özellikleri
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Filtreler
    const filters = { userId: userId };
    
    // Okunma durumu filtreleme
    if (req.query.read === 'true') {
      filters.read = true;
    } else if (req.query.read === 'false') {
      filters.read = false;
    }
    
    // Tür filtreleme
    if (req.query.type) {
      filters.type = req.query.type;
    }
    
    // Sorgu
    const notifications = await db.collection('notifications')
      .find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Toplam kayıt sayısı
    const total = await db.collection('notifications').countDocuments(filters);
    
    // Verileri düzenleme (ID'leri string'e çevirme)
    const formattedNotifications = notifications.map(notification => {
      return {
        ...notification,
        id: notification._id.toString(),
        _id: undefined
      };
    });
    
    // Yanıt gönder
    return sendSuccess(res, {
      notifications: formattedNotifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Bildirimler getirilirken hata:', error);
    return sendError(res, 'Bildirimler getirilirken bir hata oluştu', 500);
  }
}

/**
 * Yeni bildirim oluştur
 */
async function createNotification(req, res, userId) {
  try {
    // Form verilerini al
    const { 
      title, 
      message, 
      type, 
      url, 
      recipientType, 
      recipientId, 
      sendEmail 
    } = req.body;
    
    // Zorunlu alanları kontrol et
    if (!title && !message) {
      return sendError(res, 'Bildirim başlığı veya mesajı gereklidir', 400);
    }
    
    if (!type) {
      return sendError(res, 'Bildirim türü zorunludur', 400);
    }
    
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // Alıcıları belirle
    let recipients = [];
    
    if (recipientType === 'user' && recipientId) {
      // Belirli bir kullanıcıya gönder
      recipients = [recipientId];
    } else {
      // Kullanıcı gruplarına göre alıcıları belirle
      const roleFilter = {
        'all': {},  // Tüm kullanıcılar
        'admins': { role: { $in: ['admin', 'super_admin', 'editor', 'support'] } },
        'customers': { role: 'customer' },
        'carriers': { role: 'company' },
        'drivers': { role: 'driver' }
      };
      
      // Varsayılan olarak tüm kullanıcılara gönder
      const filter = roleFilter[recipientType] || {};
      
      // Kullanıcıları getir
      const users = await db.collection('users').find(filter, { projection: { _id: 1 } }).toArray();
      recipients = users.map(user => user._id.toString());
    }
    
    console.log(`${recipients.length} kullanıcıya bildirim gönderiliyor`);
    
    // Bildirimler koleksiyonu
    const notifications = [];
    const now = new Date();
    
    // Her alıcı için bildirim oluştur
    for (const recipientId of recipients) {
      const notification = {
        text: title || message, // Başlık veya mesaj kullanılır
        description: title ? message : '', // Başlık varsa, mesaj açıklama olur
        type,
        url: url || '',
        userId: recipientId,
        read: false,
        createdAt: now,
        createdBy: userId
      };
      
      notifications.push(notification);
    }
    
    // Bildirimleri toplu olarak ekle
    let result = { insertedCount: 0 };
    
    if (notifications.length > 0) {
      result = await db.collection('notifications').insertMany(notifications);
      console.log(`${result.insertedCount} bildirim oluşturuldu`);
    }
    
    // E-posta gönderimi etkinleştirilmişse
    if (sendEmail && recipients.length > 0) {
      try {
        // Kullanıcı verilerini getir
        const userIds = recipients.map(id => {
          try {
            return new ObjectId(id);
          } catch (error) {
            return null;
          }
        }).filter(id => id !== null);
        
        const users = await db.collection('users').find(
          { _id: { $in: userIds } },
          { projection: { email: 1, name: 1 } }
        ).toArray();
        
        console.log(`${users.length} kullanıcıya e-posta gönderilecek`);
        
        // E-posta gönderme işlemi burada yapılacak
        // Bu işlem asenkron olarak arka planda devam eder
        // Örnek: sendEmailNotification(users, title, message, type);
      } catch (emailError) {
        console.error('E-posta gönderimi hazırlanırken hata:', emailError);
      }
    }
    
    return sendSuccess(res, {
      success: true,
      insertedCount: result.insertedCount,
      recipientCount: recipients.length
    }, 201, `${result.insertedCount} bildirim başarıyla oluşturuldu`);
  } catch (error) {
    console.error('Bildirim oluşturulurken hata:', error);
    return sendError(res, 'Bildirim oluşturulurken bir hata oluştu', 500);
  }
}

/**
 * Bildirimleri okundu olarak işaretle
 */
async function markNotificationsAsRead(req, res, userId) {
  try {
    const { ids } = req.body;
    
    // ID kontrolü
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return sendError(res, 'Okundu olarak işaretlenecek bildirim ID\'leri gereklidir', 400);
    }
    
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // ObjectId'lere dönüştür
    const objectIds = ids.map(id => {
      try {
        return new ObjectId(id);
      } catch (error) {
        console.error(`Geçersiz ID formatı: ${id}`);
        return null;
      }
    }).filter(id => id !== null);
    
    if (objectIds.length === 0) {
      return sendError(res, 'Hiçbir geçerli bildirim ID\'si bulunamadı', 400);
    }
    
    // Bildirimleri güncelle
    const result = await db.collection('notifications').updateMany(
      { 
        _id: { $in: objectIds },
        userId: userId // Sadece kullanıcının kendi bildirimleri
      },
      { $set: { read: true, readAt: new Date() } }
    );
    
    return sendSuccess(res, {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    }, 200, `${result.modifiedCount} bildirim okundu olarak işaretlendi`);
  } catch (error) {
    console.error('Bildirimler okundu olarak işaretlenirken hata:', error);
    return sendError(res, 'Bildirimler okundu olarak işaretlenirken bir hata oluştu', 500);
  }
}

/**
 * Bildirimleri sil
 */
async function deleteNotifications(req, res, userId) {
  try {
    const { ids } = req.body;
    
    // ID kontrolü
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return sendError(res, 'Silinecek bildirim ID\'leri gereklidir', 400);
    }
    
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // ObjectId'lere dönüştür
    const objectIds = ids.map(id => {
      try {
        return new ObjectId(id);
      } catch (error) {
        console.error(`Geçersiz ID formatı: ${id}`);
        return null;
      }
    }).filter(id => id !== null);
    
    if (objectIds.length === 0) {
      return sendError(res, 'Hiçbir geçerli bildirim ID\'si bulunamadı', 400);
    }
    
    // Bildirimleri sil
    const result = await db.collection('notifications').deleteMany({
      _id: { $in: objectIds },
      userId: userId // Sadece kullanıcının kendi bildirimleri
    });
    
    return sendSuccess(res, {
      deletedCount: result.deletedCount
    }, 200, `${result.deletedCount} bildirim silindi`);
  } catch (error) {
    console.error('Bildirimler silinirken hata:', error);
    return sendError(res, 'Bildirimler silinirken bir hata oluştu', 500);
  }
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
    return getNotifications(req, res, authResult.userId);
  } else if (req.method === 'POST') {
    return createNotification(req, res, authResult.userId);
  } else if (req.method === 'PUT') {
    return markNotificationsAsRead(req, res, authResult.userId);
  } else if (req.method === 'DELETE') {
    return deleteNotifications(req, res, authResult.userId);
  } else {
    return sendError(res, 'Geçersiz istek metodu', 405);
  }
} 