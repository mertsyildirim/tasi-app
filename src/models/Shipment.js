const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

/**
 * Shipment modeli - taşıma işlemlerini takip etmek için kullanılır
 */

// Konum alt şeması
const locationSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  postalCode: {
    type: String
  },
  country: {
    type: String,
    default: 'Türkiye'
  },
  coordinates: {
    lat: {
      type: Number
    },
    lng: {
      type: Number
    }
  }
});

// İletişim bilgileri alt şeması
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  company: {
    type: String
  }
});

// Taşıma şeması
const shipmentSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true
  },
  type: {
    type: String, 
    enum: ['kurye', 'express', 'palet'],
    required: true
  },
  status: {
    type: String, 
    enum: ['created', 'pending', 'assigned', 'in_transit', 'delivered', 'canceled', 'rejected'],
    default: 'created'
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
  driver: {
    type: ObjectId,
    ref: 'User'
  },
  vehicle: {
    type: ObjectId,
    ref: 'Vehicle'
  },
  origin: {
    type: locationSchema,
    required: true
  },
  destination: {
    type: locationSchema,
    required: true
  },
  sender: {
    type: contactSchema,
    required: true
  },
  receiver: {
    type: contactSchema,
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  estimatedDeliveryDate: {
    type: Date
  },
  actualDeliveryDate: {
    type: Date
  },
  weight: {
    type: Number,
    required: true
  },
  volume: {
    type: Number
  },
  value: {
    type: Number
  },
  price: {
    type: Number
  },
  currency: {
    type: String,
    default: 'TRY'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partially_paid', 'canceled'],
    default: 'pending'
  },
  invoice: {
    type: ObjectId,
    ref: 'Invoice'
  },
  notes: {
    type: String
  },
  isFragile: {
    type: Boolean,
    default: false
  },
  requiresRefrigeration: {
    type: Boolean,
    default: false
  },
  trackingCode: {
    type: String
  },
  documents: [{
    type: String
  }],
  statusHistory: [{
    status: {
      type: String,
      enum: ['created', 'pending', 'assigned', 'in_transit', 'delivered', 'canceled', 'rejected']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: ObjectId,
      ref: 'User'
    },
    notes: {
      type: String
    }
  }],
  distance: {
    type: Number
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

// Taşıma oluşturulduğunda otomatik ID oluştur: TRK + yıl son 2 hanesi + 4 haneli sayaç
shipmentSchema.pre('save', async function(next) {
  if (!this.isNew) {
    this.updatedAt = new Date();
    return next();
  }
  
  try {
    // Son ID'yi al ve sayacı artır
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const idPrefix = `TRK${year}`;
    
    // Koleksiyonda bu yıla ait en son kaydı bul
    const lastShipment = await this.constructor.findOne(
      { id: new RegExp(`^${idPrefix}`) },
      { id: 1 },
      { sort: { id: -1 } }
    );
    
    let counter = 0;
    
    if (lastShipment && lastShipment.id) {
      // TRK23XXXX formatından XXXX kısmını al
      const lastCounter = lastShipment.id.substring(5);
      counter = parseInt(lastCounter, 10);
    }
    
    // Yeni sayaç değeri ve ID oluştur
    counter++;
    this.id = `${idPrefix}${counter.toString().padStart(4, '0')}`;
    
    // Durum geçmişi oluştur
    if (!this.statusHistory || this.statusHistory.length === 0) {
      this.statusHistory = [{
        status: this.status,
        timestamp: new Date(),
        updatedBy: this.customer,
        notes: 'Taşıma talebi oluşturuldu'
      }];
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Güncelleme öncesi updatedAt alanını güncelle
shipmentSchema.pre('findOneAndUpdate', function(next) {
  this._update.updatedAt = new Date();
  
  // Durum değişiyorsa, durum geçmişine ekle
  if (this._update.status && this._update.$push === undefined) {
    this._update.$push = {
      statusHistory: {
        status: this._update.status,
        timestamp: new Date(),
        updatedBy: this._update.updatedBy || this._conditions._id, // Güncellemeyi yapan kullanıcı
        notes: this._update.notes || 'Durum güncellendi'
      }
    };
  }
  
  next();
});

module.exports = mongoose.models.Shipment || mongoose.model('Shipment', shipmentSchema); 