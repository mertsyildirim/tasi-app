import { connectToDatabase } from '@/lib/mongodb';
import { authMiddleware } from '@/middleware/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    // Auth kontrolü
    await authMiddleware(req, res, async () => {
      const { method } = req;
      const { db } = await connectToDatabase();

      switch (method) {
        case 'GET':
          return await getRequest(req, res, db);
        case 'PUT':
          return await updateRequest(req, res, db);
        case 'DELETE':
          return await deleteRequest(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Request API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Talep detaylarını getir
async function getRequest(req, res, db) {
  try {
    const { id } = req.query;
    const { role, id: userId } = req.user;

    // ObjectId kontrolü
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz talep ID' });
    }

    // Talebi getir
    const request = await db.collection('requests').findOne({
      _id: new ObjectId(id)
    });

    if (!request) {
      return res.status(404).json({ error: 'Talep bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && 
        request.customerId.toString() !== userId && 
        request.carrierId?.toString() !== userId) {
      return res.status(403).json({ error: 'Bu talebi görüntüleme yetkiniz yok' });
    }

    return res.status(200).json(request);
  } catch (error) {
    console.error('Get request error:', error);
    return res.status(500).json({ error: 'Talep getirilirken hata oluştu' });
  }
}

// Talep güncelle
async function updateRequest(req, res, db) {
  try {
    const { id } = req.query;
    const { role, id: userId } = req.user;
    const updates = req.body;

    // ObjectId kontrolü
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz talep ID' });
    }

    // Mevcut talebi getir
    const request = await db.collection('requests').findOne({
      _id: new ObjectId(id)
    });

    if (!request) {
      return res.status(404).json({ error: 'Talep bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && 
        request.customerId.toString() !== userId && 
        request.carrierId?.toString() !== userId) {
      return res.status(403).json({ error: 'Bu talebi güncelleme yetkiniz yok' });
    }

    // Güncelleme yapılabilecek alanları kontrol et
    const allowedUpdates = {
      admin: ['status', 'carrierId', 'carrier', 'price', 'payment'],
      company: ['status'],
      customer: ['pickupLocation', 'deliveryLocation', 'date', 'time', 'vehicle', 'description']
    };

    // Güncelleme verilerini filtrele
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates[role].includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Güncelleme tarihi ekle
    filteredUpdates.updatedAt = new Date();

    // Talebi güncelle
    const result = await db.collection('requests').updateOne(
      { _id: new ObjectId(id) },
      { $set: filteredUpdates }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: 'Güncelleme yapılamadı' });
    }

    // Durum değişikliği bildirimi gönder
    if (updates.status) {
      await sendStatusNotification(db, request, updates.status);
    }

    return res.status(200).json({
      message: 'Talep başarıyla güncellendi',
      request: {
        ...request,
        ...filteredUpdates
      }
    });
  } catch (error) {
    console.error('Update request error:', error);
    return res.status(500).json({ error: 'Talep güncellenirken hata oluştu' });
  }
}

// Talep sil
async function deleteRequest(req, res, db) {
  try {
    const { id } = req.query;
    const { role, id: userId } = req.user;

    // ObjectId kontrolü
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz talep ID' });
    }

    // Mevcut talebi getir
    const request = await db.collection('requests').findOne({
      _id: new ObjectId(id)
    });

    if (!request) {
      return res.status(404).json({ error: 'Talep bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && request.customerId.toString() !== userId) {
      return res.status(403).json({ error: 'Bu talebi silme yetkiniz yok' });
    }

    // Talebi sil
    const result = await db.collection('requests').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(400).json({ error: 'Talep silinemedi' });
    }

    // İlgili bildirimleri sil
    await db.collection('notifications').deleteMany({
      requestId: new ObjectId(id)
    });

    return res.status(200).json({
      message: 'Talep başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete request error:', error);
    return res.status(500).json({ error: 'Talep silinirken hata oluştu' });
  }
}

// Durum değişikliği bildirimi gönder
async function sendStatusNotification(db, request, newStatus) {
  try {
    const notification = {
      userId: request.customerId,
      type: 'REQUEST_STATUS_CHANGE',
      requestId: request._id,
      title: 'Talep Durumu Güncellendi',
      message: `Talebinizin durumu "${newStatus}" olarak güncellendi.`,
      status: 'unread',
      createdAt: new Date()
    };

    await db.collection('notifications').insertOne(notification);
  } catch (error) {
    console.error('Send notification error:', error);
  }
} 