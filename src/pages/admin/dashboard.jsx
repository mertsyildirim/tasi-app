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
    // Çıkış işlemleri burada yapılır
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
    <AdminLayout title="Dashboard" isBlurred={showActivitiesModal || shipmentDetailModal || applicationDetailModal || driverLocationModal}>
      <div className={showActivitiesModal || shipmentDetailModal || applicationDetailModal || driverLocationModal ? "blur-sm" : ""}>
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <FaUsers className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Toplam Kullanıcı</h3>
                <p className="text-2xl font-bold">1,250</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaTruck className="text-green-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Tamamlanan Taşıma</h3>
                <p className="text-2xl font-bold">856</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <FaClipboardList className="text-yellow-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Aktif Talep</h3>
                <p className="text-2xl font-bold">42</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <FaFileInvoiceDollar className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Aylık Gelir</h3>
                <p className="text-2xl font-bold">₺45,500</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Son Taşımalar */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold">Son Taşımalar</h3>
            <button 
              className="text-sm text-orange-600 hover:text-orange-700"
              onClick={() => router.push('/admin/shipments')}
            >
              Tümünü Gör &rarr;
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taşıyıcı</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{shipment.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shipment.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shipment.carrier}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(shipment.status)}`}>
                        {shipment.status === 'Taşınıyor' ? 'Taşıma Sürecinde' : shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shipment.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button 
                        className="text-orange-600 hover:text-orange-800 transition-colors" 
                        title="İncele"
                        onClick={() => setShipmentDetailModal(shipment)}
                      >
                        <FaEye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <FaTruck className="mr-2 text-orange-600" /> Aktif Sürücüler
            </h3>
            <div className="space-y-4">
              {drivers.map(driver => (
                <div key={driver.id} className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    {driver.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{driver.name}</p>
                    <p className="text-sm text-gray-500">{driver.vehicle} - {driver.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(driver.status)}`}>
                      {driver.status === 'Taşınıyor' ? 'Taşıma Sürecinde' : driver.status}
                    </span>
                    <button 
                      className="text-orange-600 hover:text-orange-800 transition-colors" 
                      title="Sürücüyü Takip Et"
                      onClick={() => setDriverLocationModal(driver)}
                    >
                      <FaLocationArrow className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button 
              className="mt-4 text-sm text-orange-600 hover:text-orange-700"
              onClick={() => router.push('/admin/active-drivers')}
            >
              Tüm aktif sürücüleri görüntüle &rarr;
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <FaClipboardList className="mr-2 text-orange-600" /> Son Etkinlikler
            </h3>
            <div className="space-y-4">
              <div className="flex">
                <div className="mr-3 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaUser className="text-blue-600 text-xs" />
                  </div>
                </div>
                <div>
                  <p className="text-sm">Yeni kullanıcı kaydoldu: <span className="font-medium">Mehmet Kaya</span></p>
                  <p className="text-xs text-gray-500">10 dakika önce</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-3 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <FaTruck className="text-green-600 text-xs" />
                  </div>
                </div>
                <div>
                  <p className="text-sm">Taşıma tamamlandı: <span className="font-medium">#35</span></p>
                  <p className="text-xs text-gray-500">1 saat önce</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-3 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <FaFileInvoiceDollar className="text-yellow-600 text-xs" />
                  </div>
                </div>
                <div>
                  <p className="text-sm">Yeni ödeme alındı: <span className="font-medium">₺350</span></p>
                  <p className="text-xs text-gray-500">3 saat önce</p>
                </div>
              </div>
            </div>
            <button className="mt-4 text-sm text-orange-600 hover:text-orange-700"
              onClick={() => setShowActivitiesModal(true)}>
              Tüm etkinlikleri görüntüle &rarr;
            </button>
          </div>
        </div>

        {/* Taşıyıcı/Sürücü Başvuruları */}
        <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold">Taşıyıcı/Sürücü Başvuruları</h3>
            <div className="flex space-x-1">
              <button 
                className={`px-3 py-1 text-sm rounded-md ${applicationFilter === 'taşıyıcı' ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-100'}`}
                onClick={() => setApplicationFilter('taşıyıcı')}
              >
                Taşıyıcılar
              </button>
              <button 
                className={`px-3 py-1 text-sm rounded-md ${applicationFilter === 'sürücü' ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-100'}`}
                onClick={() => setApplicationFilter('sürücü')}
              >
                Sürücüler
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Soyad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Firma</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başvuru Tarihi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{app.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.company}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        className="text-orange-600 hover:text-orange-800 transition-colors" 
                        title="İncele"
                        onClick={() => setApplicationDetailModal(app)}
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Toplam <span className="font-medium">{filteredApplications.length}</span> bekleyen başvuru
            </div>
            <div className="flex space-x-1">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                Tümünü Görüntüle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shipment Detay Modal'i */}
      {shipmentDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget) setShipmentDetailModal(null);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Taşıma Detayları</h3>
              <button 
                onClick={() => setShipmentDetailModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Taşıma No</p>
                  <p className="font-medium">#{shipmentDetailModal.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tarih</p>
                  <p className="font-medium">{shipmentDetailModal.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Müşteri</p>
                  <p className="font-medium">{shipmentDetailModal.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Taşıyıcı</p>
                  <p className="font-medium">{shipmentDetailModal.carrier}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tutar</p>
                  <p className="font-medium">{shipmentDetailModal.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Durum</p>
                  <p className="font-medium">
                    <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(shipmentDetailModal.status)}`}>
                      {shipmentDetailModal.status}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Rota Bilgileri</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="mb-2">
                      <span className="font-medium">Nereden:</span> {shipmentDetailModal.from}
                    </p>
                    <p>
                      <span className="font-medium">Nereye:</span> {shipmentDetailModal.to}
                    </p>
                  </div>
                </div>

                <div className="mb-6 mt-4">
                  <h4 className="font-medium mb-2">Taşıma İncele</h4>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Araç Tipi:</span> {shipmentDetailModal.carrier === 'Mehmet Kaya' ? 'Kamyon' : 'Kamyonet'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Tahmini Varış:</span> {new Date(shipmentDetailModal.date).getDate() + 2}.{new Date(shipmentDetailModal.date).getMonth() + 1}.{new Date(shipmentDetailModal.date).getFullYear()}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Yük Bilgisi:</span> Ev Eşyası, {Math.floor(Math.random() * 10) + 1} Parça
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Mesafe:</span> {Math.floor(Math.random() * 50) + 5} km
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Gönderici Not:</span> Lütfen dikkatli taşıyınız, kırılabilir eşyalar mevcut.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-2">Harita</h4>
                <div className="border rounded-lg overflow-hidden" style={{ height: '350px', position: 'relative' }}>
                  <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                    <div className="text-center p-4 w-full">
                      <p className="text-gray-500 mb-2">Rota haritası</p>
                      <div className="flex justify-center">
                        <div className="relative w-full h-full">
                          <div className="w-full h-full absolute">
                            <div className="w-full h-full bg-gray-100 flex items-center justify-between p-6 relative">
                              <div className="flex flex-col items-center">
                                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                <div className="h-20 w-0.5 bg-gray-300 my-2"></div>
                                <div className="bg-green-100 px-3 py-1 rounded-lg text-xs text-green-800">
                                  {shipmentDetailModal.from}
                                </div>
                              </div>
                              
                              <div className="flex-1 mx-2 relative">
                                <div className="h-0.5 bg-orange-400 w-full absolute top-2"></div>
                                <div className="absolute top-0 left-1/4 transform -translate-y-1/2">
                                  <FaTruck className="text-orange-500 text-lg" />
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-center">
                                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                                <div className="h-20 w-0.5 bg-gray-300 my-2"></div>
                                <div className="bg-red-100 px-3 py-1 rounded-lg text-xs text-red-800">
                                  {shipmentDetailModal.to}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 flex justify-end">
                <button 
                  onClick={() => setShipmentDetailModal(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded mr-2"
                >
                  Kapat
                </button>
                <button 
                  onClick={() => router.push(`/admin/shipments/${shipmentDetailModal.id}`)}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded"
                >
                  Detaylı Görüntüle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Detay Modal'i */}
      {applicationDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget) setApplicationDetailModal(null);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">{applicationDetailModal.type} Başvuru Detayları</h3>
              <button 
                onClick={() => setApplicationDetailModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Başvuru No</p>
                  <p className="font-medium">#{applicationDetailModal.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Başvuru Tarihi</p>
                  <p className="font-medium">{applicationDetailModal.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ad Soyad</p>
                  <p className="font-medium">{applicationDetailModal.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Başvuru Tipi</p>
                  <p className="font-medium">{applicationDetailModal.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Firma</p>
                  <p className="font-medium">{applicationDetailModal.company}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Durum</p>
                  <p className="font-medium">
                    <span className="px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {applicationDetailModal.status}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium mb-2">İletişim Bilgileri</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="mb-2">
                    <span className="font-medium">E-posta:</span> {applicationDetailModal.name.toLowerCase().replace(/\s+/g, '.')}@example.com
                  </p>
                  <p>
                    <span className="font-medium">Telefon:</span> +90 5XX XXX XX XX
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 flex justify-end">
                <button 
                  onClick={() => setApplicationDetailModal(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded mr-2"
                >
                  Kapat
                </button>
                <button 
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded mr-2"
                >
                  Reddet
                </button>
                <button 
                  className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
                >
                  Onayla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sürücü Konum Modal'i */}
      {driverLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget) setDriverLocationModal(null);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Sürücü Konum Takibi</h3>
              <button 
                onClick={() => setDriverLocationModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-4">
              <div className="bg-orange-50 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                    {driverLocationModal.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium">{driverLocationModal.name}</h4>
                    <p className="text-sm text-gray-600">{driverLocationModal.vehicle} • Son konum: {driverLocationModal.location}</p>
                    <p className="text-sm text-gray-500">Son aktivite: {driverLocationModal.lastActive}</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(driverLocationModal.status)}`}>
                      {driverLocationModal.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden" style={{ height: '400px', position: 'relative' }}>
                <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="text-gray-500 mb-2">Harita yükleniyor...</p>
                    <div className="flex justify-center">
                      <FaMapMarkerAlt className="text-orange-500 animate-pulse h-10 w-10" />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2">
                  <div className="flex space-x-2">
                    <button className="bg-gray-100 p-2 rounded hover:bg-gray-200">
                      <FaPlus className="h-4 w-4" />
                    </button>
                    <button className="bg-gray-100 p-2 rounded hover:bg-gray-200">
                      <FaTruck className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => setDriverLocationModal(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded mr-2"
                >
                  Kapat
                </button>
                <button 
                  className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded"
                >
                  Sürücüyü Ara
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Etkinlikler Modal */}
      {showActivitiesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget) setShowActivitiesModal(false);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Tüm Etkinlikler</h3>
              <button 
                onClick={() => setShowActivitiesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {allActivities.map(activity => (
                  <div key={activity.id} className="flex p-3 border-b border-gray-100 hover:bg-gray-50 rounded-md">
                    <div className="mr-3 flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full bg-${activity.type === 'user' ? 'blue' : activity.type === 'shipment' ? 'green' : activity.type === 'payment' ? 'yellow' : 'purple'}-100 flex items-center justify-center`}>
                        {activity.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.text}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button 
                onClick={() => setShowActivitiesModal(false)}
                className="w-full py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
} 