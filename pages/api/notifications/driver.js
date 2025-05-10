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
      
      // Bildirim sistemi henüz mevcut değil, gelecekte burada bir koleksiyondan bildirimler çekilecek
      // Şimdilik sabit veri döndürelim
      
      // Sürücü bildirimlerini döndür
      return res.status(200).json({
        success: true,
        count: 3,
        notifications: [
          { id: 1, message: "Yeni bir taşıma görevi atandı: #TRK2024123", time: "Bugün, 14:30" },
          { id: 2, message: "Mola saatiniz yaklaşıyor", time: "Dün, 10:15" },
          { id: 3, message: "Sürücü belgeniz için yenileme zamanı yaklaşıyor", time: "2 gün önce" }
        ]
      });
      
    } catch (error) {
      console.error('Driver notifications API error:', error);
      return res.status(500).json({ message: 'Bildirimler getirilirken hata oluştu', error: error.message });
    }
    
  } catch (error) {
    console.error('Notifications API error:', error);
    
    // Hata durumunda mock veri dön
    return res.status(200).json({
      success: true,
      count: 3,
      notifications: [
        { id: 1, message: "Yeni bir taşıma görevi atandı: #TRK2024123", time: "Bugün, 14:30" },
        { id: 2, message: "Mola saatiniz yaklaşıyor", time: "Dün, 10:15" },
        { id: 3, message: "Sürücü belgeniz için yenileme zamanı yaklaşıyor", time: "2 gün önce" }
      ]
    });
  }
} 