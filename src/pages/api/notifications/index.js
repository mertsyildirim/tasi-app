import { connectToDatabase } from '@/lib/mongodb';
import { authMiddleware } from '@/middleware/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    await authMiddleware(req, res, async () => {
      const { method } = req;
      const { db } = await connectToDatabase();

      switch (method) {
        case 'GET':
          return await getNotifications(req, res, db);
        case 'PUT':
          return await updateNotifications(req, res, db);
        case 'DELETE':
          return await deleteNotifications(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Notifications API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Bildirimleri listele
async function getNotifications(req, res, db) {
  try {
    const { role, id: userId, companyId } = req.user;
    const {
      page = 1,
      limit = 20,
      status,
      type,
      startDate,
      endDate
    } = req.query;

    // Filtreleri oluştur
    const query = {};

    // Role göre filtreleme
    if (role === 'admin') {
      if (req.query.role) {
        query.role = req.query.role;
      }
    } else if (role === 'company') {
      query.companyId = new ObjectId(companyId);
    } else if (role === 'driver') {
      query.$or = [
        { userId: new ObjectId(userId) },
        { driverId: new ObjectId(userId) }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Toplam sayıyı hesapla
    const total = await db.collection('notifications').countDocuments(query);

    // Sayfalama
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Bildirimleri getir
    const notifications = await db.collection('notifications')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // İstatistikleri hesapla
    const stats = {
      total,
      unread: await db.collection('notifications').countDocuments({ ...query, status: 'unread' }),
      read: await db.collection('notifications').countDocuments({ ...query, status: 'read' }),
      types: await db.collection('notifications')
        .aggregate([
          { $match: query },
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]).toArray()
    };

    return res.status(200).json({
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      stats
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ error: 'Bildirimler listelenirken hata oluştu' });
  }
}

// Bildirimleri güncelle (okundu olarak işaretle)
async function updateNotifications(req, res, db) {
  try {
    const { role, id: userId, companyId } = req.user;
    const { ids, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Geçersiz bildirim ID listesi' });
    }

    if (!['read', 'unread'].includes(status)) {
      return res.status(400).json({ error: 'Geçersiz durum' });
    }

    // ObjectId'lere dönüştür
    const notificationIds = ids.map(id => {
      if (!ObjectId.isValid(id)) {
        throw new Error('Geçersiz bildirim ID');
      }
      return new ObjectId(id);
    });

    // Yetki kontrolü için sorgu oluştur
    const query = {
      _id: { $in: notificationIds }
    };

    if (role === 'company') {
      query.companyId = new ObjectId(companyId);
    } else if (role === 'driver') {
      query.$or = [
        { userId: new ObjectId(userId) },
        { driverId: new ObjectId(userId) }
      ];
    }

    // Bildirimleri güncelle
    const result = await db.collection('notifications').updateMany(
      query,
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      }
    );

    if (!result.modifiedCount) {
      return res.status(400).json({ error: 'Bildirimler güncellenemedi' });
    }

    return res.status(200).json({
      message: `${result.modifiedCount} bildirim ${status === 'read' ? 'okundu' : 'okunmadı'} olarak işaretlendi`
    });

  } catch (error) {
    console.error('Update notifications error:', error);
    return res.status(500).json({ error: 'Bildirimler güncellenirken hata oluştu' });
  }
}

// Bildirimleri sil
async function deleteNotifications(req, res, db) {
  try {
    const { role, id: userId, companyId } = req.user;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Geçersiz bildirim ID listesi' });
    }

    // ObjectId'lere dönüştür
    const notificationIds = ids.map(id => {
      if (!ObjectId.isValid(id)) {
        throw new Error('Geçersiz bildirim ID');
      }
      return new ObjectId(id);
    });

    // Yetki kontrolü için sorgu oluştur
    const query = {
      _id: { $in: notificationIds }
    };

    if (role === 'company') {
      query.companyId = new ObjectId(companyId);
    } else if (role === 'driver') {
      query.$or = [
        { userId: new ObjectId(userId) },
        { driverId: new ObjectId(userId) }
      ];
    }

    // Bildirimleri sil
    const result = await db.collection('notifications').deleteMany(query);

    if (!result.deletedCount) {
      return res.status(400).json({ error: 'Bildirimler silinemedi' });
    }

    return res.status(200).json({
      message: `${result.deletedCount} bildirim başarıyla silindi`
    });

  } catch (error) {
    console.error('Delete notifications error:', error);
    return res.status(500).json({ error: 'Bildirimler silinirken hata oluştu' });
  }
} 