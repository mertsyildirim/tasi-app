import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tasi-app-jwt-secret-key';

// Token doğrulama
export async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    return null;
  }
}

// Yetki kontrolü
export function checkRole(user, allowedRoles) {
  if (!user || !user.roles) {
    return false;
  }

  // mert@tasipp.com için özel kontrol
  if (user.email === 'mert@tasipp.com') {
    return true;
  }

  // Kullanıcının rollerini kontrol et
  return user.roles.some(role => allowedRoles.includes(role));
}

// Admin yetkisi kontrolü
export function isAdmin(user) {
  // mert@tasipp.com için özel kontrol
  if (user.email === 'mert@tasipp.com') {
    return true;
  }
  return checkRole(user, ['admin', 'super_admin']);
}

// Editör yetkisi kontrolü
export function isEditor(user) {
  // mert@tasipp.com için özel kontrol
  if (user.email === 'mert@tasipp.com') {
    return true;
  }
  return checkRole(user, ['admin', 'super_admin', 'editor']);
}

// Destek yetkisi kontrolü
export function isSupport(user) {
  // mert@tasipp.com için özel kontrol
  if (user.email === 'mert@tasipp.com') {
    return true;
  }
  return checkRole(user, ['admin', 'super_admin', 'editor', 'support']);
}

// Token oluşturma
export function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles || [user.role],
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Yetki middleware'i
export function withAuth(handler, allowedRoles = []) {
  return async (req, res) => {
    try {
      // Token kontrolü
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ 
          success: false,
          message: 'Yetkilendirme başlığı gereklidir' 
        });
      }

      // Token doğrulama
      const decoded = await verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ 
          success: false,
          message: 'Geçersiz veya süresi dolmuş token' 
        });
      }

      // Rol kontrolü
      if (allowedRoles.length > 0 && !checkRole(decoded, allowedRoles)) {
        return res.status(403).json({ 
          success: false,
          message: 'Bu işlem için yetkiniz yok' 
        });
      }

      // Kullanıcı bilgisini request nesnesine ekle
      req.user = decoded;

      // API işleyicisini çağır
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware hatası:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Yetkilendirme işlemi sırasında bir hata oluştu' 
      });
    }
  };
} 