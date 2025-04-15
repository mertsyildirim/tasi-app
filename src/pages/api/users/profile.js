import { connectToDatabase } from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Token doğrulama
    const token = req.cookies.auth;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Veritabanı bağlantısı
    const { db } = await connectToDatabase();
    
    if (req.method === 'GET') {
      // Kullanıcı bilgilerini getir
      const user = await db.collection('users').findOne(
        { _id: new ObjectId(decoded.userId) },
        { projection: { password: 0 } }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Şifreyi çıkar ve kullanıcı verilerini formatla
      const { password, ...userWithoutPassword } = user;

      // Rol kontrolü - eğer kullanıcı bir dizi olarak rollere sahipse, ilk rolü ana rol olarak kullan
      let userRole = userWithoutPassword.role;
      let userRoles = userWithoutPassword.roles || [];

      // Eğer kullanıcı bir rol dizisine sahipse ama role özelliği yoksa veya güncel değilse
      if (Array.isArray(userRoles) && userRoles.length > 0) {
        if (!userRole || userRole !== userRoles[0]) {
          userRole = userRoles[0];
        }
      } 
      // Eğer tek bir role sahipse ama roles dizisi yoksa
      else if (userRole && (!userRoles || userRoles.length === 0)) {
        userRoles = [userRole];
      }

      // Kullanıcı bilgilerini birleştir
      const userData = {
        ...userWithoutPassword,
        role: userRole,         // ana rol
        roles: userRoles        // tüm roller
      };

      res.status(200).json(userData);
    } else if (req.method === 'PUT') {
      // Kullanıcı bilgilerini güncelle
      const updateData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        notifications: req.body.notifications,
        language: req.body.language,
        taxNumber: req.body.taxNumber,
        billingAddress: req.body.billingAddress,
        updatedAt: new Date()
      };

      const result = await db.collection('users').findOneAndUpdate(
        { _id: new ObjectId(decoded.userId) },
        { $set: updateData },
        { returnDocument: 'after', projection: { password: 0 } }
      );

      if (!result.value) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(result.value);
    }
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 