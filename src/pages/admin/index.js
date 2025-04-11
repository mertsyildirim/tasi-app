import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import Head from 'next/head';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

      // Admin kullanıcı kontrolü
      if (email === 'admin@tasiapp.com' && password === 'AdminTasi2024!') {
        // Admin kullanıcısıyla giriş yap
        console.log('Admin kullanıcısıyla giriş yapılıyor');
        
        // Admin kullanıcı bilgileri
        const adminUser = {
          _id: '000000000000000000000002',
          email: 'admin@tasiapp.com',
          name: 'Admin Kullanıcı',
          role: 'admin',
          status: 'active'
        };
        
        // Token oluştur
        const token = 'admin_token_' + Date.now();
        
        // Kullanıcı ve token bilgilerini locale kaydet
        localStorage.setItem('auth_token', token);
        localStorage.setItem('userData', JSON.stringify(adminUser));
        
        // Admin paneline yönlendir
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 500);
        
        return;
      }
      
      setError('Geçersiz kullanıcı bilgileri');
    } catch (error) {
      console.error('Giriş hatası:', error);
      setError(error.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

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
                  {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
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
                <p>Giriş bilgileri: admin@tasiapp.com / AdminTasi2024!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 