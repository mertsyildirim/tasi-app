import { connectToDatabase } from '../../../lib/db';
import { getSession } from 'next-auth/react';
import { verify } from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
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
    
    // GET isteği - Faturaları listele
    if (req.method === 'GET') {
      // Query parametreleri
      const limit = parseInt(req.query.limit) || 10;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;
      const status = req.query.status || null;
      
      // Filtreleme seçenekleri oluştur
      let filter = {};
      
      // Role göre filtreleme
      if (userRole === 'admin') {
        // Admin tüm faturaları görebilir
      } else if (userRole === 'carrier') {
        filter.carrier = userId;
      } else {
        filter.customer = userId;
      }
      
      if (status) {
        filter.status = status;
      }
      
      // Faturaları getir
      const invoices = await db.collection('invoices')
        .find(filter)
        .sort({ issueDate: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
      
      // Toplam fatura sayısını getir
      const total = await db.collection('invoices').countDocuments(filter);
      
      // Sonuç döndür
      return res.status(200).json({
        success: true,
        count: invoices.length,
        invoices: invoices.length > 0 ? invoices : []
      });
    }
    
    // POST isteği - Yeni fatura oluştur
    if (req.method === 'POST') {
      // Sadece admin ve carrier rolleri fatura oluşturabilir
      if (userRole !== 'admin' && userRole !== 'carrier') {
        return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
      }
      
      const { 
        customer, carrier, type, amount, tax, totalAmount, currency,
        items, status, issueDate, dueDate, period, shipments, billingAddress, notes 
      } = req.body;
      
      // Zorunlu alanları kontrol et
      if (!customer || !amount || !totalAmount || !items || !issueDate || !dueDate) {
        return res.status(400).json({ message: 'Zorunlu alanlar eksik' });
      }
      
      // Yeni fatura oluştur
      const today = new Date();
      const year = today.getFullYear().toString().substr(-2);
      
      // Son ID'yi al
      const lastInvoice = await db.collection('invoices')
        .find({ id: new RegExp(`^INV${year}`) })
        .sort({ id: -1 })
        .limit(1)
        .toArray();
      
      let counter = 0;
      if (lastInvoice.length > 0) {
        const lastId = lastInvoice[0].id;
        counter = parseInt(lastId.substring(5), 10);
      }
      
      counter++;
      const id = `INV${year}${counter.toString().padStart(4, '0')}`;
      const invoiceNo = `F-${today.getFullYear()}-${counter.toString().padStart(4, '0')}`;
      
      const newInvoice = {
        id,
        invoiceNo,
        type: type || 'service',
        amount,
        tax: tax || 0,
        totalAmount,
        currency: currency || 'TRY',
        status: status || 'draft',
        customer,
        carrier: carrier || userId,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        period: period || '',
        shipments: shipments || [],
        totalShipments: shipments ? shipments.length : 0,
        items,
        billingAddress,
        notes,
        createdAt: today,
        updatedAt: today
      };
      
      const result = await db.collection('invoices').insertOne(newInvoice);
      
      // Taşıma kayıtlarını güncelle
      if (shipments && shipments.length > 0) {
        await Promise.all(shipments.map(shipmentId => 
          db.collection('shipments').updateOne(
            { _id: shipmentId },
            { $set: { invoice: id } }
          )
        ));
      }
      
      return res.status(201).json({
        success: true,
        invoice: { ...newInvoice, _id: result.insertedId }
      });
    }
    
  } catch (error) {
    console.error('Faturalar API hatası:', error);
    return res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
} 