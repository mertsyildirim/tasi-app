const mongoose = require('mongoose');

// MongoDB bağlantı URI'sini oluştur
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://infotasiapp:Tasi2025.@cluster0.ttipxu5.mongodb.net/tasiapp?retryWrites=true&w=majority';

// Mongoose ayarları
mongoose.set('strictQuery', false);

// MongoDB bağlantı durumunu tutan değişkenler
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, db: null };
}

/**
 * MongoDB veritabanına bağlantı kurulmasını sağlayan fonksiyon
 * @returns {Promise<{conn: mongoose.Connection, db: mongoose.Connection['db']}> } Mongoose bağlantı nesnesi
 */
async function connectToDatabase() {
  // Hata durumunda detaylı loglama
  console.log('MongoDB bağlantısı başlatılıyor. Cache durumu:', 
    cached.conn ? 'Bağlantı var' : 'Bağlantı yok', 
    cached.promise ? 'Promise var' : 'Promise yok'
  );
  
  try {
    if (cached.conn && cached.conn.readyState === 1) {
      console.log('Mevcut MongoDB bağlantısı kullanılıyor');
      return {
        conn: cached.conn, 
        db: cached.db,
        connection: { db: cached.db }  // Geriye dönük uyumluluk için
      };
    }

    // Eğer mevcut bir promise varsa ve bağlantı kopuksa, promise'i sıfırla
    if (cached.promise && (!cached.conn || cached.conn.readyState !== 1)) {
      console.log('Önceki bağlantı kopmuş, yeni bağlantı oluşturuluyor');
      cached.promise = null;
    }

    if (!cached.promise) {
      const opts = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Daha fazla bağlantı havuzu
        serverSelectionTimeoutMS: 30000, // Timeout değerini artırdık
        socketTimeoutMS: 45000,
      };

      console.log('MongoDB Atlas bağlantısı kuruluyor... URI:', MONGODB_URI.substring(0, 30) + '...');
      
      cached.promise = mongoose.connect(MONGODB_URI, opts)
        .then(mongoose => {
          console.log('MongoDB Atlas bağlantısı başarılı');
          return mongoose;
        })
        .catch(error => {
          console.error('MongoDB Atlas bağlantı hatası:', error);
          cached.promise = null;
          throw error;
        });
    }

    cached.conn = await cached.promise;
    cached.db = cached.conn.connection.db;
    
    return { 
      conn: cached.conn, 
      db: cached.db,
      connection: { db: cached.db }  // Geriye dönük uyumluluk için
    };
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    cached.promise = null;
    cached.conn = null;
    cached.db = null;
    throw error;
  }
}

/**
 * MongoDB veritabanında belirtilen koleksiyona erişim sağlayan fonksiyon
 * @param {string} collectionName - Erişilmek istenen koleksiyon adı
 * @returns {Promise<Collection>} MongoDB koleksiyon nesnesi
 */
async function getCollection(collectionName) {
  try {
    const { db } = await connectToDatabase();
    return db.collection(collectionName);
  } catch (error) {
    console.error(`Koleksiyon erişim hatası (${collectionName}):`, error);
    throw error;
  }
}

/**
 * Koleksiyonun varlığını kontrol eden ve yoksa oluşturan fonksiyon
 * @param {string} collectionName - Kontrol edilecek koleksiyon adı
 * @returns {Promise<boolean>} Koleksiyon oluşturuldu mu?
 */
async function ensureCollection(collectionName) {
  try {
    const { db } = await connectToDatabase();
    const collections = await db.listCollections({ name: collectionName }).toArray();
    
    if (collections.length === 0) {
      await db.createCollection(collectionName);
      console.log(`${collectionName} koleksiyonu oluşturuldu`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`${collectionName} koleksiyonu kontrol hatası:`, error);
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
    cached.db = null;
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

// Veritabanı bağlantı durumu değiştiğinde tetiklenecek olayları dinle
mongoose.connection.on('connected', () => {
  console.log('MongoDB\'ye bağlandı');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB bağlantı hatası:', err);
  cached.promise = null; // Hata durumunda promise'i sıfırla
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB bağlantısı kesildi');
  cached.promise = null; // Bağlantı kesildiğinde promise'i sıfırla
});

// Uygulama kapandığında MongoDB bağlantısını kapat
process.on('SIGINT', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
  getCollection,
  ensureCollection
}; 