'use client'

import { useState, useEffect } from 'react'
import { FaEnvelope, FaPhone, FaLock } from 'react-icons/fa'
import { validateEmailLogin, validatePhoneLogin, saveUserToStorage, getUserFromStorage } from '../utils/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Giris() {
  const router = useRouter()
  const [loginMethod, setLoginMethod] = useState('email')
  const [showOTP, setShowOTP] = useState(false)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  // Sayfa yüklendiğinde localStorage kontrolü
  useEffect(() => {
    const user = getUserFromStorage()
    if (user) {
      router.push('/profil')
    }
  }, [router])

  // Telefon numarası formatı için
  const formatPhoneNumber = (value: string, previousValue: string) => {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, '')
    
    // Eğer ilk defa 0 yazılıyorsa veya boşsa
    if (numbers === '0' || numbers === '') {
      return '0 ('
    }

    // Eğer backspace ile silme işlemi yapılıyorsa
    if (value.length < previousValue.length) {
      // Eğer son karakter siliniyorsa ve geriye sadece "0 (" kalıyorsa
      if (previousValue === '0 (' || value.length <= 2) {
        return '0 ('
      }
      
      const nums = numbers.startsWith('0') ? numbers.slice(1) : numbers
      if (nums.length <= 3) return `0 (${nums}`
      if (nums.length <= 6) return `0 (${nums.slice(0, 3)}) ${nums.slice(3)}`
      return `0 (${nums.slice(0, 3)}) ${nums.slice(3, 6)} ${nums.slice(6, 10)}`
    }

    // Normal ekleme işlemi
    // 0 ile başlıyorsa onu kaldır
    const nums = numbers.startsWith('0') ? numbers.slice(1) : numbers
    if (nums.length <= 3) return `0 (${nums}`
    if (nums.length <= 6) return `0 (${nums.slice(0, 3)}) ${nums.slice(3)}`
    return `0 (${nums.slice(0, 3)}) ${nums.slice(3, 6)} ${nums.slice(6, 10)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value, phone)
    setPhone(formatted)
    setError('')
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
  };

  const isEmailValid = (email: string) => {
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const result = await validateEmailLogin(email, password)
    if (result.success) {
      saveUserToStorage(result.user, rememberMe)
      router.push('/profil')
    } else {
      setError(result.error)
    }
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!showOTP) {
      setShowOTP(true)
      return
    }

    const result = await validatePhoneLogin(phone, otpCode)
    if (result.success) {
      saveUserToStorage(result.user, rememberMe)
      router.push('/profil')
    } else {
      setError(result.error)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-orange-100/20 backdrop-blur-sm">
          {/* Toggle Buttons */}
          <div className="flex mb-10 max-w-md mx-auto">
            <button
              className="flex-1 py-4 text-center font-semibold text-orange-500 border-b-2 border-orange-500"
            >
              Giriş Yap
            </button>
            <Link
              href="/kayit-ol"
              className="flex-1 py-4 text-center font-semibold text-gray-500 border-b border-gray-300 transition-colors hover:text-gray-700"
            >
              Kayıt Ol
            </Link>
          </div>

          {/* Giriş Yöntemi Seçimi */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-4 mb-8">
              <button
                className={`flex-1 py-3 px-6 rounded-xl transition-all duration-200 ${
                  loginMethod === 'email'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => {
                  setLoginMethod('email')
                  setShowOTP(false)
                }}
              >
                <FaEnvelope className="inline mr-2" />
                E-posta
              </button>
              <button
                className={`flex-1 py-3 px-6 rounded-xl transition-all duration-200 ${
                  loginMethod === 'phone'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => {
                  setLoginMethod('phone')
                  setShowOTP(false)
                }}
              >
                <FaPhone className="inline mr-2" />
                Telefon
              </button>
            </div>

            {loginMethod === 'email' ? (
              <form className="space-y-6" onSubmit={handleEmailLogin}>
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="loginId">
                    E-posta Adresi
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">
                      <FaEnvelope />
                    </span>
                    <input
                      type="email"
                      id="loginId"
                      value={email}
                      onChange={handleEmailChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        email && !isEmailValid(email) ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="demo@demo.com"
                    />
                  </div>
                  {email && !isEmailValid(email) && (
                    <p className="text-red-500 text-sm mt-1">
                      Geçerli bir e-posta adresi giriniz
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="password">
                    Şifre
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">
                      <FaLock />
                    </span>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="demo"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="text-sm text-gray-600">Beni Hatırla</span>
                  </label>
                  <a href="#" className="text-sm text-orange-500 hover:text-orange-600 transition-colors">
                    Şifremi Unuttum
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={!isEmailValid(email) || !password}
                  className={`w-full py-3 px-6 rounded-xl transition-all duration-200 ${
                    isEmailValid(email) && password
                      ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/30'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Giriş Yap
                </button>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handlePhoneSubmit}>
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="phoneNumber">
                    Telefon Numarası
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">
                      <FaPhone />
                    </span>
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={phone}
                      onChange={handlePhoneChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        phone && phone.replace(/\D/g, '').length !== 11
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="0 (5XX) XXX XX XX"
                    />
                  </div>
                  {phone && phone.replace(/\D/g, '').length !== 11 && (
                    <p className="text-red-500 text-sm mt-1">
                      Geçerli bir telefon numarası giriniz
                    </p>
                  )}
                </div>

                {showOTP ? (
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="otpCode">
                      Doğrulama Kodu
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">
                        <FaLock />
                      </span>
                      <input
                        type="text"
                        id="otpCode"
                        value={otpCode}
                        onChange={(e) => {
                          setOtpCode(e.target.value);
                          setError('');
                        }}
                        maxLength={6}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="123456"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {phone} numarasına gönderilen 6 haneli kodu giriniz
                    </p>
                    <button
                      type="button"
                      className="w-full mt-4 text-orange-500 hover:text-orange-600 transition-colors"
                      onClick={() => {
                        setShowOTP(false);
                        setPhone('');
                        setOtpCode('');
                        setError('');
                      }}
                    >
                      Numarayı Değiştir
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="text-sm text-gray-600">Beni Hatırla</span>
                  </div>
                )}

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={showOTP ? otpCode.length !== 6 : phone.replace(/\D/g, '').length !== 11}
                  className={`w-full py-3 px-6 rounded-xl transition-all duration-200 ${
                    (showOTP ? otpCode.length === 6 : phone.replace(/\D/g, '').length === 11)
                      ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/30'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {showOTP ? 'Giriş Yap' : 'Doğrulama Kodu Gönder'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  )
} 