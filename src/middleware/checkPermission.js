import jwt from 'jsonwebtoken';
import { hasPermission, hasPermissions } from '../lib/permissions';

/**
 * Belirli bir izni gerektiren endpoint'ler için middleware
 * @param {string} permission - Gerekli izin
 * @returns {Function} Express middleware
 */
export function requirePermission(permission) {
  return (req, res, next) => {
    try {
      // Authorization header'dan token'ı al
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ 
          error: 'Yetkilendirme başarısız: Token bulunamadı',
          required_permission: permission
        });
      }
      
      // Token'ı doğrula
      jwt.verify(token, process.env.JWT_SECRET || 'tasiapp-super-gizli-jwt-anahtar', (err, user) => {
        if (err) {
          return res.status(403).json({ 
            error: 'Yetkilendirme başarısız: Geçersiz token',
            required_permission: permission
          });
        }
        
        // Kullanıcı rollerini al
        const roles = user.roles || (user.role ? [user.role] : []);
        
        // İzni kontrol et
        if (!hasPermission(roles, permission)) {
          return res.status(403).json({ 
            error: 'Yetkilendirme başarısız: Yetersiz izin',
            required_permission: permission,
            user_roles: roles
          });
        }
        
        // Kullanıcı bilgilerini req nesnesine ekle
        req.user = user;
        next();
      });
    } catch (error) {
      console.error('İzin kontrolü hatası:', error);
      return res.status(500).json({ 
        error: 'Sunucu hatası: İzin kontrolü yapılamadı',
        required_permission: permission
      });
    }
  };
}

/**
 * Birden fazla izinden en az birine sahip olmayı gerektiren endpoint'ler için middleware
 * @param {string[]} permissions - Gerekli izinlerden en az biri
 * @returns {Function} Express middleware
 */
export function requireAnyPermission(permissions) {
  return (req, res, next) => {
    try {
      // Authorization header'dan token'ı al
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ 
          error: 'Yetkilendirme başarısız: Token bulunamadı',
          required_permissions: permissions
        });
      }
      
      // Token'ı doğrula
      jwt.verify(token, process.env.JWT_SECRET || 'tasiapp-super-gizli-jwt-anahtar', (err, user) => {
        if (err) {
          return res.status(403).json({ 
            error: 'Yetkilendirme başarısız: Geçersiz token',
            required_permissions: permissions
          });
        }
        
        // Kullanıcı rollerini al
        const roles = user.roles || (user.role ? [user.role] : []);
        
        // İzinleri kontrol et (en az biri yeterli)
        if (!hasPermissions(roles, permissions, false)) {
          return res.status(403).json({ 
            error: 'Yetkilendirme başarısız: Yetersiz izin',
            required_permissions: permissions,
            user_roles: roles
          });
        }
        
        // Kullanıcı bilgilerini req nesnesine ekle
        req.user = user;
        next();
      });
    } catch (error) {
      console.error('İzin kontrolü hatası:', error);
      return res.status(500).json({ 
        error: 'Sunucu hatası: İzin kontrolü yapılamadı',
        required_permissions: permissions
      });
    }
  };
}

/**
 * Birden fazla izinin tamamına sahip olmayı gerektiren endpoint'ler için middleware
 * @param {string[]} permissions - Gerekli tüm izinler
 * @returns {Function} Express middleware
 */
export function requireAllPermissions(permissions) {
  return (req, res, next) => {
    try {
      // Authorization header'dan token'ı al
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ 
          error: 'Yetkilendirme başarısız: Token bulunamadı',
          required_permissions: permissions
        });
      }
      
      // Token'ı doğrula
      jwt.verify(token, process.env.JWT_SECRET || 'tasiapp-super-gizli-jwt-anahtar', (err, user) => {
        if (err) {
          return res.status(403).json({ 
            error: 'Yetkilendirme başarısız: Geçersiz token',
            required_permissions: permissions
          });
        }
        
        // Kullanıcı rollerini al
        const roles = user.roles || (user.role ? [user.role] : []);
        
        // İzinleri kontrol et (tamamı gerekli)
        if (!hasPermissions(roles, permissions, true)) {
          return res.status(403).json({ 
            error: 'Yetkilendirme başarısız: Yetersiz izin',
            required_permissions: permissions,
            user_roles: roles
          });
        }
        
        // Kullanıcı bilgilerini req nesnesine ekle
        req.user = user;
        next();
      });
    } catch (error) {
      console.error('İzin kontrolü hatası:', error);
      return res.status(500).json({ 
        error: 'Sunucu hatası: İzin kontrolü yapılamadı',
        required_permissions: permissions
      });
    }
  };
}

/**
 * Sadece admin rolüne sahip kullanıcılar için middleware
 * @returns {Function} Express middleware
 */
export function requireAdmin() {
  return (req, res, next) => {
    try {
      // Authorization header'dan token'ı al
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ 
          error: 'Yetkilendirme başarısız: Token bulunamadı',
          required_role: 'admin'
        });
      }
      
      // Token'ı doğrula
      jwt.verify(token, process.env.JWT_SECRET || 'tasiapp-super-gizli-jwt-anahtar', (err, user) => {
        if (err) {
          return res.status(403).json({ 
            error: 'Yetkilendirme başarısız: Geçersiz token',
            required_role: 'admin'
          });
        }
        
        // Admin rolünü kontrol et
        const isAdmin = 
          (user.roles && Array.isArray(user.roles) && user.roles.includes('admin')) || 
          user.role === 'admin';
        
        if (!isAdmin) {
          return res.status(403).json({ 
            error: 'Yetkilendirme başarısız: Bu işlem için admin yetkisi gerekli',
            required_role: 'admin',
            user_roles: user.roles || [user.role]
          });
        }
        
        // Kullanıcı bilgilerini req nesnesine ekle
        req.user = user;
        next();
      });
    } catch (error) {
      console.error('Admin kontrolü hatası:', error);
      return res.status(500).json({ 
        error: 'Sunucu hatası: İzin kontrolü yapılamadı',
        required_role: 'admin'
      });
    }
  };
}

export default {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireAdmin
}; 