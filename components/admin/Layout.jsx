import React, { useState, useEffect } from 'react'
import { 
  FaUsers, FaTruck, FaClipboardList, FaChartLine, FaCog, 
  FaSignOutAlt, FaSearch, FaBell, FaFileInvoiceDollar, 
  FaBars, FaTimes, FaUser, FaShoppingBag, FaCreditCard,
  FaEnvelope, FaUserCircle, FaRegBell, FaEye, FaExternalLinkAlt, FaCheckCircle, FaEllipsisH, FaIdCard, FaSpinner, FaMoneyBillWave, FaExclamationTriangle, FaExclamationCircle, FaInfoCircle
} from 'react-icons/fa'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function AdminLayout({ children, title, fixedHeader = false }) {
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAllNotifications, setShowAllNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const router = useRouter()
  
  // Boş bir dizi ile başlat
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Bildirimleri API'den getir
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Token bulunamadı');
        return;
      }

      const response = await fetch('/api/admin/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Bildirimler alınamadı');
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Bildirimler alınırken hata:', error);
    }
  };
  
  // Sayfa yüklendiğinde bildirimleri getir (sadece bir kez)
  useEffect(() => {
    // Sadece bir kez çağır
    fetchNotifications();
    
    // Interval ile güncelleme devre dışı bırakıldı
    // Sorun çözüldüğünde aktif et
    /*
    // Her 5 dakikada bir güncelle
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    
    // Temizlik fonksiyonu
    return () => clearInterval(interval);
    */
  }, []); // Boş dependency array - sadece bir kez çalışır
  
  // Mobil cihaz kontrolü
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // Mobil olmadığında sidebar'ı her zaman açık tut
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  // Saat güncelleme
  useEffect(() => {
    // İstemci tarafında çalıştığından emin ol
    if (typeof window !== 'undefined') {
      // İlk render'da saati ayarla
      setCurrentTime(new Date());
      
      // Her saniye saati güncelle
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, []);

  // ESC tuşu ile modal'ları kapatma
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showAllNotifications) setShowAllNotifications(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Modal açıkken body scroll'u engelle
    if (showAllNotifications) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [showAllNotifications]);

  // Dropdown'ları dışına tıklandığında kapatma
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notifications-container')) {
        setShowNotifications(false)
      }
      if (showProfileMenu && !event.target.closest('.profile-container')) {
        setShowProfileMenu(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications, showProfileMenu])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');
        
        if (!token || !userData) {
          router.push('/admin');
          return;
        }

        const user = JSON.parse(userData);
        
        // mert@tasipp.com için özel kontrol
        if (user.email === 'mert@tasipp.com') {
          return;
        }

        const allowedRoles = ['admin', 'super_admin', 'editor', 'support'];
        const hasAllowedRole = user.roles?.some(role => allowedRoles.includes(role)) || allowedRoles.includes(user.role);
        
        if (!hasAllowedRole) {
          router.push('/admin');
          return;
        }

        // Token doğrulaması yap
        const response = await fetch('/api/auth/check', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (!data.success) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          router.push('/admin');
        }
      } catch (error) {
        console.error('Yetkilendirme hatası:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        router.push('/admin');
      }
    };

    checkAuth();
  }, []);

  // Sidebar menü öğeleri
  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <FaChartLine />, path: '/admin/dashboard' },
    { id: 'carriers', name: 'Taşıyıcılar', icon: <FaTruck />, path: '/admin/carriers' },
    { id: 'drivers', name: 'Tüm Sürücüler', icon: <FaIdCard />, path: '/admin/drivers' },
    { id: 'active-drivers', name: 'Aktif Sürücüler', icon: <FaIdCard />, path: '/admin/active-drivers' },
    { id: 'vehicles', name: 'Araçlar', icon: <FaTruck />, path: '/admin/vehicles' },
    { id: 'customers', name: 'Müşteriler', icon: <FaUser />, path: '/admin/customers' },
    { id: 'requests', name: 'Talepler', icon: <FaClipboardList />, path: '/admin/requests' },
    { id: 'shipments', name: 'Taşımalar', icon: <FaShoppingBag />, path: '/admin/shipments' },
    { id: 'payments', name: 'Ödemeler', icon: <FaFileInvoiceDollar />, path: '/admin/payments' },
    { id: 'users', name: 'Kullanıcılar', icon: <FaUsers />, path: '/admin/users' },
    { id: 'settings', name: 'Ayarlar', icon: <FaCog />, path: '/admin/settings' },
  ]

  const isActivePath = (itemPath) => {
    if (itemPath === router.pathname) {
      return true;
    }
    
    if (itemPath !== '/admin/dashboard' && router.pathname.startsWith(itemPath)) {
      return true;
    }
    
    return false;
  }

  // İlk 4 bildirim
  const recentNotifications = notifications.slice(0, 4);

  // Bildirim ikonlarını göster
  const getNotificationIcon = (notification) => {
    const iconClass = "h-5 w-5";
    
    switch (notification.type) {
      case 'user':
        return <FaUserCircle className={iconClass + " text-blue-500"} />;
      case 'payment':
        return <FaMoneyBillWave className={iconClass + " text-green-500"} />;
      case 'shipping':
      case 'carrier':
        return <FaTruck className={iconClass + " text-orange-500"} />;
      case 'message':
        return <FaEnvelope className={iconClass + " text-indigo-500"} />;
      case 'alert':
        return <FaExclamationTriangle className={iconClass + " text-yellow-500"} />;
      case 'error':
        return <FaExclamationCircle className={iconClass + " text-red-500"} />;
      case 'success':
        return <FaCheckCircle className={iconClass + " text-green-500"} />;
      case 'info':
        return <FaInfoCircle className={iconClass + " text-blue-400"} />;
      default:
        return <FaBell className={iconClass + " text-gray-500"} />;
    }
  };
  
  // Bildirime tıklandığında yönlendirilecek rota
  const getNotificationRoute = (notification) => {
    // URL özelliği varsa, direkt olarak onu kullan
    if (notification.url) {
      return notification.url;
    }
    
    // Tip bazında varsayılan rotalar
    switch (notification.type) {
      case 'user':
        return '/admin/users';
      case 'payment':
        return '/admin/payments';
      case 'shipping':
        return '/admin/shipments';
      case 'carrier':
        return '/admin/carriers';
      case 'message':
        return '/admin/messages';
      default:
        return '/admin/dashboard';
    }
  };

  // Çıkış yap fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    router.push('/admin');
  }

  // Tarih formatı
  const formatDate = (date) => {
    if (!date) return ''
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' }
    return date.toLocaleDateString('tr-TR', options)
  }

  // Saat formatı
  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  }

  // Sidebar genişliği
  const sidebarWidth = 280; // px cinsinden

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Sabit konumlu */}
      <aside 
        className={`
          fixed top-0 left-0 z-40 h-screen 
          ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'} 
          bg-white text-gray-700 
          transition-transform duration-300 ease-in-out
          shadow-xl overflow-y-auto
        `}
        style={{ width: `${sidebarWidth}px` }}
      >
          {/* Logo ve başlık */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-center">
              <img src="/logo.png" alt="Taşı.app Logo" className="h-12 object-contain" />
            </div>
          </div>

        {/* Navigasyon Menüsü */}
        <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => (
                <Link 
                key={item.id}
                  href={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActivePath(item.path) 
                    ? 'bg-orange-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
            ))}
          </nav>

        {/* Alt bilgi - Çıkış Yap */}
        <div className="p-4 mt-auto border-t border-gray-200">
              <button
                onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaSignOutAlt className="mr-3" />
                Çıkış Yap
              </button>
          </div>
      </aside>

      {/* Mobil menü için overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Ana içerik alanı */}
      <div 
        className="flex-1 overflow-auto"
        style={{ 
          marginLeft: isMobile ? '0' : `${sidebarWidth}px`,
          width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)` 
        }}
      >
        {/* Üst çubuk */}
        <header className="bg-white shadow-sm z-20 sticky top-0">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            {/* Mobil menü butonu */}
            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
              >
                <FaBars className="h-6 w-6" />
              </button>
            )}

            {/* Sayfa başlığı */}
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>

            {/* Sağ taraf - Arama, bildirimler, profil */}
            <div className="flex items-center space-x-4">
              {/* Arama */}
              <div className="relative hidden md:block">
                <input 
                  type="text" 
                  placeholder="Ara..." 
                  className="bg-gray-100 text-gray-700 rounded-lg pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Tarih ve saat bilgisi */}
                {currentTime && (
                <div className="hidden md:flex items-center border-l border-r border-gray-200 px-4 py-1">
                  <span className="text-sm text-gray-500 font-medium">
                    {formatDate(currentTime)} <span className="mx-1">|</span> {formatTime(currentTime)}
                  </span>
                </div>
                )}
              
              {/* Bildirimler */}
              <div className="relative notifications-container">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900 relative"
                >
                  <FaBell className="h-6 w-6" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                      {notifications.length}
                    </span>
                  )}
                </button>
                
                {/* Bildirim dropdown */}
                {showNotifications && (
                  <div 
                    className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl z-50 notifications-dropdown" 
                    style={{ width: "450px", maxWidth: "450px", minWidth: "450px" }}
                  >
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800">Bildirimler</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {/* Bildirim öğeleri */}
                      {loading ? (
                        <div className="px-4 py-3 text-center">
                          <FaSpinner className="animate-spin inline-block text-orange-500" />
                          <p className="text-sm text-gray-500 mt-2">Bildirimler yükleniyor...</p>
                        </div>
                      ) : recentNotifications.length > 0 ? (
                        recentNotifications.map((notification) => (
                          <a
                            key={notification.id}
                            href={getNotificationRoute(notification)}
                            className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification)}
                              </div>
                              <div className="ml-3 w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">{notification.text}</p>
                                <p className="text-xs text-gray-500">{notification.time}</p>
                              </div>
                            </div>
                          </a>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-center">
                          <p className="text-sm text-gray-500">Bildirim bulunmuyor</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-gray-200">
                      <button 
                        onClick={() => {
                          setShowAllNotifications(true);
                          setShowNotifications(false);
                        }}
                        className="w-full text-center text-sm text-orange-600 hover:text-orange-700"
                      >
                        Tüm Bildirimleri Gör
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Kullanıcı profili */}
              <div className="relative profile-container">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-orange-600 flex items-center justify-center text-white">
                    <FaUser className="h-4 w-4" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">Admin</span>
                </button>

                {/* Profil menüsü */}
                {showProfileMenu && (
                  <div 
                    className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl z-50"
                    style={{ width: "280px", maxWidth: "280px", minWidth: "280px" }}
                  >
                    <Link
                      href="/admin/profile"
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <div className="flex items-center">
                        <FaUserCircle className="mr-3 text-gray-400" />
                        Profil
                      </div>
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <div className="flex items-center">
                        <FaCog className="mr-3 text-gray-400" />
                        Ayarlar
                      </div>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <FaSignOutAlt className="mr-3 text-gray-400" />
                      Çıkış Yap
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* İçerik */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Sayfa içeriği */}
          {children}
        </div>
      </div>

      {/* Tüm Bildirimler Modal */}
      {showAllNotifications && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAllNotifications(false)}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 mx-auto">
              <div className="flex justify-between items-center mb-4 border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-800">Tüm Bildirimler</h2>
                <button onClick={() => setShowAllNotifications(false)} className="text-gray-400 hover:text-gray-500">
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center">
                    <FaSpinner className="animate-spin inline-block text-orange-500" />
                    <p className="text-sm text-gray-500 mt-2">Bildirimler yükleniyor...</p>
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.id} className="p-4 border-b border-gray-100 last:border-0">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          {getNotificationIcon(notification)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{notification.text}</p>
                          <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                          <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                        </div>
                        <a 
                          href={getNotificationRoute(notification)}
                          className="ml-2 text-orange-600 hover:text-orange-700"
                          onClick={() => setShowAllNotifications(false)}
                        >
                          <FaEye className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-gray-500">Bildirim bulunmuyor</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 