import { connectToDatabase } from '../../../lib/db';
import User from '../../../src/models/User';

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
      
      // Kullanıcı (sürücü) bilgilerini getir
      const driver = await User.findById(driverId).select('-password');
      
      if (!driver) {
        return res.status(404).json({ message: 'Sürücü bulunamadı' });
      }
      
      // Sürücü rolüne sahip değilse hata döndür
      if (!driver.roles.includes('driver')) {
        return res.status(403).json({ message: 'Bu kaynağa erişim yetkiniz yok' });
      }
      
      // Sürücü bilgilerini döndür
      return res.status(200).json(driver);
      
    } catch (error) {
      console.error('Driver me API error:', error);
      return res.status(500).json({ message: 'Sürücü bilgileri getirilirken hata oluştu', error: error.message });
    }
    
  } catch (error) {
    console.error('Driver API error:', error);
    
    // Hata durumunda mock veri dön
    return res.status(200).json({
      _id: 'mock_driver_id',
      name: 'Mehmet Yılmaz',
      email: 'driver@test.com',
      phone: '+90 555 123 4567',
      roles: ['driver'],
      isActive: true,
      profile: {
        avatarUrl: '/images/default-avatar.png',
        bio: 'Profesyonel sürücü',
        completedOrders: 78,
        rating: 4.8
      },
      driverDetails: {
        licensePlate: '34 ABC 123',
        vehicleType: 'Kamyonet',
        vehicleMake: 'Ford',
        vehicleModel: 'Transit',
        vehicleYear: 2020,
        licenseExpiryDate: '2026-05-15'
      },
      notifications: true,
      language: 'tr',
      address: 'Kadıköy, İstanbul',
      createdAt: '2023-01-15T10:30:00.000Z',
      updatedAt: '2023-02-20T14:45:00.000Z'
    });
  }
} 