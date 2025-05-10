// Not: Bu dosya örnek amaçlıdır. Gerçek projelerde MongoDB veya başka bir veritabanına bağlantı sağlar.

// Veritabanı bağlantı URL'si, gerçek projede .env dosyasından alınır
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tasiapp';

// Veritabanı bağlantı durumunu takip etmek için global değişken
let cachedDb = null;

/**
 * MongoDB veritabanına bağlanır ve bağlantıyı döndürür
 * @returns {Promise<object>} MongoDB bağlantı nesnesi
 */
export async function connectToDatabase() {
  // Bağlantı zaten varsa tekrar bağlanmaya gerek yok
  if (cachedDb) {
    return cachedDb;
  }

  try {
    // NOT: Bu bölüm şu anda simüle edilmiştir. Gerçek projede mongodb npm paketini kullanırsınız:
    // const { MongoClient } = require('mongodb');
    // const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    // await client.connect();
    // const db = client.db();
    
    // Simüle edilmiş veritabanı bağlantısı
    console.log('Veritabanına bağlanılıyor:', MONGODB_URI);
    
    // Demo amaçlı basit bir veritabanı nesnesi
    const db = {
      collection: (collectionName) => {
        console.log(`"${collectionName}" koleksiyonuna erişiliyor`);
        
        // Koleksiyon üzerinde işlemler
        return {
          find: (query = {}) => {
            console.log('Sorgu yapılıyor:', query);
            
            return {
              toArray: async () => {
                console.log('Sonuçlar diziye dönüştürülüyor');
                return []; // Boş sonuç dönüyoruz, gerçek projede veritabanından sonuçlar gelmeli
              }
            };
          },
          
          findOne: async (query = {}) => {
            console.log('Tek sonuç sorgusu yapılıyor:', query);
            return null; // Boş sonuç dönüyoruz
          },
          
          insertOne: async (document) => {
            console.log('Belge ekleniyor:', document);
            return { insertedId: 'simulated-id-' + Date.now() };
          },
          
          updateOne: async (filter, update) => {
            console.log('Belge güncelleniyor. Filtre:', filter, 'Güncelleme:', update);
            return { modifiedCount: 1 };
          },
          
          deleteOne: async (filter) => {
            console.log('Belge siliniyor. Filtre:', filter);
            return { deletedCount: 1 };
          }
        };
      }
    };
    
    // Bağlantıyı önbelleğe al
    cachedDb = db;
    return db;
  } catch (error) {
    console.error('Veritabanı bağlantısı sırasında hata:', error);
    throw error;
  }
} 