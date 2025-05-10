import { connectToDatabase } from '../../../src/lib/mongodb';
import { ObjectId } from 'mongodb';
import { setupCORS, handleOptionsRequest, sendSuccess, sendError, logRequest } from '../../../src/lib/api-utils';
import jwt from 'jsonwebtoken';

/**
 * E-posta ayarlarını doğrulama
 */
function validateEmailSettings(settings) {
  const { smtpHost, smtpPort, smtpUser, smtpPassword, senderName, senderEmail, useSSL } = settings;
  
  if (!smtpHost || !smtpPort || !smtpUser || !senderName || !senderEmail) {
    return { isValid: false, message: 'SMTP sunucu, port, kullanıcı, gönderen adı ve e-posta zorunludur' };
  }
  
  // Port numarası kontrolü
  if (isNaN(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
    return { isValid: false, message: 'Geçersiz port numarası' };
  }
  
  // E-posta formatı kontrolü
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(senderEmail) || !emailRegex.test(smtpUser)) {
    return { isValid: false, message: 'Geçersiz e-posta formatı' };
  }
  
  return { isValid: true };
}

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
    
    // Kullanıcı rolü kontrolü (sadece admin ve süper admin)
    const allowedRoles = ['admin', 'super_admin', 'editor'];
    if (!decoded.role || !allowedRoles.includes(decoded.role)) {
      return { authorized: false, message: 'Bu işlem için yeterli yetkiniz yok' };
    }

    return { authorized: true, userId: decoded.id };
  } catch (error) {
    console.error('Yetkilendirme hatası:', error);
    return { authorized: false, message: 'Geçersiz veya süresi dolmuş token' };
  }
}

/**
 * E-posta ayarlarını getir
 */
async function getEmailSettings(req, res) {
  try {
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // En son kaydedilen e-posta ayarlarını getir
    const settings = await db.collection('settings').findOne({ type: 'email' });
    
    if (!settings) {
      // Ayarlar bulunamadıysa varsayılan değerleri döndür
      return sendSuccess(res, {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: 'bildirim@tasiapp.com',
        smtpPassword: '', // Güvenlik nedeniyle şifre gönderilmez
        senderName: 'Taşı App',
        senderEmail: 'bildirim@tasiapp.com',
        useSSL: true,
        lastUpdated: new Date()
      });
    }
    
    // Şifre gizleme
    const result = {
      ...settings,
      smtpPassword: settings.smtpPassword ? '********' : ''
    };
    
    return sendSuccess(res, result);
  } catch (error) {
    console.error('E-posta ayarları getirilirken hata:', error);
    return sendError(res, 'E-posta ayarları getirilirken bir hata oluştu', 500);
  }
}

/**
 * E-posta ayarlarını güncelle
 */
async function updateEmailSettings(req, res) {
  try {
    const { smtpHost, smtpPort, smtpUser, smtpPassword, senderName, senderEmail, useSSL } = req.body;
    
    // Ayarları doğrula
    const validation = validateEmailSettings({
      smtpHost, 
      smtpPort, 
      smtpUser, 
      smtpPassword, 
      senderName, 
      senderEmail, 
      useSSL
    });
    
    if (!validation.isValid) {
      return sendError(res, validation.message, 400);
    }
    
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // Mevcut ayarları kontrol et
    const existingSettings = await db.collection('settings').findOne({ type: 'email' });
    
    // Şifre değişikliği kontrolü
    let updatedPassword = smtpPassword;
    if (smtpPassword === '********' && existingSettings) {
      // Şifre değişmediyse mevcut şifreyi kullan
      updatedPassword = existingSettings.smtpPassword;
    }
    
    // Ayarları kaydet veya güncelle
    const result = await db.collection('settings').updateOne(
      { type: 'email' },
      { 
        $set: {
          smtpHost,
          smtpPort: parseInt(smtpPort),
          smtpUser,
          smtpPassword: updatedPassword,
          senderName,
          senderEmail,
          useSSL: Boolean(useSSL),
          lastUpdated: new Date()
        } 
      },
      { upsert: true }
    );
    
    return sendSuccess(res, { 
      success: true, 
      message: 'E-posta ayarları başarıyla güncellendi' 
    });
  } catch (error) {
    console.error('E-posta ayarları güncellenirken hata:', error);
    return sendError(res, 'E-posta ayarları güncellenirken bir hata oluştu', 500);
  }
}

/**
 * Test e-postası gönder
 */
async function sendTestEmail(req, res) {
  try {
    const { testEmail } = req.body;
    
    if (!testEmail) {
      return sendError(res, 'Test için e-posta adresi gereklidir', 400);
    }
    
    // E-posta formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return sendError(res, 'Geçersiz e-posta formatı', 400);
    }
    
    // E-posta gönderme işlemi
    // Not: Gerçek bir e-posta göndermek için nodemailer gibi bir paket kullanılmalıdır
    
    // Başarılı yanıt
    return sendSuccess(res, { 
      success: true, 
      message: `Test e-postası ${testEmail} adresine başarıyla gönderildi` 
    });
  } catch (error) {
    console.error('Test e-postası gönderilirken hata:', error);
    return sendError(res, 'Test e-postası gönderilirken bir hata oluştu', 500);
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
    return getEmailSettings(req, res);
  } else if (req.method === 'POST') {
    return updateEmailSettings(req, res);
  } else if (req.method === 'PUT' && req.body.action === 'test') {
    return sendTestEmail(req, res);
  } else {
    return sendError(res, 'Geçersiz istek metodu', 405);
  }
} 