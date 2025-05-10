import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FaTruck, FaRoute, FaMoneyBillWave, FaUser, FaBell, FaCog, FaSignOutAlt, FaBars, FaTimes, FaTachometerAlt, FaClipboardList, FaFileAlt, FaCalendarAlt, FaClock, FaMapMarkedAlt, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

export default function DriverLayout({ children, title = 'Sürücü Paneli', initialDriverStatus = 'active' }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [driverStatus, setDriverStatus] = useState(initialDriverStatus);
  const [isMobile, setIsMobile] = useState(false);

  // Saati güncelle
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Kullanıcı giriş durumunu kontrol et
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // API'den kullanıcı bilgilerini al
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/portal/login?type=driver');
          return;
        }
        
        // API isteği
        const response = await fetch('/api/drivers/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Kullanıcı bilgileri alınamadı');
        }
        
        const userData = await response.json();
        setUser(userData);
        
        // Sürücü durumunu al
        const driverStatusResponse = await fetch('/api/drivers/status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (driverStatusResponse.ok) {
          const statusData = await driverStatusResponse.json();
          setDriverStatus(statusData.status || initialDriverStatus);
        }
        
        // Bildirimleri al
        const notificationsResponse = await fetch('/api/notifications/driver', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json();
          setNotifications(notificationsData.notifications || []);
        }
        
      } catch (error) {
        console.error('Auth check error:', error);
        
        // Hata durumunda localStorage'dan kullanıcı bilgilerini kontrol et
        const userData = localStorage.getItem('user');
        if (!userData) {
          router.push('/portal/login?type=driver');
          return;
        }
        
        const user = JSON.parse(userData);
        if (user.role !== 'driver') {
          router.push('/portal/login');
          return;
        }
        
        setUser(user);
        
        // Mock bildirimler
        setNotifications([
          { id: 1, message: "Yeni bir taşıma görevi atandı: #TRK2024123", time: "Bugün, 14:30" },
          { id: 2, message: "Mola saatiniz yaklaşıyor", time: "Dün, 10:15" },
          { id: 3, message: "Sürücü belgeniz için yenileme zamanı yaklaşıyor", time: "2 gün önce" }
        ]);
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

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [router, initialDriverStatus]);

  // Bildirim dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isNotificationsOpen && !event.target.closest('.notifications-dropdown')) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  // Profil dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  // Tarih formatı
  const formatDate = (date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Saat formatı
  const formatTime = (date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Çıkış yap
  const handleLogout = async () => {
    try {
      // API üzerinden çıkış yapma
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        router.push('/portal/login?type=driver');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Hata olsa da token ve kullanıcı bilgilerini silip yönlendirme yapıyoruz
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      router.push('/portal/login?type=driver');
    }
  };

  // Sürücü menü öğeleri
  const navigation = [
    { name: 'Ana Sayfa', href: '/portal/driver/dashboard', icon: FaTachometerAlt },
    { name: 'Aktif Taşımalarım', href: '/portal/driver/active-tasks', icon: FaTruck },
    { name: 'Rotalarım', href: '/portal/driver/routes', icon: FaRoute },
    { name: 'Tüm Görevlerim', href: '/portal/driver/tasks', icon: FaClipboardList },
    { name: 'Kazançlarım', href: '/portal/driver/earnings', icon: FaMoneyBillWave },
    { name: 'Belgelerim', href: '/portal/driver/documents', icon: FaFileAlt },
  ];

  // Sürücü durumu renk ve metin fonksiyonları
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'inactive':
        return 'text-red-500';
      case 'on_break':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Pasif';
      case 'on_break':
        return 'Molada';
      default:
        return 'Bilinmiyor';
    }
  };

  // Yükleme ekranı
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa sayfa gösterilmez
  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{title ? `${title} | Taşı Portal` : 'Taşı Portal'}</title>
        <meta name="description" content="Taşı Portal - Sürücü Paneli" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex h-screen bg-gray-50">
        {/* Sidebar - Masaüstü */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4 mb-5">
                <Link href="/portal/driver/dashboard">
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
                      {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-bold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">Sürücü</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobil Menü */}
        <div className={`fixed inset-0 flex z-40 md:hidden transition-all transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
              >
                <FaTimes className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4 mb-5">
                <Link href="/portal/driver/dashboard">
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
                      onClick={() => setIsMobileMenuOpen(false)}
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
                      {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-bold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">Sürücü</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ana İçerik */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {/* Mobil Header */}
          <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 flex items-center justify-between shadow-sm z-10 bg-white">
            <div className="flex items-center space-x-2">
              <button
                className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <FaBars className="h-6 w-6" />
              </button>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                driverStatus === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : driverStatus === 'inactive'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {getStatusText(driverStatus)}
              </span>
            </div>
            
            <div className="flex flex-col items-end pr-4">
              <div className="text-xs font-medium text-gray-500 flex items-center">
                <FaCalendarAlt className="h-3 w-3 mr-1 text-orange-500" />
                <span>{formatDate(currentTime)}</span>
              </div>
              <div className="text-xs font-medium text-gray-500 flex items-center mt-1">
                <FaClock className="h-3 w-3 mr-1 text-orange-500" />
                <span>{formatTime(currentTime)}</span>
              </div>
            </div>
          </div>
          
          {/* Desktop Header */}
          <div className="hidden md:flex md:items-center md:justify-between p-4 border-b border-gray-200 bg-white shadow-sm">
            <div>
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  driverStatus === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : driverStatus === 'inactive'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {getStatusText(driverStatus)}
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
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                  <FaBell className="h-6 w-6" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                  )}
                </button>
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 notifications-dropdown">
                    <div className="py-1">
                      {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                          <div key={index} className="px-4 py-2 hover:bg-gray-100">
                            <p className="text-sm text-gray-800">{notification.message}</p>
                            <p className="text-xs text-gray-500">{notification.time}</p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          Bildiriminiz bulunmuyor
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button 
                  className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <FaUser className="h-6 w-6" />
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-50 profile-dropdown">
                    <div className="py-1">
                      <Link
                        href="/portal/driver/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profilim
                      </Link>
                      <div className="border-t border-gray-200">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Çıkış Yap
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </>
  );
} 