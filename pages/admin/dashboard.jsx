'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  FaUsers, FaTruck, FaClipboardList, FaChartLine, FaCog, 
  FaSignOutAlt, FaSearch, FaEdit, FaTrash, FaBell, 
  FaFileInvoiceDollar, FaUserShield, FaBars, FaTimes, FaUser, FaPlus,
  FaEye, FaMapMarkerAlt, FaCheck, FaTimes as FaTimesCircle, FaLocationArrow,
  FaShoppingBag, FaCreditCard, FaEnvelope, FaUserCircle, FaRegBell, FaExternalLinkAlt, FaCheckCircle, FaEllipsisH, FaIdCard,
  FaArrowUp, FaArrowDown, FaBox, FaRoute, FaSpinner, FaBuilding, FaExclamationTriangle
} from 'react-icons/fa'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/admin/Layout'
import Image from 'next/image'
import Head from 'next/head'
import axios from 'axios'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

// Google Maps API anahtarı
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyAKht3SqaVJpufUdq-vVQEfBEQKejT9Z8k";

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
  const [dashboardStats, setDashboardStats] = useState({
    counts: {
      users: 0,
      companies: 0,
      drivers: 0,
      vehicles: 0,
      transportRequests: 0,
      activeTransports: 0,
      completedTransports: 0,
      pendingTransports: 0
    },
    recent: {
      transportRequests: [],
      companies: [],
      users: []
    },
    trends: {
      monthlyTransportData: []
    }
  })
  const [error, setError] = useState(null)
  const [map, setMap] = useState(null)
  const [deliveryMarkers, setDeliveryMarkers] = useState([])

  // Google Maps yükleme
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  })

  // Harita container stili
  const containerStyle = {
    width: '100%',
    height: '100%'
  }

  // Türkiye'nin merkezi - Ankara
  const center = {
    lat: 39.9334,
    lng: 32.8597
  }

  // Map yükleme callback
  const onLoad = React.useCallback(function callback(map) {
    // Örnek teslimat noktaları - gerçek verilerle değiştirilecek
    const sampleDeliveryPoints = [
      { id: 1, title: 'İstanbul Teslimat', position: { lat: 41.0082, lng: 28.9784 }, status: 'active' },
      { id: 2, title: 'Ankara Teslimat', position: { lat: 39.9334, lng: 32.8597 }, status: 'pending' },
      { id: 3, title: 'İzmir Teslimat', position: { lat: 38.4237, lng: 27.1428 }, status: 'completed' },
      { id: 4, title: 'Antalya Teslimat', position: { lat: 36.8841, lng: 30.7056 }, status: 'active' },
    ];

    setDeliveryMarkers(sampleDeliveryPoints);
    setMap(map);
  }, [])

  // Map unmount callback
  const onUnmount = React.useCallback(function callback() {
    setMap(null)
  }, [])

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => {
      clearInterval(timer)
    }
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      if (showActivitiesModal) setShowActivitiesModal(false);
      if (shipmentDetailModal) setShipmentDetailModal(null);
      if (applicationDetailModal) setApplicationDetailModal(null);
      if (driverLocationModal) setDriverLocationModal(null);
    }
  }, [showActivitiesModal, shipmentDetailModal, applicationDetailModal, driverLocationModal]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    // Giriş kontrolü ve admin yetkisi kontrolü
    const userData = localStorage.getItem('userData') || localStorage.getItem('user');
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (!userData || !token) {
      router.replace('/admin/login');
      return;
    }
    try {
      const parsedUser = JSON.parse(userData);
      
      // mert@tasipp.com için özel kontrol
      if (parsedUser.email === 'mert@tasipp.com') {
        return;
      }

      if (!(parsedUser.roles && parsedUser.roles.includes('admin')) && parsedUser.role !== 'admin') {
        router.replace('/admin/login');
        return;
      }
    } catch (e) {
      router.replace('/admin/login');
      return;
    }
    
    if (showActivitiesModal || shipmentDetailModal || applicationDetailModal || driverLocationModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    }
  }, [showActivitiesModal, shipmentDetailModal, applicationDetailModal, driverLocationModal, handleKeyDown, router]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/admin');
        return;
      }

      try {
        const response = await fetch('/api/auth/check', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        // mert@tasipp.com için özel kontrol
        if (data.user.email === 'mert@tasipp.com') {
          setUser(data.user);
          return;
        }
        
        if (!data.success || !(data.user.roles?.includes('admin') || data.user.role === 'admin')) {
          router.replace('/admin');
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.replace('/admin');
      }
    };
    
    checkAuth();
  }, [router]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          router.replace('/admin');
          return;
        }

        const response = await fetch('/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            router.replace('/admin');
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.error || 'Dashboard verileri alınamadı');
        }

        const data = await response.json();
        if (data.success) {
          setDashboardStats(data.data);
        } else {
          throw new Error(data.error || 'Dashboard verileri alınamadı');
        }
      } catch (error) {
        console.error('Dashboard verileri alınırken hata:', error);
        setError(error.message || 'Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, router]);

  const {
    counts = {
      users: 0,
      companies: 0,
      drivers: 0,
      vehicles: 0,
      transportRequests: 0,
      activeTransports: 0,
      completedTransports: 0,
      pendingTransports: 0
    },
    recent = {
      transportRequests: [],
      companies: [],
      users: []
    },
    trends = {
      monthlyTransportData: []
    }
  } = dashboardStats;

  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <FaChartLine /> },
    { id: 'users', name: 'Kullanıcılar', icon: <FaUsers /> },
    { id: 'shipments', name: 'Taşımalar', icon: <FaTruck /> },
    { id: 'requests', name: 'Talepler', icon: <FaClipboardList /> },
    { id: 'payments', name: 'Ödemeler', icon: <FaFileInvoiceDollar /> },
    { id: 'settings', name: 'Ayarlar', icon: <FaCog /> },
  ]

  const getStatusColor = (status) => {
    switch(status) {
      case 'Aktif':
      case 'Tamamlandı':
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'Pasif':
      case 'İptal Edildi':
      case 'inactive':
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'Taşınıyor':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'Beklemede':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleLogout = () => {
    axios.post('/api/auth/logout')
      .then(() => {
        localStorage.removeItem('userData');
        localStorage.removeItem('auth_token');
        router.push('/admin');
      })
      .catch(error => {
        console.error('Çıkış yapılırken hata:', error);
    localStorage.removeItem('userData');
        localStorage.removeItem('auth_token');
        router.push('/admin');
      });
  }

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR');
  }

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }

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
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* İstatistik Kartları */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-3">
                  <FaUsers className="text-blue-600 text-xl" />
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm">Toplam Kullanıcı</h3>
                  <p className="text-2xl font-semibold text-gray-900">{counts.users || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-3">
                  <FaBuilding className="text-green-600 text-xl" />
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm">Firmalar</h3>
                  <p className="text-2xl font-semibold text-gray-900">{counts.companies || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 rounded-full p-3">
                  <FaTruck className="text-yellow-600 text-xl" />
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm">Toplam Taşıma</h3>
                  <p className="text-2xl font-semibold text-gray-900">{counts.transportRequests || 0}</p>
                </div>
                  </div>
                  </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-full p-3">
                  <FaFileInvoiceDollar className="text-purple-600 text-xl" />
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm">Aktif Taşımalar</h3>
                  <p className="text-2xl font-semibold text-gray-900">{counts.activeTransports || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Son Kullanıcılar */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Son Kullanıcılar</h2>
                <a href="/admin/users" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                  Tümünü Gör <FaExternalLinkAlt className="ml-1" size={12} />
                </a>
              </div>
              
              {recent.users && recent.users.length > 0 ? (
              <div className="space-y-4">
                  {recent.users.slice(0, 5).map((user, index) => (
                    <div key={user._id || index} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex items-center">
                        <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center">
                          <FaUser className="text-gray-500" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-800">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                    </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(user.status)}`}>
                        {user.status === 'active' ? 'Aktif' : 'Pasif'}
                      </span>
                  </div>
                ))}
              </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaUsers className="mx-auto mb-2 text-gray-400 text-2xl" />
                  <p>Henüz kullanıcı kaydı bulunmuyor</p>
                </div>
              )}
            </div>

            {/* Son Taşımalar */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Son Taşımalar</h2>
                <a href="/admin/shipments" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                  Tümünü Gör <FaExternalLinkAlt className="ml-1" size={12} />
                </a>
              </div>
              
              {recent.transportRequests && recent.transportRequests.length > 0 ? (
              <div className="space-y-4">
                  {recent.transportRequests.slice(0, 5).map((shipment, index) => (
                    <div key={shipment._id || index} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium text-gray-800">#{shipment._id?.substring(0, 8) || `TŞM${index+1}`}</p>
                        <p className="text-sm text-gray-500">{shipment.from} → {shipment.to}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(shipment.status)}`}>
                        {shipment.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaTruck className="mx-auto mb-2 text-gray-400 text-2xl" />
                  <p>Henüz taşıma kaydı bulunmuyor</p>
                </div>
              )}
            </div>
            
            {/* Son Firmalar */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Son Firmalar</h2>
                <a href="/admin/companies" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                  Tümünü Gör <FaExternalLinkAlt className="ml-1" size={12} />
                </a>
              </div>
              
              {recent.companies && recent.companies.length > 0 ? (
                <div className="space-y-4">
                  {recent.companies.slice(0, 5).map((company, index) => (
                    <div key={company._id || index} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium text-gray-800">{company.name}</p>
                        <p className="text-sm text-gray-500">{company.email || 'E-posta yok'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(company.status)}`}>
                        {company.status === 'active' ? 'Aktif' : 'Pasif'}
                      </span>
                  </div>
                ))}
              </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaBuilding className="mx-auto mb-2 text-gray-400 text-2xl" />
                  <p>Henüz firma kaydı bulunmuyor</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Harita */}
            <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow-sm h-96">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Aktif Taşımalar Haritası</h3>
              </div>
              <div className="h-80 relative">
                {loadError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center text-red-500">
                      <FaExclamationTriangle className="mx-auto mb-2 text-red-500 h-8 w-8" />
                      <p>Harita yüklenirken bir hata oluştu.</p>
                      <p className="text-sm">Hata: {loadError.message}</p>
                    </div>
                  </div>
                )}
                {!loadError && !isLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center text-gray-500">
                      <FaSpinner className="mx-auto mb-2 text-orange-500 h-8 w-8 animate-spin" />
                      <p className="text-gray-500">Harita yükleniyor...</p>
                    </div>
                  </div>
                )}
                {!loadError && isLoaded && (
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={6}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    options={{
                      zoomControl: deliveryMarkers.length > 0,
                      mapTypeControl: false,
                      streetViewControl: false,
                      fullscreenControl: true,
                      draggable: deliveryMarkers.length > 0,
                      scrollwheel: deliveryMarkers.length > 0,
                      disableDoubleClickZoom: deliveryMarkers.length === 0,
                      gestureHandling: deliveryMarkers.length > 0 ? 'auto' : 'none'
                    }}
                  >
                    {deliveryMarkers.map((marker) => (
                      <Marker
                        key={marker.id}
                        position={marker.position}
                        title={marker.title}
                        icon={{
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: 10,
                          fillColor: marker.status === 'active' 
                            ? '#10B981' // yeşil - aktif
                            : marker.status === 'pending'
                              ? '#F59E0B' // turuncu - beklemede 
                              : '#9CA3AF', // gri - tamamlanmış
                          fillOpacity: 0.8,
                          strokeColor: '#FFFFFF',
                          strokeWeight: 2,
                        }}
                      />
                    ))}
                  </GoogleMap>
                )}
                
                {/* Veri yokken bilgilendirme mesajı */}
                {deliveryMarkers.length === 0 && isLoaded && !loadError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80">
                    <div className="text-center text-gray-500">
                      <FaTruck className="mx-auto mb-2 text-orange-500 h-8 w-8" />
                      <p>Haritada gösterilecek taşıma verisi bulunamadı.</p>
                      <p className="text-sm text-gray-400 mt-1">Harita etkileşimi devre dışı bırakıldı.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Grafik */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Taşıma İstatistikleri</h2>
              {trends.monthlyTransportData && trends.monthlyTransportData.length > 0 ? (
              <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Grafik yükleniyor...</p>
              </div>
              ) : (
                <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <FaChartLine className="mx-auto mb-2 text-gray-400 text-2xl" />
                    <p className="text-gray-500">Yeterli veri bulunmuyor</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  )
} 