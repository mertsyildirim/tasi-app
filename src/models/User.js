const mongoose = require('mongoose');

// Profil alt şeması
const profileSchema = new mongoose.Schema({
  avatarUrl: {
    type: String,
    default: '/profile-pics/default.png'
  },
  bio: {
    type: String,
    default: ''
  },
  completedOrders: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
});

// Kullanıcı şeması
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim alanı zorunludur'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'E-posta alanı zorunludur'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Şifre alanı zorunludur'],
  },
  phone: {
    type: String,
    trim: true,
  },
  roles: {
    type: [String],
    enum: ['admin', 'customer', 'company', 'driver'],
    default: ['customer']
  },
  companyName: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  taxNumber: {
    type: String,
    trim: true,
  },
  taxOffice: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFreelance: {
    type: Boolean,
    default: false,
  },
  documentStatus: {
    type: String,
    enum: ['NOT_SUBMITTED', 'WAITING_DOCUMENTS', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
    default: 'NOT_SUBMITTED'
  },
  profile: {
    type: profileSchema,
    default: () => ({})
  },
  notifications: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    enum: ['tr', 'en'],
    default: 'tr'
  },
  billingAddress: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Güncelleme öncesi updatedAt alanını güncelle
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Güncelleme öncesi updatedAt alanını güncelle
userSchema.pre('findOneAndUpdate', function(next) {
  this._update.updatedAt = new Date();
  next();
});

// Mongoose models kısmında User modeli zaten tanımlı mı diye kontrol ediyoruz
// Eğer tanımlıysa onu kullanıyoruz, değilse yeni model oluşturuyoruz
module.exports = mongoose.models.User || mongoose.model('User', userSchema); 