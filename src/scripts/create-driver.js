const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  type: String,
  isActive: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createDriver() {
  try {
    console.log('MongoDB bağlantısı kuruluyor...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB\'ye bağlandı');

    const driver = new User({
      name: 'Sürücü Kullanıcı',
      email: 'surucu@tasiapp.com',
      password: '1234',
      type: 'driver',
      isActive: true
    });

    await driver.save();
    console.log('Sürücü kullanıcısı başarıyla oluşturuldu:', driver);

    await mongoose.connection.close();
    console.log('MongoDB bağlantısı kapatıldı');
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

createDriver(); 