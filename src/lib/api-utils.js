/**
 * API yanıtları için ortak bir şablon oluşturur
 * @module api-utils
 */

/**
 * API'lerde CORS ayarları eklemek için yardımcı fonksiyon
 * @param {object} res - HTTP yanıt nesnesi
 */
function setupCORS(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
}

/**
 * OPTIONS isteklerine yanıt veren yardımcı fonksiyon
 * @param {object} req - HTTP istek nesnesi
 * @param {object} res - HTTP yanıt nesnesi
 * @returns {boolean} İstek OPTIONS ise true, diğer durumlarda false
 */
function handleOptionsRequest(req, res) {
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
function sendSuccess(res, data, statusCode = 200, message = '') {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
}

/**
 * Hata API yanıtı oluşturmak için şablon
 * @param {object} res - HTTP yanıt nesnesi
 * @param {string} error - Hata mesajı
 * @param {number} statusCode - HTTP durum kodu (varsayılan: 500)
 * @param {object} details - Ek hata detayları
 */
function sendError(res, error, statusCode = 500, details = null) {
  const errorResponse = {
    success: false,
    error
  };

  if (details) {
    errorResponse.details = details;
  }

  // Development ortamında hata stack'ını da ekle
  if (process.env.NODE_ENV === 'development' && details && details.stack) {
    errorResponse.stack = details.stack;
  }

  return res.status(statusCode).json(errorResponse);
}

/**
 * API isteklerini loglama
 * @param {object} req - HTTP istek nesnesi
 */
function logRequest(req) {
  console.log(`API İsteği: ${req.method} ${req.url}`);
  
  const headers = {
    authorization: req.headers.authorization ? 'Bearer ***' : 'Yok',
    'content-type': req.headers['content-type'] || 'Belirtilmemiş'
  };
  
  console.log('Headers:', JSON.stringify(headers));
  
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    console.log('Body:', typeof req.body === 'object' ? JSON.stringify(req.body) : 'Geçersiz Body Formatı');
  }
  
  if (req.query && Object.keys(req.query).length > 0) {
    console.log('Query:', JSON.stringify(req.query));
  }
}

module.exports = {
  setupCORS,
  handleOptionsRequest,
  sendSuccess,
  sendError,
  logRequest
}; 