import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../../src/lib/mongodb';
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
  
  // ID parametresi kontrolü
  const { id } = req.query;
  
  if (!id) {
    return sendError(res, 'Kullanıcı ID parametresi gereklidir', 400);
  }
  
  try {
    switch (req.method) {
      case 'GET':
        return await getUserById(req, res, id);
      case 'PUT':
        return await updateUser(req, res, id);
      case 'DELETE':
        return await deleteUser(req, res, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return sendError(res, `Method ${req.method} not allowed`, 405);
    }
  } catch (error) {
    console.error('API Hatası:', error);
    return sendError(res, 'Sunucu hatası', 500);
        }
}

/**
 * ID'ye göre kullanıcı getir
 */
async function getUserById(req, res, id) {
  try {
    console.log(`Kullanıcı getiriliyor, ID: ${id}`);
    
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return sendError(res, 'Geçersiz kullanıcı ID formatı', 400);
    }
    
    // Veritabanına bağlan
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // Kullanıcıyı bul
    const user = await db.collection('users').findOne(
      { _id: objectId },
      { projection: { password: 0 } } // Şifreyi getirme
    );
    
    if (!user) {
      return sendError(res, 'Kullanıcı bulunamadı', 404);
    }
    
    console.log('Kullanıcı bilgileri:', JSON.stringify(user));
    
    // Rol bilgilerini standardize et
    const userRoles = user.roles || user.role || 'customer';
    const normalizedRoles = Array.isArray(userRoles) ? userRoles : [userRoles];
    
    // Formatlanmış kullanıcı bilgisini oluştur
    const formattedUser = {
      id: user._id.toString(),
      name: user.name || 'İsimsiz Kullanıcı',
      email: user.email || 'E-posta Yok',
      roles: normalizedRoles,
      role: normalizedRoles[0], // İlk rolü ana rol olarak belirle
      status: user.isActive !== false ? 'active' : 'inactive',
      phone: user.phone || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // Diğer kullanıcı bilgilerini ekle
      address: user.address || '',
      company: user.company || '',
      // İstatistik ve diğer veriler
      stats: user.stats || {}
    };
    
    return sendSuccess(res, { user: formattedUser });
  } catch (error) {
    console.error('Kullanıcı getirme hatası:', error);
    return sendError(res, 'Kullanıcı bilgileri alınırken bir hata oluştu', 500);
  }
}

/**
 * Kullanıcı güncelle
 */
async function updateUser(req, res, id) {
  try {
    console.log(`Kullanıcı güncelleniyor, ID: ${id}`);
    
    // ID kontrolü
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return sendError(res, 'Geçersiz kullanıcı ID formatı', 400);
    }
    
    // İstek gövdesi kontrolü
    if (!req.body) {
      return sendError(res, 'Güncellenecek veri bulunamadı', 400);
    }
    
    // Veritabanına bağlan
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // Kullanıcının varlığını kontrol et
    const existingUser = await db.collection('users').findOne({ _id: objectId });
        
    if (!existingUser) {
      return sendError(res, 'Kullanıcı bulunamadı', 404);
        }
        
    // Güncellenebilir alanlar
    const { 
      name, email, role, roles, isActive, phone, address, 
      company, status
    } = req.body;
    
    // Güncellenecek verileri hazırla
    const updateData = {
      updatedAt: new Date()
    };
    
    // Güncelleme verilerini kontrol et
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (company) updateData.company = company;
    
    // İsActive veya status alanlarından birini kullan
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    } else if (status) {
      updateData.isActive = status === 'active';
    }
    
    // Rol bilgilerini güncelle (role veya roles)
    if (roles) {
      updateData.roles = Array.isArray(roles) ? roles : [roles];
    } else if (role) {
      updateData.roles = [role];
    }
    
    console.log('Güncellenecek veriler:', updateData);
    
    // Kullanıcıyı güncelle
    const result = await db.collection('users').updateOne(
      { _id: objectId },
      { $set: updateData }
        );
        
    if (result.matchedCount === 0) {
      return sendError(res, 'Kullanıcı bulunamadı', 404);
        }
        
    return sendSuccess(res, {
          success: true,
      message: 'Kullanıcı başarıyla güncellendi',
      updated: result.modifiedCount > 0
    });
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    return sendError(res, 'Kullanıcı güncellenirken bir hata oluştu', 500);
  }
}

/**
 * Kullanıcı sil
 */
async function deleteUser(req, res, id) {
  try {
    console.log(`Kullanıcı siliniyor, ID: ${id}`);
    
    // ID kontrolü
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return sendError(res, 'Geçersiz kullanıcı ID formatı', 400);
    }
    
    // Veritabanına bağlan
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // Kullanıcıyı sil
    const result = await db.collection('users').deleteOne({ _id: objectId });
    
    if (result.deletedCount === 0) {
      return sendError(res, 'Kullanıcı bulunamadı', 404);
    }
    
    return sendSuccess(res, {
      success: true,
      message: 'Kullanıcı başarıyla silindi'
    });
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    return sendError(res, 'Kullanıcı silinirken bir hata oluştu', 500);
  }
} 