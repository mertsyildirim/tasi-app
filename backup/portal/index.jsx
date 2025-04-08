import React, { useState, useEffect } from 'react';
import { FaTruck, FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function PortalLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  
  const router = useRouter();

  // Eğer kullanıcı zaten giriş yapmışsa, dashboard'a yönlendir
  useEffect(() => {
    const checkLoggedIn = () => {
      try {
        const user = localStorage.getItem('portalUser');
        if (user) {
          router.push('/portal/dashboard');
        }
      } catch (error) {
        console.error('Kullanıcı durumu kontrol edilemedi:', error);
      }
    };

    checkLoggedIn();
  }, [router]);

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Örnek giriş doğrulama - gerçek projede API ile değiştirilecek
    if (email === 'demo@tasiapp.com' && password === 'demo123') {
      // Kullanıcı bilgilerini localStorage'a kaydet
      const userData = {
        id: '12345',
        email: email,
        companyName: 'Süper Taşımacılık',
        role: 'carrier',
        lastLogin: new Date().toISOString()
      };
      
      localStorage.setItem('portalUser', JSON.stringify(userData));
      
      // Kullanıcıyı dashboard'a yönlendir
      router.push('/portal/dashboard');
    } else {
      setError('E-posta veya şifre hatalı.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    
    if (!resetEmail) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }
    
    // Şifre sıfırlama e-postası gönderme simülasyonu
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setShowForgotPassword(false);
    }, 3000);
  };

  return (
    <>
      <Head>
        <title>Taşıyıcı Portalı | Taşı.app</title>
        <meta name="description" content="Taşı.app taşıyıcı portalı giriş sayfası" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="flex-grow flex items-center justify-center px-4 py-8">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-blue-600 flex items-center justify-center">
                <FaTruck className="mr-2" /> Taşı.app
              </h1>
              <p className="text-gray-600 mt-2">Taşıyıcı Portalı</p>
            </div>
            
            {!showForgotPassword ? (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Giriş Yap</h2>
                
                {error && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
                    <p>{error}</p>
                  </div>
                )}
                
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="ornek@firma.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Beni hatırla
                      </label>
                    </div>
                    
                    <div className="text-sm">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                      >
                        Şifremi unuttum
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FaUser className="mr-2" /> Giriş Yap
                    </button>
                  </div>
                </form>
                
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Henüz üye değil misiniz?</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <a
                      href="https://tasiapp.com/kayit"
                      className="w-full flex justify-center py-3 px-4 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FaTruck className="mr-2" /> Taşıyıcı Başvurusu Yap
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Şifremi Sıfırla</h2>
                
                {error && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
                    <p>{error}</p>
                  </div>
                )}
                
                {resetSent && (
                  <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded" role="alert">
                    <p>Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.</p>
                  </div>
                )}
                
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div>
                    <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input
                        id="reset-email"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="ornek@firma.com"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Kayıtlı e-posta adresinizi girin, şifre sıfırlama bağlantısı gönderilecektir.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="flex-1 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Geri Dön
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Gönder
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 