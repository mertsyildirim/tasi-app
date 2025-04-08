// API konfigürasyon ayarları
export const API_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'tasiapp-super-gizli-jwt-anahtar',
  JWT_EXPIRE: '7d', // 7 gün
  COOKIE_EXPIRE: 7, // 7 gün
  SALT_ROUNDS: 10, // Şifre hashleme için salt rounds
  PAGE_LIMIT: 10 // Sayfalama için limit
}; 