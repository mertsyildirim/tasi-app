import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FaSpinner, FaTruck, FaBox, FaMoneyBillWave, FaUser, FaChartLine, FaBell, FaCog, FaSignOutAlt, FaBars, FaTimes, FaHome, FaMapMarkedAlt, FaFileInvoiceDollar, FaUsers, FaWarehouse, FaClipboardList, FaEnvelope, FaChevronDown, FaSearch, FaUserTie, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
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
  const [carrierStatus, setCarrierStatus] = useState('active'); // 'active', 'pending', 'inactive'

  useEffect(() => {
    // Saati güncelle
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Kullanıcı giriş durumunu kontrol et
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          router.push('/portal/login');
          return;
        }
        setUser(JSON.parse(userData));
        
        // Taşıyıcı durumunu kontrol et (örnek olarak)
        // Gerçek uygulamada bu bilgi API'den gelecektir
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

    return () => {
      window.removeEventListener('resize', handleResize);
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
      minute: '2-digit'
    });
  };

  const getStatusIcon = () => {
    switch (carrierStatus) {
      case 'active':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
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
      case 'pending':
        return 'Belge Güncelleme Bekliyor';
      case 'inactive':
        return 'Pasif';
      default:
        return 'Aktif';
    }
  };

  // Yükleme ekranı
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa sayfa gösterilmez (yönlendirme yapılır)
  if (!user) {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/portal/dashboard', icon: FaChartLine },
    { name: 'Taşımalar', href: '/portal/shipments', icon: FaTruck },
    { name: 'Takip', href: '/portal/tracking', icon: FaSearch },
    { name: 'Ödemeler', href: '/portal/payments', icon: FaMoneyBillWave },
    { name: 'Sürücüler', href: '/portal/drivers', icon: FaUserTie },
    { name: 'Araçlar', href: '/portal/vehicles', icon: FaTruck },
    { name: 'Müşteriler', href: '/portal/customers', icon: FaUsers },
    { name: 'Depolar', href: '/portal/warehouses', icon: FaWarehouse },
    { name: 'Raporlar', href: '/portal/reports', icon: FaChartLine },
    { name: 'Faturalar', href: '/portal/invoices', icon: FaFileInvoiceDollar },
    { name: 'Görevler', href: '/portal/tasks', icon: FaClipboardList },
    { name: 'Mesajlar', href: '/portal/messages', icon: FaEnvelope },
  ];

  return (
    <>
      <Head>
        <title>{title} | Taşı.app</title>
        <meta name="description" content="Taşı.app taşıyıcı portalı" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-100">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <div className="flex items-center">
                <FaTruck className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Taşı.app</span>
              </div>
              <button 
                className="lg:hidden text-gray-500 hover:text-gray-700"
                onClick={() => setSidebarOpen(false)}
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>

            {/* User Info */}
            <div className="px-4 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">{user?.name?.charAt(0) || 'U'}</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Kullanıcı'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'kullanici@tasiapp.com'}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="px-4 py-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                <FaSignOutAlt className="mr-3 h-5 w-5" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`${isMobile ? 'ml-0' : 'ml-64'} flex flex-col min-h-screen`}>
          {/* Top Navbar */}
          <header className="bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center">
                <button
                  onClick={() => setIsMobile(!isMobile)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="ml-4 text-xl font-semibold text-gray-900">{title}</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {formatDate(currentTime)} {formatTime(currentTime)}
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100">
                  {getStatusIcon()}
                  <span className="text-sm font-medium text-gray-700">Taşıyıcı Durumu: {getStatusText()}</span>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <FaBell className="h-5 w-5" />
                </button>
                <Link href="/portal/profile" className="p-2 text-gray-400 hover:text-gray-500">
                  <FaUser className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <FaSignOutAlt className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
} 