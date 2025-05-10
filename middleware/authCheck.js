import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tasiapp-super-gizli-jwt-anahtar';

export async function authCheck(req, res) {
  try {
    // Authorization header'dan token'ı al
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Token bulunamadı',
        status: 401
      };
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return {
        success: false,
        error: 'Geçersiz token formatı',
        status: 401
      };
    }

    // Token'ı doğrula
    const decodedToken = jwt.verify(token, JWT_SECRET);
    if (!decodedToken) {
      return {
        success: false,
        error: 'Geçersiz token',
        status: 401
      };
    }

    // mert@tasipp.com için özel kontrol
    if (decodedToken.email === 'mert@tasipp.com') {
      return {
        success: true,
        user: {
          id: decodedToken.userId,
          email: decodedToken.email,
          name: decodedToken.name,
          roles: ['admin', 'super_admin', 'editor', 'support'],
          role: 'admin'
        }
      };
    }

    // Token geçerliyse kullanıcı bilgilerini döndür
    return {
      success: true,
      user: {
        id: decodedToken.userId,
        email: decodedToken.email,
        name: decodedToken.name,
        roles: decodedToken.roles || [],
        role: decodedToken.role || 'user'
      }
    };
  } catch (error) {
    console.error('Auth check error:', error);
    return {
      success: false,
      error: 'Kimlik doğrulama hatası',
      status: 500
    };
  }
}

export function requireAuth(handler) {
  return async (req, res) => {
    const authResult = await authCheck(req, res);
    
    if (!authResult.success) {
      return res.status(authResult.status).json({
        success: false,
        error: authResult.error
      });
    }

    req.user = authResult.user;
    return handler(req, res);
  };
}

export function requireAdmin(handler) {
  return async (req, res) => {
    const authResult = await authCheck(req, res);
    
    if (!authResult.success) {
      return res.status(authResult.status).json({
        success: false,
        error: authResult.error
      });
    }

    // mert@tasipp.com için özel kontrol
    if (authResult.user.email === 'mert@tasipp.com') {
      req.user = authResult.user;
      return handler(req, res);
    }

    const isAdmin = authResult.user.roles.includes('admin') || authResult.user.role === 'admin';
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Bu işlem için yönetici yetkisi gereklidir'
      });
    }

    req.user = authResult.user;
    return handler(req, res);
  };
} 