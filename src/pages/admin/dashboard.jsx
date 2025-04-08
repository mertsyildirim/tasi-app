'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  FaUsers, FaTruck, FaClipboardList, FaChartLine, FaCog, 
  FaSignOutAlt, FaSearch, FaEdit, FaTrash, FaBell, 
  FaFileInvoiceDollar, FaUserShield, FaBars, FaTimes, FaUser, FaPlus,
  FaEye, FaMapMarkerAlt, FaCheck, FaTimes as FaTimesCircle, FaLocationArrow
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

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/portal/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/portal/login');
      return;
    }
    
    setUser(parsedUser);
    setLoading(false);
  }, [router]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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

      <div className="min-h-screen bg-gray-100">
        {/* Mobil sidebar toggle */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white shadow-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaTruck className="h-8 w-8 text-blue-600" />
              <span className="ml-3 text-xl font-semibold text-gray-900">Yönetici Paneli</span>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 focus:outline-none"
            >
              {sidebarOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-10 w-64 bg-white shadow-lg transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar header */}
            <div className="p-6 border-b">
              <div className="flex items-center">
                <FaTruck className="h-8 w-8 text-blue-600" />
                <span className="ml-3 text-xl font-semibold text-gray-900">Yönetici Paneli</span>
              </div>
            </div>

            {/* Sidebar navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              <a
                href="#"
                className="flex items-center px-4 py-3 text-gray-700 bg-blue-50 rounded-md"
              >
                <FaChartLine className="h-5 w-5 mr-3 text-blue-500" />
                <span>Gösterge Paneli</span>
              </a>
              <a
                href="#"
                className="flex items-center px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-gray-700 rounded-md"
              >
                <FaUsers className="h-5 w-5 mr-3 text-gray-500" />
                <span>Kullanıcılar</span>
              </a>
              <a
                href="#"
                className="flex items-center px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-gray-700 rounded-md"
              >
                <FaTruck className="h-5 w-5 mr-3 text-gray-500" />
                <span>Taşıyıcılar</span>
              </a>
              <a
                href="#"
                className="flex items-center px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-gray-700 rounded-md"
              >
                <FaClipboardList className="h-5 w-5 mr-3 text-gray-500" />
                <span>Taşımalar</span>
              </a>
              <a
                href="#"
                className="flex items-center px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-gray-700 rounded-md"
              >
                <FaCog className="h-5 w-5 mr-3 text-gray-500" />
                <span>Ayarlar</span>
              </a>
            </nav>

            {/* Sidebar footer */}
            <div className="p-4 border-t">
              <div className="mb-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {user?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'admin@tasiapp.com'}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
              >
                <FaSignOutAlt className="h-4 w-4 mr-3" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className={`lg:pl-64 pt-4 lg:pt-0`}>
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-8">Gösterge Paneli</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Toplam Kullanıcılar</p>
                    <p className="text-2xl font-semibold text-gray-900">154</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <FaUsers className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-green-500 text-sm font-medium">↑ 12%</span>
                  <span className="text-gray-500 text-sm ml-2">Son 30 gün</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Toplam Taşıyıcılar</p>
                    <p className="text-2xl font-semibold text-gray-900">28</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <FaTruck className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-green-500 text-sm font-medium">↑ 8%</span>
                  <span className="text-gray-500 text-sm ml-2">Son 30 gün</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Aktif Taşımalar</p>
                    <p className="text-2xl font-semibold text-gray-900">42</p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100">
                    <FaClipboardList className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-green-500 text-sm font-medium">↑ 15%</span>
                  <span className="text-gray-500 text-sm ml-2">Son 30 gün</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Toplam Gelir</p>
                    <p className="text-2xl font-semibold text-gray-900">₺42,580</p>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-100">
                    <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-green-500 text-sm font-medium">↑ 22%</span>
                  <span className="text-gray-500 text-sm ml-2">Son 30 gün</span>
                </div>
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Son Kaydolan Kullanıcılar</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Katılma Tarihi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-lg">A</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">Ali Yılmaz</div>
                            <div className="text-sm text-gray-500">ali@example.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Taşıyıcı</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">12 Mart 2024</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Aktif
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-semibold text-lg">M</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">Mehmet Demir</div>
                            <div className="text-sm text-gray-500">mehmet@example.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Sürücü</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">10 Mart 2024</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Aktif
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <span className="text-yellow-600 font-semibold text-lg">A</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">Ayşe Kaya</div>
                            <div className="text-sm text-gray-500">ayse@example.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Taşıyıcı</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">8 Mart 2024</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Pasif
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
} 