import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth-context';
import Head from 'next/head';
import { 
  HomeIcon, ClipboardListIcon, TruckIcon, MapIcon, 
  CreditCardIcon, DocumentTextIcon, UserIcon, 
  BellIcon, LogoutIcon, MenuIcon, XIcon
} from '@heroicons/react/outline';

const DriverPortalLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/portal/driver/dashboard', icon: HomeIcon },
    { name: 'Aktif Görevler', href: '/portal/driver/active-tasks', icon: ClipboardListIcon },
    { name: 'Görevlerim', href: '/portal/driver/tasks', icon: TruckIcon },
    { name: 'Rotalarım', href: '/portal/driver/routes', icon: MapIcon },
    { name: 'Kazançlarım', href: '/portal/driver/earnings', icon: CreditCardIcon },
    { name: 'Belgelerim', href: '/portal/driver/documents', icon: DocumentTextIcon },
    { name: 'Profilim', href: '/portal/driver/profile', icon: UserIcon },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <Head>
        <title>Tasiapp - Sürücü Portalı</title>
        <meta name="description" content="Tasiapp Sürücü Portalı" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`} role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-green-700">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Menüyü kapat</span>
              <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <span className="text-white font-bold text-xl">TASIAPP</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    router.pathname === item.href
                      ? 'bg-green-800 text-white'
                      : 'text-green-100 hover:bg-green-600'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-6 w-6 ${
                      router.pathname === item.href
                        ? 'text-green-200'
                        : 'text-green-200 group-hover:text-green-100'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-green-800 p-4">
            <div className="flex-shrink-0 group block">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-white">{user?.name || 'Sürücü'}</p>
                  <button
                    onClick={logout}
                    className="flex items-center text-sm font-medium text-green-200 hover:text-white"
                  >
                    <LogoutIcon className="mr-1 h-4 w-4" />
                    Çıkış Yap
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-green-700">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <span className="text-white font-bold text-xl">TASIAPP</span>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      router.pathname === item.href
                        ? 'bg-green-800 text-white'
                        : 'text-green-100 hover:bg-green-600'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-6 w-6 ${
                        router.pathname === item.href
                          ? 'text-green-200'
                          : 'text-green-200 group-hover:text-green-100'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="flex-shrink-0 flex border-t border-green-800 p-4">
              <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{user?.name || 'Sürücü'}</p>
                    <button
                      onClick={logout}
                      className="flex items-center text-xs font-medium text-green-200 hover:text-white"
                    >
                      <LogoutIcon className="mr-1 h-4 w-4" />
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Menüyü aç</span>
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 md:px-8">
            {/* Üst kısım */}
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
              <h1 className="text-2xl font-semibold text-gray-900">
                {navigation.find(item => item.href === router.pathname)?.name || 'Sürücü Portalı'}
              </h1>
              
              <div className="ml-4 flex items-center md:ml-6">
                {/* Bildirim ikonu */}
                <button
                  type="button"
                  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <span className="sr-only">Bildirimleri görüntüle</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>
                
                {/* Kullanıcı profili */}
                <div className="ml-3 relative">
                  <div>
                    <div className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                      <span className="sr-only">Kullanıcı profili</span>
                      <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center text-green-600 font-bold">
                        {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <span className="ml-2 text-gray-700">{user?.name || 'Sürücü'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Ana içerik */}
            <div className="pb-12">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DriverPortalLayout; 