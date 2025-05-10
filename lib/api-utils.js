// CORS ayarlarını yapılandır
export function setupCORS(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

// OPTIONS isteklerini işle
export function handleOptionsRequest(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  res.status(200).end();
  return true;
}

// Başarılı yanıt gönder
export function sendSuccess(res, data, status = 200) {
  res.status(status).json({
    success: true,
    data
  });
}

// Hata yanıtı gönder
export function sendError(res, status = 500, message = 'Internal Server Error', error = null) {
  console.error(`API Hatası (${status}):`, message, error);
  res.status(status).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && error && { details: error.message })
    }
  });
}

// İsteği logla
export function logRequest(req) {
  console.log(`${req.method} ${req.url}`, {
    body: req.body,
    query: req.query,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? '[REDACTED]' : undefined
    }
  });
} 