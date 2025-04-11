const { connectToDatabase, disconnectFromDatabase } = require('../lib/mongodb');
const User = require('../models/User');

async function seedDatabase() {
  try {
    await connectToDatabase();

    const users = [
      { name: 'Ali Veli', email: 'ali@example.com', password: 'password123', role: 'admin' },
      { name: 'Ayşe Fatma', email: 'ayse@example.com', password: 'password123', role: 'user' },
    ];

    await User.insertMany(users);
    console.log('Veritabanı başarıyla dolduruldu!');
  } catch (error) {
    console.error('Veritabanı doldurma hatası:', error);
  } finally {
    await disconnectFromDatabase();
  }
}

seedDatabase(); 