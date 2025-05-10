import { connectToDatabase } from '../../../src/lib/mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // CORS ayarları ekle
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  // OPTIONS isteğine cevap ver
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Sadece GET isteklerine yanıt ver (tarayıcıdan kolay erişim için)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed', allowed: ['GET'] });
  }

  try {
    // Veritabanına bağlan
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    // Admin kullanıcısı için şifreyi hash'le
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Admin kullanıcı nesnesini oluştur
    const adminUser = {
      name: 'Süper Admin',
      email: 'admin@tasiapp.com',
      password: hashedPassword,
      roles: ['admin'],  // Admin rolü
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // E-posta adresi zaten kullanılıyor mu kontrol et
    const existingUser = await usersCollection.findOne({ email: adminUser.email });
    
    if (existingUser) {
      // Kullanıcı zaten varsa, admin rolünü ekle/güncelle
      const updateResult = await usersCollection.updateOne(
        { email: adminUser.email },
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
        message: 'Admin kullanıcısı güncellendi',
        updated: updateResult.modifiedCount > 0,
        user: {
          email: adminUser.email,
          name: existingUser.name,
          roles: ['admin']
        }
      });
    }
    
    // Yeni admin kullanıcısını ekle
    const result = await usersCollection.insertOne(adminUser);
    
    return res.status(201).json({
      success: true,
      message: 'Admin kullanıcısı başarıyla oluşturuldu',
      userId: result.insertedId.toString(),
      user: {
        email: adminUser.email,
        name: adminUser.name,
        roles: ['admin']
      }
    });
  } catch (error) {
    console.error('Admin kullanıcısı oluşturma hatası:', error);
    return res.status(500).json({ 
      error: 'Admin kullanıcısı oluşturulurken bir hata oluştu', 
      details: error.message 
    });
  }
} 