import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth-context';
import Head from 'next/head';

const MainLayout = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>Tasiapp - Taşıma Hizmetleri</title>
        <meta name="description" content="Profesyonel taşıma hizmetleri platformu" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-blue-600 shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <span className="text-white font-bold text-xl">TASIAPP</span>
              </Link>
            </div>

            {/* Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium ${router.pathname === '/' ? 'text-white bg-blue-700' : 'text-gray-100 hover:bg-blue-700'}`}>
                  Ana Sayfa
                </Link>
                <Link href="/services" className={`px-3 py-2 rounded-md text-sm font-medium ${router.pathname === '/services' ? 'text-white bg-blue-700' : 'text-gray-100 hover:bg-blue-700'}`}>
                  Hizmetlerimiz
                </Link>
                <Link href="/about" className={`px-3 py-2 rounded-md text-sm font-medium ${router.pathname === '/about' ? 'text-white bg-blue-700' : 'text-gray-100 hover:bg-blue-700'}`}>
                  Hakkımızda
                </Link>
                <Link href="/contact" className={`px-3 py-2 rounded-md text-sm font-medium ${router.pathname === '/contact' ? 'text-white bg-blue-700' : 'text-gray-100 hover:bg-blue-700'}`}>
                  İletişim
                </Link>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center">
              {isAuthenticated ? (
                <div className="flex items-center">
                  <div className="hidden md:block">
                    <span className="text-gray-200 mr-2">Merhaba, {user.name}</span>
                  </div>
                  <div className="relative ml-3">
                    <div>
                      <button 
                        type="button" 
                        className="flex text-sm bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        id="user-menu"
                        aria-expanded="false"
                        aria-haspopup="true"
                      >
                        <span className="sr-only">Kullanıcı menüsünü aç</span>
                        <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold">
                          {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                        </div>
                      </button>
                    </div>
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none hidden">
                      {user.role === 'admin' && (
                        <Link href="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Admin Paneli
                        </Link>
                      )}
                      {user.role === 'company' && (
                        <Link href="/portal/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Şirket Portalı
                        </Link>
                      )}
                      {user.role === 'driver' && (
                        <Link href="/portal/driver/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Sürücü Portalı
                        </Link>
                      )}
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Profilim
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login" className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800">
                    Giriş Yap
                  </Link>
                  <Link href="/register" className="px-4 py-2 text-sm font-medium text-blue-600 bg-white rounded-md hover:bg-gray-100">
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

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
                    <Link href="/services" className="text-gray-300 hover:text-white">
                      Hizmetlerimiz
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="text-gray-300 hover:text-white">
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