import { connectToDatabase } from '@/lib/mongodb';
import { authMiddleware } from '@/middleware/auth';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  try {
    await authMiddleware(req, res, async () => {
      const { method } = req;
      const { db } = await connectToDatabase();

      switch (method) {
        case 'GET':
          return await getDriver(req, res, db);
        case 'PUT':
          return await updateDriver(req, res, db);
        case 'DELETE':
          return await deleteDriver(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Driver API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Sürücü detaylarını getir
async function getDriver(req, res, db) {
  try {
    const { id, driverId } = req.query;
    const { role, companyId } = req.user;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(driverId)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && id !== companyId?.toString()) {
      return res.status(403).json({ error: 'Bu sürücünün bilgilerini görüntüleme yetkiniz yok' });
    }

    // Sürücüyü getir
    const driver = await db.collection('drivers').findOne({
      _id: new ObjectId(driverId),
      companyId: new ObjectId(id)
    });

    if (!driver) {
      return res.status(404).json({ error: 'Sürücü bulunamadı' });
    }

    // Hassas bilgileri temizle
    delete driver.password;

    // Aktif taşımayı getir
    const activeTransport = await db.collection('transport_requests').findOne({
      driverId: new ObjectId(driverId),
      status: { $in: ['accepted', 'in_progress'] }
    });

    // Tamamlanan taşımaları getir
    const completedTransports = await db.collection('transport_requests')
      .find({
        driverId: new ObjectId(driverId),
        status: 'completed'
      })
      .sort({ updatedAt: -1 })
      .limit(5)
      .toArray();

    // Sürücü performans istatistiklerini hesapla
    const stats = {
      totalTransports: driver.completedTransports + driver.cancelledTransports,
      completionRate: driver.completedTransports > 0 ? 
        (driver.completedTransports / (driver.completedTransports + driver.cancelledTransports)) * 100 : 0,
      averageRating: driver.totalRatings > 0 ? driver.rating / driver.totalRatings : 0,
      totalRatings: driver.totalRatings
    };

    return res.status(200).json({
      driver,
      activeTransport,
      recentTransports: completedTransports,
      stats
    });

  } catch (error) {
    console.error('Get driver error:', error);
    return res.status(500).json({ error: 'Sürücü bilgileri getirilirken hata oluştu' });
  }
}

// Sürücü bilgilerini güncelle
async function updateDriver(req, res, db) {
  try {
    const { id, driverId } = req.query;
    const { role, companyId } = req.user;
    const updateData = req.body;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(driverId)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && id !== companyId?.toString()) {
      return res.status(403).json({ error: 'Bu sürücünün bilgilerini güncelleme yetkiniz yok' });
    }

    // Sürücüyü kontrol et
    const driver = await db.collection('drivers').findOne({
      _id: new ObjectId(driverId),
      companyId: new ObjectId(id)
    });

    if (!driver) {
      return res.status(404).json({ error: 'Sürücü bulunamadı' });
    }

    // Email değişikliği varsa kontrol et
    if (updateData.email && updateData.email !== driver.email) {
      const existingDriver = await db.collection('drivers').findOne({
        email: updateData.email,
        _id: { $ne: new ObjectId(driverId) }
      });

      if (existingDriver) {
        return res.status(400).json({ error: 'Bu email adresi zaten kullanımda' });
      }
    }

    // Güncelleme verilerini hazırla
    const update = {
      $set: {
        ...updateData,
        updatedAt: new Date()
      }
    };

    // Tarihleri dönüştür
    if (updateData.licenseExpiry) update.$set.licenseExpiry = new Date(updateData.licenseExpiry);
    if (updateData.birthDate) update.$set.birthDate = new Date(updateData.birthDate);

    // Şifre değişikliği varsa hashle
    if (updateData.password) {
      update.$set.password = await bcrypt.hash(updateData.password, 10);
    }

    // Sürücüyü güncelle
    const result = await db.collection('drivers').updateOne(
      { _id: new ObjectId(driverId) },
      update
    );

    if (!result.modifiedCount) {
      return res.status(400).json({ error: 'Sürücü bilgileri güncellenemedi' });
    }

    // Kullanıcı hesabını da güncelle
    if (updateData.email || updateData.password || updateData.name || updateData.phone || updateData.status) {
      const userUpdate = {
        $set: {
          updatedAt: new Date()
        }
      };

      if (updateData.email) userUpdate.$set.email = updateData.email;
      if (updateData.password) userUpdate.$set.password = update.$set.password;
      if (updateData.name) {
        userUpdate.$set.name = updateData.name.split(' ')[0];
        userUpdate.$set.surname = updateData.name.split(' ').slice(1).join(' ');
      }
      if (updateData.phone) userUpdate.$set.phone = updateData.phone;
      if (updateData.status) userUpdate.$set.status = updateData.status;

      await db.collection('users').updateOne(
        { driverId: new ObjectId(driverId) },
        userUpdate
      );
    }

    // Güncellenmiş sürücü bilgilerini getir
    const updatedDriver = await db.collection('drivers').findOne({
      _id: new ObjectId(driverId)
    });

    // Hassas bilgileri temizle
    delete updatedDriver.password;

    return res.status(200).json({
      message: 'Sürücü bilgileri başarıyla güncellendi',
      driver: updatedDriver
    });

  } catch (error) {
    console.error('Update driver error:', error);
    return res.status(500).json({ error: 'Sürücü bilgileri güncellenirken hata oluştu' });
  }
}

// Sürücüyü sil
async function deleteDriver(req, res, db) {
  try {
    const { id, driverId } = req.query;
    const { role, companyId } = req.user;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(driverId)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && id !== companyId?.toString()) {
      return res.status(403).json({ error: 'Bu sürücüyü silme yetkiniz yok' });
    }

    // Sürücüyü kontrol et
    const driver = await db.collection('drivers').findOne({
      _id: new ObjectId(driverId),
      companyId: new ObjectId(id)
    });

    if (!driver) {
      return res.status(404).json({ error: 'Sürücü bulunamadı' });
    }

    // Aktif taşıma kontrolü
    const activeTransport = await db.collection('transport_requests').findOne({
      driverId: new ObjectId(driverId),
      status: { $in: ['accepted', 'in_progress'] }
    });

    if (activeTransport) {
      return res.status(400).json({ error: 'Aktif taşıması olan sürücü silinemez' });
    }

    // Sürücüyü sil
    const result = await db.collection('drivers').deleteOne({
      _id: new ObjectId(driverId)
    });

    if (!result.deletedCount) {
      return res.status(400).json({ error: 'Sürücü silinemedi' });
    }

    // Kullanıcı hesabını sil
    await db.collection('users').deleteOne({
      driverId: new ObjectId(driverId)
    });

    return res.status(200).json({
      message: 'Sürücü başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete driver error:', error);
    return res.status(500).json({ error: 'Sürücü silinirken hata oluştu' });
  }
} 