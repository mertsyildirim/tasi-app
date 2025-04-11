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
          return await getTransportRequests(req, res, db);
        case 'POST':
          return await createTransportRequest(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'POST']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Transport requests API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Taşıma taleplerini listele
async function getTransportRequests(req, res, db) {
  try {
    const { role, id: userId, companyId } = req.user;
    const {
      page = 1,
      limit = 10,
      status,
      type,
      startDate,
      endDate,
      origin,
      destination,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Filtreleri oluştur
    const query = {};

    // Admin tüm talepleri görebilir
    if (role !== 'admin') {
      // Şirket sadece kendi taleplerini görebilir
      query.companyId = new ObjectId(companyId);
    }

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.pickupDate = {};
      if (startDate) query.pickupDate.$gte = new Date(startDate);
      if (endDate) query.pickupDate.$lte = new Date(endDate);
    }

    if (origin) {
      query['origin.city'] = { $regex: origin, $options: 'i' };
    }

    if (destination) {
      query['destination.city'] = { $regex: destination, $options: 'i' };
    }

    // Toplam sayıyı hesapla
    const total = await db.collection('transport_requests').countDocuments(query);

    // Sıralama ayarları
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Sayfalama
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Talepleri getir
    const requests = await db.collection('transport_requests')
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // İstatistikleri hesapla
    const stats = {
      total,
      pending: await db.collection('transport_requests').countDocuments({ ...query, status: 'pending' }),
      accepted: await db.collection('transport_requests').countDocuments({ ...query, status: 'accepted' }),
      completed: await db.collection('transport_requests').countDocuments({ ...query, status: 'completed' }),
      cancelled: await db.collection('transport_requests').countDocuments({ ...query, status: 'cancelled' })
    };

    return res.status(200).json({
      requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      stats
    });

  } catch (error) {
    console.error('Get transport requests error:', error);
    return res.status(500).json({ error: 'Taşıma talepleri listelenirken hata oluştu' });
  }
}

// Yeni taşıma talebi oluştur
async function createTransportRequest(req, res, db) {
  try {
    const { role, id: userId, companyId } = req.user;
    const {
      type,
      cargo,
      origin,
      destination,
      pickupDate,
      deliveryDate,
      vehicle,
      price,
      notes
    } = req.body;

    // Zorunlu alan kontrolü
    const requiredFields = ['type', 'cargo', 'origin', 'destination', 'pickupDate', 'deliveryDate', 'vehicle'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Eksik bilgi',
        fields: missingFields
      });
    }

    // Tarih kontrolü
    const pickup = new Date(pickupDate);
    const delivery = new Date(deliveryDate);
    const now = new Date();

    if (pickup < now) {
      return res.status(400).json({ error: 'Yükleme tarihi geçmiş bir tarih olamaz' });
    }

    if (delivery <= pickup) {
      return res.status(400).json({ error: 'Teslimat tarihi yükleme tarihinden sonra olmalıdır' });
    }

    // Şirket kontrolü
    const company = await db.collection('companies').findOne({
      _id: new ObjectId(companyId)
    });

    if (!company) {
      return res.status(404).json({ error: 'Şirket bulunamadı' });
    }

    if (company.status !== 'active') {
      return res.status(403).json({ error: 'Şirketiniz aktif değil' });
    }

    // Yeni taşıma talebi oluştur
    const newRequest = {
      type,
      cargo: {
        ...cargo,
        weight: parseFloat(cargo.weight),
        volume: parseFloat(cargo.volume)
      },
      origin: {
        city: origin.city,
        district: origin.district,
        address: origin.address,
        coordinates: origin.coordinates || null
      },
      destination: {
        city: destination.city,
        district: destination.district,
        address: destination.address,
        coordinates: destination.coordinates || null
      },
      pickupDate: pickup,
      deliveryDate: delivery,
      vehicle: {
        type: vehicle.type,
        requirements: vehicle.requirements || []
      },
      price: price ? {
        amount: parseFloat(price.amount),
        currency: price.currency || 'TRY',
        negotiable: price.negotiable || false
      } : null,
      notes: notes || '',
      status: 'pending',
      companyId: new ObjectId(companyId),
      userId: new ObjectId(userId),
      offers: [],
      tracking: {
        status: 'waiting',
        location: null,
        lastUpdate: null
      },
      createdAt: now,
      updatedAt: now
    };

    const result = await db.collection('transport_requests').insertOne(newRequest);

    if (!result.insertedId) {
      return res.status(500).json({ error: 'Taşıma talebi oluşturulamadı' });
    }

    // Uygun araç sahiplerine bildirim gönder
    const notification = {
      type: 'NEW_TRANSPORT_REQUEST',
      requestId: result.insertedId,
      origin: origin.city,
      destination: destination.city,
      pickupDate,
      status: 'unread',
      createdAt: now
    };

    await db.collection('notifications').insertMany([
      // Admin'e bildirim
      {
        ...notification,
        role: 'admin'
      },
      // Uygun araç sahiplerine bildirim
      {
        ...notification,
        role: 'company',
        vehicleType: vehicle.type
      }
    ]);

    return res.status(201).json({
      message: 'Taşıma talebi başarıyla oluşturuldu',
      request: {
        ...newRequest,
        _id: result.insertedId
      }
    });

  } catch (error) {
    console.error('Create transport request error:', error);
    return res.status(500).json({ error: 'Taşıma talebi oluşturulurken hata oluştu' });
  }
} 