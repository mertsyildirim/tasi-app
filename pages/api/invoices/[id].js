import { connectToDatabase } from '../../../lib/db';
import { verify } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Yalnızca GET, PUT ve DELETE isteklerine izin ver
  if (req.method !== 'GET' && req.method !== 'PUT' && req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Fatura ID'sini al
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: 'Fatura ID gerekli' });
  }

  try {
    const { db } = await connectToDatabase();
    
    // Token, kullanıcı doğrulama
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token bulunamadı, yetkilendirme başarısız' });
    }
    
    // Token'ı doğrula
    let userId, userRole;
    try {
      // Token doğrulama
      const decoded = verify(token, process.env.JWT_SECRET || 'tasiapp-super-gizli-jwt-anahtar');
      userId = decoded.userId || decoded.id || decoded._id;
      userRole = decoded.role || decoded.roles?.[0];
      
      if (!userId || !userRole) {
        return res.status(401).json({ message: 'Geçersiz kullanıcı bilgisi' });
      }
    } catch (error) {
      return res.status(401).json({ message: 'Geçersiz token' });
    }
    
    // Faturayı bul
    const invoice = await db.collection('invoices').findOne(
      { $or: [{ id: id }, { _id: new ObjectId(id) }] }
    );
    
    // Fatura bulunamadıysa 404 döndür
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Fatura bulunamadı'
      });
    }
    
    // Yetki kontrolü
    if (userRole !== 'admin' && 
        userRole !== 'carrier' && invoice.carrier !== userId && 
        userRole !== 'customer' && invoice.customer !== userId) {
      return res.status(403).json({ message: 'Bu faturaya erişim yetkiniz yok' });
    }
    
    // GET isteği - Faturayı getir
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        invoice: invoice
      });
    }
    
    // PUT isteği - Faturayı güncelle
    if (req.method === 'PUT') {
      // Yalnızca admin ve carrier rolleri fatura güncelleyebilir
      if (userRole !== 'admin' && (userRole !== 'carrier' || invoice.carrier !== userId)) {
        return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
      }
      
      const { status, dueDate, billingAddress, notes } = req.body;
      
      // Güncelleme nesnesi oluştur
      const updateObj = { updatedAt: new Date() };
      
      if (status) updateObj.status = status;
      if (dueDate) updateObj.dueDate = new Date(dueDate);
      if (billingAddress) updateObj.billingAddress = billingAddress;
      if (notes) updateObj.notes = notes;
      
      // Eğer status paid olarak güncelleniyorsa, paidDate ekle
      if (status === 'paid' && invoice.status !== 'paid') {
        updateObj.paidDate = new Date();
      }
      
      // Faturayı güncelle
      await db.collection('invoices').updateOne(
        { id },
        { $set: updateObj }
      );
      
      // Güncellenmiş faturayı getir
      const updatedInvoice = await db.collection('invoices').findOne({ id });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Fatura başarıyla güncellendi',
        invoice: updatedInvoice
      });
    }
    
    // DELETE isteği - Faturayı sil
    if (req.method === 'DELETE') {
      // Yalnızca admin ve carrier rolleri fatura silebilir
      if (userRole !== 'admin' && (userRole !== 'carrier' || invoice.carrier !== userId)) {
        return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
      }
      
      // Fatura silinmeden önce taşıma kayıtlarından referansı kaldır
      if (invoice.shipments && invoice.shipments.length > 0) {
        await db.collection('shipments').updateMany(
          { _id: { $in: invoice.shipments } },
          { $unset: { invoice: "" } }
        );
      }
      
      // Faturayı sil
      await db.collection('invoices').deleteOne({ id });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Fatura başarıyla silindi'
      });
    }
    
  } catch (error) {
    console.error('Fatura işlemi hatası:', error);
    return res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
} 