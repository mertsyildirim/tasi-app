import React, { useState, useEffect } from 'react'
import { 
  FaUsers, FaTruck, FaClipboardList, FaChartLine, FaCog, 
  FaSignOutAlt, FaSearch, FaBell, FaFileInvoiceDollar, 
  FaBars, FaTimes, FaUser, FaShoppingBag, FaCreditCard,
  FaEnvelope, FaUserCircle, FaRegBell, FaEye, FaExternalLinkAlt, FaCheckCircle, FaEllipsisH, FaIdCard
} from 'react-icons/fa'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function AdminLayout({ children, title }) {
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(null) // Başlangıçta null
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAllNotifications, setShowAllNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const router = useRouter()

  // Mobil cihaz kontrolü
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  // Saat güncellemesi
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => {
      clearInterval(timer)
    }
  }, [])

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

  // Sidebar menü öğeleri
  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <FaChartLine />, path: '/admin/dashboard' },
    { id: 'carriers', name: 'Taşıyıcılar', icon: <FaTruck />, path: '/admin/carriers' },
    { id: 'drivers', name: 'Sürücüler', icon: <FaIdCard />, path: '/admin/drivers' },
    { id: 'vehicles', name: 'Araçlar', icon: <FaTruck />, path: '/admin/vehicles' },
    { id: 'customers', name: 'Müşteriler', icon: <FaUser />, path: '/admin/customers' },
    { id: 'requests', name: 'Talepler', icon: <FaClipboardList />, path: '/admin/requests' },
    { id: 'shipments', name: 'Taşımalar', icon: <FaShoppingBag />, path: '/admin/shipments' },
    { id: 'payments', name: 'Ödemeler', icon: <FaFileInvoiceDollar />, path: '/admin/payments' },
    { id: 'settings', name: 'Ayarlar', icon: <FaCog />, path: '/admin/settings' },
  ]

  // Örnek bildirimler
  const notifications = [
    { 
      id: 1, 
      text: 'Yeni taşıyıcı kaydı: ABC Lojistik', 
      time: '5 dakika önce', 
      icon: <FaTruck className="text-blue-500" />,
      detailUrl: '/admin/carriers',
      description: 'ABC Lojistik firması sisteme kaydoldu. Onay bekliyor.'
    },
    { 
      id: 2, 
      text: 'Yeni ödeme alındı: ₺12,500', 
      time: '15 dakika önce', 
      icon: <FaFileInvoiceDollar className="text-green-500" />,
      detailUrl: '/admin/payments',
      description: 'XYZ firmasından yeni bir ödeme alındı.'
    },
    { 
      id: 3, 
      text: 'Yeni mesaj: 3 okunmamış', 
      time: '1 saat önce', 
      icon: <FaEnvelope className="text-purple-500" />,
      detailUrl: '/admin/messages',
      description: '3 yeni mesajınız var.'
    },
    { 
      id: 4, 
      text: 'Sistem güncellemesi', 
      time: '2 saat önce', 
      icon: <FaCog className="text-gray-500" />,
      detailUrl: '/admin/settings',
      description: 'Sistem başarıyla güncellendi.'
    },
    { 
      id: 5, 
      text: 'Yeni sürücü kaydı: Mehmet Yılmaz', 
      time: '3 saat önce', 
      icon: <FaIdCard className="text-orange-500" />,
      detailUrl: '/admin/drivers',
      description: 'Yeni bir sürücü kaydı oluşturuldu.'
    },
    { 
      id: 6, 
      text: 'Taşıma tamamlandı: #1234', 
      time: '5 saat önce', 
      icon: <FaCheckCircle className="text-green-500" />,
      detailUrl: '/admin/shipments',
      description: 'İstanbul - Ankara taşıması başarıyla tamamlandı.'
    },
    { 
      id: 7, 
      text: 'Yeni taşıma talebi: #6023', 
      time: '8 saat önce', 
      icon: <FaClipboardList className="text-orange-500" />,
      detailUrl: '/admin/requests',
      description: 'Müşteri İbrahim Yılmaz tarafından yeni bir taşıma talebi oluşturuldu. Rota: İstanbul - Ankara'
    },
  ]

  // İlk 4 bildirim
  const recentNotifications = notifications.slice(0, 4);

  // Taşıma tipi ve rota belirleme
  const getNotificationRoute = (notification) => {
    if (notification.text.includes('taşıyıcı')) {
      return '/admin/carriers';
    } else if (notification.text.includes('Ödeme')) {
      return '/admin/payments';
    } else if (notification.text.includes('mesaj')) {
      return '/admin/messages';
    } else if (notification.text.includes('Taşıma')) {
      return '/admin/shipments';
    } else {
      return '/admin/dashboard';
    }
  };

  // Çıkış yap fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/portal/login');
  }

  // Tarih formatı
  const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' }
    return date.toLocaleDateString('tr-TR', options)
  }

  // Saat formatı
  const formatTime = (date) => {
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' }
    return date.toLocaleTimeString('tr-TR', options)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobil menü butonu */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-20 bg-orange-600 p-4 flex justify-between items-center`}>
        <h1 className="text-white text-xl font-bold">Taşı.app Admin</h1>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white p-2"
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
      
      {/* Sidebar */}
      <div 
        className={`
          ${isMobile ? (sidebarOpen ? 'block' : 'hidden') : 'block'} 
          fixed inset-y-0 left-0 z-10 w-64 bg-orange-600 text-white
          transition-all duration-300
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo ve başlık */}
          <div className="p-6 border-b border-orange-500">
            <div className="flex items-center space-x-3">
              <FaTruck className="h-8 w-8" />
              <h1 className="text-xl font-bold">Taşı.app Admin</h1>
            </div>
        </div>

          {/* Navigasyon */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => (
                <Link 
                key={item.id}
                  href={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  router.pathname === item.path 
                    ? 'bg-orange-700 text-white' 
                    : 'text-orange-100 hover:bg-orange-700'
                  }`}
                  onClick={() => {
                    if (isMobile) setSidebarOpen(false)
                  }}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
            ))}
          </nav>

          {/* Alt bilgi */}
          <div className="p-4 border-t border-orange-500">
              <button
                onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-orange-100 hover:bg-orange-700 rounded-lg transition-colors"
              >
                <FaSignOutAlt className="mr-3" />
                Çıkış Yap
              </button>
          </div>
        </div>
      </div>

      {/* Ana İçerik */}
      <div className={`lg:ml-64 transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            {/* Başlık */}
            <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>

            {/* Arama ve Bildirimler */}
            <div className="flex items-center space-x-6">
              {/* Arama */}
              <div className="relative hidden md:block">
                <input 
                  type="text" 
                  placeholder="Ara..." 
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Saat ve Tarih */}
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                {currentTime && (
                  <>
                    <span>{formatDate(currentTime)}</span>
                    <span>|</span>
                    <span>{formatTime(currentTime)}</span>
                  </>
                )}
              </div>
              
              {/* Bildirimler */}
              <div className="relative notifications-container">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <span className="sr-only">Bildirimleri Görüntüle</span>
                  <FaBell className="h-6 w-6" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </button>
                
                {/* Bildirimler Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-20">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800">Bildirimler</h4>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                      {recentNotifications.length > 0 ? (
                        recentNotifications.map((notification) => (
                          <Link 
                            key={notification.id}
                            href={notification.detailUrl || '#'}
                            className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {notification.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{notification.text}</p>
                                <p className="text-xs text-gray-500 truncate">{notification.description}</p>
                                <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-center text-sm text-gray-500">
                          Yeni bildirim yok.
                        </div>
                      )}
                    </div>
                    <div className="px-4 py-3 border-t border-gray-200">
                      <button 
                        onClick={() => {setShowNotifications(false); setShowAllNotifications(true)}}
                        className="w-full text-center text-sm text-orange-600 hover:underline"
                      >
                        Tüm Bildirimleri Göster
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Profil Menüsü */}
              <div className="relative profile-container">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <FaUserCircle className="h-8 w-8 text-gray-600" />
                  <span className="ml-2 hidden md:block text-gray-700">Admin User</span>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                    <Link href="/admin/profile"
                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Profil
                      </Link>
                    <Link href="/admin/settings" 
                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Ayarlar
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* İçerik Alanı */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Tüm Bildirimler Modalı */}
      {showAllNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget) setShowAllNotifications(false);
        }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-lg">Tüm Bildirimler</h3>
              <button 
                onClick={() => setShowAllNotifications(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6 divide-y divide-gray-100">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 bg-gray-100 p-3 rounded-full">
                            {notification.icon}
                          </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium text-gray-900">{notification.text}</p>
                          <p className="text-xs text-gray-400 flex-shrink-0 ml-4">{notification.time}</p>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{notification.description}</p>
                        {notification.detailUrl && (
                          <Link 
                            href={notification.detailUrl}
                            className="text-xs text-orange-600 hover:underline mt-1 inline-flex items-center"
                            onClick={() => setShowAllNotifications(false)}
                          >
                            Detayları Gör <FaExternalLinkAlt className="ml-1 h-3 w-3" />
                          </Link>
                        )}
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 p-1">
                        <FaEllipsisH />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FaRegBell className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Bildirim yok</h3>
                  <p className="mt-1 text-sm text-gray-500">Henüz size gönderilmiş bir bildirim yok.</p>
                </div>
              )}
              </div>
            <div className="p-4 border-t border-gray-200 flex justify-end sticky bottom-0 bg-white z-10">
              <button 
                onClick={() => setShowAllNotifications(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded flex items-center"
              >
                <FaTimes className="mr-2" /> Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FaRegBell className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Bildirim yok</h3>
                  <p className="mt-1 text-sm text-gray-500">Henüz size gönderilmiş bir bildirim yok.</p>
                </div>
              )}
              </div>
            <div className="p-4 border-t border-gray-200 flex justify-end sticky bottom-0 bg-white z-10">
              <button 
                onClick={() => setShowAllNotifications(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded flex items-center"
              >
                <FaTimes className="mr-2" /> Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 