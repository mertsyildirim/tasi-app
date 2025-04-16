import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function authMiddleware(req, res, next) {
  try {
    // JWT token'ı al
    const token = await getToken({ req, secret });

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Oturum bulunamadı' 
      });
    }

    // Token'dan kullanıcı bilgilerini al
    req.user = {
      id: token.id,
      email: token.email,
      name: token.name,
      roles: token.roles || []
    };

    // Sonraki middleware'e veya işleyiciye geç
    return await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      success: false,
      error: 'Kimlik doğrulama hatası',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 