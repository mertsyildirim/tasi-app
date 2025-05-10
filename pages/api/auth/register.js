import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { setupCORS, handleOptionsRequest, sendSuccess, sendError, logRequest } from '../../../src/lib/api-utils';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

export default async function handler(req, res) {
  // CORS ayarlarını ekle
  setupCORS(res);
  
  // OPTIONS isteğini işle
  if (handleOptionsRequest(req, res)) {
    return;
  }
  
  // İsteği logla
  logRequest(req);

  // Sadece POST istekleri
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB);

    // Mevcut kullanıcıyı kontrol et
    const existingUser = await db.collection('users').findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor' });
    }

    // Son taşıyıcı ID'sini al
    const lastCarrier = await db.collection('users')
      .findOne(
        { role: 'carrier' },
        { sort: { carrierId: -1 } }
      );

    // Yeni taşıyıcı ID'sini oluştur
    const lastNumber = lastCarrier ? parseInt(lastCarrier.carrierId.replace('TF', '')) : 0;
    const newNumber = lastNumber + 1;
    const carrierId = `TF${newNumber.toString().padStart(3, '0')}`;

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Kullanıcı durumunu belirle
    const status = req.body.documents?.length > 0 ? 'pending' : 'document_required';

    // Yeni kullanıcıyı oluştur
    const newUser = {
      ...req.body,
      password: hashedPassword,
      role: 'carrier',
      carrierId,
      status,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Kullanıcıyı veritabanına kaydet
    const result = await db.collection('users').insertOne(newUser);

    // Hassas bilgileri çıkar
    const { password, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      message: 'Kayıt başarıyla tamamlandı',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Kayıt hatası:', error);
    return res.status(500).json({ error: 'Kayıt işlemi sırasında bir hata oluştu' });
  } finally {
    await client.close();
  }
} 