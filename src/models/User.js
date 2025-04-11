const mongoose = require('mongoose');

// Kullanıcı için şema oluşturulması
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: false,
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  companyName: {
    type: String,
    required: false,
    trim: true,
  },
  address: {
    type: String,
    required: false,
    trim: true,
  },
  taxNumber: {
    type: String,
    required: false,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Mongoose models kısmında User modeli zaten tanımlı mı diye kontrol ediyoruz
// Eğer tanımlıysa onu kullanıyoruz, değilse yeni model oluşturuyoruz
module.exports = mongoose.models.User || mongoose.model('User', userSchema); 