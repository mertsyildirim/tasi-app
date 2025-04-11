'use client'

import React, { useState, useEffect } from 'react'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaTruck, FaSpinner, FaSignInAlt, FaKey } from 'react-icons/fa'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import Image from 'next/image'

// Admin kullanıcı bilgileri
const ADMIN_USERS = [
  {
    email: 'admin@tasiapp.com',
    password: 'Admin123!',
    name: 'Admin Kullanıcı',
    role: 'admin'
  },
  {
    email: 'superadmin@tasiapp.com',
    password: 'Super123!',
    name: 'Süper Admin',
    role: 'admin'
  }
];

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState('')
  
  useEffect(() => {
    // Kullanıcı zaten giriş yapmış mı kontrol et
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user && (user.type === 'admin' || user.role === 'admin')) {
          console.log('Kullanıcı zaten giriş yapmış, yönlendiriliyor');
          window.location.href = '/admin/dashboard';
        }
      } catch (err) {
        console.error('Kullanıcı bilgisi çözümlenirken hata:', err);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    // Email ve şifre validasyonu
    if (!email || !password) {
      setError('Lütfen e-posta ve şifrenizi giriniz')
      setLoading(false)
      return
    }

    try {
      // Email formatı kontrolü
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Geçerli bir e-posta adresi giriniz')
        setLoading(false)
        return
      }

      // Simüle edilmiş API çağrısı için bekletme
      await new Promise(resolve => setTimeout(resolve, 800));

      // Admin kullanıcı kontrolü
      const user = ADMIN_USERS.find(u => u.email === email && u.password === password);
      
      if (user) {
        setSuccessMessage('Giriş başarılı! Yönlendiriliyorsunuz...');
        
        // Kullanıcı bilgilerini localStorage'a kaydet
        const userData = {
          email: user.email,
          name: user.name,
          type: user.role,
          role: user.role,
          company: 'Taşı Lojistik',
          isAdmin: true
        };
        
        // Önce localStorage'ı temizleyelim
        localStorage.removeItem('user');
        
        // Ardından kullanıcı bilgilerini ekleyelim
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('Kullanıcı giriş yaptı:', userData);
        
        // Admin paneline yönlendir
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 1000);
      } else {
        setError('Hatalı e-posta veya şifre. Lütfen bilgilerinizi kontrol ediniz.');
      }
    } catch (err) {
      setError('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyiniz.');
      console.error('Giriş hatası:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setForgotError('')
    setForgotSuccess('')
    setForgotLoading(true)

    if (!forgotEmail) {
      setForgotError('Lütfen e-posta adresinizi giriniz')
      setForgotLoading(false)
      return
    }

    try {
      // Email formatı kontrolü
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(forgotEmail)) {
        setForgotError('Geçerli bir e-posta adresi giriniz')
        setForgotLoading(false)
        return
      }

      // Simüle edilmiş API çağrısı
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Admin kullanıcısı mı kontrol et
      const isAdmin = ADMIN_USERS.some(u => u.email === forgotEmail);
      
      if (isAdmin) {
        setForgotSuccess('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen e-postanızı kontrol ediniz.');
        
        // 5 saniye sonra şifremi unuttum panelini kapat
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotEmail('');
          setForgotSuccess('');
        }, 5000);
      } else {
        setForgotError('Bu e-posta adresi sistemde kayıtlı değil');
      }
    } catch (err) {
      setForgotError('İşlem sırasında bir hata oluştu. Lütfen tekrar deneyiniz.');
      console.error('Şifremi unuttum hatası:', err);
    } finally {
      setForgotLoading(false);
    }
  }

  const toggleForgotPassword = () => {
    setShowForgotPassword(!showForgotPassword)
    setForgotError('')
    setForgotSuccess('')
    setForgotEmail('')
  }

  return (
    <>
      <Head>
        <title>Yönetici Girişi | Taşı.app</title>
        <meta name="description" content="Taşı.app yönetici paneli giriş sayfası" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4 rounded-full shadow-lg">
              <FaTruck className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Taşı.app Yönetici Paneli
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Lojistik ve taşıma süreçlerinizi yönetin
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200">
            {showForgotPassword ? (
              // Şifremi unuttum formu
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Şifremi Unuttum</h3>
                <p className="text-sm text-gray-600 mb-4">
                  E-posta adresinizi girin, şifre sıfırlama bağlantısını göndereceğiz.
                </p>
                
                {forgotError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{forgotError}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {forgotSuccess && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm text-green-700">{forgotSuccess}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <form className="space-y-6" onSubmit={handleForgotPassword}>
                  <div>
                    <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700">
                      E-posta Adresi
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="forgot-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-none"
                        placeholder="admin@tasiapp.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        disabled={forgotLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={toggleForgotPassword}
                      className="text-sm font-medium text-orange-600 hover:text-orange-500"
                      disabled={forgotLoading}
                    >
                      Giriş sayfasına dön
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-400"
                      disabled={forgotLoading}
                    >
                      {forgotLoading ? (
                        <>
                          <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <FaKey className="-ml-1 mr-2 h-4 w-4" />
                          Şifremi Sıfırla
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              // Normal giriş formu
              <form className="space-y-6" onSubmit={handleLogin}>
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {successMessage && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm text-green-700">{successMessage}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    E-posta Adresi
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-none"
                      placeholder="admin@tasiapp.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Şifre
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-none"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <FaEyeSlash className="h-5 w-5" />
                        ) : (
                          <FaEye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Beni hatırla
                    </label>
                  </div>

                  <div className="text-sm">
                    <button
                      type="button"
                      className="font-medium text-orange-600 hover:text-orange-500"
                      onClick={toggleForgotPassword}
                    >
                      Şifremi unuttum
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-400"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Giriş yapılıyor...
                      </>
                    ) : (
                      <>
                        <FaSignInAlt className="-ml-1 mr-2 h-4 w-4" />
                        Giriş Yap
                      </>
                    )}
                  </button>
                </div>
                
                <div className="mt-4 text-center">
                  <Link
                    href="/"
                    className="text-sm font-medium text-orange-600 hover:text-orange-500"
                  >
                    Ana sayfaya dön
                  </Link>
                </div>
              </form>
            )}
            
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="text-xs text-center text-gray-500">
                <p>© {new Date().getFullYear()} Taşı.app. Tüm hakları saklıdır.</p>
                <p className="mt-1">Admin giriş bilgileri: admin@tasiapp.com / Admin123!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 