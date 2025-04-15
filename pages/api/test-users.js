import { connectToDatabase } from '../../src/lib/mongodb';
import { setupCORS, handleOptionsRequest, sendSuccess, sendError } from '../../src/lib/api-utils';

export default async function handler(req, res) {
  // CORS ayarlarını ekle
  setupCORS(res);
  
  // OPTIONS isteğini işle
  if (handleOptionsRequest(req, res)) {
    return;
  }
  
  try {
    // Veritabanına bağlan
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    console.log('Veritabanı bağlantısı başarılı. Kullanıcılar çekiliyor...');
    
    // Kullanıcıları getir (password hariç)
    const users = await db.collection('users')
      .find({})
      .project({ password: 0 })
      .limit(50)
      .toArray();
    
    console.log(`${users.length} kullanıcı bulundu.`);
    
    // İlk kullanıcı örneği için log
    if (users.length > 0) {
      console.log('İlk kullanıcı örneği:', JSON.stringify(users[0]));
    }
    
    // Kullanıcıları formatla
    const formattedUsers = users.map(user => {
      // Rol bilgilerini standardize et
      const userRoles = user.roles || user.role || 'customer';
      const normalizedRoles = Array.isArray(userRoles) ? userRoles : [userRoles];
      
      return {
        id: user._id.toString(),
        name: user.name || 'İsimsiz Kullanıcı',
        email: user.email || 'E-posta Yok',
        roles: normalizedRoles,
        role: normalizedRoles[0], // İlk rolü ana rol olarak belirle
        status: user.isActive !== false ? 'active' : 'inactive',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    });
    
    return sendSuccess(res, { 
      users: formattedUsers,
      total: formattedUsers.length
    });
  } catch (error) {
    console.error('Kullanıcıları getirme hatası:', error);
    return sendError(res, 'Kullanıcılar yüklenirken bir hata oluştu', 500);
  }
} 