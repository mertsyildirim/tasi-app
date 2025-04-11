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
          return await getTracking(req, res, db);
        case 'POST':
          return await updateTracking(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'POST']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Transport tracking API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Takip bilgilerini getir
async function getTracking(req, res, db) {
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
    if (role !== 'admin' && 
        request.companyId.toString() !== companyId?.toString() && 
        request.transportCompanyId?.toString() !== companyId?.toString()) {
      return res.status(403).json({ error: 'Bu taşımanın takip bilgilerini görüntüleme yetkiniz yok' });
    }

    // Takip kayıtlarını getir
    const trackingLogs = await db.collection('transport_tracking')
      .find({ requestId: new ObjectId(id) })
      .sort({ timestamp: -1 })
      .toArray();

    // Sürücü bilgilerini getir
    let driver = null;
    if (request.driverId) {
      driver = await db.collection('drivers').findOne(
        { _id: request.driverId },
        { projection: { name: 1, phone: 1, photo: 1 } }
      );
    }

    // Araç bilgilerini getir
    let vehicle = null;
    if (request.vehicleId) {
      vehicle = await db.collection('vehicles').findOne(
        { _id: request.vehicleId },
        { projection: { type: 1, plate: 1, brand: 1, model: 1 } }
      );
    }

    // Rota bilgilerini hesapla
    const routeStats = trackingLogs.length > 0 ? {
      totalDistance: calculateTotalDistance(trackingLogs),
      averageSpeed: calculateAverageSpeed(trackingLogs),
      estimatedArrival: calculateEstimatedArrival(trackingLogs, request.destination.coordinates),
      completedPercentage: calculateCompletedPercentage(
        trackingLogs[0]?.location,
        request.origin.coordinates,
        request.destination.coordinates
      )
    } : null;

    return res.status(200).json({
      status: request.tracking.status,
      currentLocation: trackingLogs[0] || null,
      driver,
      vehicle,
      routeStats,
      logs: trackingLogs
    });

  } catch (error) {
    console.error('Get tracking error:', error);
    return res.status(500).json({ error: 'Takip bilgileri getirilirken hata oluştu' });
  }
}

// Takip bilgilerini güncelle
async function updateTracking(req, res, db) {
  try {
    const { id } = req.query;
    const { role, companyId } = req.user;
    const {
      location,
      status,
      notes
    } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Zorunlu alan kontrolü
    if (!location || !location.coordinates || !location.coordinates.length === 2) {
      return res.status(400).json({ error: 'Geçersiz konum bilgisi' });
    }

    // Taşıma talebini kontrol et
    const request = await db.collection('transport_requests').findOne({
      _id: new ObjectId(id)
    });

    if (!request) {
      return res.status(404).json({ error: 'Taşıma talebi bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && request.transportCompanyId?.toString() !== companyId?.toString()) {
      return res.status(403).json({ error: 'Bu taşımanın takip bilgilerini güncelleme yetkiniz yok' });
    }

    // Durum kontrolü
    if (!['waiting', 'loading', 'in_transit', 'unloading', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Geçersiz durum' });
    }

    // Yeni takip kaydı oluştur
    const trackingLog = {
      requestId: new ObjectId(id),
      location: {
        type: 'Point',
        coordinates: location.coordinates
      },
      address: location.address,
      status,
      notes: notes || null,
      timestamp: new Date()
    };

    const result = await db.collection('transport_tracking').insertOne(trackingLog);

    if (!result.insertedId) {
      return res.status(500).json({ error: 'Takip kaydı oluşturulamadı' });
    }

    // Taşıma talebini güncelle
    await db.collection('transport_requests').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          'tracking.status': status,
          'tracking.location': trackingLog.location,
          'tracking.lastUpdate': trackingLog.timestamp,
          status: status === 'completed' ? 'completed' : 'in_progress'
        }
      }
    );

    // Önemli durum değişikliklerinde bildirim gönder
    if (['loading', 'in_transit', 'unloading', 'completed'].includes(status)) {
      const statusMessages = {
        loading: 'Yükleme başladı',
        in_transit: 'Araç yola çıktı',
        unloading: 'Teslimat noktasına ulaşıldı',
        completed: 'Taşıma tamamlandı'
      };

      await db.collection('notifications').insertOne({
        type: 'TRANSPORT_STATUS_UPDATE',
        requestId: new ObjectId(id),
        companyId: request.companyId,
        status: 'unread',
        message: statusMessages[status],
        location: trackingLog.location,
        createdAt: new Date()
      });
    }

    return res.status(200).json({
      message: 'Takip bilgileri başarıyla güncellendi',
      tracking: trackingLog
    });

  } catch (error) {
    console.error('Update tracking error:', error);
    return res.status(500).json({ error: 'Takip bilgileri güncellenirken hata oluştu' });
  }
}

// Yardımcı fonksiyonlar
function calculateTotalDistance(trackingLogs) {
  let total = 0;
  for (let i = 1; i < trackingLogs.length; i++) {
    total += calculateDistance(
      trackingLogs[i-1].location.coordinates,
      trackingLogs[i].location.coordinates
    );
  }
  return total;
}

function calculateAverageSpeed(trackingLogs) {
  if (trackingLogs.length < 2) return 0;
  
  const distances = [];
  const times = [];
  
  for (let i = 1; i < trackingLogs.length; i++) {
    distances.push(calculateDistance(
      trackingLogs[i-1].location.coordinates,
      trackingLogs[i].location.coordinates
    ));
    
    times.push((trackingLogs[i-1].timestamp - trackingLogs[i].timestamp) / 3600000); // saat cinsinden
  }
  
  const totalDistance = distances.reduce((a, b) => a + b, 0);
  const totalTime = times.reduce((a, b) => a + b, 0);
  
  return totalTime > 0 ? totalDistance / totalTime : 0;
}

function calculateEstimatedArrival(trackingLogs, destination) {
  if (trackingLogs.length < 2) return null;
  
  const averageSpeed = calculateAverageSpeed(trackingLogs);
  if (averageSpeed === 0) return null;
  
  const remainingDistance = calculateDistance(
    trackingLogs[0].location.coordinates,
    destination
  );
  
  const estimatedTime = remainingDistance / averageSpeed;
  return new Date(Date.now() + estimatedTime * 3600000);
}

function calculateCompletedPercentage(currentLocation, origin, destination) {
  if (!currentLocation) return 0;
  
  const totalDistance = calculateDistance(origin, destination);
  const completedDistance = calculateDistance(origin, currentLocation.coordinates);
  
  return (completedDistance / totalDistance) * 100;
}

function calculateDistance(point1, point2) {
  const R = 6371; // Dünya'nın yarıçapı (km)
  const lat1 = toRad(point1[1]);
  const lat2 = toRad(point2[1]);
  const dLat = toRad(point2[1] - point1[1]);
  const dLon = toRad(point2[0] - point1[0]);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(value) {
  return value * Math.PI / 180;
} 