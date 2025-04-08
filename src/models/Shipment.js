import mongoose from 'mongoose';

const ShipmentSchema = new mongoose.Schema({
  trackingNo: {
    type: String,
    required: [true, 'Takip numarası gereklidir'],
    unique: true,
    trim: true
  },
  sender: {
    name: {
      type: String,
      required: [true, 'Gönderici adı gereklidir'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Gönderici telefon numarası gereklidir'],
      trim: true
    },
    company: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Gönderici adresi gereklidir'],
      trim: true
    }
  },
  receiver: {
    name: {
      type: String,
      required: [true, 'Alıcı adı gereklidir'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Alıcı telefon numarası gereklidir'],
      trim: true
    },
    company: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Alıcı adresi gereklidir'],
      trim: true
    }
  },
  from: {
    type: String,
    required: [true, 'Çıkış noktası gereklidir'],
    trim: true
  },
  to: {
    type: String,
    required: [true, 'Varış noktası gereklidir'],
    trim: true
  },
  cargoDetails: {
    weight: {
      type: Number,
      required: [true, 'Kargo ağırlığı gereklidir']
    },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number }
    },
    items: [{
      name: { type: String, trim: true },
      quantity: { type: Number, default: 1 },
      description: { type: String, trim: true }
    }],
    description: {
      type: String,
      trim: true
    },
    isFragile: {
      type: Boolean,
      default: false
    }
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  carrier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Taşıyıcı ID gereklidir']
  },
  status: {
    type: String,
    enum: ['Hazırlanıyor', 'Yükleniyor', 'Yolda', 'Teslim Edildi', 'İptal Edildi'],
    default: 'Hazırlanıyor'
  },
  price: {
    amount: {
      type: Number,
      required: [true, 'Fiyat gereklidir']
    },
    currency: {
      type: String,
      enum: ['TRY', 'USD', 'EUR'],
      default: 'TRY'
    }
  },
  estimatedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  },
  trackingHistory: [{
    status: { 
      type: String,
      required: true 
    },
    location: { 
      type: String,
      trim: true
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    },
    notes: { 
      type: String, 
      trim: true
    }
  }],
  pickupDate: {
    type: Date,
    required: [true, 'Alım tarihi gereklidir']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Eğer Shipment modeli zaten tanımlanmış ise onu kullan, yoksa yeni model oluştur
export default mongoose.models.Shipment || mongoose.model('Shipment', ShipmentSchema); 