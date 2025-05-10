import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaTruck } from 'react-icons/fa';
import Head from 'next/head';
import Link from 'next/link';

// Örnek kullanıcı verileri
const USERS = [
  {
    email: 'tasiapp@example.com',
    password: 'Tasi123!',
    name: 'Taşı App Kullanıcı',
    role: 'carrier'
  },
  {
    email: 'driver@tasiapp.com',
    password: 'Driver123!',
    name: 'Sürücü Kullanıcı',
    role: 'driver'
  },
  {
    email: 'demo@tasiapp.com',
    password: 'demo123',
    name: 'Demo Kullanıcı',
    role: 'carrier'
  },
  {
    email: 'admin@tasiapp.com',
    password: 'Admin123!',
    name: 'Admin Kullanıcı',
    role: 'admin'
  },
  {
    email: 'surucu@tasiapp.com',
    password: '1234',
    name: 'Sürücü Kullanıcı',
    role: 'driver'
  }
];

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('portal'); // Default olarak portal

  useEffect(() => {
    // Sayfa yüklendiğinde URL kontrolü yaparak giriş tipini belirle
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    console.log("Debug - Login Page:", { hostname, pathname });

    if (hostname === 'tasiapp.com' || hostname === 'www.tasiapp.com') {
      if (pathname.includes('/admin')) {
        setLoginType('admin');
      } else {
        setLoginType('main');
      }
    } else if (hostname === 'portal.tasiapp.com' || hostname.includes('localhost') || hostname.includes('vercel.app')) {
      setLoginType('portal');
    }

    // URL'de debug parametresi varsa tüm kullanıcıları console'a yazdır
    if (window.location.search.includes('debug')) {
      console.log("Kullanıcı Listesi:", USERS);
    }
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Mock otomatik giriş
      console.log("Otomatik giriş yapılıyor");
      
      // Rol belirleme (sadece demo amaçlı)
      let role = 'carrier';
      if (email.includes('driver') || email.includes('surucu')) {
        role = 'driver';
      } else if (email.includes('admin')) {
        role = 'admin';
      }
      
      // Kullanıcı bilgilerini localStorage'a kaydet
      const userData = {
        email: email || 'demo@tasiapp.com',
        name: 'Demo Kullanıcı',
        type: role,
        company: 'Taşı Lojistik',
        phone: '+90 555 123 4567',
        address: 'Levent, İstanbul',
        taxNumber: '1234567890',
        taxOffice: 'İstanbul'
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Giriş tipine ve kullanıcı rolüne göre yönlendirme yap
      if (loginType === 'admin') {
        router.push('/admin/dashboard');
      } else if (loginType === 'main') {
        router.push('/');
      } else {
        // Portal girişi yapılıyor
        console.log("Portal girişi, kullanıcı rolü:", role);
        
        // Rol bazlı yönlendirme
        if (role === 'admin') {
          router.push('/admin');
        } else if (role === 'driver') {
          router.push('/portal/driver/dashboard');
        } else {
          router.push('/portal/dashboard');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Hata durumunda da otomatik giriş yap
      const userData = {
        email: 'demo@tasiapp.com',
        name: 'Demo Kullanıcı',
        type: 'carrier',
        company: 'Taşı Lojistik',
        phone: '+90 555 123 4567',
        address: 'Levent, İstanbul',
        taxNumber: '1234567890',
        taxOffice: 'İstanbul'
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      router.push('/portal/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Login title ve açıklamasını giriş tipine göre ayarla
  const getTitle = () => {
    switch (loginType) {
      case 'admin':
        return 'Yönetici Paneli';
      case 'main':
        return 'Taşı.app';
      case 'portal':
      default:
        return '';
    }
  };

  const getDescription = () => {
    switch (loginType) {
      case 'admin':
        return 'Taşı.app yönetici paneline hoş geldiniz';
      case 'main':
        return 'Taşı.app ana sayfaya hoş geldiniz';
      case 'portal':
      default:
        return 'Taşıapp.com taşıyıcı portalına hoş geldiniz';
    }
  };

  return (
    <>
      <Head>
        <title>{getTitle()} | Taşı.app</title>
        <meta name="description" content={`Taşı.app ${getTitle().toLowerCase()} giriş sayfası`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="inline-flex items-center justify-center rounded-md mb-2">
              <img src="/portal_logo.png" alt="Taşı Portal" className="h-16" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 text-center">
            {getTitle()}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {getDescription()}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="py-8 px-4 sm:px-10">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <form 
                className="space-y-6" 
                onSubmit={handleLogin}
                method="POST"
                action="#"
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    E-posta
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      placeholder="ornek@tasiapp.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Şifre
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
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
                    <a href="#" className="font-medium text-orange-600 hover:text-orange-500">
                      Şifremi unuttum
                    </a>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    onClick={handleLogin}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Demo Hesaplar</span>
                  </div>
                </div>
                <div className="mt-6 text-center text-sm text-gray-600">
                  {loginType === 'admin' ? (
                    <>
                      <p>E-posta: admin@tasiapp.com</p>
                      <p>Şifre: Admin123!</p>
                    </>
                  ) : (
                    <>
                      <p>Taşıyıcı: demo@tasiapp.com / demo123</p>
                      <p>Sürücü: driver@tasiapp.com / Driver123!</p>
                      <p>Admin: admin@tasiapp.com / Admin123!</p>
                    </>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <button 
                    type="button"
                    onClick={() => {
                      // Demo kullanıcı olarak otomatik giriş yap
                      setEmail('demo@tasiapp.com');
                      setPassword('demo123');
                      setTimeout(() => handleLogin(), 500);
                    }}
                    className="px-4 py-2 text-xs text-orange-600 hover:text-orange-800 focus:outline-none"
                  >
                    Demo Olarak Giriş Yap
                  </button>
                </div>
              </div>
            </div>
            <div className="px-4 py-4 bg-gray-50 text-right sm:px-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Hesabınız yok mu? 
                <Link href="/portal/register" className="ml-1 text-orange-600 hover:text-orange-500">
                  Kayıt olun
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
