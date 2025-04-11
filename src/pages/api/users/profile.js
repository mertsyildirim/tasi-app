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
          return await getProfile(req, res, db);
        case 'PUT':
          return await updateProfile(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'PUT']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Profil bilgilerini getir
async function getProfile(req, res, db) {
  try {
    const { id: userId, role, companyId, driverId } = req.user;

    // Kullanıcı bilgilerini getir
    const user = await db.collection('users').findOne({
      _id: new ObjectId(userId)
    });

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Hassas bilgileri temizle
    delete user.password;

    // Role göre ek bilgileri getir
    let profile = null;
    let stats = null;

    if (role === 'company') {
      // Şirket bilgilerini getir
      profile = await db.collection('companies').findOne({
        _id: new ObjectId(companyId)
      });

      if (profile) {
        // Şirket istatistiklerini hesapla
        const [
          activeTransports,
          completedTransports,
          totalDrivers,
          totalVehicles
        ] = await Promise.all([
          db.collection('transport_requests').countDocuments({
            transportCompanyId: new ObjectId(companyId),
            status: { $in: ['accepted', 'in_progress'] }
          }),
          db.collection('transport_requests').countDocuments({
            transportCompanyId: new ObjectId(companyId),
            status: 'completed'
          }),
          db.collection('drivers').countDocuments({
            companyId: new ObjectId(companyId),
            status: 'active'
          }),
          db.collection('vehicles').countDocuments({
            companyId: new ObjectId(companyId),
            status: 'active'
          })
        ]);

        stats = {
          activeTransports,
          completedTransports,
          totalDrivers,
          totalVehicles,
          rating: profile.rating,
          totalRatings: profile.totalRatings
        };
      }
    } else if (role === 'driver') {
      // Sürücü bilgilerini getir
      profile = await db.collection('drivers').findOne({
        _id: new ObjectId(driverId)
      });

      if (profile) {
        // Sürücü istatistiklerini hesapla
        const [
          activeTransport,
          completedTransports,
          cancelledTransports
        ] = await Promise.all([
          db.collection('transport_requests').findOne({
            driverId: new ObjectId(driverId),
            status: { $in: ['accepted', 'in_progress'] }
          }),
          db.collection('transport_requests').countDocuments({
            driverId: new ObjectId(driverId),
            status: 'completed'
          }),
          db.collection('transport_requests').countDocuments({
            driverId: new ObjectId(driverId),
            status: 'cancelled'
          })
        ]);

        stats = {
          activeTransport,
          completedTransports,
          cancelledTransports,
          rating: profile.rating,
          totalRatings: profile.totalRatings
        };

        // Hassas bilgileri temizle
        delete profile.password;
      }
    }

    return res.status(200).json({
      user,
      profile,
      stats
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Profil bilgileri getirilirken hata oluştu' });
  }
}

// Profil bilgilerini güncelle
async function updateProfile(req, res, db) {
  try {
    const { id: userId, role, companyId, driverId } = req.user;
    const updateData = req.body;

    // Kullanıcıyı kontrol et
    const user = await db.collection('users').findOne({
      _id: new ObjectId(userId)
    });

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Email değişikliği varsa kontrol et
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await db.collection('users').findOne({
        email: updateData.email,
        _id: { $ne: new ObjectId(userId) }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Bu email adresi zaten kullanımda' });
      }
    }

    // Güncelleme verilerini hazırla
    const userUpdate = {
      $set: {
        updatedAt: new Date()
      }
    };

    // Kullanıcı bilgilerini güncelle
    if (updateData.email) userUpdate.$set.email = updateData.email;
    if (updateData.name) userUpdate.$set.name = updateData.name;
    if (updateData.surname) userUpdate.$set.surname = updateData.surname;
    if (updateData.phone) userUpdate.$set.phone = updateData.phone;

    // Şifre değişikliği
    if (updateData.currentPassword && updateData.newPassword) {
      const isValidPassword = await bcrypt.compare(updateData.currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Mevcut şifre yanlış' });
      }
      userUpdate.$set.password = await bcrypt.hash(updateData.newPassword, 10);
    }

    // Kullanıcıyı güncelle
    const userResult = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      userUpdate
    );

    // Role göre profil bilgilerini güncelle
    let profileResult = null;
    if (role === 'company' && companyId) {
      const companyUpdate = {
        $set: {
          updatedAt: new Date()
        }
      };

      if (updateData.company) {
        const allowedFields = ['name', 'phone', 'email', 'website', 'address'];
        allowedFields.forEach(field => {
          if (updateData.company[field] !== undefined) {
            companyUpdate.$set[field] = updateData.company[field];
          }
        });
      }

      if (Object.keys(companyUpdate.$set).length > 1) {
        profileResult = await db.collection('companies').updateOne(
          { _id: new ObjectId(companyId) },
          companyUpdate
        );
      }
    } else if (role === 'driver' && driverId) {
      const driverUpdate = {
        $set: {
          updatedAt: new Date()
        }
      };

      if (updateData.driver) {
        const allowedFields = ['phone', 'email', 'address', 'emergencyContact'];
        allowedFields.forEach(field => {
          if (updateData.driver[field] !== undefined) {
            driverUpdate.$set[field] = updateData.driver[field];
          }
        });
      }

      if (Object.keys(driverUpdate.$set).length > 1) {
        profileResult = await db.collection('drivers').updateOne(
          { _id: new ObjectId(driverId) },
          driverUpdate
        );
      }
    }

    // Bildirim ayarlarını güncelle
    if (updateData.settings?.notifications) {
      const collection = role === 'company' ? 'companies' : 'drivers';
      const documentId = role === 'company' ? companyId : driverId;

      if (documentId) {
        await db.collection(collection).updateOne(
          { _id: new ObjectId(documentId) },
          {
            $set: {
              'settings.notifications': updateData.settings.notifications
            }
          }
        );
      }
    }

    if (!userResult.modifiedCount && !profileResult?.modifiedCount) {
      return res.status(400).json({ error: 'Profil bilgileri güncellenemedi' });
    }

    // Güncellenmiş profili getir
    const updatedUser = await db.collection('users').findOne({
      _id: new ObjectId(userId)
    });

    delete updatedUser.password;

    let updatedProfile = null;
    if (role === 'company' && companyId) {
      updatedProfile = await db.collection('companies').findOne({
        _id: new ObjectId(companyId)
      });
    } else if (role === 'driver' && driverId) {
      updatedProfile = await db.collection('drivers').findOne({
        _id: new ObjectId(driverId)
      });
      delete updatedProfile.password;
    }

    return res.status(200).json({
      message: 'Profil bilgileri başarıyla güncellendi',
      user: updatedUser,
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Profil bilgileri güncellenirken hata oluştu' });
  }
} 