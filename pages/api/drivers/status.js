import { connectToDatabase } from '../../../lib/db';
import User from '../../../src/models/User';

export default async function handler(req, res) {
  // Sadece GET ve PUT isteklerine izin ver
  if (req.method !== 'GET' && req.method !== 'PUT') {
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
      
      // GET isteği - Sürücü durumunu getir
      if (req.method === 'GET') {
        const driver = await User.findById(driverId).select('driverStatus');
        
        if (!driver) {
          return res.status(404).json({ message: 'Sürücü bulunamadı' });
        }
        
        // Sürücü durumunu döndür
        return res.status(200).json({
          status: driver.driverStatus || 'active'
        });
      }
      
      // PUT isteği - Sürücü durumunu güncelle
      if (req.method === 'PUT') {
        const { status } = req.body;
        
        // Durum değeri validasyonu
        if (!status || !['active', 'inactive', 'on_break'].includes(status)) {
          return res.status(400).json({ message: 'Geçersiz durum değeri. Kabul edilen değerler: active, inactive, on_break' });
        }
        
        // Sürücüyü bul ve güncelle
        const updatedDriver = await User.findByIdAndUpdate(
          driverId,
          { driverStatus: status },
          { new: true, runValidators: true }
        ).select('driverStatus');
        
        if (!updatedDriver) {
          return res.status(404).json({ message: 'Sürücü bulunamadı' });
        }
        
        return res.status(200).json({
          status: updatedDriver.driverStatus,
          message: 'Sürücü durumu güncellendi'
        });
      }
      
    } catch (error) {
      console.error('Driver status API error:', error);
      return res.status(500).json({ message: 'Sürücü durumu işlenirken hata oluştu', error: error.message });
    }
    
  } catch (error) {
    console.error('Driver API error:', error);
    
    // GET isteği için mock veri
    if (req.method === 'GET') {
      return res.status(200).json({
        status: 'active'
      });
    }
    
    // PUT isteği için mock veri
    if (req.method === 'PUT') {
      const { status } = req.body;
      
      // Durum değeri validasyonu
      if (!status || !['active', 'inactive', 'on_break'].includes(status)) {
        return res.status(400).json({ message: 'Geçersiz durum değeri. Kabul edilen değerler: active, inactive, on_break' });
      }
      
      return res.status(200).json({
        status: status,
        message: 'Sürücü durumu güncellendi'
      });
    }
  }
} 