'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaEnvelope, FaPhone, FaLock, FaUser, FaBuilding } from 'react-icons/fa'
import Link from 'next/link'
import { getUserFromStorage } from '../utils/auth'

export default function UyeOl() {
  const router = useRouter()
  const [userType, setUserType] = useState('individual')
  
  // Bireysel üyelik için state'ler
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  // Kurumsal üyelik için state'ler
  const [companyName, setCompanyName] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [taxOffice, setTaxOffice] = useState('')
  const [taxNumber, setTaxNumber] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [authorizedName, setAuthorizedName] = useState('')
  const [authorizedPhone, setAuthorizedPhone] = useState('')
  const [companyPassword, setCompanyPassword] = useState('')
  const [confirmCompanyPassword, setConfirmCompanyPassword] = useState('')

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

  const PHONE_REGEX = /^0 \(5\d{2}\) \d{3} \d{2} \d{2}$/
  const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  const TURKISH_CHAR_REGEX = /[çğıöşüÇĞİÖŞÜ]/

  const isEmailValid = (email: string) => {
    if (!email) return false
    if (!email.includes('@')) return false
    if (TURKISH_CHAR_REGEX.test(email)) return false
    return EMAIL_REGEX.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setError('');

    if (!value) {
      setError('Geçerli bir email adresi giriniz');
    } else if (!value.includes('@')) {
      setError('Email adresi @ işareti içermelidir');
    } else if (TURKISH_CHAR_REGEX.test(value)) {
      setError('Email adresinde Türkçe karakter kullanılamaz');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value, phone)
    setPhone(formatted)
    setError('')

    if (!formatted) {
      setError('Geçerli bir telefon numarası giriniz')
    } else if (!PHONE_REGEX.test(formatted)) {
      setError('Telefon numarası 0 (5XX) XXX XX XX formatında olmalıdır')
    }
  }

  const handleAuthorizedPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value, authorizedPhone)
    setAuthorizedPhone(formatted)
    setError('')

    if (formatted && !PHONE_REGEX.test(formatted)) {
      setError('Telefon numarası 0 (5XX) XXX XX XX formatında olmalıdır')
    }
  }

  const handleCompanyPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value, companyPhone)
    setCompanyPhone(formatted)
    setError('')

    if (!formatted) {
      setError('Geçerli bir telefon numarası giriniz')
    } else if (!PHONE_REGEX.test(formatted)) {
      setError('Telefon numarası 0 (5XX) XXX XX XX formatında olmalıdır')
    }
  }

  const handleCompanyEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCompanyEmail(value);
    setError('');

    if (!value) {
      setError('Geçerli bir email adresi giriniz');
    } else if (!value.includes('@')) {
      setError('Email adresi @ işareti içermelidir');
    } else if (TURKISH_CHAR_REGEX.test(value)) {
      setError('Email adresinde Türkçe karakter kullanılamaz');
    }
  };

  const handleRegister = (e: React.MouseEvent) => {
    e.preventDefault()

    // Temel validasyonlar
    if (userType === 'individual') {
      if (!fullName.trim()) {
        setError('Ad Soyad giriniz')
        return
      }
      if (!phone) {
        setError('Geçerli bir telefon numarası giriniz')
        return
      }
      if (!PHONE_REGEX.test(phone)) {
        setError('Telefon numarası 0 (5XX) XXX XX XX formatında olmalıdır')
        return
      }
      if (!email) {
        setError('Geçerli bir email adresi giriniz')
        return
      }
      if (!email.includes('@')) {
        setError('Email adresi @ işareti içermelidir')
        return
      }
      if (TURKISH_CHAR_REGEX.test(email)) {
        setError('Email adresinde Türkçe karakter kullanılamaz')
        return
      }
      if (!EMAIL_REGEX.test(email)) {
        setError('Geçerli bir email adresi giriniz')
        return
      }
      if (password.length < 4) {
        setError('Şifre en az 4 karakter olmalıdır')
        return
      }
      if (password !== confirmPassword) {
        setError('Şifreler eşleşmiyor')
        return
      }
    } else {
      // Kurumsal üye validasyonları
      if (!companyName.trim()) {
        setError('Firma adı giriniz')
        return
      }
      if (!companyAddress.trim()) {
        setError('Firma adresi giriniz')
        return
      }
      if (!taxOffice.trim()) {
        setError('Vergi dairesi giriniz')
        return
      }
      if (!taxNumber.trim() || taxNumber.length < 10) {
        setError('Geçerli bir vergi numarası giriniz')
        return
      }
      if (!companyPhone) {
        setError('Geçerli bir telefon numarası giriniz')
        return
      }
      if (!PHONE_REGEX.test(companyPhone)) {
        setError('Telefon numarası 0 (5XX) XXX XX XX formatında olmalıdır')
        return
      }
      if (!companyEmail) {
        setError('Geçerli bir email adresi giriniz')
        return
      }
      if (!companyEmail.includes('@')) {
        setError('Email adresi @ işareti içermelidir')
        return
      }
      if (TURKISH_CHAR_REGEX.test(companyEmail)) {
        setError('Email adresinde Türkçe karakter kullanılamaz')
        return
      }
      if (!EMAIL_REGEX.test(companyEmail)) {
        setError('Geçerli bir email adresi giriniz')
        return
      }
      if (!authorizedName.trim()) {
        setError('Yetkili adı soyadı giriniz')
        return
      }
      if (authorizedPhone && !PHONE_REGEX.test(authorizedPhone)) {
        setError('Yetkili telefon numarası 0 (5XX) XXX XX XX formatında olmalıdır')
        return
      }
      if (companyPassword.length < 4) {
        setError('Şifre en az 4 karakter olmalıdır')
        return
      }
      if (companyPassword !== confirmCompanyPassword) {
        setError('Şifreler eşleşmiyor')
        return
      }
    }

    // TODO: Kayıt işlemi backend'e gönderilecek
    console.log('Kayıt bilgileri:', {
      userType,
      ...(userType === 'individual' && {
        fullName,
        phone,
        email,
        password
      }),
      ...(userType === 'corporate' && {
        companyName,
        companyAddress,
        taxOffice,
        taxNumber,
        companyPhone,
        companyEmail,
        authorizedName,
        authorizedPhone,
        password: companyPassword
      })
    })
  }

  // Sayfa yüklendiğinde localStorage kontrolü
  useEffect(() => {
    const user = getUserFromStorage()
    if (user) {
      router.push('/profil')
    }
  }, [router])

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-orange-100/20 backdrop-blur-sm">
          {/* Toggle Buttons */}
          <div className="flex mb-10 max-w-md mx-auto">
            <Link
              href="/giris"
              className="flex-1 py-4 text-center font-semibold text-gray-500 border-b border-gray-300 transition-colors hover:text-gray-700"
            >
              Giriş Yap
            </Link>
            <button
              className="flex-1 py-4 text-center font-semibold text-orange-500 border-b-2 border-orange-500"
            >
              Kayıt Ol
            </button>
          </div>

          <form className="space-y-6 max-w-2xl mx-auto" onSubmit={(e) => e.preventDefault()}>
            {/* Üyelik Tipi Seçimi */}
            <div className="flex justify-center space-x-6 mb-8">
              <button
                type="button"
                onClick={() => setUserType('individual')}
                className={`flex items-center px-6 py-3 rounded-xl transition-all duration-200 ${
                  userType === 'individual'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FaUser className="mr-2" />
                Bireysel
              </button>
              <button
                type="button"
                onClick={() => setUserType('corporate')}
                className={`flex items-center px-6 py-3 rounded-xl transition-all duration-200 ${
                  userType === 'corporate'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FaBuilding className="mr-2" />
                Kurumsal
              </button>
            </div>

            {userType === 'individual' ? (
              // Bireysel Üyelik Formu
              <>
                <div className="mb-4">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Ad Soyad"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="registerPhone" className="block text-sm font-medium text-gray-700">
                    Cep Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    id="registerPhone"
                    value={phone}
                    onChange={handlePhoneChange}
                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                      phone && phone.replace(/\D/g, '').length !== 11
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="0 (5XX) XXX XX XX"
                  />
                  {phone && phone.replace(/\D/g, '').length !== 11 && (
                    <p className="text-red-500 text-sm mt-1">
                      Geçerli bir telefon numarası giriniz
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="registerEmail" className="block text-sm font-medium text-gray-700">
                    E-posta Adresi
                  </label>
                  <input
                    type="email"
                    id="registerEmail"
                    value={email}
                    onChange={handleEmailChange}
                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                      email && !isEmailValid(email) ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="ornek@email.com"
                  />
                  {email && !isEmailValid(email) && (
                    <p className="text-red-500 text-sm mt-1">
                      Geçerli bir e-posta adresi giriniz
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="registerPassword" className="block text-sm font-medium text-gray-700">
                    Şifre
                  </label>
                  <input
                    type="password"
                    id="registerPassword"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="••••••••"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Şifre Tekrar
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="••••••••"
                  />
                </div>
              </>
            ) : (
              // Kurumsal Üyelik Formu
              <>
                <div className="mb-4">
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Firma Adı
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700">
                    Firma Adresi
                  </label>
                  <textarea
                    id="companyAddress"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="taxOffice" className="block text-sm font-medium text-gray-700">
                    Vergi Dairesi
                  </label>
                  <input
                    type="text"
                    id="taxOffice"
                    value={taxOffice}
                    onChange={(e) => setTaxOffice(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="taxNumber" className="block text-sm font-medium text-gray-700">
                    Vergi Kimlik No
                  </label>
                  <input
                    type="text"
                    id="taxNumber"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700">
                    E-posta Adresi
                  </label>
                  <input
                    type="email"
                    id="companyEmail"
                    value={companyEmail}
                    onChange={handleCompanyEmailChange}
                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                      companyEmail && !isEmailValid(companyEmail) ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="ornek@email.com"
                  />
                  {companyEmail && !isEmailValid(companyEmail) && (
                    <p className="text-red-500 text-sm mt-1">
                      Geçerli bir e-posta adresi giriniz
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700">
                    Cep Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    id="companyPhone"
                    value={companyPhone}
                    onChange={handleCompanyPhoneChange}
                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                      companyPhone && companyPhone.replace(/\D/g, '').length !== 11
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="0 (5XX) XXX XX XX"
                  />
                  {companyPhone && companyPhone.replace(/\D/g, '').length !== 11 && (
                    <p className="text-red-500 text-sm mt-1">
                      Geçerli bir telefon numarası giriniz
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label htmlFor="authorizedName" className="block text-sm font-medium text-gray-700">
                    Yetkili Adı Soyadı
                  </label>
                  <input
                    type="text"
                    id="authorizedName"
                    value={authorizedName}
                    onChange={(e) => setAuthorizedName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="authorizedPhone" className="block text-sm font-medium text-gray-700">
                    Yetkili Cep Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    id="authorizedPhone"
                    value={authorizedPhone}
                    onChange={handleAuthorizedPhoneChange}
                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                      authorizedPhone && authorizedPhone.replace(/\D/g, '').length !== 11
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="0 (5XX) XXX XX XX (Opsiyonel)"
                  />
                  {authorizedPhone && authorizedPhone.replace(/\D/g, '').length !== 11 && (
                    <p className="text-red-500 text-sm mt-1">
                      Geçerli bir telefon numarası giriniz
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label htmlFor="companyPassword" className="block text-sm font-medium text-gray-700">
                    Şifre
                  </label>
                  <input
                    type="password"
                    id="companyPassword"
                    value={companyPassword}
                    onChange={(e) => setCompanyPassword(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="••••••••"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="confirmCompanyPassword" className="block text-sm font-medium text-gray-700">
                    Şifre Tekrar
                  </label>
                  <input
                    type="password"
                    id="confirmCompanyPassword"
                    value={confirmCompanyPassword}
                    onChange={(e) => setConfirmCompanyPassword(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="••••••••"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              onClick={handleRegister}
              className="w-full flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-lg shadow-orange-500/30 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Kayıt Ol
            </button>
          </form>
        </div>
      </div>
    </main>
  )
} 