import { connectToDatabase } from '../../src/lib/mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Veritabanına bağlan
    const { db } = await connectToDatabase();
    
    // mert@tasiapp.com kullanıcısını bul
    const existingUser = await db.collection('users').findOne({ email: 'mert@tasiapp.com' });
    
    if (!existingUser) {
      // Kullanıcı bulunamazsa yeni admin olarak ekle
      const hashedPassword = await bcrypt.hash('12345678', 10);
      
      const newAdmin = {
        name: 'Mert Yönetici',
        email: 'mert@tasiapp.com',
        password: hashedPassword,
        roles: ['admin'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await db.collection('users').insertOne(newAdmin);
      
      return res.status(201).json({
        success: true,
        message: 'Admin kullanıcısı oluşturuldu',
        userId: result.insertedId.toString()
      });
    } else {
      // Kullanıcı varsa ve admin rolü yoksa ekle
      if (!existingUser.roles || !existingUser.roles.includes('admin')) {
        const roles = existingUser.roles || [];
        if (!roles.includes('admin')) {
          roles.push('admin');
        }
        
        await db.collection('users').updateOne(
          { _id: existingUser._id },
          { 
            $set: { 
              roles: roles,
              isActive: true,
              updatedAt: new Date()
            } 
          }
        );
        
        return res.status(200).json({
          success: true,
          message: 'Mevcut kullanıcıya admin rolü eklendi',
          userId: existingUser._id.toString(),
          roles: roles
        });
      } else {
        // Kullanıcı zaten admin ise
        return res.status(200).json({
          success: true,
          message: 'Kullanıcı zaten admin rolüne sahip',
          userId: existingUser._id.toString(),
          roles: existingUser.roles
        });
      }
    }
    
  } catch (error) {
    console.error('Admin ekleme hatası:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
} 