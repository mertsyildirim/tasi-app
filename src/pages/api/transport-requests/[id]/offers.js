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
          return await getOffers(req, res, db);
        case 'POST':
          return await createOffer(req, res, db);
        case 'PUT':
          return await updateOffer(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'POST', 'PUT']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Transport offers API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Teklifleri listele
async function getOffers(req, res, db) {
  try {
    const { id } = req.query;
    const { role, companyId } = req.user;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Taşıma talebini kontrol et
    const request = await db.collection('transport_requests').findOne({
      _id: new ObjectId(id)
    });

    if (!request) {
      return res.status(404).json({ error: 'Taşıma talebi bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && request.companyId.toString() !== companyId?.toString()) {
      return res.status(403).json({ error: 'Bu talebin tekliflerini görüntüleme yetkiniz yok' });
    }

    // Teklifleri getir
    const offers = await db.collection('transport_offers')
      .find({ requestId: new ObjectId(id) })
      .sort({ createdAt: -1 })
      .toArray();

    // Teklif veren şirketlerin bilgilerini getir
    const companies = await Promise.all(
      offers.map(offer =>
        db.collection('companies').findOne(
          { _id: offer.companyId },
          { projection: { name: 1, rating: 1, completedTransports: 1 } }
        )
      )
    );

    // Teklifleri şirket bilgileriyle birleştir
    const offersWithCompanies = offers.map((offer, index) => ({
      ...offer,
      company: companies[index]
    }));

    return res.status(200).json({
      offers: offersWithCompanies,
      stats: {
        total: offers.length,
        averagePrice: offers.reduce((acc, curr) => acc + curr.price.amount, 0) / offers.length || 0,
        lowestPrice: Math.min(...offers.map(o => o.price.amount)),
        highestPrice: Math.max(...offers.map(o => o.price.amount))
      }
    });

  } catch (error) {
    console.error('Get offers error:', error);
    return res.status(500).json({ error: 'Teklifler listelenirken hata oluştu' });
  }
}

// Yeni teklif oluştur
async function createOffer(req, res, db) {
  try {
    const { id } = req.query;
    const { role, id: userId, companyId } = req.user;
    const {
      price,
      vehicle,
      driver,
      notes,
      validUntil
    } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Zorunlu alan kontrolü
    const requiredFields = ['price', 'vehicle'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Eksik bilgi',
        fields: missingFields
      });
    }

    // Taşıma talebini kontrol et
    const request = await db.collection('transport_requests').findOne({
      _id: new ObjectId(id)
    });

    if (!request) {
      return res.status(404).json({ error: 'Taşıma talebi bulunamadı' });
    }

    // Kendi talebine teklif vermeyi engelle
    if (request.companyId.toString() === companyId?.toString()) {
      return res.status(400).json({ error: 'Kendi talebinize teklif veremezsiniz' });
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

    // Araç kontrolü
    const vehicleExists = await db.collection('vehicles').findOne({
      _id: new ObjectId(vehicle.id),
      companyId: new ObjectId(companyId)
    });

    if (!vehicleExists) {
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }

    // Sürücü kontrolü (eğer belirtilmişse)
    if (driver?.id) {
      const driverExists = await db.collection('drivers').findOne({
        _id: new ObjectId(driver.id),
        companyId: new ObjectId(companyId)
      });

      if (!driverExists) {
        return res.status(404).json({ error: 'Sürücü bulunamadı' });
      }
    }

    // Önceki teklif kontrolü
    const existingOffer = await db.collection('transport_offers').findOne({
      requestId: new ObjectId(id),
      companyId: new ObjectId(companyId)
    });

    if (existingOffer) {
      return res.status(400).json({ error: 'Bu talep için zaten teklif verdiniz' });
    }

    // Yeni teklif oluştur
    const newOffer = {
      requestId: new ObjectId(id),
      companyId: new ObjectId(companyId),
      price: {
        amount: parseFloat(price.amount),
        currency: price.currency || 'TRY'
      },
      vehicle: {
        id: new ObjectId(vehicle.id),
        type: vehicleExists.type,
        plate: vehicleExists.plate
      },
      driver: driver?.id ? {
        id: new ObjectId(driver.id),
        name: driver.name
      } : null,
      notes: notes || '',
      status: 'pending',
      validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 saat
      createdBy: new ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('transport_offers').insertOne(newOffer);

    if (!result.insertedId) {
      return res.status(500).json({ error: 'Teklif oluşturulamadı' });
    }

    // Talep sahibine bildirim gönder
    await db.collection('notifications').insertOne({
      type: 'NEW_TRANSPORT_OFFER',
      requestId: new ObjectId(id),
      offerId: result.insertedId,
      companyId: request.companyId,
      offerCompanyId: new ObjectId(companyId),
      price: newOffer.price,
      status: 'unread',
      createdAt: new Date()
    });

    return res.status(201).json({
      message: 'Teklif başarıyla oluşturuldu',
      offer: newOffer
    });

  } catch (error) {
    console.error('Create offer error:', error);
    return res.status(500).json({ error: 'Teklif oluşturulurken hata oluştu' });
  }
}

// Teklifi güncelle (kabul et/reddet)
async function updateOffer(req, res, db) {
  try {
    const { id } = req.query;
    const { offerId } = req.body;
    const { role, companyId } = req.user;
    const { status, reason } = req.body;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(offerId)) {
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
      return res.status(403).json({ error: 'Bu teklifi güncelleme yetkiniz yok' });
    }

    // Teklifi kontrol et
    const offer = await db.collection('transport_offers').findOne({
      _id: new ObjectId(offerId),
      requestId: new ObjectId(id)
    });

    if (!offer) {
      return res.status(404).json({ error: 'Teklif bulunamadı' });
    }

    // Durum kontrolü
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Geçersiz durum' });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({ error: 'Bu teklif zaten işlem görmüş' });
    }

    // Teklifi güncelle
    const result = await db.collection('transport_offers').updateOne(
      { _id: new ObjectId(offerId) },
      {
        $set: {
          status,
          statusReason: reason || null,
          updatedAt: new Date()
        }
      }
    );

    if (!result.modifiedCount) {
      return res.status(400).json({ error: 'Teklif güncellenemedi' });
    }

    // Eğer teklif kabul edildiyse
    if (status === 'accepted') {
      // Diğer teklifleri reddet
      await db.collection('transport_offers').updateMany(
        {
          requestId: new ObjectId(id),
          _id: { $ne: new ObjectId(offerId) },
          status: 'pending'
        },
        {
          $set: {
            status: 'rejected',
            statusReason: 'Başka bir teklif kabul edildi',
            updatedAt: new Date()
          }
        }
      );

      // Talebi güncelle
      await db.collection('transport_requests').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: 'accepted',
            acceptedOffer: new ObjectId(offerId),
            transportCompanyId: offer.companyId,
            vehicleId: offer.vehicle.id,
            driverId: offer.driver?.id || null,
            price: offer.price,
            updatedAt: new Date()
          }
        }
      );
    }

    // Bildirim gönder
    await db.collection('notifications').insertOne({
      type: 'TRANSPORT_OFFER_STATUS_CHANGE',
      requestId: new ObjectId(id),
      offerId: new ObjectId(offerId),
      companyId: offer.companyId,
      status: 'unread',
      message: status === 'accepted' ? 'Teklifiniz kabul edildi' : `Teklifiniz reddedildi${reason ? ': ' + reason : ''}`,
      createdAt: new Date()
    });

    return res.status(200).json({
      message: `Teklif başarıyla ${status === 'accepted' ? 'kabul edildi' : 'reddedildi'}`
    });

  } catch (error) {
    console.error('Update offer error:', error);
    return res.status(500).json({ error: 'Teklif güncellenirken hata oluştu' });
  }
} 