import { connectToDatabase } from '../../../src/lib/mongodb';
import jwt from 'jsonwebtoken';
import appConfig from '../../../lib/config';

// API_CONFIG yerine appConfig kullanacağız
const API_CONFIG = appConfig;

// CORS yapılandırması
export const config = {
  api: {
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  // CORS için header'lar
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // OPTIONS isteği kontrolü
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sadece GET, POST, PUT ve DELETE isteklerine izin ver
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Token kontrolü
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token bulunamadı' });
    }

    // Token doğrulama
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, API_CONFIG.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Geçersiz token', error: error.message });
    }

    // Admin kontrolü
    const { userId, role: userRole } = decodedToken;
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    // Veritabanı bağlantısı
    const { db } = await connectToDatabase();

    // GET isteği - Faturaları listele
    if (req.method === 'GET') {
      // Query parametreleri
      const limit = parseInt(req.query.limit) || 10;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;
      const status = req.query.status || null;
      const search = req.query.search || null;
      const customerId = req.query.customerId || null;
      const carrierId = req.query.carrierId || null;
      const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

      // Filtreleme seçenekleri oluştur
      let filter = {};
      
      if (status) {
        filter.status = status;
      }
      
      if (customerId) {
        filter.customer = customerId;
      }
      
      if (carrierId) {
        filter.carrier = carrierId;
      }
      
      // Tarih aralığı filtrelemesi
      if (startDate || endDate) {
        filter.issueDate = {};
        if (startDate) filter.issueDate.$gte = startDate;
        if (endDate) filter.issueDate.$lte = endDate;
      }
      
      // Arama filtrelemesi
      if (search) {
        filter.$or = [
          { id: { $regex: search, $options: 'i' } },
          { invoiceNo: { $regex: search, $options: 'i' } }
        ];
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
      
      // İstatistikler
      const stats = await getInvoiceStats(db, filter);
      
      return res.status(200).json({
        success: true,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        stats,
        invoices
      });
    }
    
    // POST isteği - Yeni fatura oluştur
    if (req.method === 'POST') {
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
        tax,
        totalAmount,
        currency: currency || 'TRY',
        status: status || 'pending',
        customer,
        carrier,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        period,
        items,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Opsiyonel alanlar
      if (billingAddress) newInvoice.billingAddress = billingAddress;
      if (notes) newInvoice.notes = notes;
      
      // Shipments varsa ekle
      if (shipments && shipments.length > 0) {
        newInvoice.shipments = shipments;
        newInvoice.totalShipments = shipments.length;
        
        // Shipment koleksiyonunda ilgili kayıtlara fatura referansı ekle
        await db.collection('shipments').updateMany(
          { _id: { $in: shipments } },
          { $set: { invoice: id } }
        );
      }
      
      // Faturayı kaydet
      await db.collection('invoices').insertOne(newInvoice);
      
      return res.status(201).json({ 
        success: true, 
        message: 'Fatura başarıyla oluşturuldu',
        invoice: newInvoice
      });
    }
    
    // PUT isteği - Faturayı güncelle
    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ message: 'Fatura ID gerekli' });
      }
      
      // Faturayı bul
      const invoice = await db.collection('invoices').findOne({ id });
      if (!invoice) {
        return res.status(404).json({ message: 'Fatura bulunamadı' });
      }
      
      const { 
        status, dueDate, billingAddress, notes, 
        items, amount, tax, totalAmount, shipments 
      } = req.body;
      
      // Güncelleme nesnesi oluştur
      const updateObj = { updatedAt: new Date() };
      
      // Temel alanları güncelle
      if (status) updateObj.status = status;
      if (dueDate) updateObj.dueDate = new Date(dueDate);
      if (billingAddress) updateObj.billingAddress = billingAddress;
      if (notes) updateObj.notes = notes;
      
      // Tutar bilgilerini güncelle
      if (items) updateObj.items = items;
      if (amount) updateObj.amount = amount;
      if (tax) updateObj.tax = tax;
      if (totalAmount) updateObj.totalAmount = totalAmount;
      
      // Eğer status paid olarak güncelleniyorsa, paidDate ekle
      if (status === 'paid' && invoice.status !== 'paid') {
        updateObj.paidDate = new Date();
      }
      
      // Shipment bilgilerini güncelle
      if (shipments) {
        updateObj.shipments = shipments;
        updateObj.totalShipments = shipments.length;
        
        // Eski shipment referanslarını kaldır
        if (invoice.shipments && invoice.shipments.length > 0) {
          await db.collection('shipments').updateMany(
            { _id: { $in: invoice.shipments } },
            { $unset: { invoice: "" } }
          );
        }
        
        // Yeni shipment referanslarını ekle
        await db.collection('shipments').updateMany(
          { _id: { $in: shipments } },
          { $set: { invoice: id } }
        );
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
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ message: 'Fatura ID gerekli' });
      }
      
      // Faturayı bul
      const invoice = await db.collection('invoices').findOne({ id });
      if (!invoice) {
        return res.status(404).json({ message: 'Fatura bulunamadı' });
      }
      
      // Shipment referanslarını kaldır
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

// Fatura istatistiklerini getir
async function getInvoiceStats(db, baseFilter = {}) {
  try {
    // Toplam fatura sayısı
    const totalCount = await db.collection('invoices').countDocuments(baseFilter);
    
    // Durum bazlı fatura sayıları
    const statusCounts = await db.collection('invoices').aggregate([
      { $match: baseFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]).toArray();
    
    // İstatistik nesnesini oluştur
    let stats = {
      total: totalCount,
      paid: 0,
      pending: 0,
      overdue: 0,
      cancelled: 0
    };
    
    // Durum bazlı sayıları ekle
    statusCounts.forEach(item => {
      if (item._id in stats) {
        stats[item._id] = item.count;
      }
    });
    
    // Toplam tutar ve ödemeler
    const amounts = await db.collection('invoices').aggregate([
      { $match: baseFilter },
      { $group: { 
        _id: null, 
        totalAmount: { $sum: "$totalAmount" },
        paidAmount: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$totalAmount", 0] } },
        pendingAmount: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$totalAmount", 0] } }
      }}
    ]).toArray();
    
    if (amounts.length > 0) {
      stats.totalAmount = amounts[0].totalAmount || 0;
      stats.paidAmount = amounts[0].paidAmount || 0;
      stats.pendingAmount = amounts[0].pendingAmount || 0;
    }
    
    return stats;
  } catch (error) {
    console.error('Fatura istatistikleri hatası:', error);
    return {
      total: 0,
      paid: 0,
      pending: 0,
      overdue: 0,
      cancelled: 0,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0
    };
  }
} 