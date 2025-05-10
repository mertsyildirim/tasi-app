import { connectToDatabase } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    
    // Öncelikle test kullanıcılarını alalım
    const customers = await db.collection('users').find({ roles: 'customer' }).toArray();
    const carriers = await db.collection('users').find({ roles: 'carrier' }).toArray();
    const drivers = await db.collection('users').find({ roles: 'driver' }).toArray();
    
    if (customers.length === 0 || carriers.length === 0 || drivers.length === 0) {
      return res.status(404).json({ 
        message: 'Test kullanıcıları bulunamadı. Önce /api/seed-users endpoint\'ini çağırın.',
        customersCount: customers.length,
        carriersCount: carriers.length,
        driversCount: drivers.length
      });
    }
    
    // Örnek gönderici ve alıcı bilgileri
    const senders = [
      {
        name: "Ahmet Yılmaz",
        phone: "+90 532 123 4567",
        email: "ahmet@example.com",
        company: "ABC Lojistik Ltd. Şti."
      },
      {
        name: "Zeynep Arslan",
        phone: "+90 532 987 6543",
        email: "zeynep@example.com",
        company: "DEF Kargo Ltd. Şti."
      },
      {
        name: "Can Yıldız",
        phone: "+90 532 345 6789",
        email: "can@example.com",
        company: "GHI Lojistik A.Ş."
      }
    ];
    
    const receivers = [
      {
        name: "Mehmet Demir",
        phone: "+90 533 765 4321",
        email: "mehmet@example.com",
        company: "XYZ Dağıtım A.Ş."
      },
      {
        name: "Hakan Şahin",
        phone: "+90 533 456 7890",
        email: "hakan@example.com",
        company: "MNO Dağıtım A.Ş."
      },
      {
        name: "Ayşe Demir",
        phone: "+90 533 890 1234",
        email: "ayse@example.com",
        company: "PQR Sanayi Ltd. Şti."
      }
    ];
    
    // Örnek konum bilgileri
    const locations = [
      {
        city: "İstanbul",
        address: "Kadıköy, Bağdat Caddesi No:123",
        postalCode: "34000",
        country: "Türkiye",
        coordinates: { lat: 41.0082, lng: 28.9784 }
      },
      {
        city: "Ankara",
        address: "Çankaya, Atatürk Bulvarı No:456",
        postalCode: "06000",
        country: "Türkiye",
        coordinates: { lat: 39.9334, lng: 32.8597 }
      },
      {
        city: "İzmir",
        address: "Bornova, Cumhuriyet Caddesi No:789",
        postalCode: "35000",
        country: "Türkiye",
        coordinates: { lat: 38.4237, lng: 27.1428 }
      },
      {
        city: "Antalya",
        address: "Muratpaşa, Lara Caddesi No:101",
        postalCode: "07000",
        country: "Türkiye",
        coordinates: { lat: 36.8841, lng: 30.7056 }
      },
      {
        city: "Bursa",
        address: "Osmangazi, Fevzi Çakmak Caddesi No:202",
        postalCode: "16000",
        country: "Türkiye",
        coordinates: { lat: 40.1824, lng: 29.0670 }
      },
      {
        city: "Kocaeli",
        address: "İzmit, Hürriyet Caddesi No:303",
        postalCode: "41000",
        country: "Türkiye",
        coordinates: { lat: 40.8533, lng: 29.8815 }
      }
    ];
    
    // Aktif taşıma kayıtları
    const today = new Date();
    const activeShipments = [
      {
        type: "kurye",
        status: "in_transit",
        customer: customers[0]._id,
        carrier: carriers[0]._id,
        driver: drivers[0]._id,
        origin: locations[0],
        destination: locations[1],
        sender: senders[0],
        receiver: receivers[0],
        scheduledDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 gün önce
        estimatedDeliveryDate: new Date(today.getTime() + 4 * 60 * 60 * 1000), // 4 saat sonra
        weight: 250,
        volume: 2,
        value: 2500,
        price: 2500,
        currency: "TRY",
        paymentStatus: "paid",
        notes: "Kırılacak eşya içerir, dikkatli taşınmalıdır.",
        isFragile: true,
        requiresRefrigeration: false,
        documents: ["İrsaliye", "Teslimat Formu"],
        distance: 450,
        statusHistory: [
          {
            status: "created",
            timestamp: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000),
            notes: "Taşıma talebi oluşturuldu"
          },
          {
            status: "assigned",
            timestamp: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
            notes: "Taşıma talebi sürücüye atandı"
          },
          {
            status: "in_transit",
            timestamp: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
            notes: "Taşıma başladı"
          }
        ],
        createdAt: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        type: "express",
        status: "pending",
        customer: customers[0]._id,
        carrier: carriers[0]._id,
        origin: locations[2],
        destination: locations[3],
        sender: senders[1],
        receiver: receivers[1],
        scheduledDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // Yarın
        estimatedDeliveryDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // Yarın + 5 saat
        weight: 180,
        volume: 1.5,
        value: 1800,
        price: 1800,
        currency: "TRY",
        paymentStatus: "pending",
        notes: "Soğuk zincir ürünü, sıcaklık kontrolü gerekli.",
        isFragile: false,
        requiresRefrigeration: true,
        documents: ["İrsaliye", "Soğuk Zincir Formu"],
        distance: 480,
        statusHistory: [
          {
            status: "created",
            timestamp: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
            notes: "Taşıma talebi oluşturuldu"
          },
          {
            status: "pending",
            timestamp: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
            notes: "Sürücü atama bekleniyor"
          }
        ],
        createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        type: "palet",
        status: "in_transit",
        customer: customers[0]._id,
        carrier: carriers[0]._id,
        driver: drivers[1]._id,
        origin: locations[4],
        destination: locations[5],
        sender: senders[2],
        receiver: receivers[2],
        scheduledDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), // Dün
        estimatedDeliveryDate: new Date(today.getTime() + 1 * 60 * 60 * 1000), // 1 saat sonra
        weight: 750,
        volume: 4,
        value: 3200,
        price: 3200,
        currency: "TRY",
        paymentStatus: "paid",
        notes: "Ağır yük, forklift gerekli.",
        isFragile: false,
        requiresRefrigeration: false,
        documents: ["İrsaliye", "Ağır Yük Formu"],
        distance: 150,
        statusHistory: [
          {
            status: "created",
            timestamp: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
            notes: "Taşıma talebi oluşturuldu"
          },
          {
            status: "assigned",
            timestamp: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
            notes: "Taşıma talebi sürücüye atandı"
          },
          {
            status: "in_transit",
            timestamp: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
            notes: "Taşıma başladı"
          }
        ],
        createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)
      }
    ];
    
    // Tamamlanmış taşıma kayıtları
    const completedShipments = [
      {
        type: "kurye",
        status: "delivered",
        customer: customers[0]._id,
        carrier: carriers[0]._id,
        driver: drivers[0]._id,
        origin: locations[0],
        destination: locations[2],
        sender: senders[0],
        receiver: receivers[0],
        scheduledDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
        estimatedDeliveryDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        actualDeliveryDate: new Date(today.getTime() - 9 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        weight: 120,
        volume: 1,
        value: 1500,
        price: 1500,
        currency: "TRY",
        paymentStatus: "paid",
        notes: "Teslimat başarıyla tamamlandı.",
        isFragile: false,
        requiresRefrigeration: false,
        documents: ["İrsaliye", "Teslimat Formu"],
        distance: 480,
        statusHistory: [
          {
            status: "created",
            timestamp: new Date(today.getTime() - 12 * 24 * 60 * 60 * 1000),
            notes: "Taşıma talebi oluşturuldu"
          },
          {
            status: "assigned",
            timestamp: new Date(today.getTime() - 11 * 24 * 60 * 60 * 1000),
            notes: "Taşıma talebi sürücüye atandı"
          },
          {
            status: "in_transit",
            timestamp: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
            notes: "Taşıma başladı"
          },
          {
            status: "delivered",
            timestamp: new Date(today.getTime() - 9 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
            notes: "Teslimat tamamlandı"
          }
        ],
        createdAt: new Date(today.getTime() - 12 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(today.getTime() - 9 * 24 * 60 * 60 * 1000)
      },
      {
        type: "express",
        status: "delivered",
        customer: customers[0]._id,
        carrier: carriers[0]._id,
        driver: drivers[0]._id,
        origin: locations[1],
        destination: locations[4],
        sender: senders[1],
        receiver: receivers[1],
        scheduledDate: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000),
        estimatedDeliveryDate: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        actualDeliveryDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        weight: 200,
        volume: 1.8,
        value: 1200,
        price: 1200,
        currency: "TRY",
        paymentStatus: "paid",
        notes: "Zamanında teslim edildi.",
        isFragile: false,
        requiresRefrigeration: false,
        documents: ["İrsaliye", "Teslimat Formu"],
        distance: 260,
        statusHistory: [
          {
            status: "created",
            timestamp: new Date(today.getTime() - 17 * 24 * 60 * 60 * 1000),
            notes: "Taşıma talebi oluşturuldu"
          },
          {
            status: "assigned",
            timestamp: new Date(today.getTime() - 16 * 24 * 60 * 60 * 1000),
            notes: "Taşıma talebi sürücüye atandı"
          },
          {
            status: "in_transit",
            timestamp: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000),
            notes: "Taşıma başladı"
          },
          {
            status: "delivered",
            timestamp: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
            notes: "Teslimat tamamlandı"
          }
        ],
        createdAt: new Date(today.getTime() - 17 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)
      },
      {
        type: "palet",
        status: "delivered",
        customer: customers[0]._id,
        carrier: carriers[0]._id,
        driver: drivers[1]._id,
        origin: locations[3],
        destination: locations[5],
        sender: senders[2],
        receiver: receivers[2],
        scheduledDate: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000),
        estimatedDeliveryDate: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
        actualDeliveryDate: new Date(today.getTime() - 19 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
        weight: 500,
        volume: 3,
        value: 900,
        price: 900,
        currency: "TRY",
        paymentStatus: "paid",
        notes: "Sorunsuz teslim edildi.",
        isFragile: false,
        requiresRefrigeration: false,
        documents: ["İrsaliye", "Teslimat Formu"],
        distance: 70,
        statusHistory: [
          {
            status: "created",
            timestamp: new Date(today.getTime() - 22 * 24 * 60 * 60 * 1000),
            notes: "Taşıma talebi oluşturuldu"
          },
          {
            status: "assigned",
            timestamp: new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000),
            notes: "Taşıma talebi sürücüye atandı"
          },
          {
            status: "in_transit",
            timestamp: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000),
            notes: "Taşıma başladı"
          },
          {
            status: "delivered",
            timestamp: new Date(today.getTime() - 19 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
            notes: "Teslimat tamamlandı"
          }
        ],
        createdAt: new Date(today.getTime() - 22 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(today.getTime() - 19 * 24 * 60 * 60 * 1000)
      }
    ];
    
    const allShipments = [...activeShipments, ...completedShipments];
    
    // Önce mevcut test shipment'larını sil
    await db.collection('shipments').deleteMany({
      customer: { $in: customers.map(c => c._id) }
    });
    
    // Shipment ID'leri oluşturulacak otomatik olarak
    let shipmentIds = [];
    let currentYear = today.getFullYear().toString().substr(-2);
    
    for (let i = 0; i < allShipments.length; i++) {
      const shipmentId = `TRK${currentYear}${(i + 1).toString().padStart(4, '0')}`;
      allShipments[i].id = shipmentId;
      shipmentIds.push(shipmentId);
    }
    
    // Yeni test shipment'larını ekle
    const result = await db.collection('shipments').insertMany(allShipments);
    
    res.status(200).json({
      message: 'Test taşıma kayıtları başarıyla eklendi',
      count: result.insertedCount,
      shipmentIds
    });
    
  } catch (error) {
    console.error('Test shipments error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
} 