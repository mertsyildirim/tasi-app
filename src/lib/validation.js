/**
 * Email adresinin geçerli olup olmadığını kontrol eder
 * @param {string} email - Email adresi
 * @returns {boolean} - Email adresi geçerli mi
 */
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Şifrenin güvenlik kriterlerine uyup uymadığını kontrol eder
 * @param {string} password - Şifre
 * @returns {boolean} - Şifre kriterlere uygun mu
 */
export const validatePassword = (password) => {
  // En az 8 karakter, en az bir büyük harf, bir küçük harf ve bir rakam
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

/**
 * Telefon numarasının geçerli olup olmadığını kontrol eder
 * @param {string} phone - Telefon numarası
 * @returns {boolean} - Telefon numarası geçerli mi
 */
export const validatePhone = (phone) => {
  // Türkiye formatlı telefon numarası
  const regex = /^((\+90)|0)[.\- ]?5[0-9][0-9][.\- ]?[0-9]{3}[.\- ]?[0-9]{2}[.\- ]?[0-9]{2}$/;
  return regex.test(phone);
};

/**
 * Plaka numarasının geçerli olup olmadığını kontrol eder
 * @param {string} plate - Plaka numarası
 * @returns {boolean} - Plaka numarası geçerli mi
 */
export const validatePlate = (plate) => {
  // Türkiye plaka formatı
  const regex = /^(0[1-9]|[1-7][0-9]|8[01])(([A-Z]){1,3})([0-9]{1,4})$/;
  return regex.test(plate.replace(/ /g, '').toUpperCase());
};

/**
 * Verilen tarihin geçerli ve bugünden sonra olup olmadığını kontrol eder
 * @param {string} date - Tarih (YYYY-MM-DD)
 * @returns {boolean} - Tarih geçerli mi ve bugünden sonra mı
 */
export const validateFutureDate = (date) => {
  const selectedDate = new Date(date);
  const today = new Date();
  
  // Geçerli bir tarih mi
  if (isNaN(selectedDate.getTime())) {
    return false;
  }
  
  // Bugünden sonra mı
  return selectedDate > today;
};

/**
 * Para miktarının geçerli olup olmadığını kontrol eder
 * @param {number|string} amount - Para miktarı
 * @returns {boolean} - Para miktarı geçerli mi
 */
export const validateAmount = (amount) => {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount >= 0;
}; 