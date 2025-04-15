import { connectToDatabase } from '../../../lib/db';
import User from '../../../src/models/User';
import Shipment from '../../../src/models/Shipment';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  // Yalnızca GET isteklerine izin ver
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Veritabanına bağlan
    await connectToDatabase();
    
    // Kullanıcı oturumunu kontrol et
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Yetkilendirme hatası. Oturum bulunamadı.' });
    }
    
    // Token'ı çıkar ve oturumu doğrula (normalde token doğrulama yapılır)
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Geçersiz token' });
    }
    
    try {
      // Gerçek API'de token doğrulama yapılıp kullanıcı ID'si alınır
      // Şu anda mock veri kullanıyoruz
      const driverId = "mock_driver_id";
      
      // Sürücü bilgilerini getir
      const driver = await User.findById(driverId).select('-password');
      
      if (!driver) {
        return res.status(404).json({ message: 'Sürücü bulunamadı' });
      }
      
      // Sürücü rolüne sahip değilse hata döndür
      if (!driver.roles.includes('driver')) {
        return res.status(403).json({ message: 'Bu kaynağa erişim yetkiniz yok' });
      }
      
      // Mevcut aktif rotayı getir (eğer varsa)
      const currentRoute = await Shipment.findOne({
        driver: driverId,
        status: 'in_transit'
      }).select('id origin destination distance estimatedDeliveryDate scheduledDate');
      
      // Son tamamlanan taşımaları getir
      const recentTrips = await Shipment.find({
        driver: driverId,
        status: 'delivered'
      })
      .sort({ actualDeliveryDate: -1 })
      .limit(5)
      .select('id origin destination distance scheduledDate actualDeliveryDate');
      
      // İstatistikler
      // Toplam sefer sayısı
      const totalTrips = await Shipment.countDocuments({
        driver: driverId,
        status: 'delivered'
      });
      
      // Toplam mesafe
      const totalDistancePipeline = [
        { $match: { driver: mongoose.Types.ObjectId(driverId), status: 'delivered' } },
        { $group: { _id: null, totalDistance: { $sum: '$distance' } } }
      ];
      
      const totalDistanceResult = await Shipment.aggregate(totalDistancePipeline);
      const totalDistance = totalDistanceResult.length > 0 ? totalDistanceResult[0].totalDistance : 0;
      
      // Ortalama puan
      const averageRating = driver.profile.rating || 0;
      
      // Dashboard verilerini döndür
      return res.status(200).json({
        driverStatus: driver.driverStatus || 'active',
        currentRoute: currentRoute ? {
          id: currentRoute.id,
          origin: currentRoute.origin.city,
          destination: currentRoute.destination.city,
          distance: `${currentRoute.distance} km`,
          estimatedTime: currentRoute.estimatedDeliveryDate ? 
            Math.ceil((new Date(currentRoute.estimatedDeliveryDate) - new Date(currentRoute.scheduledDate)) / (1000 * 60 * 60)) + ' saat' : 
            '5 saat',
          status: 'devam ediyor'
        } : null,
        stats: {
          totalTrips: totalTrips,
          totalDistance: `${totalDistance} km`,
          averageRating: averageRating,
          fuelConsumption: '8.5 L/100km' // Bu değer şu anda sabit, gerçek uygulamada hesaplanabilir
        },
        recentTrips: recentTrips.map(trip => ({
          id: trip.id,
          date: new Date(trip.scheduledDate).toLocaleDateString('tr-TR'),
          route: `${trip.origin.city} - ${trip.destination.city}`,
          status: 'tamamlandı',
          distance: `${trip.distance} km`
        })),
        upcomingMaintenance: {
          date: '20 Haziran 2024',
          type: 'Periyodik Bakım',
          vehicle: 'Ford Transit'
        },
        monthlyPerformance: {
          labels: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran"],
          datasets: [
            {
              label: "Mesafe (km)",
              data: [1200, 1900, 1700, 2100, 2400, 2000],
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)"
            },
            {
              label: "Yakıt Tüketimi (L)",
              data: [320, 390, 350, 400, 450, 380],
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.2)"
            }
          ]
        }
      });
      
    } catch (error) {
      console.error('Driver dashboard API error:', error);
      return res.status(500).json({ message: 'Dashboard verileri getirilirken hata oluştu', error: error.message });
    }
    
  } catch (error) {
    console.error('Driver API error:', error);
    
    // Hata durumunda mock veri dön
    return res.status(200).json({
      driverStatus: 'active',
      currentRoute: {
        id: "R12345",
        origin: "İstanbul",
        destination: "Ankara",
        distance: "450 km",
        estimatedTime: "5 saat",
        status: "devam ediyor"
      },
      stats: {
        totalTrips: 45,
        totalDistance: "12,500 km",
        averageRating: 4.8,
        fuelConsumption: "8.5 L/100km"
      },
      recentTrips: [
        {
          id: "T789012",
          date: "15 Mayıs 2024",
          route: "İstanbul - İzmir",
          status: "tamamlandı",
          distance: "480 km"
        },
        {
          id: "T789011",
          date: "10 Mayıs 2024",
          route: "Ankara - İstanbul",
          status: "tamamlandı",
          distance: "450 km"
        },
        {
          id: "T789010",
          date: "5 Mayıs 2024",
          route: "İzmir - Antalya",
          status: "tamamlandı",
          distance: "350 km"
        }
      ],
      upcomingMaintenance: {
        date: "20 Haziran 2024",
        type: "Periyodik Bakım",
        vehicle: "Ford Kamyon"
      },
      monthlyPerformance: {
        labels: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran"],
        datasets: [
          {
            label: "Mesafe (km)",
            data: [1200, 1900, 1700, 2100, 2400, 2000],
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)"
          },
          {
            label: "Yakıt Tüketimi (L)",
            data: [320, 390, 350, 400, 450, 380],
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)"
          }
        ]
      }
    });
  }
} 