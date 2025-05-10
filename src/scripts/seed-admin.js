// Dotenv yapılandırması
require('dotenv').config({ path: '.env.local' });

const { connectToDatabase, disconnectFromDatabase } = require('../lib/mongodb');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Kullanıcı şifresini hashleyen fonksiyon
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Veritabanına kullanıcı ekleme işlemi
 */
async function seedUsers() {
  try {
    // MongoDB'ye bağlan
    console.log('MongoDB bağlantısı kuruluyor...');
    await connectToDatabase();
    console.log('MongoDB bağlantısı başarılı!');

    // Her bir site için kullanıcılar oluştur
    
    // 1. Portal kullanıcıları (portal.tasiapp.com)
    const portalUsers = [
      {
        name: 'Taşıyıcı Firma',
        email: 'carrier@tasiapp.com',
        password: await hashPassword('Carrier123!'),
        phone: '+90 555 123 7890',
        role: 'carrier',
        company: 'ABC Lojistik',
        address: 'Kadıköy, İstanbul',
        taxNumber: '9876543210',
        taxOffice: 'İstanbul',
        isActive: true
      },
      {
        name: 'Ahmet Sürücü',
        email: 'driver@tasiapp.com',
        password: await hashPassword('Driver123!'),
        phone: '+90 555 987 6543',
        role: 'driver',
        company: 'ABC Lojistik',
        address: 'Beşiktaş, İstanbul',
        isActive: true
      },
      {
        name: 'Demo Kullanıcı',
        email: 'demo@tasiapp.com',
        password: await hashPassword('demo123'),
        phone: '+90 555 000 0000',
        role: 'carrier',
        company: 'Demo Lojistik',
        address: 'Demo Adres',
        taxNumber: '0000000000',
        taxOffice: 'Demo',
        isActive: true
      }
    ];

    // 2. Admin kullanıcısı (tasiapp.com/admin)
    const adminUsers = [
      {
        name: 'Taşı Admin',
        email: 'admin@tasiapp.com',
        password: await hashPassword('Admin123!'),
        phone: '+90 555 123 4567',
        role: 'admin',
        company: 'Taşı Lojistik',
        address: 'Levent, İstanbul',
        taxNumber: '1234567890',
        taxOffice: 'İstanbul',
        isActive: true
      }
    ];

    // 3. Müşteri kullanıcıları (tasiapp.com)
    const customerUsers = [
      {
        name: 'Ali Müşteri',
        email: 'customer@tasiapp.com',
        password: await hashPassword('Customer123!'),
        phone: '+90 555 111 2222',
        role: 'customer',
        address: 'Beyoğlu, İstanbul',
        isActive: true
      }
    ];

    // Tüm kullanıcıları birleştir
    const allUsers = [...portalUsers, ...adminUsers, ...customerUsers];

    // Kullanıcıları veritabanına ekle
    for (const userData of allUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`${userData.email} kullanıcısı zaten mevcut.`);
        
        // Email ve şifre hariç kullanıcı bilgilerini güncelle
        const { email, password, ...updateData } = userData;
        await User.findOneAndUpdate({ email }, updateData);
        console.log(`${userData.email} kullanıcısı bilgileri güncellendi.`);
      } else {
        const user = await User.create(userData);
        console.log(`${user.email} kullanıcısı başarıyla oluşturuldu. Rol: ${user.role}`);
      }
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
seedUsers(); 