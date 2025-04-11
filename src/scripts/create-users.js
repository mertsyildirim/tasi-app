// Modern veritabanına test kullanıcıları ekleyen script
const { connectToDatabase, disconnectFromDatabase } = require('../lib/mongodb');
const bcrypt = require('bcryptjs');

// Şifre hashlemek için
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function createUsers() {
  try {
    console.log('Veritabanına test kullanıcıları ekleniyor...');
    
    // Veritabanına bağlan
    const { db } = await connectToDatabase();
    console.log('MongoDB bağlantısı başarılı!');

    // Demo kullanıcıları oluştur
    const users = [
      // Taşıyıcı kullanıcı
      {
        name: 'Demo Taşıyıcı',
        email: 'tasici@tasiapp.com',
        password: await hashPassword('TasiApp2024!'),
        phone: '+90 555 123 4567',
        role: 'carrier',
        company: 'Demo Lojistik A.Ş.',
        status: 'active',
        address: 'İstanbul, Türkiye',
        createdAt: new Date(),
        lastLogin: null
      },
      // Sürücü kullanıcı
      {
        name: 'Demo Sürücü',
        email: 'surucu@tasiapp.com',
        password: await hashPassword('Driver2024!'),
        phone: '+90 555 987 6543',
        role: 'driver',
        company: 'Demo Lojistik A.Ş.',
        status: 'active',
        address: 'Ankara, Türkiye',
        createdAt: new Date(),
        lastLogin: null
      },
      // Müşteri kullanıcı
      {
        name: 'Demo Müşteri',
        email: 'musteri@tasiapp.com',
        password: await hashPassword('Customer2024!'),
        phone: '+90 555 789 1234',
        role: 'customer',
        status: 'active',
        address: 'İzmir, Türkiye',
        createdAt: new Date(),
        lastLogin: null
      },
      // Admin kullanıcı
      {
        name: 'Demo Admin',
        email: 'admin@tasiapp.com',
        password: await hashPassword('Admin2024!'),
        phone: '+90 555 456 7890',
        role: 'admin',
        status: 'active',
        address: 'Bursa, Türkiye',
        createdAt: new Date(),
        lastLogin: null
      }
    ];

    // Kullanıcıları ekle veya güncelle
    for (const user of users) {
      const userEmail = user.email;
      
      // Kullanıcı var mı kontrol et
      const existingUser = await db.collection('users').findOne({ email: userEmail });
      
      if (existingUser) {
        console.log(`${userEmail} kullanıcısı zaten mevcut, güncelleniyor...`);
        
        // Şifre ve email hariç güncelle
        const { password, ...updateData } = user;
        await db.collection('users').updateOne(
          { email: userEmail },
          { $set: updateData }
        );
        
        console.log(`${userEmail} güncellendi ✓`);
      } else {
        // Yeni kullanıcı ekle
        const result = await db.collection('users').insertOne(user);
        console.log(`${userEmail} oluşturuldu (${user.role}) ✓`);
      }
    }

    console.log('\nTüm kullanıcılar başarıyla eklendi/güncellendi!');
    console.log('\nGiriş bilgileri:');
    console.log('- Taşıyıcı: tasici@tasiapp.com / TasiApp2024!');
    console.log('- Sürücü: surucu@tasiapp.com / Driver2024!');
    console.log('- Müşteri: musteri@tasiapp.com / Customer2024!');
    console.log('- Admin: admin@tasiapp.com / Admin2024!');
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    // Bağlantıyı kapat
    await disconnectFromDatabase();
    console.log('MongoDB bağlantısı kapatıldı.');
  }
}

// Scripti çalıştır
createUsers(); 