import { connectToDatabase } from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';
import { validateEmail, validatePassword } from '../../../lib/validation';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const { email, password, name, surname, phone } = req.body;

    // Zorunlu alan kontrolü
    if (!email || !password || !name || !surname || !phone) {
      return res.status(400).json({
        error: 'Eksik bilgi',
        fields: ['email', 'password', 'name', 'surname', 'phone']
      });
    }

    // Email formatı kontrolü
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Geçersiz email formatı' });
    }

    // Şifre güvenliği kontrolü
    if (!validatePassword(password)) {
      return res.status(400).json({ 
        error: 'Şifre en az 8 karakter uzunluğunda olmalı ve en az bir büyük harf, bir küçük harf ve bir rakam içermelidir' 
      });
    }

    // Email kullanımda mı kontrolü
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu email adresi zaten kullanımda' });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluştur
    const newUser = {
      email,
      password: hashedPassword,
      name,
      surname,
      phone,
      role: 'user',
      status: 'active',
      emailVerified: false,
      phoneVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      settings: {
        language: 'tr',
        notifications: {
          email: true,
          sms: true,
          push: true
        },
        theme: 'light'
      }
    };

    const result = await db.collection('users').insertOne(newUser);

    if (!result.insertedId) {
      return res.status(500).json({ error: 'Kullanıcı kaydı oluşturulamadı' });
    }

    // Email doğrulama kodu gönder
    // TODO: Email doğrulama sistemi eklenecek

    // Telefon doğrulama kodu gönder
    // TODO: SMS doğrulama sistemi eklenecek

    delete newUser.password;
    return res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: newUser
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
} 