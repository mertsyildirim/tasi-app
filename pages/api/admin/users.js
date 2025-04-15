import { connectToDatabase } from '../../../src/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { setupCORS, handleOptionsRequest, sendSuccess, sendError, logRequest } from '../../../src/lib/api-utils';

// Kullanıcı için erişim kontrolü
const isAuthorized = (req) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authorized: false, error: 'Yetkilendirme başlığı geçersiz' };
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tasiapp-secret-key2024');
    
    // Admin paneline erişim için izin verilen roller
    const allowedRoles = ['admin', 'super_admin', 'editor', 'support'];
    
    // Hem role hem de roles alanını kontrol et
    const userRole = decoded.role;
    const userRoles = decoded.roles || [userRole];
    
    // Kullanıcının herhangi bir rolü izin verilen rollerden biriyse erişime izin ver
    const hasAllowedRole = userRoles.some(role => allowedRoles.includes(role)) || allowedRoles.includes(userRole);
    
    if (!hasAllowedRole) {
      return { authorized: false, error: 'Bu işlem için yönetici yetkileri gereklidir' };
    }
    
    return { authorized: true, user: decoded };
  } catch (error) {
    console.error('Yetkilendirme hatası:', error);
    return { authorized: false, error: 'Yetkilendirme hatası' };
  }
};

export default async function handler(req, res) {
  // CORS ayarlarını ekle
  setupCORS(res);
  
  // OPTIONS isteğini işle
  if (handleOptionsRequest(req, res)) {
    return;
  }
  
  // İsteği logla
  logRequest(req);

  // Yetkilendirme kontrolü
  const auth = isAuthorized(req);
  if (!auth.authorized) {
    return sendError(res, auth.error, 401);
  }
  
  try {
    // İstek metoduna göre işlem yap
    switch (req.method) {
      case 'GET':
        return await getUsers(req, res);
      case 'POST':
        return await createUser(req, res);
      case 'PUT':
        return await updateUser(req, res);
      case 'DELETE':
        return await deleteUser(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return sendError(res, `Method ${req.method} not allowed`, 405);
    }
  } catch (error) {
    console.error('Kullanıcılar API hatası:', error);
    return sendError(res, 'Sunucu hatası', 500, error);
  }
}

/**
 * Tüm kullanıcıları getir
 */
async function getUsers(req, res) {
  try {
    // Veritabanına bağlan
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // Filtreleri al
    const { role, status, search, adminOnly = 'true' } = req.query;
    
    // Arama filtresi oluştur
    const filter = {};
    
    // Admin rollere ait kullanıcıları filtrele (adminOnly parametresi 'false' olmadığı sürece)
    if (adminOnly !== 'false') {
      filter.$or = [
        { role: { $in: ['admin', 'super_admin', 'editor', 'support'] } },
        { roles: { $in: ['admin', 'super_admin', 'editor', 'support'] } }
      ];
    }
    
    // Rol filtresi
    if (role) {
      if (filter.$or) {
        // Halihazırda bir $or filtresi varsa, role filtresini her bir koşula ekle
        filter.$or = filter.$or.map(condition => {
          if (condition.role) {
            return { role };
          }
          if (condition.roles) {
            return { roles: { $in: [role] } };
          }
          return condition;
        });
      } else {
        // $or filtresi yoksa, yeni bir role filtresi ekle
        filter.$or = [
          { role },
          { roles: { $in: [role] } }
        ];
      }
    }
    
    // Durum filtresi
    if (status) {
      filter.status = status;
    }
    
    // Arama filtresi
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      
      // Halihazırda bir $or filtresi varsa ona ekle, yoksa yeni bir $or filtresi oluştur
      if (filter.$or) {
        // Varolan $or filtresi, role veya roles ile ilgili
        // Yeni bir $and filtresi oluşturup hem $or hem de arama koşullarını ekle
        const existingOr = filter.$or;
        filter.$or = undefined; // Önceki $or filtresini kaldır
        
        filter.$and = [
          { $or: existingOr },
          { $or: [
            { name: searchRegex },
            { email: searchRegex }
          ]}
        ];
      } else {
        // $or filtresi yoksa, yeni bir arama filtresi ekle
        filter.$or = [
          { name: searchRegex },
          { email: searchRegex }
        ];
      }
    }
    
    console.log('Kullanıcı filtresi:', JSON.stringify(filter, null, 2));
    
    // Kullanıcıları getir
    const users = await db.collection('users')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`${users.length} kullanıcı bulundu.`);
    
    // Kullanıcı formatını düzenle
    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
      roles: user.roles || [user.role || 'user'],
      status: user.status || 'active',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
    
    return sendSuccess(res, { 
      users: formattedUsers,
      total: formattedUsers.length,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || formattedUsers.length,
      pages: Math.ceil(formattedUsers.length / (parseInt(req.query.limit) || formattedUsers.length))
    });
  } catch (error) {
    console.error('Kullanıcılar getirme hatası:', error);
    return sendError(res, 'Kullanıcı verileri yüklenirken bir hata oluştu', 500, error);
  }
}

/**
 * Yeni bir kullanıcı oluştur
 */
const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, status, company } = req.body;

    // Gerekli alanları kontrol et
    if (!name || !email || !password || !role) {
      return sendError(res, 'İsim, e-posta, şifre ve rol alanları gereklidir', 400);
    }

    // E-posta formatını doğrula
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'Geçerli bir e-posta adresi girin', 400);
    }

    // Veritabanı bağlantısı
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    const usersCollection = db.collection('users');

    // Debugleme için konsola yazdır
    console.log('Kullanıcı oluşturma - Veritabanı bağlantısı kuruldu');
    console.log('Gelen veriler:', { name, email, role });

    // E-posta benzersizliğini kontrol et
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      console.log('E-posta adresi zaten kullanılıyor:', email);
      return sendError(res, 'Bu e-posta adresine sahip bir kullanıcı zaten var', 400);
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10);

    // İsim ve soyismi ayır (eğer boşluk varsa)
    let firstName = name;
    let lastName = '';
    
    if (name.includes(' ')) {
      const nameParts = name.split(' ');
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    }

    // Yeni kullanıcı nesnesini oluştur
    const newUser = {
      name: firstName,
      surname: lastName,
      email,
      password: hashedPassword,
      phone: phone || '',
      role,
      status: status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Yeni kullanıcı için roller dizisi 
    newUser.roles = [role];

    console.log('Oluşturulacak kullanıcı:', { 
      ...newUser,
      password: '***gizlendi***'
    });

    // Eğer şirket rolü ise şirket bilgilerini ekle
    if (role === 'company' && company) {
      newUser.company = company;
    }

    // Kullanıcıyı veritabanına ekle
    console.log('Veritabanına kullanıcı ekleniyor...');
    const result = await usersCollection.insertOne(newUser);
    console.log('Kullanıcı eklendi, ID:', result.insertedId);

    // Kullanıcı oluşturulduktan sonra bildirim ekle
    try {
      const notificationData = {
        text: `Yeni kullanıcı eklendi: ${name}`,
        description: `${name} (${email}) kullanıcısı ${role} rolüyle sisteme eklendi.`,
        type: 'user',
        url: '/admin/users'
      };
      
      // Bildirim API'sine istek gönder
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/create-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization // Mevcut token'ı aktar
        },
        body: JSON.stringify(notificationData)
      });
      
      console.log('Kullanıcı bildirimi oluşturuldu');
    } catch (notifError) {
      console.error('Bildirim oluşturulurken hata:', notifError);
      // Bildirim hatası işlemi durdurmaz
    }

    // Sonuç döndür
    return sendSuccess(res, {
      success: true,
      userId: result.insertedId,
      message: 'Kullanıcı başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error);
    return sendError(res, 'Kullanıcı oluşturulurken bir hata oluştu', 500);
  }
};

/**
 * Kullanıcı güncelle
 */
async function updateUser(req, res) {
  try {
    // Gövde kontrolü
    if (!req.body || Object.keys(req.body).length === 0) {
      return sendError(res, 'Geçersiz istek: Boş gövde', 400);
    }
    
    // Kullanıcı ID'sini al
    const userId = req.query.id;
    if (!userId) {
      return sendError(res, 'Kullanıcı ID gereklidir', 400);
    }
    
    // ID formatını kontrol et
    let objectId;
    try {
      objectId = new ObjectId(userId);
    } catch (error) {
      return sendError(res, 'Geçersiz kullanıcı ID formatı', 400);
    }
    
    // Veritabanına bağlan
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // Kullanıcı var mı kontrol et
    const existingUser = await db.collection('users').findOne({ _id: objectId });
    if (!existingUser) {
      return sendError(res, 'Kullanıcı bulunamadı', 404);
    }
    
    const updateData = { ...req.body };
    
    // E-posta değişiyorsa ve zaten kullanılıyorsa kontrol et
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailInUse = await db.collection('users').findOne({ 
        email: updateData.email,
        _id: { $ne: objectId }
      });
      
      if (emailInUse) {
        return sendError(res, 'Bu e-posta adresi zaten kullanılıyor', 400);
      }
    }
    
    // Şifre güncellemesi varsa hashleme işlemi yapılır
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    // Güncelleme tarihini ekle
    updateData.updatedAt = new Date();
    
    // Kullanıcı bilgilerini güncelle
    await db.collection('users').updateOne(
      { _id: objectId },
      { $set: updateData }
    );
    
    // Güncellenmiş kullanıcıyı getir
    const updatedUser = await db.collection('users').findOne({ _id: objectId });
    
    // Bildirim oluştur
    try {
      const notificationData = {
        text: `Kullanıcı güncellendi: ${updatedUser.name}`,
        description: `${updatedUser.name} (${updatedUser.email}) kullanıcısının bilgileri güncellendi.`,
        type: 'user',
        url: `/admin/users/${userId}`
      };
      
      // Bildirim API'sine istek gönder
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/create-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization
        },
        body: JSON.stringify(notificationData)
      });
      
      console.log('Kullanıcı güncelleme bildirimi oluşturuldu');
    } catch (notifError) {
      console.error('Bildirim oluşturulurken hata:', notifError);
      // Bildirim hatası işlemi durdurmaz
    }
    
    // Şifreyi çıkararak kullanıcı nesnesini döndür
    const userToReturn = {
      ...updatedUser,
      id: updatedUser._id.toString(),
      _id: undefined,
      password: undefined
    };
    
    return sendSuccess(res, { user: userToReturn }, 200, 'Kullanıcı başarıyla güncellendi');
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    return sendError(res, 'Kullanıcı güncellenirken bir hata oluştu', 500, error);
  }
}

/**
 * Kullanıcı sil
 */
async function deleteUser(req, res) {
  try {
    // Kullanıcı ID'sini al
    const userId = req.query.id;
    if (!userId) {
      return sendError(res, 'Kullanıcı ID gereklidir', 400);
    }
    
    // ID formatını kontrol et
    let objectId;
    try {
      objectId = new ObjectId(userId);
    } catch (error) {
      return sendError(res, 'Geçersiz kullanıcı ID formatı', 400);
    }
    
    // Veritabanına bağlan
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // Kullanıcı bilgilerini silmeden önce al
    const userToDelete = await db.collection('users').findOne({ _id: objectId });
    
    if (!userToDelete) {
      return sendError(res, 'Kullanıcı bulunamadı', 404);
    }
    
    // Kullanıcıyı sil
    const deleteResult = await db.collection('users').deleteOne({ _id: objectId });
    
    if (deleteResult.deletedCount === 0) {
      return sendError(res, 'Kullanıcı bulunamadı', 404);
    }
    
    // Bildirim oluştur
    try {
      const notificationData = {
        text: `Kullanıcı silindi: ${userToDelete.name}`,
        description: `${userToDelete.name} (${userToDelete.email}) kullanıcısı sistemden silindi.`,
        type: 'user',
        url: '/admin/users'
      };
      
      // Bildirim API'sine istek gönder
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/create-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization
        },
        body: JSON.stringify(notificationData)
      });
      
      console.log('Kullanıcı silme bildirimi oluşturuldu');
    } catch (notifError) {
      console.error('Bildirim oluşturulurken hata:', notifError);
      // Bildirim hatası işlemi durdurmaz
    }
    
    return sendSuccess(res, null, 200, 'Kullanıcı başarıyla silindi');
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    return sendError(res, 'Kullanıcı silinirken bir hata oluştu', 500, error);
  }
} 