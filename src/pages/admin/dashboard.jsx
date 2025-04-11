'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  FaUsers, FaTruck, FaClipboardList, FaChartLine, FaCog, 
  FaSignOutAlt, FaSearch, FaEdit, FaTrash, FaBell, 
  FaFileInvoiceDollar, FaUserShield, FaBars, FaTimes, FaUser, FaPlus,
  FaEye, FaMapMarkerAlt, FaCheck, FaTimes as FaTimesCircle, FaLocationArrow,
  FaShoppingBag, FaCreditCard, FaEnvelope, FaUserCircle, FaRegBell, FaExternalLinkAlt, FaCheckCircle, FaEllipsisH, FaIdCard,
  FaArrowUp, FaArrowDown, FaBox, FaRoute
} from 'react-icons/fa'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/admin/Layout'
import Image from 'next/image'
import Head from 'next/head'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showActivitiesModal, setShowActivitiesModal] = useState(false)
  const [applicationFilter, setApplicationFilter] = useState('taşıyıcı')
  const [shipmentDetailModal, setShipmentDetailModal] = useState(null)
  const [applicationDetailModal, setApplicationDetailModal] = useState(null)
  const [driverLocationModal, setDriverLocationModal] = useState(null)
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Kullanıcı kontrolü - giriş yapmamış veya admin olmayan kullanıcılar için
  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('user');
      
      if (!userData) {
        console.log('Kullanıcı girişi bulunamadı, yönlendiriliyor...');
        router.replace('/admin');
        return;
      }

      try {
        const user = JSON.parse(userData);
        
        if (!(user.type === 'admin' || user.role === 'admin')) {
          console.log('Admin yetkisi bulunamadı, yönlendiriliyor...');
          router.replace('/admin');
          return;
        }
        
        setUser(user);
        setLoading(false);
      } catch (err) {
        console.error('Kullanıcı bilgisi çözümlenirken hata:', err);
        localStorage.removeItem('user');
        router.replace('/admin');
      }
    };
    
    checkAuth();
  }, [router]);

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
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      if (showActivitiesModal) setShowActivitiesModal(false);
      if (shipmentDetailModal) setShipmentDetailModal(null);
      if (applicationDetailModal) setApplicationDetailModal(null);
      if (driverLocationModal) setDriverLocationModal(null);
    }
  }, [showActivitiesModal, shipmentDetailModal, applicationDetailModal, driverLocationModal]);

  useEffect(() => {
    // ESC tuşu için event listener ekle
    document.addEventListener('keydown', handleKeyDown);
    
    // Modal açıkken body scroll'u engelle
    if (showActivitiesModal || shipmentDetailModal || applicationDetailModal || driverLocationModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    }
  }, [showActivitiesModal, shipmentDetailModal, applicationDetailModal, driverLocationModal, handleKeyDown]);

  // Örnek veri
  const users = [
    { id: 1, name: 'Ahmet Yılmaz', email: 'ahmet@example.com', type: 'Müşteri', status: 'Aktif', date: '01.04.2023' },
    { id: 2, name: 'Mehmet Kaya', email: 'mehmet@example.com', type: 'Taşıyıcı', status: 'Aktif', date: '15.03.2023' },
    { id: 3, name: 'Ayşe Demir', email: 'ayse@example.com', type: 'Müşteri', status: 'Pasif', date: '10.02.2023' },
    { id: 4, name: 'Fatma Çelik', email: 'fatma@example.com', type: 'Taşıyıcı', status: 'Aktif', date: '22.03.2023' },
    { id: 5, name: 'Ali Öztürk', email: 'ali@example.com', type: 'Müşteri', status: 'Aktif', date: '05.04.2023' },
  ]
  
  const shipments = [
    { id: 1, customer: 'Ahmet Yılmaz', carrier: 'Mehmet Kaya', from: 'İstanbul, Kadıköy', to: 'İstanbul, Beşiktaş', status: 'Tamamlandı', amount: '₺350', date: '03.04.2023' },
    { id: 2, customer: 'Ayşe Demir', carrier: 'Fatma Çelik', from: 'Ankara, Çankaya', to: 'Ankara, Keçiören', status: 'Taşınıyor', amount: '₺420', date: '05.04.2023' },
    { id: 3, customer: 'Ali Öztürk', carrier: 'Mehmet Kaya', from: 'İzmir, Karşıyaka', to: 'İzmir, Konak', status: 'Beklemede', amount: '₺280', date: '07.04.2023' },
    { id: 4, customer: 'Ahmet Yılmaz', carrier: 'Fatma Çelik', from: 'İstanbul, Ümraniye', to: 'İstanbul, Ataşehir', status: 'Tamamlandı', amount: '₺300', date: '01.04.2023' },
    { id: 5, customer: 'Ayşe Demir', carrier: 'Mehmet Kaya', from: 'Ankara, Etimesgut', to: 'Ankara, Sincan', status: 'İptal Edildi', amount: '₺390', date: '02.04.2023' },
  ]

  // Örnek sürücü verileri
  const drivers = [
    { id: 1, name: 'Mehmet Kaya', vehicle: 'Kamyon', status: 'Aktif', location: 'İstanbul, Kadıköy', lastActive: '10 dk önce' },
    { id: 2, name: 'Fatma Çelik', vehicle: 'Kamyonet', status: 'Taşınıyor', location: 'Ankara, Çankaya', lastActive: '5 dk önce' },
    { id: 3, name: 'Murat Demir', vehicle: 'Tır', status: 'Aktif', location: 'İzmir, Konak', lastActive: '30 dk önce' },
  ]

  // Örnek başvuru verileri
  const driverApplications = [
    { id: 2, name: 'Ayşe Kara', type: 'Sürücü', company: 'Güven Nakliyat', date: '04.04.2023', status: 'Beklemede' },
    { id: 4, name: 'Zeynep Can', type: 'Sürücü', company: 'Anadolu Lojistik', date: '02.04.2023', status: 'Beklemede' },
    { id: 5, name: 'Mustafa Yılmaz', type: 'Sürücü', company: 'Yılmaz Transport', date: '01.04.2023', status: 'Beklemede' },
    { id: 6, name: 'Kemal Demir', type: 'Sürücü', company: 'Demir Nakliyat', date: '30.03.2023', status: 'Beklemede' },
  ]

  const carrierApplications = [
    { id: 1, name: 'Ahmet Şahin', type: 'Taşıyıcı', company: 'Şahin Lojistik', date: '05.04.2023', status: 'Beklemede' },
    { id: 3, name: 'Hasan Yıldız', type: 'Taşıyıcı', company: 'Yıldız Taşımacılık', date: '03.04.2023', status: 'Beklemede' },
    { id: 7, name: 'Mehmet Koç', type: 'Taşıyıcı', company: 'Koç Lojistik', date: '29.03.2023', status: 'Beklemede' },
    { id: 8, name: 'Ali Tekin', type: 'Taşıyıcı', company: 'Tekin Transport', date: '28.03.2023', status: 'Beklemede' },
  ]

  // Aktif filtre durumuna göre uygulamaları seç
  const filteredApplications = applicationFilter === 'sürücü' ? driverApplications : carrierApplications;

  // Örnek etkinlik verileri
  const allActivities = [
    { id: 1, type: 'user', text: 'Yeni kullanıcı kaydoldu: Mehmet Kaya', time: '10 dakika önce', icon: <FaUser className="text-blue-600 text-xs" /> },
    { id: 2, type: 'shipment', text: 'Taşıma tamamlandı: #35', time: '1 saat önce', icon: <FaTruck className="text-green-600 text-xs" /> },
    { id: 3, type: 'payment', text: 'Yeni ödeme alındı: ₺350', time: '3 saat önce', icon: <FaFileInvoiceDollar className="text-yellow-600 text-xs" /> },
    { id: 4, type: 'user', text: 'Yeni taşıyıcı kaydoldu: Ahmet Demir', time: '5 saat önce', icon: <FaUser className="text-blue-600 text-xs" /> },
    { id: 5, type: 'request', text: 'Yeni talep oluşturuldu: #42', time: '6 saat önce', icon: <FaClipboardList className="text-purple-600 text-xs" /> },
    { id: 6, type: 'shipment', text: 'Taşıma iptal edildi: #28', time: '12 saat önce', icon: <FaTruck className="text-red-600 text-xs" /> },
    { id: 7, type: 'payment', text: 'Komisyon tahsil edildi: ₺120', time: '1 gün önce', icon: <FaFileInvoiceDollar className="text-yellow-600 text-xs" /> },
    { id: 8, type: 'user', text: 'Kullanıcı güncellendi: Ayşe Kaya', time: '1 gün önce', icon: <FaUser className="text-blue-600 text-xs" /> },
    { id: 9, type: 'shipment', text: 'Yeni taşıma başlatıldı: #39', time: '2 gün önce', icon: <FaTruck className="text-orange-600 text-xs" /> },
    { id: 10, type: 'request', text: 'Talep onaylandı: #37', time: '2 gün önce', icon: <FaClipboardList className="text-green-600 text-xs" /> },
  ]

  // Sidebar menü öğeleri
  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <FaChartLine /> },
    { id: 'users', name: 'Kullanıcılar', icon: <FaUsers /> },
    { id: 'shipments', name: 'Taşımalar', icon: <FaTruck /> },
    { id: 'requests', name: 'Talepler', icon: <FaClipboardList /> },
    { id: 'payments', name: 'Ödemeler', icon: <FaFileInvoiceDollar /> },
    { id: 'settings', name: 'Ayarlar', icon: <FaCog /> },
  ]

  // Durum renkleri
  const getStatusColor = (status) => {
    switch(status) {
      case 'Aktif':
      case 'Tamamlandı':
        return 'bg-green-100 text-green-800'
      case 'Pasif':
      case 'İptal Edildi':
        return 'bg-red-100 text-red-800'
      case 'Taşınıyor':
        return 'bg-blue-100 text-blue-800'
      case 'Beklemede':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Çıkış yap fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/admin');
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

  // Örnek veriler
  const stats = [
    {
      title: 'Toplam Taşıma',
      value: '1,234',
      change: '+12.5%',
      trend: 'up',
      icon: <FaTruck className="h-6 w-6" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Aktif Taşıyıcılar',
      value: '456',
      change: '+8.2%',
      trend: 'up',
      icon: <FaUsers className="h-6 w-6" />,
      color: 'bg-green-500'
    },
    {
      title: 'Bekleyen Talepler',
      value: '89',
      change: '-3.1%',
      trend: 'down',
      icon: <FaClipboardList className="h-6 w-6" />,
      color: 'bg-yellow-500'
    },
    {
      title: 'Toplam Gelir',
      value: '₺234,567',
      change: '+15.3%',
      trend: 'up',
      icon: <FaFileInvoiceDollar className="h-6 w-6" />,
      color: 'bg-purple-500'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'shipment',
      title: 'Yeni Taşıma Talebi',
      description: 'İstanbul - Ankara arası yeni bir taşıma talebi oluşturuldu',
      time: '5 dakika önce',
      icon: <FaTruck className="h-5 w-5" />,
      color: 'text-blue-500'
    },
    {
      id: 2,
      type: 'user',
      title: 'Yeni Taşıyıcı Kaydı',
      description: 'ABC Lojistik firması sisteme kaydoldu',
      time: '15 dakika önce',
      icon: <FaUser className="h-5 w-5" />,
      color: 'text-green-500'
    },
    {
      id: 3,
      type: 'payment',
      title: 'Ödeme Alındı',
      description: 'XYZ firmasından ₺12,500 ödeme alındı',
      time: '1 saat önce',
      icon: <FaCreditCard className="h-5 w-5" />,
      color: 'text-purple-500'
    },
    {
      id: 4,
      type: 'route',
      title: 'Rota Güncellendi',
      description: 'İzmir - Antalya rotası güncellendi',
      time: '2 saat önce',
      icon: <FaRoute className="h-5 w-5" />,
      color: 'text-yellow-500'
    }
  ]

  const topCarriers = [
    {
      id: 1,
      name: 'ABC Lojistik',
      shipments: 234,
      rating: 4.8,
      status: 'Aktif',
      lastActive: '5 dakika önce'
    },
    {
      id: 2,
      name: 'XYZ Transport',
      shipments: 189,
      rating: 4.6,
      status: 'Aktif',
      lastActive: '15 dakika önce'
    },
    {
      id: 3,
      name: '123 Nakliyat',
      shipments: 156,
      rating: 4.5,
      status: 'Aktif',
      lastActive: '1 saat önce'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Yönetici Paneli | Taşı.app</title>
        <meta name="description" content="Taşı.app yönetici kontrol paneli" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AdminLayout title="Dashboard">
        <div className="space-y-6">
          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg text-white`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="ml-2 text-gray-500 text-sm">geçen aya göre</span>
                </div>
              </div>
            ))}
          </div>

          {/* Ana İçerik Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Son Aktiviteler */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Son Aktiviteler</h2>
                <button className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                  Tümünü Gör
                </button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50">
                    <div className={`${activity.color} p-2 rounded-lg`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* En İyi Taşıyıcılar */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">En İyi Taşıyıcılar</h2>
                <button className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                  Tümünü Gör
                </button>
              </div>
              <div className="space-y-4">
                {topCarriers.map((carrier) => (
                  <div key={carrier.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <span className="text-orange-600 font-semibold">
                          {carrier.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{carrier.name}</h3>
                        <p className="text-xs text-gray-500">{carrier.lastActive}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{carrier.shipments} taşıma</p>
                      <div className="flex items-center text-yellow-500 text-sm">
                        <span>★</span>
                        <span className="ml-1">{carrier.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alt Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Harita */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Aktif Taşımalar</h2>
              <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Harita yükleniyor...</p>
              </div>
            </div>

            {/* Grafik */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Taşıma İstatistikleri</h2>
              <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Grafik yükleniyor...</p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  )
} 