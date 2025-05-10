import { connectToDatabase } from '../../../lib/db';
import { withAuth } from '../../../lib/auth';
import { ObjectId } from 'mongodb';

async function handler(req, res) {
  const { method } = req;

  try {
    const { db } = await connectToDatabase();
    const { userId } = req.user;

    if (method === 'GET') {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Okunmamış bildirim sayısını al
      const unreadCount = await db.collection('notifications').countDocuments({
        userId: new ObjectId(userId),
        read: false
      });

      // Bildirimleri getir
      const notifications = await db.collection('notifications')
        .find({ userId: new ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      // Toplam bildirim sayısını al
      const total = await db.collection('notifications').countDocuments({
        userId: new ObjectId(userId)
      });

      return res.status(200).json({
        success: true,
        notifications: notifications.map(notification => ({
          id: notification._id.toString(),
          title: notification.title,
          message: notification.message,
          type: notification.type,
          read: notification.read,
          createdAt: notification.createdAt
        })),
        pagination: {
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          limit
        },
        unreadCount
      });

    } else if (method === 'PUT') {
      const { notificationId } = req.body;

      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message: 'Bildirim ID\'si gerekli'
        });
      }

      // Bildirimi okundu olarak işaretle
      const result = await db.collection('notifications').updateOne(
        { 
          _id: new ObjectId(notificationId),
          userId: new ObjectId(userId)
        },
        { 
          $set: { 
            read: true,
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Bildirim bulunamadı'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Bildirim okundu olarak işaretlendi'
      });

    } else if (method === 'DELETE') {
      const { notificationId } = req.query;

      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message: 'Bildirim ID\'si gerekli'
        });
      }

      // Bildirimi sil
      const result = await db.collection('notifications').deleteOne({
        _id: new ObjectId(notificationId),
        userId: new ObjectId(userId)
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Bildirim bulunamadı'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Bildirim başarıyla silindi'
      });

    } else {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }

  } catch (error) {
    console.error('Bildirimler API hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Bildirimler işlemi sırasında bir hata oluştu',
      error: error.message
    });
  }
}

export default withAuth(handler); 