import { connectToDatabase, disconnectFromDatabase } from '../lib/mongodb';
import User from '../models/User';

/**
 * Veritabanına admin kullanıcısı ekleme işlemi
 */
async function seedAdminUser() {
  try {
    // MongoDB'ye bağlan
    console.log('MongoDB bağlantısı kuruluyor...');
    await connectToDatabase();
    console.log('MongoDB bağlantısı başarılı!');

    // Admin kullanıcısını kontrol et
    const existingAdmin = await User.findOne({ email: 'admin@tasiapp.com' });
    
    if (existingAdmin) {
      console.log('Admin kullanıcısı zaten mevcut.');
    } else {
      // Admin kullanıcısını oluştur
      const admin = await User.create({
        name: 'Taşı Admin',
        email: 'admin@tasiapp.com',
        password: 'Admin123!', // Not: Gerçek bir uygulamada şifre hashlenmelidir!
        phone: '+90 555 123 4567',
        role: 'admin',
        company: 'Taşı Lojistik',
        address: 'Levent, İstanbul',
        taxNumber: '1234567890',
        taxOffice: 'İstanbul',
        isActive: true
      });
      
      console.log('Admin kullanıcısı başarıyla oluşturuldu:', admin.email);
    }

    // Taşıyıcı kullanıcısını kontrol et
    const existingCarrier = await User.findOne({ email: 'carrier@tasiapp.com' });
    
    if (existingCarrier) {
      console.log('Taşıyıcı kullanıcısı zaten mevcut.');
    } else {
      // Taşıyıcı kullanıcısını oluştur
      const carrier = await User.create({
        name: 'Taşıyıcı Firma',
        email: 'carrier@tasiapp.com',
        password: 'Carrier123!', // Not: Gerçek bir uygulamada şifre hashlenmelidir!
        phone: '+90 555 123 7890',
        role: 'carrier',
        company: 'ABC Lojistik',
        address: 'Kadıköy, İstanbul',
        taxNumber: '9876543210',
        taxOffice: 'İstanbul',
        isActive: true
      });
      
      console.log('Taşıyıcı kullanıcısı başarıyla oluşturuldu:', carrier.email);
    }

    // Sürücü kullanıcısını kontrol et
    const existingDriver = await User.findOne({ email: 'driver@tasiapp.com' });
    
    if (existingDriver) {
      console.log('Sürücü kullanıcısı zaten mevcut.');
    } else {
      // Sürücü kullanıcısını oluştur
      const driver = await User.create({
        name: 'Ahmet Sürücü',
        email: 'driver@tasiapp.com',
        password: 'Driver123!', // Not: Gerçek bir uygulamada şifre hashlenmelidir!
        phone: '+90 555 987 6543',
        role: 'driver',
        company: 'ABC Lojistik',
        address: 'Beşiktaş, İstanbul',
        isActive: true
      });
      
      console.log('Sürücü kullanıcısı başarıyla oluşturuldu:', driver.email);
    }

    // Demo kullanıcısını kontrol et
    const existingDemo = await User.findOne({ email: 'demo@tasiapp.com' });
    
    if (existingDemo) {
      console.log('Demo kullanıcısı zaten mevcut.');
    } else {
      // Demo kullanıcısını oluştur
      const demo = await User.create({
        name: 'Demo Kullanıcı',
        email: 'demo@tasiapp.com',
        password: 'demo123', // Not: Gerçek bir uygulamada şifre hashlenmelidir!
        phone: '+90 555 000 0000',
        role: 'carrier',
        company: 'Demo Lojistik',
        address: 'Demo Adres',
        taxNumber: '0000000000',
        taxOffice: 'Demo',
        isActive: true
      });
      
      console.log('Demo kullanıcısı başarıyla oluşturuldu:', demo.email);
    }

    console.log('Kullanıcı oluşturma işlemi tamamlandı.');
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    // MongoDB bağlantısını kapat
    await disconnectFromDatabase();
    console.log('MongoDB bağlantısı kapatıldı.');
  }
}

// Seed işlemini başlat
seedAdminUser(); 