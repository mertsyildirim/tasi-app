const { connectToDatabase } = require('./src/lib/mongodb');

async function testConnection() {
  try {
    console.log('MongoDB bağlantısı test ediliyor...');
    const connection = await connectToDatabase();
    console.log('Bağlantı başarılı!', connection ? 'Bağlantı nesnesi alındı' : 'Bağlantı nesnesi alınamadı');
    
    if (connection && connection.db) {
      const collections = await connection.db.listCollections().toArray();
      console.log('Mevcut koleksiyonlar:');
      collections.forEach(coll => console.log(`- ${coll.name}`));
      
      // Drivers koleksiyonunu kontrol et
      const hasDrivers = collections.some(coll => coll.name === 'drivers');
      console.log('Drivers koleksiyonu mevcut mu:', hasDrivers);
    }
    
    // İşlem tamamlandığında uygulamayı durdur
    process.exit(0);
  } catch (error) {
    console.error('Bağlantı hatası:', error);
    process.exit(1);
  }
}

// Fonksiyonu çalıştır
testConnection(); 