const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

// Ödeme şeması
const paymentSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
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
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'canceled'],
    default: 'pending'
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
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'cash', 'other'],
    required: true
  },
  paymentDetails: {
    cardMask: String,
    bankName: String,
    accountNumber: String,
    referenceCode: String
  },
  shipments: [{
    type: ObjectId,
    ref: 'Shipment'
  }],
  totalShipments: {
    type: Number,
    default: 0
  },
  period: {
    type: String
  },
  dueDate: {
    type: Date
  },
  paymentDate: {
    type: Date
  },
  invoice: {
    type: ObjectId,
    ref: 'Invoice'
  },
  notes: {
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

// Ödeme oluşturulduğunda otomatik ID oluştur: PMT + yıl son 2 hanesi + 4 haneli sayaç
paymentSchema.pre('save', async function(next) {
  if (!this.isNew) {
    this.updatedAt = new Date();
    return next();
  }
  
  try {
    // Son ID'yi al ve sayacı artır
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const idPrefix = `PMT${year}`;
    
    // Koleksiyonda bu yıla ait en son kaydı bul
    const lastPayment = await this.constructor.findOne(
      { id: new RegExp(`^${idPrefix}`) },
      { id: 1 },
      { sort: { id: -1 } }
    );
    
    let counter = 0;
    
    if (lastPayment && lastPayment.id) {
      // PMT23XXXX formatından XXXX kısmını al
      const lastCounter = lastPayment.id.substring(5);
      counter = parseInt(lastCounter, 10);
    }
    
    // Yeni sayaç değeri ve ID oluştur
    counter++;
    this.id = `${idPrefix}${counter.toString().padStart(4, '0')}`;
    
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
paymentSchema.pre('findOneAndUpdate', function(next) {
  this._update.updatedAt = new Date();
  next();
});

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema); 