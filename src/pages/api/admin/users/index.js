import { getSession } from 'next-auth/react';
import { connectToDatabase } from '../../../../lib/db';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Session kontrolü
  const session = await getSession({ req });
  
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ error: 'Bu işlem için yetkiniz bulunmamaktadır.' });
  }

  // Veritabanı bağlantısı
  let client;
  
  try {
    client = await connectToDatabase();
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // GET isteği (kullanıcıları listele)
    if (req.method === 'GET') {
      // Sayfalama için parametreler
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      // Arama ve filtreleme parametreleri
      const search = req.query.search || '';
      const role = req.query.role || '';
      const status = req.query.status || '';
      
      // Filtre oluştur
      let filter = {};
      
      if (search) {
        filter = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { surname: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { 'company.name': { $regex: search, $options: 'i' } }
          ]
        };
      }
      
      if (role) {
        filter.role = role;
      }
      
      if (status) {
        filter.status = status;
      }
      
      // Toplam kullanıcı sayısı
      const total = await usersCollection.countDocuments(filter);
      
      // Kullanıcıları getir
      const users = await usersCollection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .project({
          name: 1,
          surname: 1,
          email: 1,
          phone: 1,
          role: 1,
          status: 1,
          company: 1,
          createdAt: 1,
          updatedAt: 1
          // password alanını dahil etme
        })
        .toArray();
      
      // Cevap döndür
      return res.status(200).json({
        users,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    }
    
    // POST isteği (yeni kullanıcı ekle)
    if (req.method === 'POST') {
      const { name, surname, email, password, phone, role, status, company } = req.body;
      
      // Zorunlu alanları kontrol et
      if (!name || !surname || !email || !password) {
        return res.status(400).json({ error: 'Lütfen zorunlu alanları doldurun (isim, soyisim, e-posta, şifre).' });
      }
      
      // E-posta adresi daha önce kullanılmış mı kontrol et
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor.' });
      }
      
      // Şifre güvenliği kontrolü
      if (password.length < 6) {
        return res.status(400).json({ error: 'Şifre en az 6 karakter uzunluğunda olmalıdır.' });
      }
      
      // Şirket hesabı için şirket adı zorunlu
      if (role === 'company' && (!company || !company.name)) {
        return res.status(400).json({ error: 'Şirket hesabı için şirket adı zorunludur.' });
      }
      
      // Kullanıcı verilerini hazırla
      const newUser = {
        name,
        surname,
        email,
        password: await hashPassword(password), // Güvenli şifreleme
        phone: phone || '',
        role: role || 'customer',
        status: status || 'active',
        company: role === 'company' ? {
          name: company.name,
          taxNumber: company.taxNumber || '',
          address: company.address || '',
          phone: company.phone || ''
        } : null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Kullanıcıyı ekle
      const result = await usersCollection.insertOne(newUser);
      
      // Şifreli veriyi çıkart
      const { password: _, ...userWithoutPassword } = newUser;
      
      return res.status(201).json({
        success: true,
        message: 'Kullanıcı başarıyla oluşturuldu',
        user: {
          ...userWithoutPassword,
          _id: result.insertedId
        }
      });
    }
    
    // Desteklenmeyen HTTP metodu
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Şifre şifreleme fonksiyonu
async function hashPassword(password) {
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
} 