import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { FaSpinner, FaTruck, FaBox, FaMoneyBillWave, FaUser, FaChartLine, FaBell, FaCog, FaSignOutAlt, FaBars, FaTimes, FaHome, FaMapMarkedAlt, FaFileInvoiceDollar, FaUsers, FaWarehouse, FaClipboardList, FaEnvelope, FaChevronDown, FaSearch, FaUserTie, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaTachometerAlt, FaUserAlt, FaCalendarAlt, FaClock } from 'react-icons/fa';
import Link from 'next/link';

export default function PortalLayout({ children, title = 'Taşıyıcı Portalı' }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [carrierStatus, setCarrierStatus] = useState('active'); // 'active', 'document_expired', 'inactive'
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Saati güncelle
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Kullanıcı giriş durumunu kontrol et
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          router.push('/portal/login');
          return;
        }
        const user = JSON.parse(userData);
        
        // Profile sayfasından firma adını al
        const companyInput = document.querySelector('input[name="company"]');
        if (companyInput) {
          user.companyName = companyInput.value;
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        setUser(user);
        
        // Taşıyıcı durumunu kontrol et
        const carrierData = localStorage.getItem('carrierData');
        if (carrierData) {
          const parsedCarrierData = JSON.parse(carrierData);
          setCarrierStatus(parsedCarrierData.status || 'active');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/portal/login');
      } finally {
        setLoading(false);
      }
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkAuth();
    handleResize();
    window.addEventListener('resize', handleResize);

    // Profile sayfasındaki company input değişikliklerini dinle
    const companyInput = document.querySelector('input[name="company"]');
    if (companyInput) {
      companyInput.addEventListener('change', checkAuth);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (companyInput) {
        companyInput.removeEventListener('change', checkAuth);
      }
    };
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/portal/login');
  };

  // Tarih formatı
  const formatDate = (date) => {
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Saat formatı
  const formatTime = (date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusIcon = () => {
    switch (carrierStatus) {
      case 'active':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
      case 'document_expired':
        return <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />;
      case 'inactive':
        return <FaTimesCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusText = () => {
    switch (carrierStatus) {
      case 'active':
        return 'Aktif';
      case 'document_expired':
        return 'Tarihi geçmiş evrak güncellemesi bekliyor';
      case 'inactive':
        return 'Pasif';
      default:
        return 'Aktif';
    }
  };

  const getStatusClass = () => {
    switch (carrierStatus) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'document_expired':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notifications-dropdown')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-dropdown')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  // Yükleme ekranı
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa sayfa gösterilmez (yönlendirme yapılır)
  if (!user) {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/portal/dashboard', icon: FaTachometerAlt },
    { name: 'Taşımalar', href: '/portal/shipments', icon: FaTruck },
    { name: 'Takip', href: '/portal/tracking', icon: FaMapMarkedAlt },
    { name: 'Ödemeler', href: '/portal/payments', icon: FaMoneyBillWave },
    { name: 'Sürücüler', href: '/portal/drivers', icon: FaUserTie },
    { name: 'Araçlar', href: '/portal/vehicles', icon: FaTruck },
    { name: 'Raporlar', href: '/portal/reports', icon: FaChartLine },
    { name: 'Faturalar', href: '/portal/invoices', icon: FaFileInvoiceDollar },
    { name: 'Görevler', href: '/portal/tasks', icon: FaClipboardList },
    { name: 'Mesajlar', href: '/portal/messages', icon: FaEnvelope },
  ];

  const isActivePath = (path) => {
    return router.pathname === path;
  };

  return (
    <>
      <Head>
        <title>{title ? `${title} | Taşı Portal` : 'Taşı Portal'}</title>
        <meta name="description" content="Taşı Portal - Taşıma İşlemlerinizi Yönetin" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex h-screen bg-gray-50">
        {/* Sidebar - Masaüstü */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4 mb-5">
                <Link href="/portal/dashboard" className="text-2xl font-bold text-orange-500 hover:text-orange-600 transition-colors duration-200">
                  <Image
                    src="/portal_logo.png"
                    alt="Taşı Portal Logo"
                    width={120}
                    height={40}
                    className="cursor-pointer"
                    priority
                  />
                </Link>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = router.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                        isActive
                          ? 'bg-orange-100 text-orange-700'
                          : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
                      }`}
                    >
                      <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex-shrink-0 w-full">
                <div className="flex items-center">
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-orange-100">
                    <span className="text-sm font-medium leading-none text-orange-700">
                      {user.companyName ? user.companyName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-bold text-gray-900">{user.companyName}</p>
                    <p className="text-sm text-gray-500">{user.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobil Menü */}
        <div className={`fixed inset-0 flex z-40 md:transition-all transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
              >
                <FaTimes className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4 mb-5">
                <Link href="/portal/dashboard" className="text-2xl font-bold text-orange-500 hover:text-orange-600 transition-colors duration-200">
                  <Image
                    src="/portal_logo.png"
                    alt="Taşı Portal Logo"
                    width={120}
                    height={40}
                    className="cursor-pointer"
                    priority
                  />
                </Link>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = router.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                        isActive
                          ? 'bg-orange-100 text-orange-700'
                          : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
                      }`}
                    >
                      <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex-shrink-0 w-full">
                <div className="flex items-center">
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-orange-100">
                    <span className="text-sm font-medium leading-none text-orange-700">
                      {user.companyName ? user.companyName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-bold text-gray-900">{user.companyName}</p>
                    <p className="text-sm text-gray-500">{user.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {/* Mobil Header */}
          <div className="md:hidden bg-white shadow-sm z-10">
            <div className="flex items-center justify-between px-3 py-2">
              {/* Mobil menü butonu ve sayfa başlığı */}
              <div className="flex items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
                >
                  <FaBars className="h-5 w-5" />
                </button>
                <div className="ml-2">
                  <h1 className="text-base font-medium text-gray-800">{title}</h1>
                </div>
              </div>
              
              {/* Sağ taraf */}
              <div className="flex items-center space-x-3">
                {/* Durum */}
                <div className={`flex items-center px-2 py-1 rounded-md border ${getStatusClass()}`}>
                  {getStatusIcon()}
                  <span className="ml-1 text-xs font-medium">{carrierStatus === 'active' ? 'Aktif' : carrierStatus === 'document_expired' ? 'Evrak' : 'Pasif'}</span>
                </div>
                
                {/* Bildirim butonu */}
                <div className="relative">
                  <button 
                    className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <FaBell className="h-5 w-5" />
                    {/* Okunmamış bildirim varsa */}
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-1 ring-white"></span>
                  </button>
                </div>
                
                {/* Profil butonu */}
                <div className="relative">
                  <button 
                    className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    <FaUser className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Tarih ve saat bilgisi - Tek satırda yan yana */}
            <div className="flex items-center justify-end px-3 py-1 border-t border-gray-100 text-xs text-gray-500">
              <div className="flex items-center">
                <FaCalendarAlt className="h-3 w-3 mr-1 text-orange-500" />
                <span>{currentTime.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="mx-2">•</span>
                <FaClock className="h-3 w-3 mr-1 text-orange-500" />
                <span>{currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
          
          {showNotifications && (
            <div className="fixed inset-0 z-50 md:hidden" onClick={() => setShowNotifications(false)}>
              <div className="absolute inset-0 bg-gray-600 bg-opacity-75"></div>
              <div className="absolute top-14 right-2 w-[calc(100%-1rem)] max-w-xs bg-white rounded-md shadow-lg overflow-hidden notifications-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-medium text-gray-800">Bildirimler</h3>
                  <button onClick={() => setShowNotifications(false)}>
                    <FaTimes className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                <div className="py-1 max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <div key={index} className="px-4 py-3 hover:bg-gray-100 border-b border-gray-100">
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-sm text-gray-500 text-center">
                      Henüz bildiriminiz yok
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-200 py-2 px-4">
                  <button className="w-full text-center text-sm text-orange-600 font-medium" onClick={() => router.push('/portal/messages')}>
                    Tüm Bildirimleri Görüntüle
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {showProfileMenu && (
            <div className="fixed inset-0 z-50 md:hidden" onClick={() => setShowProfileMenu(false)}>
              <div className="absolute inset-0 bg-gray-600 bg-opacity-75"></div>
              <div className="absolute top-14 right-2 w-48 bg-white rounded-md shadow-lg overflow-hidden profile-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="py-2 px-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.companyName}</p>
                </div>
                <div className="py-1">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => router.push('/portal/profile')}>
                    Profil
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => router.push('/portal/settings')}>
                    Ayarlar
                  </button>
                  <div className="border-t border-gray-200">
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100" onClick={handleLogout}>
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Desktop Header */}
          <div className="hidden md:flex md:items-center md:justify-between p-4 border-b border-gray-200 bg-white shadow-sm">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold">{title}</h1>
                <div className="mx-4 h-6 w-px bg-gray-300"></div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  carrierStatus === 'active' ? 'bg-green-100 text-green-800' : 
                  carrierStatus === 'document_expired' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {carrierStatus === 'active' ? 'Aktif ✓' : 
                   carrierStatus === 'document_expired' ? 'Evrak Bekliyor !' : 
                   'Pasif ✕'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center justify-end text-sm text-gray-600">
                  <FaCalendarAlt className="h-4 w-4 mr-1 text-orange-500" />
                  <span>{formatDate(currentTime)}</span>
                </div>
                <div className="flex items-center justify-end text-sm text-gray-600 mt-1">
                  <FaClock className="h-4 w-4 mr-1 text-orange-500" />
                  <span>{formatTime(currentTime)}</span>
                </div>
              </div>
              <div className="relative">
                <button 
                  className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <FaBell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 notifications-dropdown">
                    <div className="py-1">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notification, index) => (
                          <div key={index} className="px-4 py-2 hover:bg-gray-100">
                            <p className="text-sm text-gray-800">{notification.message}</p>
                            <p className="text-xs text-gray-500">{notification.time}</p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          Henüz Sistem Mesajınız yok
                        </div>
                      )}
                      <div className="border-t border-gray-200">
                        <button className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-gray-100" onClick={() => router.push('/portal/messages')}>
                          Tüm Sistem Mesajları
                        </button>
                      </div>
                    </div>
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-500" onClick={() => setShowNotifications(false)}>
                      <FaTimes className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <button 
                  className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <FaUser className="h-6 w-6" />
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-50 profile-dropdown">
                    <div className="py-1">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => router.push('/portal/profile')}>
                        Profil
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => router.push('/portal/settings')}>
                        Ayarlar
                      </button>
                      <div className="border-t border-gray-200">
                        <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100" onClick={handleLogout}>
                          Çıkış Yap
                        </button>
                      </div>
                    </div>
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-500" onClick={() => setShowProfileMenu(false)}>
                      <FaTimes className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}