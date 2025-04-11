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
          return await getLocation(req, res, db);
        case 'POST':
          return await updateLocation(req, res, db);
        case 'GET':
          if (req.query.history === 'true') {
            return await getLocationHistory(req, res, db);
          }
          return await getLocation(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'POST']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Vehicle location API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Güncel konumu getir
async function getLocation(req, res, db) {
  try {
    const { id, vehicleId } = req.query;
    const { role, id: userId } = req.user;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Şirket ve araç kontrolü
    const company = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    });

    if (!company) {
      return res.status(404).json({ error: 'Şirket bulunamadı' });
    }

    const vehicle = await db.collection('vehicles').findOne({
      _id: new ObjectId(vehicleId),
      companyId: new ObjectId(id)
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && company.userId?.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Bu aracın konumunu görüntüleme yetkiniz yok' });
    }

    // Son konumu getir
    const lastLocation = await db.collection('vehicle_locations')
      .findOne(
        { vehicleId: new ObjectId(vehicleId) },
        { sort: { timestamp: -1 } }
      );

    // Aktif taşıma varsa getir
    const activeTransport = await db.collection('transports')
      .findOne({
        vehicleId: new ObjectId(vehicleId),
        status: { $in: ['assigned', 'in_progress'] }
      });

    return res.status(200).json({
      location: lastLocation || null,
      activeTransport: activeTransport ? {
        id: activeTransport._id,
        pickupAddress: activeTransport.pickupAddress,
        deliveryAddress: activeTransport.deliveryAddress,
        status: activeTransport.status
      } : null
    });
  } catch (error) {
    console.error('Get location error:', error);
    return res.status(500).json({ error: 'Konum bilgisi getirilirken hata oluştu' });
  }
}

// Konum geçmişini getir
async function getLocationHistory(req, res, db) {
  try {
    const { id, vehicleId } = req.query;
    const { role, id: userId } = req.user;
    const { startDate, endDate, limit = 100 } = req.query;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Şirket ve araç kontrolü
    const company = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    });

    if (!company) {
      return res.status(404).json({ error: 'Şirket bulunamadı' });
    }

    const vehicle = await db.collection('vehicles').findOne({
      _id: new ObjectId(vehicleId),
      companyId: new ObjectId(id)
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && company.userId?.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Bu aracın konum geçmişini görüntüleme yetkiniz yok' });
    }

    // Tarih filtresi oluştur
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }

    // Konum geçmişini getir
    const query = {
      vehicleId: new ObjectId(vehicleId)
    };
    if (Object.keys(dateFilter).length > 0) {
      query.timestamp = dateFilter;
    }

    const locations = await db.collection('vehicle_locations')
      .find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .toArray();

    // İlgili taşımaları getir
    const transportIds = [...new Set(locations
      .filter(loc => loc.transportId)
      .map(loc => loc.transportId))];

    const transports = transportIds.length > 0 
      ? await db.collection('transports')
        .find({ 
          _id: { $in: transportIds.map(id => new ObjectId(id)) }
        })
        .toArray()
      : [];

    // Konum verilerine taşıma bilgilerini ekle
    const locationsWithTransport = locations.map(location => {
      if (!location.transportId) return location;
      
      const transport = transports.find(t => 
        t._id.toString() === location.transportId.toString()
      );

      return {
        ...location,
        transport: transport ? {
          id: transport._id,
          pickupAddress: transport.pickupAddress,
          deliveryAddress: transport.deliveryAddress,
          status: transport.status
        } : null
      };
    });

    return res.status(200).json({
      locations: locationsWithTransport,
      metadata: {
        total: locations.length,
        startDate: locations[locations.length - 1]?.timestamp,
        endDate: locations[0]?.timestamp
      }
    });
  } catch (error) {
    console.error('Get location history error:', error);
    return res.status(500).json({ error: 'Konum geçmişi getirilirken hata oluştu' });
  }
}

// Konum güncelle
async function updateLocation(req, res, db) {
  try {
    const { id, vehicleId } = req.query;
    const { role, id: userId } = req.user;
    const locationData = req.body;

    console.log("Araç konum verisi alındı:", { 
      companyId: id, 
      vehicleId, 
      latitude: locationData.latitude, 
      longitude: locationData.longitude
    });

    if (!ObjectId.isValid(id) || !ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Zorunlu alanları kontrol et
    const requiredFields = ['latitude', 'longitude'];
    const missingFields = requiredFields.filter(field => !locationData[field]);
    if (missingFields.length > 0) {
      console.warn("Eksik konum alanları:", missingFields);
      return res.status(400).json({ 
        error: 'Eksik alanlar var',
        fields: missingFields
      });
    }

    console.log("Şirket ve araç kontrolü yapılıyor...");
    // Şirket ve araç kontrolü
    const company = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    });

    if (!company) {
      console.warn(`Şirket bulunamadı, ID: ${id}`);
      return res.status(404).json({ error: 'Şirket bulunamadı' });
    }

    const vehicle = await db.collection('vehicles').findOne({
      _id: new ObjectId(vehicleId),
      companyId: new ObjectId(id)
    });

    if (!vehicle) {
      console.warn(`Araç bulunamadı, ID: ${vehicleId}, şirket ID: ${id}`);
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }

    console.log("Yetki kontrolü yapılıyor...");
    // Yetki kontrolü - Sadece sürücü ve admin konum güncelleyebilir
    const driver = await db.collection('drivers').findOne({
      vehicleId: new ObjectId(vehicleId),
      userId: new ObjectId(userId)
    });

    if (role !== 'admin' && !driver) {
      console.warn(`Yetkisiz erişim, kullanıcı: ${userId}, rol: ${role}`);
      return res.status(403).json({ error: 'Bu aracın konumunu güncelleme yetkiniz yok' });
    }

    console.log("Aktif taşıma kontrolü yapılıyor...");
    // Aktif taşıma varsa ID'sini al
    const activeTransport = await db.collection('transports')
      .findOne({
        vehicleId: new ObjectId(vehicleId),
        status: { $in: ['assigned', 'in_progress'] }
      });

    if (activeTransport) {
      console.log(`Aktif taşıma bulundu, ID: ${activeTransport._id}`);
    } else {
      console.log("Aktif taşıma bulunamadı");
    }

    // Yeni konum kaydı oluştur
    const newLocation = {
      vehicleId: new ObjectId(vehicleId),
      companyId: new ObjectId(id),
      driverId: driver?._id || null,
      transportId: activeTransport?._id || null,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      speed: locationData.speed || 0,
      heading: locationData.heading || 0,
      accuracy: locationData.accuracy || null,
      timestamp: new Date(),
      metadata: {
        batteryLevel: locationData.batteryLevel,
        provider: locationData.provider,
        mock: locationData.mock || false
      }
    };

    console.log("Konum verisi kaydediliyor...");
    // Konumu kaydet
    const result = await db.collection('vehicle_locations')
      .insertOne(newLocation);

    if (!result.insertedId) {
      console.error("Konum verisi kaydedilemedi");
      return res.status(400).json({ error: 'Konum güncellenemedi' });
    }

    console.log(`Konum verisi kaydedildi, ID: ${result.insertedId}`);

    console.log("Araç son konum bilgisi güncelleniyor...");
    // Aracın son konum bilgisini güncelle
    const updateResult = await db.collection('vehicles').updateOne(
      { _id: new ObjectId(vehicleId) },
      {
        $set: {
          lastLocation: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            timestamp: new Date()
          },
          updatedAt: new Date()
        }
      }
    );

    console.log(`Araç bilgisi güncellendi, etkilenen kayıt: ${updateResult.modifiedCount}`);

    return res.status(200).json({
      message: 'Konum başarıyla güncellendi',
      location: newLocation
    });
  } catch (error) {
    console.error('Update location error:', error);
    
    // Veritabanı bağlantı hatası mı kontrol et
    if (error.name === 'MongoError' || error.name === 'MongoNetworkError') {
      console.error('MongoDB bağlantı hatası:', error.code, error.message);
    }
    
    // Hata detaylarını günlüklere yaz
    try {
      console.error('Hata detayları:', JSON.stringify({
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      }));
    } catch (logError) {
      console.error('Hata bilgilerini detaylandırırken bir sorun oluştu', logError);
    }
    
    return res.status(500).json({ 
      error: 'Konum güncellenirken hata oluştu', 
      details: {
        message: error.message,
        name: error.name,
        code: error.code
      } 
    });
  }
} 