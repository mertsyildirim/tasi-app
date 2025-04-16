/**
 * API yanıtları için ortak bir şablon oluşturur
 * @module api-utils
 */

/**
 * API'lerde CORS ayarları eklemek için yardımcı fonksiyon
 * @param {object} res - HTTP yanıt nesnesi
 */
export function setupCORS(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

/**
 * OPTIONS isteklerine yanıt veren yardımcı fonksiyon
 * @param {object} req - HTTP istek nesnesi
 * @param {object} res - HTTP yanıt nesnesi
 * @returns {boolean} İstek OPTIONS ise true, diğer durumlarda false
 */
export function handleOptionsRequest(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Başarılı API yanıtı oluşturmak için şablon
 * @param {object} res - HTTP yanıt nesnesi
 * @param {object|array} data - Yanıtta gönderilecek veri
 * @param {number} statusCode - HTTP durum kodu (varsayılan: 200)
 * @param {string} message - Başarı mesajı
 */
export function sendSuccess(res, data, status = 200, message = 'Success') {
  return res.status(status).json({
    success: true,
    message,
    data
  });
}

/**
 * Hata API yanıtı oluşturmak için şablon
 * @param {object} res - HTTP yanıt nesnesi
 * @param {string} error - Hata mesajı
 * @param {number} statusCode - HTTP durum kodu (varsayılan: 500)
 * @param {object} details - Ek hata detayları
 */
export function sendError(res, message, status = 500, error = null) {
  console.error('API Error:', error);
  return res.status(status).json({
    success: false,
    message,
    error: error ? error.message : undefined
  });
}

/**
 * API isteklerini loglama
 * @param {object} req - HTTP istek nesnesi
 */
export function logRequest(req) {
  console.log(`${req.method} ${req.url}`, {
    query: req.query,
    body: req.body,
    headers: req.headers
  });
} 