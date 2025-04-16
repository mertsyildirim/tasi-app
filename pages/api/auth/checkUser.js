import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'E-posta adresi gereklidir' });
    }

    // MongoDB bağlantı dizesi
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tasiapp';
    console.log('MongoDB URI:', uri);
    
    // Bağlantı oluştur
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    try {
      // Bağlan
      await client.connect();
      console.log('MongoDB bağlantısı başarılı');
      
      // Veritabanını seç
      const db = client.db('tasiapp');
      
      // Hem users hem de customers koleksiyonlarını kontrol et
      const usersCollection = db.collection('users');
      const customersCollection = db.collection('customers');
      
      // Kullanıcıyı email ile bul
      const userInUsers = await usersCollection.findOne({ email });
      const userInCustomers = await customersCollection.findOne({ email });
      
      console.log('Kullanıcı users koleksiyonunda bulundu mu:', !!userInUsers);
      console.log('Kullanıcı customers koleksiyonunda bulundu mu:', !!userInCustomers);
      
      if (userInUsers) {
        // Şifreyi yanıttan çıkar
        const { password, ...userWithoutPassword } = userInUsers;
        return res.status(200).json({
          found: true,
          collection: 'users',
          user: userWithoutPassword
        });
      } else if (userInCustomers) {
        // Şifreyi yanıttan çıkar
        const { password, ...userWithoutPassword } = userInCustomers;
        return res.status(200).json({
          found: true,
          collection: 'customers',
          user: userWithoutPassword
        });
      } else {
        return res.status(404).json({
          found: false,
          message: 'Kullanıcı bulunamadı'
        });
      }
    } finally {
      // Bağlantıyı kapat
      await client.close();
    }
  } catch (error) {
    console.error('Kullanıcı kontrolü hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası', details: error.message });
  }
} 