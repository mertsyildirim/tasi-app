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
          return await getRequests(req, res, db);
        case 'POST':
          return await createRequest(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'POST']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Requests API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Talepleri listele
async function getRequests(req, res, db) {
  try {
    const { role, id } = req.user;
    const { status, page = 1, limit = 10 } = req.query;

    // Filtreleme koşulları
    let query = {};
    
    if (status) {
      query.status = status;
    }

    // Role göre filtreleme
    if (role === 'company') {
      query.carrierId = new ObjectId(id);
    } else if (role === 'customer') {
      query.customerId = new ObjectId(id);
    }
    // Admin tüm talepleri görebilir

    // Sayfalama
    const skip = (page - 1) * limit;
    
    // Talepleri getir
    const requests = await db.collection('requests')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Toplam talep sayısı
    const total = await db.collection('requests').countDocuments(query);

    return res.status(200).json({
      requests,
      pagination: {
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get requests error:', error);
    return res.status(500).json({ error: 'Talepleri getirirken hata oluştu' });
  }
}

// Yeni talep oluştur
async function createRequest(req, res, db) {
  try {
    const { id } = req.user;
    const {
      pickupLocation,
      deliveryLocation,
      date,
      time,
      vehicle,
      description,
      price
    } = req.body;

    // Validasyon
    if (!pickupLocation || !deliveryLocation || !date || !vehicle) {
      return res.status(400).json({ error: 'Tüm zorunlu alanları doldurun' });
    }

    // Yeni talep oluştur
    const request = {
      customerId: new ObjectId(id),
      pickupLocation,
      deliveryLocation,
      date: new Date(date),
      time,
      vehicle,
      description,
      price,
      status: 'Yeni',
      carrierId: null,
      carrier: null,
      payment: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('requests').insertOne(request);

    // Yakındaki taşıyıcılara bildirim gönder
    await notifyNearbyCarriers(db, request);

    return res.status(201).json({
      message: 'Talep başarıyla oluşturuldu',
      request: {
        id: result.insertedId,
        ...request
      }
    });
  } catch (error) {
    console.error('Create request error:', error);
    return res.status(500).json({ error: 'Talep oluştururken hata oluştu' });
  }
}

// Yakındaki taşıyıcılara bildirim gönder
async function notifyNearbyCarriers(db, request) {
  try {
    // Aktif taşıyıcıları bul
    const carriers = await db.collection('companies')
      .find({ 
        status: 'active',
        // Burada konum bazlı filtreleme yapılabilir
      })
      .toArray();

    // Her taşıyıcı için bildirim oluştur
    const notifications = carriers.map(carrier => ({
      userId: carrier.userId,
      type: 'NEW_REQUEST',
      requestId: request._id,
      title: 'Yeni Taşıma Talebi',
      message: `${request.pickupLocation} - ${request.deliveryLocation} güzergahında yeni bir taşıma talebi var.`,
      status: 'unread',
      createdAt: new Date()
    }));

    if (notifications.length > 0) {
      await db.collection('notifications').insertMany(notifications);
    }
  } catch (error) {
    console.error('Notify carriers error:', error);
  }
} 