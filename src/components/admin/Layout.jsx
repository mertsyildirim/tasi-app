import React, { useState, useEffect } from 'react'
import { 
  FaUsers, FaTruck, FaClipboardList, FaChartLine, FaCog, 
  FaSignOutAlt, FaSearch, FaBell, FaFileInvoiceDollar, 
  FaBars, FaTimes, FaUser, FaShoppingBag, FaCreditCard,
  FaEnvelope, FaUserCircle, FaRegBell, FaEye, FaExternalLinkAlt, FaCheckCircle, FaEllipsisH, FaIdCard
} from 'react-icons/fa'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function AdminLayout({ children, title, isBlurred }) {
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
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
    { id: 'customers', name: 'Müşteriler', icon: <FaUser />, path: '/admin/customers' },
    { id: 'requests', name: 'Talepler', icon: <FaClipboardList />, path: '/admin/requests' },
    { id: 'shipments', name: 'Taşımalar', icon: <FaShoppingBag />, path: '/admin/shipments' },
    { id: 'payments', name: 'Ödemeler', icon: <FaFileInvoiceDollar />, path: '/admin/payments' },
    { id: 'settings', name: 'Ayarlar', icon: <FaCog />, path: '/admin/settings' },
  ]

  // Örnek notifikasyonlar - genişletilmiş versiyon
  const notifications = [
    { 
      id: 1, 
      text: 'Yeni taşıyıcı başvurusu', 
      time: '5 dk önce', 
      icon: <FaTruck className="text-orange-500" />,
      detailUrl: '/admin/carriers',
      description: 'Ahmet Yıldız isimli taşıyıcı sisteme kayıt olmak için başvuru yaptı. Lütfen başvuruyu inceleyip onaylayın.'
    },
    { 
      id: 2, 
      text: 'Ödeme onaylandı: #5142', 
      time: '1 saat önce', 
      icon: <FaCreditCard className="text-green-500" />,
      detailUrl: '/admin/payments',
      description: '#5142 numaralı taşıma ödemesi başarıyla tamamlandı. Toplam tutar: 450₺'
    },
    { 
      id: 3, 
      text: 'Yeni mesaj: Mehmet Kaya', 
      time: '3 saat önce', 
      icon: <FaEnvelope className="text-blue-500" />,
      detailUrl: '/admin/messages',
      description: 'Mehmet Kaya: "Taşıma sırasında fazladan 2 koli daha eklemek istiyorum, mümkün müdür?"'
    },
    { 
      id: 4, 
      text: 'Taşıma tamamlandı: #3201', 
      time: '5 saat önce', 
      icon: <FaTruck className="text-green-500" />,
      detailUrl: '/admin/shipments',
      description: '#3201 numaralı taşıma başarıyla tamamlandı. Müşteri Ayşe Demir teslimatı onayladı.'
    },
    { 
      id: 5, 
      text: 'Yeni müşteri kaydı', 
      time: '6 saat önce', 
      icon: <FaUser className="text-purple-500" />,
      detailUrl: '/admin/customers',
      description: 'Leyla Kara sisteme yeni müşteri olarak kayıt oldu. Telefon numarası: 0532 XXX XX XX'
    },
    { 
      id: 6, 
      text: 'Ödeme bekleyen: #4855', 
      time: '7 saat önce', 
      icon: <FaFileInvoiceDollar className="text-yellow-500" />,
      detailUrl: '/admin/payments',
      description: '#4855 numaralı taşıma için ödeme 24 saat içinde yapılmazsa iptal edilecek. Toplam tutar: 320₺'
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
    router.push('/admin')
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
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobil menü butonu */}
      <div className={`md:hidden bg-orange-600 p-4 flex justify-between items-center ${isBlurred || showAllNotifications ? 'blur-sm' : ''}`}>
        <h1 className="text-white text-xl font-bold">Taşı.app Admin</h1>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white p-2"
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
      
      {/* Sidebar - Sabit (Sticky) */}
      <div 
        className={`
          ${isMobile ? (sidebarOpen ? 'block' : 'hidden') : 'block'} 
          bg-orange-600 text-white w-full md:w-64 
          md:sticky md:top-0 md:h-screen overflow-y-auto
          transition-all duration-300
          ${isBlurred || showAllNotifications ? 'blur-sm' : ''}
        `}
      >
        <div className="p-4 border-b border-orange-500">
          <h1 className="text-2xl font-bold">Taşı.app Admin</h1>
        </div>
        <nav className="mt-4 h-full overflow-y-auto">
          <ul>
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <Link 
                  href={item.path}
                  className={`flex items-center w-full px-4 py-3 hover:bg-orange-700 transition-colors ${
                    router.pathname === item.path ? 'bg-orange-700' : ''
                  }`}
                  onClick={() => {
                    if (isMobile) setSidebarOpen(false)
                  }}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
            <li className="mt-auto">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 hover:bg-orange-700 transition-colors mt-8 text-orange-200"
              >
                <span className="mr-3"><FaSignOutAlt /></span>
                Çıkış Yap
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Ana İçerik */}
      <div className="flex-1 overflow-x-hidden relative">
        {/* Header */}
        <header className={`bg-white shadow-md sticky top-0 z-50 w-full ${isBlurred || showAllNotifications ? 'blur-sm' : ''}`}>
          <div className="mx-auto p-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <div className="flex items-center">
              <div className="mr-4 text-right">
                <p className="text-sm font-medium text-gray-700">{formatDate(currentTime)}</p>
                <p className="text-sm text-gray-500">{formatTime(currentTime)}</p>
              </div>
              
              {/* Bildirimler Dropdown */}
              <div className="relative mr-3 notifications-container">
                <button 
                  className="p-2 text-gray-600 hover:text-orange-600 transition-colors relative" 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                >
                  <FaBell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-700">Bildirimler</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {recentNotifications.map(notification => (
                        <div key={notification.id} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                          <div className="flex items-start">
                            <div className="mr-3 mt-1">{notification.icon}</div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{notification.text}</p>
                              <p className="text-xs text-gray-500">{notification.time}</p>
                            </div>
                            <button 
                              onClick={() => router.push(notification.detailUrl)}
                              className="ml-2 text-xs py-1 px-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                              title="İncele"
                            >
                              <FaEye />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100">
                      <button 
                        className="text-sm text-orange-600 hover:text-orange-800 w-full text-center"
                        onClick={() => {
                          setShowNotifications(false);
                          setShowAllNotifications(true);
                        }}
                      >
                        Tümünü Görüntüle
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Profil Dropdown */}
              <div className="relative profile-container">
                <button 
                  className="bg-white p-2 rounded-full border border-gray-200 flex items-center justify-center hover:border-orange-300 transition-colors" 
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                >
                  <img src="/images/avatar.png" alt="Admin" className="w-8 h-8 rounded-full" onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                  }} />
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">Admin Kullanıcı</p>
                      <p className="text-sm text-gray-500 truncate">admin@tasiapp.com</p>
                    </div>
                    <Link href="/admin/settings" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                      Profil Ayarları
                    </Link>
                    <button 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={handleLogout}
                    >
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Sayfa İçeriği */}
        <main className={`p-4 md:p-6 ${showAllNotifications ? 'blur-sm' : ''}`}>
          {children}
        </main>
      </div>

      {/* Tüm Bildirimler Modal */}
      {showAllNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget) setShowAllNotifications(false);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Tüm Bildirimler</h3>
              <button 
                onClick={() => setShowAllNotifications(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4 flex justify-between items-center">
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-orange-100 text-orange-800 rounded-md text-sm font-medium">
                    Tümü
                  </button>
                  <button className="px-3 py-1 hover:bg-gray-100 text-gray-700 rounded-md text-sm font-medium">
                    Okunmamış
                  </button>
                </div>
                <button className="text-sm text-orange-600 hover:text-orange-800 flex items-center">
                  <FaCheckCircle className="mr-1" /> Tümünü Okundu İşaretle
                </button>
              </div>
              <div className="space-y-2">
                {notifications.map(notification => (
                  <div key={notification.id} className="border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="bg-gray-100 p-3 rounded-full mr-3">
                            {notification.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{notification.text}</h4>
                            <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
                            <p className="text-sm text-gray-600 mt-2">{notification.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => {
                              setShowAllNotifications(false);
                              router.push(notification.detailUrl);
                            }} 
                            className="bg-orange-600 text-white py-2 px-3 rounded hover:bg-orange-700 transition-colors flex items-center"
                          >
                            <FaEye className="mr-1" /> İncele
                          </button>
                          <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <FaEllipsisH />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 