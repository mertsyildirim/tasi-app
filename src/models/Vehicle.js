import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
  licensePlate: {
    type: String,
    required: [true, 'Plaka numarası gereklidir'],
    unique: true,
    trim: true
  },
  make: {
    type: String,
    required: [true, 'Araç markası gereklidir'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Araç modeli gereklidir'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Araç model yılı gereklidir']
  },
  type: {
    type: String,
    enum: ['Kamyon', 'Tır', 'Kamyonet', 'Panel Van', 'Frigorifik', 'Diğer'],
    required: [true, 'Araç tipi gereklidir']
  },
  capacity: {
    weight: {
      type: Number, // kg cinsinden
      required: [true, 'Ağırlık kapasitesi gereklidir']
    },
    volume: {
      type: Number, // m³ cinsinden
      required: [true, 'Hacim kapasitesi gereklidir']
    },
    length: {
      type: Number, // metre cinsinden
      required: [true, 'Uzunluk kapasitesi gereklidir']
    }
  },
  features: {
    isRefrigerated: {
      type: Boolean,
      default: false
    },
    hasTailLift: {
      type: Boolean,
      default: false
    },
    hasTrackingSystem: {
      type: Boolean,
      default: false
    },
    hasAirSuspension: {
      type: Boolean,
      default: false
    }
  },
  documents: {
    insurance: {
      number: {
        type: String,
        trim: true
      },
      expiryDate: {
        type: Date
      },
      isValid: {
        type: Boolean,
        default: true
      }
    },
    inspection: {
      date: {
        type: Date
      },
      expiryDate: {
        type: Date
      },
      isValid: {
        type: Boolean,
        default: true
      }
    }
  },
  maintenanceHistory: [{
    date: {
      type: Date,
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    cost: {
      type: Number
    },
    mileage: {
      type: Number
    }
  }],
  currentDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Araç sahibi (taşıyıcı) ID gereklidir']
  },
  status: {
    type: String,
    enum: ['Aktif', 'Bakımda', 'Müsait Değil', 'Arızalı'],
    default: 'Aktif'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  currentLocation: {
    type: String,
    trim: true
  },
  mileage: {
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
}, {
  timestamps: true
});

// Eğer Vehicle modeli zaten tanımlanmış ise onu kullan, yoksa yeni model oluştur
export default mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema); 