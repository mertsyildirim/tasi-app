import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // CORS ayarları
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Token al
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Yetkilendirme başarısız: Geçersiz token formatı' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Token'ı decode et
    const decodedToken = jwt.decode(token);
    
    if (!decodedToken) {
      return res.status(401).json({ error: 'Yetkilendirme başarısız: Token decode edilemedi' });
    }
    
    // Token'ı doğrula
    try {
      const verifiedToken = jwt.verify(token, process.env.JWT_SECRET || 'tasiapp-super-gizli-jwt-anahtar');
      
      // Token ve rol bilgilerini döndür
      return res.status(200).json({
        success: true,
        token_info: {
          decoded: decodedToken,
          verified: true,
          is_admin: decodedToken.roles?.includes('admin') || decodedToken.role === 'admin',
          roles: decodedToken.roles || [decodedToken.role],
          user: {
            name: decodedToken.name,
            email: decodedToken.email,
            userId: decodedToken.userId
          }
        }
      });
    } catch (verifyError) {
      return res.status(401).json({ 
        error: 'Yetkilendirme başarısız: Token doğrulanamadı', 
        details: verifyError.message 
      });
    }
  } catch (error) {
    console.error('Token kontrol hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası', details: error.message });
  }
} 