import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim alanı zorunludur'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'E-posta alanı zorunludur'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir e-posta adresi giriniz']
  },
  phone: {
    type: String,
    required: [true, 'Telefon numarası zorunludur'],
    trim: true,
    match: [/^5[0-9]{9}$/, 'Geçerli bir telefon numarası giriniz (5XX XXX XX XX)']
  },
  password: {
    type: String,
    required: [true, 'Şifre alanı zorunludur'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır']
  },
  accountType: {
    type: String,
    enum: ['individual', 'corporate'],
    required: [true, 'Hesap tipi zorunludur'],
    default: 'individual'
  },
  companyName: {
    type: String,
    trim: true,
    required: function() {
      return this.accountType === 'corporate';
    }
  },
  taxNumber: {
    type: String,
    trim: true,
    required: function() {
      return this.accountType === 'corporate';
    }
  },
  taxOffice: {
    type: String,
    trim: true,
    required: function() {
      return this.accountType === 'corporate';
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'passive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema); 