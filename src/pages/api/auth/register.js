import { connectToDatabase } from '../../../lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // Sadece POST istekleri
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, password, name, phone } = req.body;

  // Gerekli alanları kontrol et
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Ad, e-posta ve şifre gereklidir' });
  }

  // E-posta geçerliliğini kontrol et
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: 'Geçerli bir e-posta adresi giriniz' });
  }

  // Şifre geçerliliğini kontrol et (en az 6 karakter)
  if (password.length < 6) {
    return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır' });
  }

  let client;

  try {
    client = await connectToDatabase();
    const db = client.db();
    const usersCollection = db.collection('users');

    // E-posta adresinin benzersiz olduğunu kontrol et
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Bu e-posta adresi zaten kullanılıyor' });
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 12);

    // Yeni kullanıcı oluştur
    const result = await usersCollection.insertOne({
      email,
      password: hashedPassword,
      name,
      phone: phone || '',
      role: 'user',
      status: 'active',
      createdAt: new Date(),
      lastLogin: null
    });

    const newUser = {
      _id: result.insertedId,
      email,
      name,
      phone: phone || '',
      role: 'user',
      status: 'active'
    };

    return res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 