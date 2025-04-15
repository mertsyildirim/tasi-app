const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

// Fatura şeması
const invoiceSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true
  },
  invoiceNo: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['service', 'product', 'refund', 'other'],
    default: 'service'
  },
  amount: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['TRY', 'USD', 'EUR'],
    default: 'TRY'
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'paid', 'canceled', 'overdue'],
    default: 'draft'
  },
  customer: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  carrier: {
    type: ObjectId,
    ref: 'User'
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: {
    type: Date
  },
  period: {
    type: String
  },
  shipments: [{
    type: ObjectId,
    ref: 'Shipment'
  }],
  totalShipments: {
    type: Number,
    default: 0
  },
  payments: [{
    type: ObjectId,
    ref: 'Payment'
  }],
  items: [{
    description: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    },
    unitPrice: {
      type: Number,
      required: true
    },
    taxRate: {
      type: Number,
      default: 0
    },
    amount: {
      type: Number,
      required: true
    }
  }],
  billingAddress: {
    name: String,
    company: String,
    taxId: String,
    taxOffice: String,
    address: String,
    city: String,
    postalCode: String,
    country: String
  },
  notes: {
    type: String
  },
  fileUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Fatura oluşturulduğunda otomatik ID ve fatura numarası oluştur
invoiceSchema.pre('save', async function(next) {
  if (!this.isNew) {
    this.updatedAt = new Date();
    return next();
  }
  
  try {
    // Son ID'yi al ve sayacı artır
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const idPrefix = `INV${year}`;
    
    // Koleksiyonda bu yıla ait en son kaydı bul
    const lastInvoice = await this.constructor.findOne(
      { id: new RegExp(`^${idPrefix}`) },
      { id: 1 },
      { sort: { id: -1 } }
    );
    
    let counter = 0;
    
    if (lastInvoice && lastInvoice.id) {
      // INV23XXXX formatından XXXX kısmını al
      const lastCounter = lastInvoice.id.substring(5);
      counter = parseInt(lastCounter, 10);
    }
    
    // Yeni sayaç değeri ve ID oluştur
    counter++;
    this.id = `${idPrefix}${counter.toString().padStart(4, '0')}`;
    
    // Fatura numarası oluştur (örnek: F-2024-0123)
    if (!this.invoiceNo) {
      const fullYear = date.getFullYear();
      this.invoiceNo = `F-${fullYear}-${counter.toString().padStart(4, '0')}`;
    }
    
    // Toplam taşıma sayısını kaydet
    if (this.shipments && this.shipments.length > 0) {
      this.totalShipments = this.shipments.length;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Güncelleme öncesi updatedAt alanını güncelle
invoiceSchema.pre('findOneAndUpdate', function(next) {
  this._update.updatedAt = new Date();
  next();
});

module.exports = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema); 