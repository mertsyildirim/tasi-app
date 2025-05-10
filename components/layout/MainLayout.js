import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/lib/auth';
import Head from 'next/head';
import Image from 'next/image';

const MainLayout = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>Tasiapp - Taşıma Hizmetleri</title>
        <meta name="description" content="Profesyonel taşıma hizmetleri platformu" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <nav className="bg-white shadow-md py-4 relative z-20">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Taşı.app" className="h-10" />
          </Link>
          <div className="hidden md:flex space-x-6 items-center">
            <Link href="/" className={`text-gray-600 hover:text-orange-600 transition group relative ${router.pathname === '/' ? 'text-orange-600' : ''}`}>
              Anasayfa
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/#services" className={`text-gray-600 hover:text-orange-600 transition group relative ${router.pathname === '/services' ? 'text-orange-600' : ''}`}>
              Hizmetlerimiz
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/#about" className={`text-gray-600 hover:text-orange-600 transition group relative ${router.pathname === '/about' ? 'text-orange-600' : ''}`}>
              Neden Biz?
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/contact" className={`text-gray-600 hover:text-orange-600 transition group relative ${router.pathname === '/contact' ? 'text-orange-600' : ''}`}>
              İletişim
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/profile" 
                  className="px-4 py-2 text-sm font-medium text-orange-600 bg-white border border-orange-600 rounded-md hover:bg-orange-50"
                >
                  Profilim
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
                >
                  Çıkış Yap
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700">
                  Giriş Yap
                </Link>
                <Link href="/register" className="px-4 py-2 text-sm font-medium text-orange-600 bg-white border border-orange-600 rounded-md hover:bg-orange-50">
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobil menü butonları */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-orange-600 p-2 focus:outline-none"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                )}
              </svg>
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link 
                  href="/profile" 
                  className="px-3 py-1.5 text-xs font-medium text-orange-600 bg-white border border-orange-600 rounded-md hover:bg-orange-50"
                >
                  Profilim
                </Link>
              </div>
            ) : (
              <Link href="/login" className="px-3 py-1.5 text-xs font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700">
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
        
        {/* Mobil menü açılır panel */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg z-50 transition-all duration-300 ease-in-out transform translate-y-0">
            <div className="px-4 pt-2 pb-3 space-y-1 border-t">
              <Link 
                href="/" 
                className={`block px-3 py-3 text-base font-medium rounded-md ${
                  router.pathname === '/' 
                    ? 'text-orange-600 bg-orange-50' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-orange-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Anasayfa
              </Link>
              <Link 
                href="/#services" 
                className={`block px-3 py-3 text-base font-medium rounded-md ${
                  router.pathname === '/services' 
                    ? 'text-orange-600 bg-orange-50' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-orange-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Hizmetlerimiz
              </Link>
              <Link 
                href="/#about" 
                className={`block px-3 py-3 text-base font-medium rounded-md ${
                  router.pathname === '/about' 
                    ? 'text-orange-600 bg-orange-50' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-orange-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Neden Biz?
              </Link>
              <Link 
                href="/contact" 
                className={`block px-3 py-3 text-base font-medium rounded-md ${
                  router.pathname === '/contact' 
                    ? 'text-orange-600 bg-orange-50' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-orange-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                İletişim
              </Link>
              
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-3 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-orange-600"
                >
                  Çıkış Yap
                </button>
              ) : (
                <Link 
                  href="/register" 
                  className={`block px-3 py-3 text-base font-medium rounded-md ${
                    router.pathname === '/register' 
                      ? 'text-orange-600 bg-orange-50' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-orange-600'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Kayıt Ol
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:justify-between">
            <div className="mb-8 md:mb-0">
              <h2 className="text-xl font-bold mb-4">TASIAPP</h2>
              <p className="text-gray-300 max-w-md">
                Profesyonel taşıma hizmetleri platformu. Güvenli, hızlı ve ekonomik taşıma çözümleri sunuyoruz.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Bağlantılar</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/" className="text-gray-300 hover:text-white">
                      Ana Sayfa
                    </Link>
                  </li>
                  <li>
                    <Link href="/#services" className="text-gray-300 hover:text-white">
                      Hizmetlerimiz
                    </Link>
                  </li>
                  <li>
                    <Link href="/#about" className="text-gray-300 hover:text-white">
                      Hakkımızda
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-gray-300 hover:text-white">
                      İletişim
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Portallar</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/portal/dashboard" className="text-gray-300 hover:text-white">
                      Şirket Portalı
                    </Link>
                  </li>
                  <li>
                    <Link href="/portal/driver/dashboard" className="text-gray-300 hover:text-white">
                      Sürücü Portalı
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Taşıyıcı</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/portal/login" className="text-gray-300 hover:text-white">
                      Taşıyıcı Portal Girişi
                    </Link>
                  </li>
                  <li>
                    <Link href="/portal/register" className="text-gray-300 hover:text-white bg-transparent hover:bg-gray-700 border border-gray-500 rounded px-2 py-1 text-sm inline-flex items-center">
                      Taşıyıcı Olun
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">İletişim</h3>
                <ul className="space-y-2">
                  <li className="text-gray-300">
                    <span className="block">Email: info@tasiapp.com</span>
                  </li>
                  <li className="text-gray-300">
                    <span className="block">Telefon: +90 (212) 123 4567</span>
                  </li>
                  <li className="text-gray-300">
                    <span className="block">Adres: İstanbul, Türkiye</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700">
            <p className="text-gray-300 text-center">
              &copy; {new Date().getFullYear()} TASIAPP. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 