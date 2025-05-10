import { connectToDatabase } from '../../../src/lib/mongodb';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // Yalnızca GET isteklerine izin ver
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Kullanıcı oturumunu kontrol et
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Yetkilendirme hatası. Oturum bulunamadı.' });
    }
    
    // Token'ı çıkar ve oturumu doğrula
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Geçersiz token' });
    }
    
    // Token'dan kullanıcı bilgilerini çıkar
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tasiapp-super-gizli-jwt-anahtar');
    const userId = decoded.userId || decoded.id || decoded._id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Geçersiz kullanıcı bilgisi' });
    }
    
    // Veritabanına bağlan
    const { db } = await connectToDatabase();
    
    // Son faturaları getir
    const invoices = await db.collection('invoices')
      .find({ customer: userId })
      .sort({ issueDate: -1 })
      .limit(5)
      .toArray();
    
    // Response olarak faturaları döndür
    return res.status(200).json({
      success: true,
      count: invoices.length,
      invoices: invoices
    });
    
  } catch (error) {
    console.error('Son faturalar getirme hatası:', error);
    
    // Hata durumunda gerçek hata yanıtı dön
    return res.status(500).json({ 
      success: false, 
      message: 'Fatura verileri alınırken bir hata oluştu', 
      error: error.message 
    });
  }
} 