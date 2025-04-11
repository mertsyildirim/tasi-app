const mongoose = require('mongoose');

// MongoDB bağlantı URI'sini oluştur
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tasiapp';

// MongoDB bağlantı durumunu tutan değişkenler
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * MongoDB veritabanına bağlantı kurulmasını sağlayan fonksiyon
 * @returns {Promise<Mongoose>} Mongoose bağlantı nesnesi
 */
async function connectToDatabase() {
  if (cached.conn) {
    console.log('Mevcut MongoDB bağlantısı kullanılıyor');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 5000, // 5 saniye
      socketTimeoutMS: 45000, // 45 saniye
    };

    console.log('MongoDB bağlantısı kuruluyor...');
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then(mongoose => {
        console.log('MongoDB bağlantısı başarılı');
        return mongoose;
      })
      .catch(error => {
        console.error('MongoDB bağlantı hatası:', error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}

/**
 * MongoDB bağlantısını kapatmak için kullanılan fonksiyon
 */
async function disconnectFromDatabase() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

// Veritabanı bağlantı durumu değiştiğinde tetiklenecek olayları dinle
mongoose.connection.on('connected', () => {
  console.log('MongoDB\'ye bağlandı');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB bağlantı hatası:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB bağlantısı kesildi');
});

// Uygulama kapandığında MongoDB bağlantısını kapat
process.on('SIGINT', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});

module.exports = {
  connectToDatabase,
  disconnectFromDatabase
}; 