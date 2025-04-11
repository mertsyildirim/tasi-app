const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI ortam değişkeni tanımlanmamış');
}

if (!MONGODB_DB) {
  throw new Error('MONGODB_DB ortam değişkeni tanımlanmamış');
}

console.log(`MongoDB bağlantısı için URI ayarlandı: ${MONGODB_URI.substring(0, 15)}...`);
console.log(`MongoDB veritabanı: ${MONGODB_DB}`);

let cachedClient = null;
let cachedDb = null;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 3;

export async function connectToDatabase() {
  try {
    connectionAttempts++;
    
    // Bağlantı denemesi detaylarını logla
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] MongoDB bağlantı denemesi #${connectionAttempts}/${MAX_RETRY_ATTEMPTS}`);
    
    // Cached bağlantı varsa onu kullan
    if (cachedClient && cachedDb) {
      // Bağlantı hala yaşıyor mu kontrol et
      try {
        const pingStartTime = Date.now();
        await cachedClient.db().admin().ping();
        const pingDuration = Date.now() - pingStartTime;
        console.log(`MongoDB mevcut bağlantı ping süresi: ${pingDuration}ms`);
        
        if (pingDuration > 1000) {
          console.warn(`MongoDB ping yanıtı yavaş: ${pingDuration}ms - Ancak bağlantı hala aktif`);
        }
        
        return { client: cachedClient, db: cachedDb };
      } catch (pingError) {
        console.warn('Mevcut MongoDB bağlantısı kesilmiş veya yanıt vermiyor:', pingError.message);
        console.log('Yeni bağlantı kuruluyor...');
        
        // Bozuk bağlantıyı kapat
        try {
          await cachedClient.close();
        } catch (closeError) {
          console.error('Eski bağlantı kapatılırken hata:', closeError.message);
        }
        
        cachedClient = null;
        cachedDb = null;
      }
    }

    console.log('Yeni MongoDB bağlantısı kuruluyor...');
    
    // Veritabanı URL'sini kontrol et
    if (!MONGODB_URI.startsWith('mongodb')) {
      throw new Error('Geçersiz MongoDB bağlantı URL formatı');
    }
    
    // Bağlantı seçeneklerini optimize et
    const clientOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 20, // Bağlantı havuzu boyutunu artır (varsayılan 10)
      serverSelectionTimeoutMS: 15000, // 15 saniye sunucu seçim zaman aşımı
      socketTimeoutMS: 60000, // 60 saniye soket zaman aşımı
      connectTimeoutMS: 30000, // 30 saniye bağlantı zaman aşımı
      heartbeatFrequencyMS: 10000, // Daha sık canlılık kontrolü
      minPoolSize: 5, // Minimum 5 bağlantı 
      maxIdleTimeMS: 120000, // 2 dakika atıl bağlantı süresi
      waitQueueTimeoutMS: 15000, // Kuyrukta bekle süresi 15 saniye
      family: 4 // IPV4 kullanımını zorla (mobil ağlarda daha kararlı)
    };
    
    // Yeni bağlantı oluştur
    console.log('MongoDB istemcisi oluşturuluyor, bağlantı seçenekleri:', JSON.stringify(clientOptions));
    
    const client = new MongoClient(MONGODB_URI, clientOptions);

    // Bağlanma işlemini başlat ve ölç
    const connectStartTime = Date.now();
    console.log('MongoDB bağlantısı başlatılıyor...');
    
    await client.connect();
    
    const connectDuration = Date.now() - connectStartTime;
    console.log(`MongoDB bağlantısı başarılı, süre: ${connectDuration}ms`);
    
    const db = client.db(MONGODB_DB);
    console.log(`MongoDB veritabanına erişildi: ${MONGODB_DB}`);

    // Bağlantı olaylarını dinle
    client.on('serverOpening', (event) => {
      console.log(`MongoDB sunucusuna bağlanılıyor: ${event.address}`);
    });
    
    client.on('serverClosed', (event) => {
      console.log(`MongoDB sunucusu bağlantısı kapandı: ${event.address}`);
    });
    
    client.on('timeout', (event) => {
      console.warn(`MongoDB zaman aşımı oluştu: ${event}`);
    });

    // Bağlantıyı cache'le
    cachedClient = client;
    cachedDb = db;

    console.log('MongoDB bağlantısı başarıyla kuruldu ve önbelleğe alındı');
    
    // Bağlantı başarılıysa sayacı sıfırla
    connectionAttempts = 0;
    
    return { client, db };
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error.message);
    console.error('Hata stack:', error.stack);
    
    // Bağlantı hata türüne göre log
    if (error.name === 'MongoServerSelectionError') {
      console.error('MongoDB sunucu seçim hatası - muhtemelen ağ veya firewall sorunu');
    } else if (error.name === 'MongoNetworkError') {
      console.error('MongoDB ağ hatası - internet bağlantısı kontrol edilmeli');
    } else if (error.name === 'MongoParseError') {
      console.error('MongoDB bağlantı URL parse hatası - URL doğru formatta değil');
    }
    
    // Yeniden deneme yap (maksimum deneme sayısını aşmadıysa)
    if (connectionAttempts < MAX_RETRY_ATTEMPTS) {
      console.log(`MongoDB bağlantısı yeniden deneniyor... (${connectionAttempts}/${MAX_RETRY_ATTEMPTS})`);
      
      // Her denemede bekleme süresini artır (exponential backoff)
      const retryDelayMs = Math.min(1000 * Math.pow(2, connectionAttempts - 1), 10000);
      console.log(`Yeniden deneme öncesi ${retryDelayMs}ms bekleniyor...`);
      
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
      return connectToDatabase();
    }
    
    throw new Error(`Veritabanına bağlanırken hata oluştu (${connectionAttempts} deneme sonrası): ${error.message}`);
  }
}

/**
 * MongoDB bağlantısını kapatmak için kullanılan fonksiyon
 */
async function disconnectFromDatabase() {
  if (cachedClient) {
    try {
      console.log('MongoDB bağlantısı kapatılıyor...');
      await cachedClient.close();
      cachedClient = null;
      cachedDb = null;
      console.log('MongoDB bağlantısı kapatıldı');
    } catch (error) {
      console.error('MongoDB bağlantısı kapatılırken hata:', error);
    }
  }
}

// Veritabanı bağlantı durumu değiştiğinde tetiklenecek olayları dinle
if (cachedClient) {
  cachedClient.on('connected', () => {
    console.log('MongoDB\'ye bağlandı');
  });

  cachedClient.on('error', (err) => {
    console.error('MongoDB bağlantı hatası:', err);
  });

  cachedClient.on('disconnected', () => {
    console.log('MongoDB bağlantısı kesildi');
  });
}

// Uygulama kapandığında MongoDB bağlantısını kapat
process.on('SIGINT', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});

module.exports = {
  connectToDatabase,
  disconnectFromDatabase
}; 