import { connectToDatabase } from '../../../src/lib/mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  try {
    // Sadece POST isteklerine yanıt ver
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Sadece POST metodu kabul edilir' });
    }

    // Veritabanına bağlan
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // Varsayılan değerler - Parametreler yoksa bu değerleri kullan
    const name = req.body.name || 'Mert Soydan';
    const email = req.body.email || 'mert@tasiapp.com';
    const password = req.body.password || 'Merts1995';
    
    // Email kontrolü yap
    const existingUser = await db.collection('users').findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Bu email adresi zaten kullanılıyor', 
        user: { 
          id: existingUser._id.toString(),
          email: existingUser.email, 
          name: existingUser.name 
        } 
      });
    }
    
    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Yeni admin kullanıcı oluştur
    const newUser = {
      name,
      email,
      password: hashedPassword,
      roles: ['admin'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Kullanıcıyı veritabanına ekle
    const result = await db.collection('users').insertOne(newUser);
    
    // Kullanıcı ID
    const userId = result.insertedId.toString();
    
    // Şifreyi response'dan çıkar
    const { password: _, ...userInfo } = newUser;
    
    return res.status(201).json({
      success: true,
      message: 'Yönetici kullanıcısı başarıyla oluşturuldu',
      user: {
        ...userInfo,
        id: userId
      }
    });
    
  } catch (error) {
    console.error('Admin kullanıcısı oluşturma hatası:', error);
    return res.status(500).json({ error: 'Admin kullanıcısı oluşturulurken bir hata oluştu', details: error.message });
  }
} 