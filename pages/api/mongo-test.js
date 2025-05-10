import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  // MongoDB bağlantı dizesi
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    return res.status(500).json({ error: 'MONGODB_URI tanımlı değil' });
  }
  
  console.log('Bağlantı dizesi:', uri);
  
  try {
    // Bağlantı oluştur
    console.log('MongoDB bağlantısı kuruluyor...');
    const client = new MongoClient(uri);
    
    // Bağlan
    await client.connect();
    console.log('MongoDB bağlantısı başarılı!');
    
    // Veritabanları listesini al
    const admin = client.db().admin();
    const dbList = await admin.listDatabases();
    
    // Bağlantıyı kapat
    await client.close();
    
    return res.status(200).json({ 
      success: true, 
      message: 'MongoDB bağlantısı başarılı!',
      databases: dbList.databases.map(db => db.name)
    });
  } catch (error) {
    console.error('MongoDB Bağlantı Hatası:', error);
    
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack,
      uri: uri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://$1:****@')
    });
  }
} 