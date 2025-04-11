// Dotenv yapılandırması
require('dotenv').config({ path: '.env' });

const { connectToDatabase, disconnectFromDatabase } = require('../lib/mongodb');
const User = require('../models/User');

async function testDatabaseConnection() {
  try {
    console.log('MongoDB bağlantı testi başlatılıyor...');
    
    // Veritabanına bağlan
    await connectToDatabase();
    console.log('Veritabanı bağlantısı başarılı!');

    // Test kullanıcısı oluştur
    const testUser = new User({
      name: 'Test Kullanıcı',
      email: 'test@tasiapp.com',
      password: 'test123',
      role: 'admin',
      isActive: true
    });

    // Kullanıcıyı kaydet
    await testUser.save();
    console.log('Test kullanıcısı başarıyla oluşturuldu');

    // Kullanıcıyı sorgula
    const foundUser = await User.findOne({ email: 'test@tasiapp.com' });
    console.log('Bulunan kullanıcı:', foundUser);

    // Test kullanıcısını sil
    await User.deleteOne({ email: 'test@tasiapp.com' });
    console.log('Test kullanıcısı başarıyla silindi');

    console.log('Tüm testler başarıyla tamamlandı!');
  } catch (error) {
    console.error('Test sırasında hata oluştu:', error);
  } finally {
    // Veritabanı bağlantısını kapat
    await disconnectFromDatabase();
    console.log('Veritabanı bağlantısı kapatıldı');
  }
}

// Testi çalıştır
testDatabaseConnection(); 