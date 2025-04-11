import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';

export async function authMiddleware(req, res, next) {
  try {
    console.log(`API isteği: ${req.method} ${req.url}, Host: ${req.headers.host}`);
    
    // Localhost için oturum doğrulama kontrolünü gevşet
    const host = req.headers.host || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1') || host.startsWith('192.168.') || host.includes('.local');
    const isHttpRequest = req.headers['x-forwarded-proto'] !== 'https' && !req.connection.encrypted;
    const isDriverLocationRequest = req.url.includes('/api/drivers/location');
    
    // Geliştirme ortamı için esneklik sağla
    if (isLocalhost) {
      console.log('Localhost ortamı tespit edildi, esneklik sağlanıyor');
      
      // Konum API'si için özel durum
      if (isDriverLocationRequest && req.method === 'POST') {
        console.log('Localhost ortamında konum isteği tespit edildi, kontroller gevşetiliyor');
        
        // Test kullanıcısı oluştur
        req.user = {
          id: '000000000000000000000000', // Geçici ID
          role: 'driver',
        };
        
        return await next();
      }
    }
    
    // Localhost için HTTP isteklerine izin ver
    if (isLocalhost && isHttpRequest) {
      console.log('Localhost üzerinde HTTP isteği, güvenlik kontrolünde esneklik sağlanıyor');
    }
    
    // Token kontrolü
    let token = null;
    
    // Header'dan token al
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('Header token bulundu');
    }
    
    // Cookie'den token al
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('Cookie token bulundu');
    }
    
    // Query string'den token al (mobil tarayıcılar için)
    if (!token && req.query && req.query.token) {
      token = req.query.token;
      console.log('Query token bulundu');
    }
    
    // Tüm seçenekler denendi ve token bulunamadı
    if (!token) {
      console.warn('Oturum belirteci bulunamadı');
      
      // Test ortamında geçici kullanıcı oluşturma
      if (process.env.NODE_ENV !== 'production' && isLocalhost) {
        console.log('Test ortamında belirlenen geçici kullanıcı kullanılıyor');
        req.user = {
          id: '000000000000000000000000',
          role: 'driver',
        };
        return await next();
      }
      
      return res.status(401).json({ 
        error: 'Oturum belirteci bulunamadı',
        code: 'TOKEN_MISSING'
      });
    }
    
    try {
      // Token doğrulama
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Kullanıcı bilgilerini req nesnesine ekle
      req.user = decoded;
      
      console.log(`Kullanıcı doğrulandı: ID=${decoded.id}, Rol=${decoded.role}`);
      
      // İsteği işlemeye devam et
      return await next();
    } catch (tokenError) {
      console.error('Token doğrulama hatası:', tokenError.name, tokenError.message);
      
      // Test ortamında hata atlama
      if (process.env.NODE_ENV !== 'production' && isLocalhost && isDriverLocationRequest) {
        console.log('Test ortamında token hatası yok sayılıyor, varsayılan kullanıcı ile devam ediliyor');
        req.user = {
          id: '000000000000000000000000',
          role: 'driver',
        };
        return await next();
      }
      
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.', code: 'TOKEN_EXPIRED' });
      } else if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Geçersiz oturum belirteci. Lütfen tekrar giriş yapın.', code: 'INVALID_TOKEN' });
      } else {
        return res.status(401).json({ error: 'Oturum doğrulama hatası. Lütfen tekrar giriş yapın.', code: 'AUTH_ERROR' });
      }
    }
  } catch (error) {
    console.error('Auth middleware genel hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası', code: 'SERVER_ERROR' });
  }
}

export function roleMiddleware(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Yetkilendirme gerekli' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }

    return next();
  };
} 