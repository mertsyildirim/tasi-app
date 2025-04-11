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
          return await getTransportRequest(req, res, db);
        case 'PUT':
          return await updateTransportRequest(req, res, db);
        case 'DELETE':
          return await deleteTransportRequest(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Transport request API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Taşıma talebi detaylarını getir
async function getTransportRequest(req, res, db) {
  try {
    const { id } = req.query;
    const { role, companyId } = req.user;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Talebi getir
    const request = await db.collection('transport_requests').findOne({
      _id: new ObjectId(id)
    });

    if (!request) {
      return res.status(404).json({ error: 'Taşıma talebi bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && request.companyId.toString() !== companyId?.toString()) {
      return res.status(403).json({ error: 'Bu talebi görüntüleme yetkiniz yok' });
    }

    // İlgili şirket bilgilerini getir
    const company = await db.collection('companies').findOne({
      _id: request.companyId
    });

    // Teklifleri getir
    const offers = await db.collection('transport_offers')
      .find({ requestId: request._id })
      .toArray();

    // Sürücü bilgilerini getir (eğer atanmışsa)
    let driver = null;
    if (request.driverId) {
      driver = await db.collection('drivers').findOne({
        _id: request.driverId
      });
    }

    // Araç bilgilerini getir (eğer atanmışsa)
    let vehicle = null;
    if (request.vehicleId) {
      vehicle = await db.collection('vehicles').findOne({
        _id: request.vehicleId
      });
    }

    return res.status(200).json({
      request,
      company: {
        name: company.name,
        phone: company.phone,
        email: company.email
      },
      offers,
      driver,
      vehicle
    });

  } catch (error) {
    console.error('Get transport request error:', error);
    return res.status(500).json({ error: 'Taşıma talebi getirilirken hata oluştu' });
  }
}

// Taşıma talebini güncelle
async function updateTransportRequest(req, res, db) {
  try {
    const { id } = req.query;
    const { role, companyId } = req.user;
    const updateData = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Talebi kontrol et
    const request = await db.collection('transport_requests').findOne({
      _id: new ObjectId(id)
    });

    if (!request) {
      return res.status(404).json({ error: 'Taşıma talebi bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && request.companyId.toString() !== companyId?.toString()) {
      return res.status(403).json({ error: 'Bu talebi güncelleme yetkiniz yok' });
    }

    // Durum değişikliği kontrolü
    if (updateData.status && request.status !== updateData.status) {
      // Sadece geçerli durum değişikliklerine izin ver
      const validTransitions = {
        pending: ['accepted', 'cancelled'],
        accepted: ['in_progress', 'cancelled'],
        in_progress: ['completed', 'cancelled'],
        completed: [],
        cancelled: []
      };

      if (!validTransitions[request.status].includes(updateData.status)) {
        return res.status(400).json({
          error: 'Geçersiz durum değişikliği',
          current: request.status,
          requested: updateData.status,
          allowed: validTransitions[request.status]
        });
      }

      // Durum değişikliği bildirimi gönder
      await db.collection('notifications').insertOne({
        type: 'TRANSPORT_STATUS_CHANGE',
        requestId: request._id,
        oldStatus: request.status,
        newStatus: updateData.status,
        companyId: request.companyId,
        status: 'unread',
        createdAt: new Date()
      });
    }

    // Güncelleme verilerini hazırla
    const update = {
      $set: {
        ...updateData,
        updatedAt: new Date()
      }
    };

    // Sayısal değerleri dönüştür
    if (updateData.cargo?.weight) update.$set['cargo.weight'] = parseFloat(updateData.cargo.weight);
    if (updateData.cargo?.volume) update.$set['cargo.volume'] = parseFloat(updateData.cargo.volume);
    if (updateData.price?.amount) update.$set['price.amount'] = parseFloat(updateData.price.amount);

    // Tarihleri dönüştür
    if (updateData.pickupDate) update.$set.pickupDate = new Date(updateData.pickupDate);
    if (updateData.deliveryDate) update.$set.deliveryDate = new Date(updateData.deliveryDate);

    // Talebi güncelle
    const result = await db.collection('transport_requests').updateOne(
      { _id: new ObjectId(id) },
      update
    );

    if (!result.modifiedCount) {
      return res.status(400).json({ error: 'Taşıma talebi güncellenemedi' });
    }

    // Güncellenmiş talebi getir
    const updatedRequest = await db.collection('transport_requests').findOne({
      _id: new ObjectId(id)
    });

    return res.status(200).json({
      message: 'Taşıma talebi başarıyla güncellendi',
      request: updatedRequest
    });

  } catch (error) {
    console.error('Update transport request error:', error);
    return res.status(500).json({ error: 'Taşıma talebi güncellenirken hata oluştu' });
  }
}

// Taşıma talebini sil
async function deleteTransportRequest(req, res, db) {
  try {
    const { id } = req.query;
    const { role, companyId } = req.user;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Talebi kontrol et
    const request = await db.collection('transport_requests').findOne({
      _id: new ObjectId(id)
    });

    if (!request) {
      return res.status(404).json({ error: 'Taşıma talebi bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && request.companyId.toString() !== companyId?.toString()) {
      return res.status(403).json({ error: 'Bu talebi silme yetkiniz yok' });
    }

    // Aktif taşıma kontrolü
    if (['accepted', 'in_progress'].includes(request.status)) {
      return res.status(400).json({ error: 'Aktif durumdaki taşıma talebi silinemez' });
    }

    // İlgili teklifleri sil
    await db.collection('transport_offers').deleteMany({
      requestId: new ObjectId(id)
    });

    // Talebi sil
    const result = await db.collection('transport_requests').deleteOne({
      _id: new ObjectId(id)
    });

    if (!result.deletedCount) {
      return res.status(400).json({ error: 'Taşıma talebi silinemedi' });
    }

    // Bildirim gönder
    await db.collection('notifications').insertOne({
      type: 'TRANSPORT_REQUEST_DELETED',
      requestId: new ObjectId(id),
      companyId: request.companyId,
      status: 'unread',
      createdAt: new Date()
    });

    return res.status(200).json({
      message: 'Taşıma talebi başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete transport request error:', error);
    return res.status(500).json({ error: 'Taşıma talebi silinirken hata oluştu' });
  }
} 