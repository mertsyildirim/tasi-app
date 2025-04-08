import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ad ve soyad gereklidir'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'E-posta adresi gereklidir'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Geçerli bir e-posta adresi giriniz']
  },
  password: {
    type: String,
    required: [true, 'Şifre gereklidir'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır']
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['carrier', 'driver', 'admin'],
    default: 'carrier'
  },
  company: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  taxNumber: {
    type: String,
    trim: true
  },
  taxOffice: {
    type: String,
    trim: true
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
  timestamps: true // createdAt ve updatedAt alanlarını otomatik günceller
});

// Eğer User modeli zaten tanımlanmış ise onu kullan, yoksa yeni model oluştur
export default mongoose.models.User || mongoose.model('User', UserSchema); 