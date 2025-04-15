// Uygulama yapılandırma ayarları
const config = {
  // API URL'leri
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || '',
  
  // Para birimi ayarları
  currency: {
    code: 'TRY',
    symbol: '₺',
    name: 'Türk Lirası',
    locale: 'tr-TR'
  },
  
  // Tarih formatları
  dateFormats: {
    short: 'dd.MM.yyyy',
    long: 'dd MMMM yyyy',
    iso: 'yyyy-MM-dd',
    time: 'HH:mm',
    dateTime: 'dd.MM.yyyy HH:mm'
  },
  
  // Fatura ayarları
  invoice: {
    taxRate: 0.18,
    prefix: 'INV'
  },
  
  // Dosya yükleme limitleri
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf']
  }
};

module.exports = config; 