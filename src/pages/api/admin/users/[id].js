import { connectToDatabase } from '@/lib/mongodb';
import { authMiddleware } from '@/middleware/auth';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  try {
    await authMiddleware(req, res, async () => {
      // Yalnızca admin erişebilir
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Bu işlem için yetkiniz bulunmamaktadır' });
      }

      const { method } = req;
      const { db } = await connectToDatabase();

      switch (method) {
        case 'GET':
          return await getUser(req, res, db);
        case 'PUT':
          return await updateUser(req, res, db);
        case 'DELETE':
          return await deleteUser(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Admin user API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Kullanıcı bilgilerini getir
async function getUser(req, res, db) {
  try {
    const { id } = req.query;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz kullanıcı ID' });
    }
    
    const user = await db.collection('users').findOne({
      _id: new ObjectId(id)
    }, {
      projection: { password: 0 } // Şifreyi gönderme
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // Kullanıcı rolüne göre ek bilgileri getir
    let additionalData = null;
    
    if (user.role === 'company' && user.companyId) {
      additionalData = await db.collection('companies').findOne({
        _id: new ObjectId(user.companyId)
      });
    } else if (user.role === 'driver' && user.driverId) {
      additionalData = await db.collection('drivers').findOne({
        _id: new ObjectId(user.driverId)
      });
    }
    
    return res.status(200).json({
      user,
      additionalData
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Kullanıcı bilgileri getirilirken hata oluştu' });
  }
}

// Kullanıcı bilgilerini güncelle
async function updateUser(req, res, db) {
  try {
    const { id } = req.query;
    const updateData = req.body;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz kullanıcı ID' });
    }
    
    // Kullanıcıyı kontrol et
    const user = await db.collection('users').findOne({
      _id: new ObjectId(id)
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // Email değişikliği varsa kontrol et
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await db.collection('users').findOne({
        email: updateData.email,
        _id: { $ne: new ObjectId(id) }
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Bu email adresi başka bir kullanıcı tarafından kullanılıyor' });
      }
    }
    
    // Güncelleme verilerini hazırla
    const userUpdate = {
      $set: {
        updatedAt: new Date()
      }
    };
    
    // İzin verilen alanları güncelle
    const allowedFields = ['name', 'surname', 'email', 'phone', 'status', 'role'];
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        userUpdate.$set[field] = updateData[field];
      }
    });
    
    // Şifre değişikliği
    if (updateData.password) {
      userUpdate.$set.password = await bcrypt.hash(updateData.password, 10);
    }
    
    // Kullanıcıyı güncelle
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      userUpdate
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Kullanıcı güncellenemedi' });
    }
    
    // Role göre ek bilgileri güncelle
    if (user.role === 'company' && user.companyId && updateData.company) {
      const companyUpdate = {
        $set: {
          updatedAt: new Date()
        }
      };
      
      // Şirket alanlarını güncelle
      const companyFields = ['name', 'email', 'phone', 'address', 'website', 'taxNumber', 'contactPerson', 'status'];
      
      companyFields.forEach(field => {
        if (updateData.company[field] !== undefined) {
          companyUpdate.$set[field] = updateData.company[field];
        }
      });
      
      if (Object.keys(companyUpdate.$set).length > 1) {
        await db.collection('companies').updateOne(
          { _id: new ObjectId(user.companyId) },
          companyUpdate
        );
      }
    } else if (user.role === 'driver' && user.driverId && updateData.driver) {
      const driverUpdate = {
        $set: {
          updatedAt: new Date()
        }
      };
      
      // Sürücü alanlarını güncelle
      const driverFields = ['name', 'surname', 'email', 'phone', 'address', 'licenseInfo', 'birthDate', 'emergencyContact', 'status'];
      
      driverFields.forEach(field => {
        if (updateData.driver[field] !== undefined) {
          if (field === 'birthDate' && updateData.driver[field]) {
            driverUpdate.$set[field] = new Date(updateData.driver[field]);
          } else {
            driverUpdate.$set[field] = updateData.driver[field];
          }
        }
      });
      
      // Sürücünün bağlı olduğu şirketi değiştir
      if (updateData.driver.companyId && ObjectId.isValid(updateData.driver.companyId)) {
        driverUpdate.$set.companyId = new ObjectId(updateData.driver.companyId);
      }
      
      if (Object.keys(driverUpdate.$set).length > 1) {
        await db.collection('drivers').updateOne(
          { _id: new ObjectId(user.driverId) },
          driverUpdate
        );
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Kullanıcı güncellenirken hata oluştu' });
  }
}

// Kullanıcıyı sil
async function deleteUser(req, res, db) {
  try {
    const { id } = req.query;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz kullanıcı ID' });
    }
    
    // Kullanıcıyı kontrol et
    const user = await db.collection('users').findOne({
      _id: new ObjectId(id)
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // Admin kullanıcısı siliniyor mu?
    if (user.role === 'admin') {
      // En az bir admin kullanıcısı olmalı
      const adminCount = await db.collection('users').countDocuments({ role: 'admin' });
      
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Son admin kullanıcısı silinemez' });
      }
    }
    
    // Role göre ilişkili kayıtları kontrol et
    if (user.role === 'company' && user.companyId) {
      // Şirketin aktif taşıması var mı?
      const activeTransport = await db.collection('transport_requests').findOne({
        transportCompanyId: new ObjectId(user.companyId),
        status: { $in: ['accepted', 'in_progress'] }
      });
      
      if (activeTransport) {
        return res.status(400).json({ error: 'Aktif taşıma isteği olan şirket silinemez' });
      }
      
      // İlişkili kayıtları sil/güncelle
      await Promise.all([
        // Şirketi sil
        db.collection('companies').updateOne(
          { _id: new ObjectId(user.companyId) },
          { $set: { status: 'deleted', updatedAt: new Date() } }
        ),
        
        // Şirketin sürücülerini güncelle
        db.collection('drivers').updateMany(
          { companyId: new ObjectId(user.companyId) },
          { $set: { status: 'inactive', updatedAt: new Date() } }
        ),
        
        // Şirketin araçlarını güncelle
        db.collection('vehicles').updateMany(
          { companyId: new ObjectId(user.companyId) },
          { $set: { status: 'inactive', updatedAt: new Date() } }
        )
      ]);
    } else if (user.role === 'driver' && user.driverId) {
      // Sürücünün aktif taşıması var mı?
      const activeTransport = await db.collection('transport_requests').findOne({
        driverId: new ObjectId(user.driverId),
        status: { $in: ['accepted', 'in_progress'] }
      });
      
      if (activeTransport) {
        return res.status(400).json({ error: 'Aktif taşıma isteği olan sürücü silinemez' });
      }
      
      // Sürücüyü sil
      await db.collection('drivers').updateOne(
        { _id: new ObjectId(user.driverId) },
        { $set: { status: 'deleted', updatedAt: new Date() } }
      );
      
      // Sürücünün araçlarını güncelle
      await db.collection('vehicles').updateMany(
        { driverId: new ObjectId(user.driverId) },
        { $set: { driverId: null, updatedAt: new Date() } }
      );
    }
    
    // Kullanıcıyı sil (veya inaktif yap)
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'deleted', updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Kullanıcı silinemedi' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Kullanıcı silinirken hata oluştu' });
  }
} 