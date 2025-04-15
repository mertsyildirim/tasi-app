import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaSpinner } from 'react-icons/fa';
import Head from 'next/head';
import axios from 'axios';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);

  // Sayfa yüklendiğinde token kontrolü yap
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // localStorage'dan token'ı al (auth_token veya token adıyla olabilir)
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
        const userData = localStorage.getItem('userData') || localStorage.getItem('user');
        
        // Token ve kullanıcı bilgisi varsa
        if (token && userData) {
          console.log('Token bulundu, kullanıcı bilgisi kontrol ediliyor...');
          
          try {
            const user = JSON.parse(userData);
            console.log('Kullanıcı rolü:', user.roles || user.role);
            
            // Kullanıcının admin yetkisi var mı kontrol et
            const adminRoles = ['admin', 'super_admin', 'editor', 'support'];
            const hasAdminPermission = user.roles 
              ? user.roles.some(role => adminRoles.includes(role)) 
              : adminRoles.includes(user.role);

            if (hasAdminPermission) {
              console.log('Admin yetkisi doğrulandı, yönlendiriliyor...');
              router.replace('/admin/shipments');
            } else {
              console.log('Admin yetkisi bulunmuyor, ana sayfaya yönlendiriliyor...');
              router.replace('/');
            }
          } catch (parseError) {
            console.error('Kullanıcı bilgisi parse edilemedi:', parseError);
            localStorage.removeItem('userData');
            localStorage.removeItem('user');
          }
        } else {
          console.log('Token veya kullanıcı bilgisi bulunamadı');
        }
      } catch (error) {
        console.error('Token kontrolü sırasında hata:', error);
        // Hata durumunda local storage'ı temizle
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('user');
      } finally {
        // İlk kontrol tamamlandı
        setInitialChecking(false);
      }
    };

    if (router.isReady) {
      checkAuth();
    }
  }, [router.isReady, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Giriş bilgilerini kontrol et
      if (!email || !password) {
        throw new Error('Lütfen e-posta ve şifrenizi giriniz');
      }

      // E-posta formatını kontrol et
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Geçerli bir e-posta adresi giriniz');
      }

      console.log('Giriş yapılıyor:', { email });

      // Local storage'ı tamamen temizle
      localStorage.clear();
      console.log('Local storage temizlendi');

      // API'ye giriş isteği gönder
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      console.log('Giriş yanıtı:', { 
        status: response.status, 
        hasToken: response.data?.token ? 'Var' : 'Yok', 
        hasUserData: response.data?.user ? 'Var' : 'Yok'
      });

      // Yanıt başarılıysa
      if (response.data && response.data.token) {
        const { token, user } = response.data;
        
        console.log('Token alındı, kullanıcı rolü kontrol ediliyor:', {
          userRoles: user.roles || [user.role], 
          email: user.email
        });
        
        // Kullanıcının admin yetkisi var mı kontrol et
        const adminRoles = ['admin', 'super_admin', 'editor', 'support'];
        const hasAdminPermission = user.roles 
          ? user.roles.some(role => adminRoles.includes(role)) 
          : adminRoles.includes(user.role);

        if (hasAdminPermission) {
          console.log('Admin yetkisi doğrulandı, token ve kullanıcı bilgileri kaydediliyor...');
          
          // Token ve kullanıcı bilgilerini kaydet
          localStorage.setItem('auth_token', token);
          localStorage.setItem('token', token); // Alternatif isim için
          localStorage.setItem('userData', JSON.stringify(user));
          localStorage.setItem('user', JSON.stringify(user)); // Alternatif isim için
          
          console.log('Token ve kullanıcı bilgileri kaydedildi, yönlendiriliyor...');
          router.replace('/admin/shipments');
        } else {
          console.log('Admin yetkisi bulunmuyor, ana sayfaya yönlendiriliyor...');
          router.replace('/');
        }
      } else {
        console.error('Token alınamadı:', response.data);
        throw new Error('Giriş başarısız. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Giriş hatası:', { 
        message: error.message,
        status: error.response?.status,
        data: error.response?.data 
      });
      setError(error.response?.data?.error || error.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // İlk kontrol devam ediyorsa yükleniyor ekranı göster
  if (initialChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
        <FaSpinner className="animate-spin text-4xl text-yellow-500" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Yönetici Girişi | Taşı.app</title>
        <meta name="description" content="Taşı.app yönetici giriş sayfası" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="bg-gray-700 p-3 rounded-full shadow-lg">
              <FaShieldAlt className="h-12 w-12 text-yellow-500" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Yönetici Paneli
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Taşı.app yönetici paneline erişim
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-800 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-700">
            <form 
              className="space-y-6" 
              onSubmit={handleLogin}
              method="POST"
              action="#"
            >
              {error && (
                <div className="bg-red-900 border-l-4 border-red-500 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  E-posta
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-700 focus:ring-yellow-500 focus:border-yellow-500 block w-full pl-10 sm:text-sm border-gray-600 rounded-md text-white"
                    placeholder="admin@tasiapp.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Şifre
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-700 focus:ring-yellow-500 focus:border-yellow-500 block w-full pl-10 pr-10 sm:text-sm border-gray-600 rounded-md text-white"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-300 focus:outline-none"
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

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Giriş yapılıyor...
                    </>
                  ) : 'Giriş Yap'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">Yalnızca yöneticiler için</span>
                </div>
              </div>
              <div className="mt-6 text-center text-sm text-gray-400">
                <p>Test için: admin@tasiapp.com / AdminTasi2024!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 