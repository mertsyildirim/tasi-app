import { connectToDatabase } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    
    const today = new Date();
    
    // Faturalar - boş dizi kullanıyoruz
    const invoices = [];
    
    // Ödemeler - boş dizi kullanıyoruz
    const payments = [];
    
    // Önce mevcut verileri sil
    await db.collection('invoices').deleteMany({});
    await db.collection('payments').deleteMany({});
    
    // Boş veri olduğu için ekleme yapmıyoruz
    
    res.status(200).json({
      message: 'Tüm ödeme ve fatura kayıtları temizlendi',
      invoicesCount: 0,
      paymentsCount: 0
    });
    
  } catch (error) {
    console.error('Payments-invoices temizleme hatası:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
} 