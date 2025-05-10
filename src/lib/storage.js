/**
 * Google Cloud Storage entegrasyonu
 * Dosya yükleme ve yönetim işlemlerini sağlar
 */

import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

// Google Cloud Storage yapılandırması
// Not: Bu bilgiler .env dosyasından alınmalıdır
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }
});

// Kullanılacak bucket adı
const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME || 'tasiapp-storage';
const bucket = storage.bucket(bucketName);

/**
 * Base64 formatındaki dosyayı yükler
 * @param {string} base64String Base64 formatındaki dosya
 * @param {string} fileName Dosya adı (opsiyonel)
 * @param {string} folder Klasör yolu (opsiyonel)
 * @returns {Promise<{url: string, fileName: string}>} Yüklenen dosyanın URL'si ve adı
 */
export async function uploadFileFromBase64(base64String, fileName = '', folder = '') {
  try {
    // Base64 verilerinden dosya içeriğini ayıklama
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      throw new Error('Geçersiz base64 formatı');
    }
    
    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    
    // Dosya adı ve uzantısını oluşturma
    const extension = mimeType.split('/')[1];
    const generatedFileName = fileName || `${uuidv4()}.${extension}`;
    const fullPath = folder ? `${folder}/${generatedFileName}` : generatedFileName;
    
    // Dosyayı yükleme
    const file = bucket.file(fullPath);
    
    await file.save(buffer, {
      metadata: {
        contentType: mimeType
      }
    });
    
    // Dosya URL'sini oluşturma
    const url = `https://storage.googleapis.com/${bucketName}/${fullPath}`;
    
    return {
      url,
      fileName: generatedFileName,
      contentType: mimeType,
      size: buffer.length,
      path: fullPath
    };
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    throw new Error(`Dosya yüklenemedi: ${error.message}`);
  }
}

/**
 * Çoklu dosya yükleme (multipart/form-data)
 * @param {File} file Express.js ile gelen dosya nesnesi
 * @param {string} folder Klasör yolu (opsiyonel)
 * @returns {Promise<{url: string, fileName: string}>} Yüklenen dosyanın URL'si ve adı
 */
export async function uploadFile(file, folder = '') {
  try {
    // Dosya adı ve uzantısını oluşturma
    const originalName = file.originalname || file.name;
    const extension = originalName.split('.').pop();
    const generatedFileName = `${uuidv4()}.${extension}`;
    const fullPath = folder ? `${folder}/${generatedFileName}` : generatedFileName;
    
    // Dosyayı yükleme
    const fileObject = bucket.file(fullPath);
    
    await fileObject.save(file.buffer || file.data, {
      metadata: {
        contentType: file.mimetype
      }
    });
    
    // Dosya URL'sini oluşturma
    const url = `https://storage.googleapis.com/${bucketName}/${fullPath}`;
    
    return {
      url,
      fileName: generatedFileName,
      originalName,
      contentType: file.mimetype,
      size: file.size,
      path: fullPath
    };
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    throw new Error(`Dosya yüklenemedi: ${error.message}`);
  }
}

/**
 * Dosyayı silme
 * @param {string} fileUrl Silinecek dosyanın URL'si veya yolu
 * @returns {Promise<boolean>} İşlem başarılı ise true, değilse false döner
 */
export async function deleteFile(fileUrl) {
  try {
    // URL'den dosya yolunu çıkarma
    let filePath;
    
    if (fileUrl.includes(`https://storage.googleapis.com/${bucketName}/`)) {
      filePath = fileUrl.replace(`https://storage.googleapis.com/${bucketName}/`, '');
    } else {
      filePath = fileUrl;
    }
    
    // Dosyayı silme
    await bucket.file(filePath).delete();
    
    return true;
  } catch (error) {
    console.error('Dosya silme hatası:', error);
    return false;
  }
}

/**
 * Geçici/Süreli URL oluşturma
 * @param {string} filePath Dosya yolu
 * @param {number} expiresInMinutes URL'nin geçerli olacağı süre (dakika)
 * @returns {Promise<string>} Geçici URL
 */
export async function generateSignedUrl(filePath, expiresInMinutes = 60) {
  try {
    const file = bucket.file(filePath);
    
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresInMinutes * 60 * 1000
    });
    
    return url;
  } catch (error) {
    console.error('Geçici URL oluşturma hatası:', error);
    throw new Error(`Geçici URL oluşturulamadı: ${error.message}`);
  }
}

/**
 * Dosya bilgilerini alma
 * @param {string} filePath Dosya yolu
 * @returns {Promise<Object>} Dosya bilgileri
 */
export async function getFileMetadata(filePath) {
  try {
    const file = bucket.file(filePath);
    const [metadata] = await file.getMetadata();
    
    return metadata;
  } catch (error) {
    console.error('Dosya bilgisi alma hatası:', error);
    throw new Error(`Dosya bilgileri alınamadı: ${error.message}`);
  }
}

export default {
  uploadFileFromBase64,
  uploadFile,
  deleteFile,
  generateSignedUrl,
  getFileMetadata
}; 