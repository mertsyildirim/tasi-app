'use client'

import React, { useState, useEffect } from 'react'
import { FaPlus, FaSearch, FaEdit, FaTrash, FaMapMarkerAlt, FaPhone, FaEnvelope, FaTruck, FaSpinner, FaChevronLeft, FaChevronRight, FaChevronDown, FaIdCard, FaCheck } from 'react-icons/fa'
import AdminLayout from '../../components/admin/Layout'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

// Google Maps API anahtarı
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyAKht3SqaVJpufUdq-vVQEfBEQKejT9Z8k";

export default function ActiveDriversPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeDrivers, setActiveDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDrivers, setTotalDrivers] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [onDeliveryCount, setOnDeliveryCount] = useState(0)
  const [map, setMap] = useState(null)
  const [driverMarkers, setDriverMarkers] = useState([])
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showDriverDetailModal, setShowDriverDetailModal] = useState(null)

  // Google Maps yükleme
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  })

  // Harita container stili
  const containerStyle = {
    width: '100%',
    height: '400px'
  }

  // Türkiye'nin merkezi - Ankara
  const center = {
    lat: 39.9334,
    lng: 32.8597
  }

  // Map yükleme callback
  const onLoad = React.useCallback(function callback(map) {
    setMap(map)
  }, [])

  // Map unmount callback
  const onUnmount = React.useCallback(function callback() {
    setMap(null)
  }, [])

  // API'den aktif sürücüleri çek
  useEffect(() => {
    fetchActiveDrivers();
  }, [currentPage]);

  // Sürücü konumlarını haritaya ekle
  useEffect(() => {
    if (activeDrivers.length > 0 && isLoaded) {
      // Sürücü konumlarını oluştur
      const markers = activeDrivers
        .filter(driver => {
          // Konum bilgisi string ise ayrıştır, yoksa atla
          if (typeof driver.location === 'string' && driver.location.includes(',')) {
            return true;
          }
          return false;
        })
        .map(driver => {
          // Konum bilgisini ayrıştır (örn: "41.0082, 28.9784" formatı)
          const locationParts = driver.location.split(',');
          if (locationParts.length >= 2) {
            const lat = parseFloat(locationParts[0].trim());
            const lng = parseFloat(locationParts[1].trim());
            
            if (!isNaN(lat) && !isNaN(lng)) {
              return {
                position: { lat, lng },
                title: driver.name,
                id: driver.id,
                status: driver.status
              };
            }
          }
          return null;
        })
        .filter(marker => marker !== null);

      setDriverMarkers(markers);
    }
  }, [activeDrivers, isLoaded]);

  const fetchActiveDrivers = async (page = currentPage) => {
    try {
      setLoading(true);
      
      // Token kontrol et
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setError('Oturum bilgileriniz bulunamadı. Lütfen yeniden giriş yapın.');
        setLoading(false);
        return;
      }
      
      // API'ye istek at
      const response = await fetch(`/api/admin/active-drivers?page=${page}&limit=10${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Yanıtı kontrol et
      if (!response.ok) {
        throw new Error(`API hatası: ${response.status}`);
      }
      
      // Verileri parse et
      const data = await response.json();
      console.log('Aktif sürücüler API yanıtı:', data);
      
      // API yanıtını işle
      if (data.success) {
        // Veri başarıyla geldi
        if (data.data && data.data.drivers) {
          console.log(`${data.data.drivers.length} sürücü verileri alındı`);
          setActiveDrivers(data.data.drivers);
          setTotalPages(data.data.totalPages || 1);
          setTotalDrivers(data.data.total || 0);
          setActiveCount(data.data.active || 0);
          setOnDeliveryCount(data.data.onDelivery || 0);
        } else if (data.drivers) {
          console.log(`${data.drivers.length} sürücü verileri alındı`);
          setActiveDrivers(data.drivers);
          setTotalPages(data.totalPages || 1);
          setTotalDrivers(data.total || 0);
          setActiveCount(data.active || 0);
          setOnDeliveryCount(data.onDelivery || 0);
        } else {
          console.warn('API yanıtında sürücü verisi bulunamadı:', data);
          setActiveDrivers([]);
          setTotalPages(1);
          setTotalDrivers(0);
          setActiveCount(0);
          setOnDeliveryCount(0);
        }
      } else {
        console.error('API başarısız yanıt döndürdü:', data);
        setError(data.message || 'Sürücü verileri alınamadı. Lütfen daha sonra tekrar deneyin.');
        setActiveDrivers([]);
      }
    } catch (error) {
      console.error('Aktif sürücüler getirilirken hata oluştu:', error);
      setError(`Sürücü verileri yüklenirken bir hata oluştu: ${error.message}. Lütfen sayfayı yenileyin veya sistem yöneticinizle iletişime geçin.`);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa değiştirme
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Arama işlemi
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Aramada ilk sayfaya dön
    fetchActiveDrivers(1);
  };

  // Durum renk sınıfları
  const getStatusColor = (status) => {
    switch(status) {
      case 'Aktif':
      case 'active':
      case 'online':
        return 'bg-green-100 text-green-800'
      case 'Taşıma sırasında':
      case 'on_delivery':
      case 'busy':
        return 'bg-purple-100 text-purple-800'
      case 'offline':
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Durumu formatla
  const formatStatus = (status) => {
    switch(status) {
      case 'active':
      case 'online':
        return 'Aktif'
      case 'on_delivery':
      case 'busy':
        return 'Taşıma sırasında'
      case 'offline':
      case 'inactive':
        return 'Çevrimdışı'
      default:
        return status || 'Bilinmiyor'
    }
  }

  // Sayfa numaraları oluştur
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(currentPage - halfVisiblePages, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };
  
  // Yükleniyor durumunu göster
  if (loading) {
    return (
      <AdminLayout title="Aktif Sürücüler">
        <div className="flex flex-col items-center justify-center h-64">
          <FaSpinner className="animate-spin text-4xl text-orange-500 mb-4" />
          <p className="text-gray-600">Sürücü verileri yükleniyor...</p>
        </div>
      </AdminLayout>
    )
  }
  
  // Hata durumunu göster
  if (error) {
    return (
      <AdminLayout title="Aktif Sürücüler">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="bg-red-100 text-red-800 p-4 rounded-lg max-w-lg text-center">
            <p className="font-medium mb-2">Hata</p>
            <p>{error}</p>
          </div>
        </div>
      </AdminLayout>
    )
  }
  
  // Veri yok durumunu göster
  if (activeDrivers.length === 0) {
    return (
      <AdminLayout title="Aktif Sürücüler">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-lg font-medium">Aktif Sürücü Listesi</h1>
            <p className="text-gray-500 text-sm mt-1">Sistemde anlık olarak aktif olan tüm sürücüleri görüntüle ve takip et</p>
          </div>
          <div className="flex flex-col w-full md:flex-row md:w-auto gap-4">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
              <div className="relative w-full md:w-auto">
                <input 
                  type="text" 
                  placeholder="Sürücü ara..." 
                  className="pl-10 pr-4 py-2 w-full md:min-w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Ara</button>
            </form>
            <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2">
              <FaPlus />
              <span>Yeni Sürücü</span>
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FaTruck className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Aktif sürücü bulunamadı</h3>
          <p className="text-gray-600 mb-6">Şu anda sistemde aktif sürücü bulunmuyor veya sürücüler henüz kayıtlı değil.</p>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 inline-flex items-center gap-2">
            <FaPlus />
            <span>Yeni Sürücü Ekle</span>
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Aktif Sürücüler">
      <div className={showDriverDetailModal ? "blur-sm" : ""}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Aktif Sürücüler</h1>
          <div className="flex space-x-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Sürücü ara..." 
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative">
              <select 
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Tüm Durumlar</option>
                <option value="available">Müsait</option>
                <option value="busy">Taşımada</option>
                <option value="offline">Çevrimdışı</option>
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="flex flex-row gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 flex-1">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FaIdCard className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Toplam Aktif Sürücü</h3>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 flex-1">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaCheck className="text-green-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Müsait Sürücüler</h3>
                <p className="text-2xl font-bold">{activeDrivers.filter(d => d.status !== 'busy').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 flex-1">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <FaTruck className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Taşımada</h3>
                <p className="text-2xl font-bold">{activeDrivers.filter(d => d.status === 'busy').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sürücü Haritası */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold">Sürücü Konumları</h3>
          </div>
          {loadError && (
            <div className="h-64 bg-gray-100 p-4 flex items-center justify-center">
              <div className="text-center text-red-500">
                <FaMapMarkerAlt className="mx-auto mb-2 text-red-500 h-8 w-8" />
                <p>Harita yüklenirken bir hata oluştu.</p>
                <p className="text-sm">Hata: {loadError.message}</p>
              </div>
            </div>
          )}
          {!loadError && !isLoaded && (
            <div className="h-64 bg-gray-100 p-4 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <FaSpinner className="mx-auto mb-2 text-orange-500 h-8 w-8 animate-spin" />
                <p>Harita yükleniyor...</p>
              </div>
            </div>
          )}
          {!loadError && isLoaded && (
            <div className="h-96">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={6}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                  zoomControl: driverMarkers.length > 0,
                  mapTypeControl: false,
                  streetViewControl: false,
                  fullscreenControl: true,
                  draggable: driverMarkers.length > 0,
                  scrollwheel: driverMarkers.length > 0,
                  disableDoubleClickZoom: driverMarkers.length === 0,
                  gestureHandling: driverMarkers.length > 0 ? 'auto' : 'none'
                }}
              >
                {driverMarkers.map((marker) => (
                  <Marker
                    key={marker.id}
                    position={marker.position}
                    title={marker.title}
                    icon={{
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 10,
                      fillColor: marker.status === 'active' || marker.status === 'online' 
                        ? '#10B981' // yeşil - aktif
                        : marker.status === 'on_delivery' || marker.status === 'busy'
                          ? '#8B5CF6' // mor - taşıma sırasında
                          : '#9CA3AF', // gri - diğer durumlar
                      fillOpacity: 0.8,
                      strokeColor: '#FFFFFF',
                      strokeWeight: 2,
                    }}
                  />
                ))}
              </GoogleMap>
            </div>
          )}
          {driverMarkers.length === 0 && isLoaded && !loadError && (
            <div className="h-96 flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <FaMapMarkerAlt className="mx-auto mb-2 text-orange-500 h-8 w-8" />
                <p>Haritada gösterilecek sürücü konumu bulunamadı.</p>
                <p className="text-sm text-gray-400 mt-1">Harita etkileşimi devre dışı bırakıldı.</p>
              </div>
            </div>
          )}
        </div>

        {/* Sürücü Listesi */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sürücü</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İletişim</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Araç</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Aktivite</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                          {driver.name?.charAt(0) || "?"}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                          <div className="text-sm text-gray-500">{driver.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <FaPhone className="mr-2 text-gray-500" /> {driver.phone || 'N/A'}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FaEnvelope className="mr-2 text-gray-500" /> {driver.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{driver.vehicleType || driver.vehicle?.type || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{driver.licensePlate || driver.vehicle?.licensePlate || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(driver.status)}`}>
                        {formatStatus(driver.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.location || 'Bilinmiyor'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.lastActive || driver.lastSeen || 'Bilinmiyor'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button className="text-orange-600 hover:text-orange-900 transition-colors" title="Takip Et">
                          <FaMapMarkerAlt className="w-5 h-5" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 transition-colors" title="Düzenle">
                          <FaEdit className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Toplam <span className="font-medium">{totalDrivers}</span> sürücü, <span className="font-medium">{activeDrivers.length}</span> sonuç gösteriliyor
            </div>
            {totalPages > 1 && (
              <div className="flex space-x-1">
                <button 
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${currentPage === 1 ? 'text-gray-400' : 'hover:bg-gray-50'}`}
                >
                  <FaChevronLeft size={12} />
                </button>
                
                {getPageNumbers().map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${
                      page === currentPage ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button 
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${currentPage === totalPages ? 'text-gray-400' : 'hover:bg-gray-50'}`}
                >
                  <FaChevronRight size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
} 