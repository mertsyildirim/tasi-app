import { MongoClient, ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../../src/lib/mongodb';
import bcrypt from 'bcryptjs';
import { setupCORS, handleOptionsRequest, sendSuccess, sendError, logRequest } from '../../../../src/lib/api-utils';

export default async function handler(req, res) {
  // CORS ayarlarını ekle
  setupCORS(res);
  
  // OPTIONS isteğini işle
  if (handleOptionsRequest(req, res)) {
    return;
  }
  
  // İsteği logla
  logRequest(req);
  
  try {
    switch (req.method) {
      case 'GET':
        return await handleGetUsers(req, res);
      case 'POST':
        return await handleCreateUser(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return sendError(res, `Method ${req.method} not allowed`, 405);
    }
  } catch (error) {
    console.error('API Hatası:', error);
    return sendError(res, 'Sunucu hatası', 500, error);
  }
}

// Kullanıcıları getir
async function handleGetUsers(req, res) {
  try {
    console.log('Kullanıcılar getiriliyor...');
    
    // Veritabanına bağlan
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // Sorgu parametrelerini al
    const { role: queryRole, status, search } = req.query;
    
    // Filtre oluştur
    const filter = {};
    
    // Role göre filtrele (opsiyonel)
    if (queryRole) {
      filter.roles = { $in: [queryRole] };
    }
    
    // Duruma göre filtrele
    if (status) {
      filter.isActive = status === 'active';
    }
    
    // Arama terimlerine göre filtrele
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('Sorgu filtresi:', JSON.stringify(filter));
    
    // Kullanıcıları getir (tüm kullanıcılar)
    console.log('Veritabanından kullanıcılar alınıyor...');
    const users = await db.collection('users')
      .find(filter)
      .sort({ createdAt: -1 })
      .project({ password: 0 }) // Şifreleri gönderme
      .toArray();
    
    console.log(`${users.length} kullanıcı bulundu.`);
    
    if (users.length > 0) {
      console.log('İlk kullanıcı örneği:', JSON.stringify(users[0]));
    }
    
    // Dönüş formatını düzenle
    const formattedUsers = users.map(user => {
      // Rol bilgilerini kontrol et
      const userRoles = user.roles || user.role || 'customer';
      const normalizedRoles = Array.isArray(userRoles) ? userRoles : [userRoles];
      
      console.log(`Kullanıcı ${user.email || user.name} rolleri:`, normalizedRoles);
      
      return {
        id: user._id.toString(),
        name: user.name || 'İsimsiz Kullanıcı',
        email: user.email || 'E-posta Yok',
        roles: normalizedRoles,
        role: normalizedRoles[0], // İlk rolü ana rol olarak belirle
        status: user.isActive !== false ? 'active' : 'inactive', // varsayılan olarak aktif
        createdAt: user.createdAt,
        phone: user.phone || '',
      };
    });
    
    return sendSuccess(res, { 
      users: formattedUsers,
      total: formattedUsers.length
    });
  } catch (error) {
    console.error('Kullanıcıları getirme hatası:', error);
    return sendError(res, 'Kullanıcılar yüklenirken bir hata oluştu', 500, error);
  }
}

// Yeni kullanıcı oluştur
async function handleCreateUser(req, res) {
  try {
    console.log('Yeni kullanıcı oluşturma isteği alındı');
    
    // Gövde kontrolü
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error('Boş istek gövdesi');
      return sendError(res, 'Geçersiz istek: Boş gövde', 400);
    }
    
    // Body string ise JSON'a dönüştür
    let userData = req.body;
    if (typeof userData === 'string') {
      try {
        userData = JSON.parse(userData);
        console.log('İstek gövdesi string\'den JSON\'a dönüştürüldü');
      } catch (e) {
        console.error('JSON ayrıştırma hatası:', e);
        return sendError(res, 'Geçersiz JSON formatı', 400);
      }
    }
    
    console.log('Kullanıcı verileri:', JSON.stringify(userData));
    
    // Veritabanına bağlan
    console.log('Veritabanına bağlanılıyor...');
    const connection = await connectToDatabase();
    const database = connection.connection.db;
    console.log('Veritabanı bağlantısı başarılı');
    
    // Gerekli bilgileri al
    const { name, email, password, roles } = userData;
    
    // Gerekli alanları kontrol et
    if (!name || !email || !password) {
      console.error('Eksik alanlar:', {
        nameProvided: !!name,
        emailProvided: !!email,
        passwordProvided: !!password
      });
      return sendError(res, 'Ad, e-posta ve şifre alanları zorunludur', 400);
    }
    
    // E-posta formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('Geçersiz e-posta formatı:', email);
      return sendError(res, 'Geçerli bir e-posta adresi girin', 400);
    }
    
    // E-posta zaten var mı kontrol et
    console.log('E-posta kontrolü yapılıyor:', email);
    const existingUser = await database.collection('users').findOne({ email });
    if (existingUser) {
      console.error('Bu e-posta zaten kullanımda:', email);
      return sendError(res, 'Bu e-posta adresi zaten kullanılıyor', 400);
    }
    
    // Şifreyi hash'le
    console.log('Şifre hashlenıyor...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Kullanıcı rollerini doğru formatta ayarla
    let userRoles = ['editor']; // Varsayılan rol
    
    if (roles) {
      if (Array.isArray(roles)) {
        userRoles = roles;
      } else if (typeof roles === 'string') {
        userRoles = [roles];
      }
    }
    
    console.log('Kullanıcı rolleri:', userRoles);
    
    // Kullanıcıyı oluştur
    const newUser = {
      name,
      email,
      password: hashedPassword,
      roles: userRoles,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Kullanıcıyı veritabanına ekle
    console.log('Kullanıcı veritabanına ekleniyor...');
    const result = await database.collection('users').insertOne(newUser);
    console.log('Kullanıcı başarıyla eklendi:', result.insertedId.toString());
    
    // Şifre hariç kullanıcı bilgilerini döndür
    const { password: _, ...userWithoutPassword } = newUser;
    
    return sendSuccess(res, {
      user: {
        ...userWithoutPassword,
        id: result.insertedId.toString(),
      },
    }, 201, 'Kullanıcı başarıyla eklendi');
  } catch (error) {
    console.error('Kullanıcı ekleme hatası:', error);
    return sendError(res, 'Kullanıcı eklenirken bir hata oluştu', 500, error);
  }
} 