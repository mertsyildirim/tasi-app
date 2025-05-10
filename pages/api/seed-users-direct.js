import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  try {
    // MongoDB bağlantı dizesi
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      return res.status(500).json({ error: 'MONGODB_URI tanımlı değil' });
    }
    
    console.log('Bağlantı dizesi:', uri);
    
    // Bağlantı oluştur
    console.log('MongoDB bağlantısı kuruluyor...');
    const client = new MongoClient(uri);
    
    // Bağlan
    await client.connect();
    console.log('MongoDB bağlantısı başarılı!');
    
    // Veritabanını seç
    const db = client.db('tasiapp');
    
    // Test kullanıcıları
    const testUsers = [
      {
        name: 'Test Müşteri',
        email: 'customer@test.com',
        password: await bcrypt.hash('test123', 10),
        role: 'customer',
        phone: '0555 111 1111',
        address: 'Test Mahallesi, Müşteri Sokak No:1 İstanbul',
        notifications: true,
        language: 'tr',
        taxNumber: '11111111111',
        billingAddress: 'Fatura Mahallesi, Müşteri Sokak No:1 İstanbul',
        avatarUrl: 'https://ui-avatars.com/api/?name=Test+Müşteri&background=random',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Test Taşıyıcı',
        email: 'carrier@test.com',
        password: await bcrypt.hash('test123', 10),
        role: 'carrier',
        phone: '0555 222 2222',
        address: 'Test Mahallesi, Taşıyıcı Sokak No:2 Ankara',
        notifications: true,
        language: 'tr',
        taxNumber: '22222222222',
        billingAddress: 'Fatura Mahallesi, Taşıyıcı Sokak No:2 Ankara',
        avatarUrl: 'https://ui-avatars.com/api/?name=Test+Taşıyıcı&background=random',
        companyName: 'Test Taşıma Şirketi',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Test Sürücü',
        email: 'driver@test.com',
        password: await bcrypt.hash('test123', 10),
        role: 'driver',
        phone: '0555 333 3333',
        address: 'Test Mahallesi, Sürücü Sokak No:3 İzmir',
        notifications: true,
        language: 'tr',
        taxNumber: '33333333333',
        billingAddress: 'Fatura Mahallesi, Sürücü Sokak No:3 İzmir',
        avatarUrl: 'https://ui-avatars.com/api/?name=Test+Sürücü&background=random',
        licenseNumber: 'TST123',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Test Admin',
        email: 'admin@test.com',
        password: await bcrypt.hash('test123', 10),
        role: 'admin',
        phone: '0555 444 4444',
        address: 'Test Mahallesi, Admin Sokak No:4 Bursa',
        notifications: true,
        language: 'tr',
        taxNumber: '44444444444',
        billingAddress: 'Fatura Mahallesi, Admin Sokak No:4 Bursa',
        avatarUrl: 'https://ui-avatars.com/api/?name=Test+Admin&background=random',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Önce mevcut test kullanıcılarını sil
    await db.collection('users').deleteMany({
      email: { $in: testUsers.map(user => user.email) }
    });

    // Yeni test kullanıcılarını ekle
    const result = await db.collection('users').insertMany(testUsers);

    // Bağlantıyı kapat
    await client.close();

    return res.status(200).json({
      success: true,
      message: 'Test kullanıcıları başarıyla eklendi',
      count: result.insertedCount,
      users: testUsers.map(({ password, ...user }) => user)
    });
  } catch (error) {
    console.error('Test kullanıcıları ekleme hatası:', error);
    
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    });
  }
} 