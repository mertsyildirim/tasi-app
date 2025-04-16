import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-posta ve şifre gereklidir' });
    }

    // MongoDB bağlantı dizesi
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tasiapp';
    
    // Bağlantı oluştur
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    try {
      // Bağlan
      await client.connect();
      
      // Veritabanını seç
      const db = client.db('tasiapp');
      
      // Kullanıcıyı email ile bul
      const existingUser = await db.collection('users').findOne({ email });

      // Kullanıcı zaten varsa
      if (existingUser) {
        // Admin rolünü ekle
        const result = await db.collection('users').updateOne(
          { email },
          { 
            $set: { 
              roles: ['admin'],
              isActive: true,
              updatedAt: new Date()
            } 
          }
        );
        
        return res.status(200).json({
          success: true,
          message: 'Kullanıcıya admin rolü eklendi',
          user: {
            id: existingUser._id.toString(),
            email: existingUser.email,
            name: existingUser.name,
            roles: ['admin']
          }
        });
      }
      
      // Şifreyi hashle
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Yeni admin kullanıcısı oluştur
      const newUser = {
        email,
        password: hashedPassword,
        name: name || 'Admin User',
        roles: ['admin'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Kullanıcıyı veritabanına ekle
      const result = await db.collection('users').insertOne(newUser);
      
      return res.status(201).json({
        success: true,
        message: 'Admin kullanıcısı başarıyla oluşturuldu',
        user: {
          id: result.insertedId.toString(),
          email: newUser.email,
          name: newUser.name,
          roles: newUser.roles
        }
      });
    } finally {
      // Bağlantıyı kapat
      await client.close();
    }
  } catch (error) {
    console.error('Admin oluşturma hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
} 