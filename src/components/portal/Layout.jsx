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
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>{title} - Taşı App</title>
      </Head>

      {/* Üst Menü */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo ve Menü Butonu */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                >
                  {sidebarOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
                </button>
                <Link href="/portal/dashboard" className="flex items-center">
                  <Image src="/logo.png" alt="Taşı App" width={40} height={40} className="ml-2" />
                  <span className="ml-2 text-xl font-bold text-gray-900">Taşı App</span>
                </Link>
              </div>
            </div>

            {/* Sağ Taraf - Bildirimler ve Profil */}
            <div className="flex items-center">
              {/* Bildirimler */}
              <div className="relative ml-3">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                >
                  <FaBell className="h-6 w-6" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </button>
                {/* Bildirim Dropdown */}
                {showNotifications && (
                  <div className="notifications-dropdown origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    {/* Bildirim içeriği */}
                  </div>
                )}
              </div>

              {/* Profil - Her zaman görünür */}
              <div className="relative ml-3">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                >
                  <FaUser className="h-6 w-6" />
                  {!isMobile && (
                    <span className="ml-2 text-sm font-medium">{user?.name || 'Kullanıcı'}</span>
                  )}
                </button>
                {/* Profil Dropdown */}
                {showProfileMenu && (
                  <div className="profile-dropdown origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <Link href="/portal/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Profil
                      </Link>
                      <Link href="/portal/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Ayarlar
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ana İçerik */}
      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block lg:flex-shrink-0`}>
          <div className="h-full w-64 bg-white border-r border-gray-200">
            <div className="h-full flex flex-col">
              {/* Sidebar İçeriği */}
              <nav className="flex-1 p-4 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      router.pathname === item.href
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${
                      router.pathname === item.href ? 'text-orange-500' : 'text-gray-400'
                    }`} />
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Kullanıcı Bilgisi */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-orange-700 font-medium">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'Kullanıcı'}</p>
                    <p className="text-xs text-gray-500">{user?.email || ''}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ana İçerik Alanı */}
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}