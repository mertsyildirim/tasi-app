// Local Storage Keys
export const USER_STORAGE_KEY = 'tasiapp_user'
export const REMEMBER_ME_KEY = 'tasiapp_remember_me'

// Test User Credentials
const TEST_USERS = {
  individual: {
    email: 'demo@demo.com',
    password: 'demo',
    fullName: 'Demo Kullanıcı',
    phone: '0 (555) 555 55 55',
    type: 'individual'
  },
  corporate: {
    email: 'kurumsal@demo.com',
    password: 'demo',
    companyName: 'Demo Şirket',
    authorizedName: 'Demo Yetkili',
    phone: '0 (555) 555 55 55',
    type: 'corporate'
  }
}

// Kullanıcı bilgilerini localStorage'a kaydetme
export const saveUserToStorage = (user: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  }
}

// Kullanıcı bilgilerini localStorage'dan alma
export const getUserFromStorage = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem(USER_STORAGE_KEY)
    return user ? JSON.parse(user) : null
  }
  return null
}

// Kullanıcı çıkışı
export const logoutUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_STORAGE_KEY)
  }
}

// Email ile giriş doğrulama
export const validateEmailLogin = (email: string, password: string) => {
  const individualUser = TEST_USERS.individual
  const corporateUser = TEST_USERS.corporate

  if (email === individualUser.email && password === individualUser.password) {
    return {
      success: true,
      user: {
        email: individualUser.email,
        fullName: individualUser.fullName,
        phone: individualUser.phone,
        type: individualUser.type
      }
    }
  }

  if (email === corporateUser.email && password === corporateUser.password) {
    return {
      success: true,
      user: {
        email: corporateUser.email,
        companyName: corporateUser.companyName,
        authorizedName: corporateUser.authorizedName,
        phone: corporateUser.phone,
        type: corporateUser.type
      }
    }
  }

  return {
    success: false,
    error: 'Geçersiz email veya şifre'
  }
}

// Telefon ile giriş doğrulama
export const validatePhoneLogin = (phone: string, otp: string) => {
  const formattedPhone = phone.replace(/\D/g, '')
  const individualUser = TEST_USERS.individual
  const corporateUser = TEST_USERS.corporate

  if (formattedPhone === individualUser.phone.replace(/\D/g, '') && otp === '123456') {
    return {
      success: true,
      user: {
        email: individualUser.email,
        fullName: individualUser.fullName,
        phone: individualUser.phone,
        type: individualUser.type
      }
    }
  }

  if (formattedPhone === corporateUser.phone.replace(/\D/g, '') && otp === '123456') {
    return {
      success: true,
      user: {
        email: corporateUser.email,
        companyName: corporateUser.companyName,
        authorizedName: corporateUser.authorizedName,
        phone: corporateUser.phone,
        type: corporateUser.type
      }
    }
  }

  return {
    success: false,
    error: otp ? 'Geçersiz doğrulama kodu' : 'Geçersiz telefon numarası'
  }
} 