'use client'

import React, { useState, useEffect } from 'react'
import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaShippingFast, FaBoxOpen, FaCalendarAlt, FaTimes, FaTruck, FaMapMarkerAlt, FaMoneyBillWave, FaFileImage, FaMapMarked, FaCompass, FaArrowRight, FaSpinner } from 'react-icons/fa'
import AdminLayout from '../../components/admin/Layout'
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api'
import axios from 'axios'
import { useRouter } from 'next/router'

// Google Maps API anahtarı
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyAKht3SqaVJpufUdq-vVQEfBEQKejT9Z8k";

export default function ShipmentsPage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showShipmentDetailModal, setShowShipmentDetailModal] = useState(null)
  const [showImagesModal, setShowImagesModal] = useState(false)
  const [directions, setDirections] = useState(null)
  const [map, setMap] = useState(null)
  const [vehiclePosition, setVehiclePosition] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shipments, setShipments] = useState([])
  const [counts, setCounts] = useState({
    all: 0,
    inProgress: 0,
    completed: 0,
    waiting: 0,
    paymentWaiting: 0,
    canceled: 0
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [error, setError] = useState(null)

  // Sürücü konumu için state
  const [driverLocations, setDriverLocations] = useState({})

  // Google Maps yükleme
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  })

  // API'den taşımaları getir
  const loadShipments = async () => {
    setLoading(true);
    setError(null);

    try {
      // Local storage'dan token al (her iki format için kontrol)
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      
      if (!token) {
        console.log('Token bulunamadı, giriş sayfasına yönlendiriliyor');
        
        // Tüm localStorage'ı temizle 
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
        
        router.replace('/admin');
        return;
      }

      console.log('Token bilgisi:', { tokenLength: token.length, tokenStart: token.substring(0, 10) });

      // API isteği için parametreler
      const params = {
        status: selectedTab,
        search: searchTerm || undefined,
        page: pagination.page,
        limit: pagination.limit
      };

      console.log('API isteği yapılıyor...', {
        url: '/api/admin/shipments',
        token: `Bearer ${token.substring(0, 10)}...`,
        params
      });

      // API isteği
      const response = await axios.get('/api/admin/shipments', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params
      });

      console.log('API yanıtı alındı:', {
        success: response.data.success,
        dataCount: response.data.data?.length,
        status: response.status
      });

      if (response.data.success) {
        // Verileri state'e kaydet
        console.log('API veri yapısı:', response.data);
        
        // data.data.shipments mi yoksa data.data mi kontrol et
        const shipmentsData = response.data.data.shipments || response.data.data || [];
        setShipments(shipmentsData);
        
        setPagination(response.data.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        });
        
        setCounts(response.data.data.counts || {
          all: 0,
          inProgress: 0,
          completed: 0,
          waiting: 0,
          paymentWaiting: 0,
          canceled: 0
        });
      } else {
        console.error('API başarısız yanıt döndü:', response.data);
        setError(response.data.message || 'Veriler alınırken bir hata oluştu');
      }
    } catch (error) {
      console.error('Taşımalar yüklenirken hata:', error);
      console.error('Hata detayları:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // 401 veya 403 hatası durumunda token'ı sil ve login sayfasına yönlendir
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log(`${error.response.status} hatası. Token geçersiz veya yetkisiz erişim. Giriş sayfasına yönlendiriliyor.`);
        
        // Tüm localStorage'ı temizle
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
        
        if (error.response.status === 403) {
          // Yetkisiz erişim hatası için ekstra bilgi
          setError('Bu sayfaya erişim yetkiniz bulunmuyor. Sadece admin kullanıcılar erişebilir.');
          setTimeout(() => {
            router.replace('/admin');
          }, 2000); // 2 saniye bekleyip yönlendir
        } else {
          router.replace('/admin');
        }
      } else {
        console.log('Diğer hata:', error.message);
        setError(`Taşımalar yüklenirken bir hata oluştu: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde, tab veya arama değiştiğinde veya sayfa değiştiğinde taşımaları getir
  useEffect(() => {
    if (router.isReady) {
      loadShipments();
    }
  }, [router.isReady, selectedTab, searchTerm, pagination.page, pagination.limit]);

  // Harita merkezi - İstanbul
  const center = {
    lat: 41.0082,
    lng: 28.9784
  };

  // Map container style
  const containerStyle = {
    width: '100%',
    height: '400px'
  };

  // Map load callback
  const onLoad = React.useCallback(function callback(map) {
    setMap(map)
  }, [])

  // Map unmount callback
  const onUnmount = React.useCallback(function callback() {
    setMap(null)
  }, [])

  // Örnek şehir koordinatları
  const getCoordinatesForCity = (city) => {
    const cities = {
      'İstanbul': { lat: 41.0082, lng: 28.9784 },
      'Ankara': { lat: 39.9334, lng: 32.8597 },
      'İzmir': { lat: 38.4237, lng: 27.1428 },
      'Bursa': { lat: 40.1885, lng: 29.0610 },
      'Antalya': { lat: 36.8841, lng: 30.7056 },
      'Konya': { lat: 37.8715, lng: 32.4941 },
    };
    
    const cityName = city?.split(',')[0]?.trim();
    return cities[cityName] || cities['İstanbul']; // Varsayılan olarak İstanbul
  }

  // Rota çizimi için
  const getRoute = (from, to) => {
    if (!isLoaded || !map) return;

    const fromCoords = getCoordinatesForCity(from);
    const toCoords = getCoordinatesForCity(to);

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: fromCoords,
        destination: toCoords,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          
          // Eğer taşıma sürecindeyse, aracı rota üzerinde bir yere yerleştir
          if (showShipmentDetailModal && showShipmentDetailModal.status === 'Taşınıyor') {
            const route = result.routes[0];
            const leg = route.legs[0];
            const steps = leg.steps;
            const midStep = Math.floor(steps.length / 2);
            
            setVehiclePosition({
              lat: steps[midStep].start_location.lat(),
              lng: steps[midStep].start_location.lng()
            });
          } else {
            setVehiclePosition(null);
          }
        } else {
          console.error(`Rota bulunamadı: ${status}`);
        }
      }
    );
  };

  // Modal açıldığında harita rotasını çiz
  useEffect(() => {
    if (showShipmentDetailModal && isLoaded) {
      getRoute(showShipmentDetailModal.from, showShipmentDetailModal.to);
    }
  }, [showShipmentDetailModal, isLoaded]);

  // ESC tuşu ile modal'ları kapatma
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showImagesModal) {
          setShowImagesModal(false);
        } else if (showShipmentDetailModal) {
          setShowShipmentDetailModal(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Modal açıkken body scroll'u engelle
    if (showShipmentDetailModal || showImagesModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [showShipmentDetailModal, showImagesModal]);

  // Sürücü konumunu güncelle
  const updateDriverLocation = (driverId, location) => {
    if (!location || !location.coords) return;
    
    setDriverLocations(prev => ({
      ...prev,
      [driverId]: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        formattedTime: new Date().toLocaleTimeString('tr-TR')
      }
    }));
  };

  // Konum güncellemelerini dinle
  useEffect(() => {
    if (!showShipmentDetailModal || showShipmentDetailModal.status !== 'Taşınıyor') return;

    const driverId = showShipmentDetailModal.driverEmail;
    if (!driverId) return;

    // WebSocket bağlantısı kur (örnek)
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'location' && data.driverId === driverId) {
          updateDriverLocation(driverId, {
            coords: {
              latitude: data.latitude,
              longitude: data.longitude
            }
          });
          
          // Modal'ı güncelle
          setShowShipmentDetailModal(prev => ({
            ...prev,
            driverLocation: {
              latitude: data.latitude,
              longitude: data.longitude,
              formattedTime: new Date().toLocaleTimeString('tr-TR')
            }
          }));
        }
      } catch (error) {
        console.error('Konum verisi işlenirken hata:', error);
      }
    };

    return () => {
      ws.close();
    };
  }, [showShipmentDetailModal]);

  // Taşıma detaylarını göster
  const showShipmentDetails = (shipment) => {
    // Sürücü konumunu ekle
    const shipmentWithLocation = {
      ...shipment,
      driverLocation: driverLocations[shipment.driverEmail]
    };
    setShowShipmentDetailModal(shipmentWithLocation);
    
    // 300ms bekleyerek modal açıldıktan sonra rota çizimini başlat
    setTimeout(() => {
      getRoute(shipment.from, shipment.to);
    }, 300);
  };

  const tabs = [
    { id: 'all', name: 'Tüm Taşımalar' },
    { id: 'date-waiting', name: 'Tarih Bekliyor' },
    { id: 'in-progress', name: 'Taşınıyor' },
    { id: 'payment-waiting', name: 'Taşıyıcı Ödemesi Bekleniyor' },
    { id: 'completed', name: 'Tamamlandı' },
    { id: 'canceled', name: 'İptal Edildi' },
  ]

  // Durum renkleri
  const getStatusColor = (status) => {
    switch(status) {
      case 'Tamamlandı':
        return 'bg-green-100 text-green-800'
      case 'İptal Edildi':
        return 'bg-red-100 text-red-800'
      case 'Taşınıyor':
        return 'bg-blue-100 text-blue-800'
      case 'Tarih Bekliyor':
        return 'bg-yellow-100 text-yellow-800'
      case 'Taşıyıcı Ödemesi Bekleniyor':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Sayfa değiştir
  const changePage = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination({...pagination, page: newPage});
    }
  }

  return (
    <AdminLayout title="Taşıma Yönetimi">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-wrap space-x-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors mb-2 ${
                selectedTab === tab.id 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Taşıma ara..." 
            className="pl-10 pr-4 py-2 w-full md:min-w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-full mr-4">
              <FaShippingFast className="text-orange-600" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Toplam Taşıma</h3>
              <p className="text-2xl font-bold">{counts.all}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FaBoxOpen className="text-green-600" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Tamamlanan</h3>
              <p className="text-2xl font-bold">{counts.completed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <FaShippingFast className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Taşınıyor</h3>
              <p className="text-2xl font-bold">{counts.inProgress}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <FaCalendarAlt className="text-yellow-600" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Beklemede</h3>
              <p className="text-2xl font-bold">{counts.waiting}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Taşıma Tablosu */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <FaSpinner className="animate-spin text-orange-500 text-2xl mr-2" />
            <span>Yükleniyor...</span>
          </div>
        ) : shipments.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            {searchTerm ? 'Arama kriterlerine uygun taşıma bulunamadı.' : 'Henüz taşıma kaydı bulunmuyor.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taşıyıcı</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Güzergah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yük Tipi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shipments.map((shipment) => (
                  <tr key={shipment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{shipment._id.substring(0,6)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{shipment.customer}</div>
                      <div className="text-xs text-gray-500">{shipment.customerCompany}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{shipment.carrier}</div>
                      <div className="text-xs text-gray-500">{shipment.carrierCompany}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="mb-1">{shipment.from}</div>
                        <div className="flex items-center">
                          <svg className="w-3 h-3 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                          </svg>
                          <span>{shipment.to}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>{shipment.cargoType}</div>
                        <div className="text-xs text-gray-500">{shipment.vehicleType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(shipment.status)}`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{shipment.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(shipment.date).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900 transition-colors" 
                          title="Görüntüle"
                          onClick={() => showShipmentDetails(shipment)}
                        >
                          <FaEye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Toplam <span className="font-medium">{pagination.total}</span> taşıma
          </div>
          {pagination.pages > 1 && (
            <div className="flex space-x-1">
              <button 
                className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${pagination.page === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                onClick={() => changePage(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Önceki
              </button>
              {[...Array(pagination.pages)].map((_, i) => (
                <button 
                  key={i}
                  className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${pagination.page === i + 1 ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50'}`}
                  onClick={() => changePage(i + 1)}
                >
                  {i + 1}
                </button>
              )).slice(Math.max(0, pagination.page - 3), Math.min(pagination.pages, pagination.page + 2))}
              <button 
                className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${pagination.page === pagination.pages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Sonraki
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Taşıma Detay Modal */}
      {showShipmentDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget && !showImagesModal) setShowShipmentDetailModal(null);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Taşıma #{showShipmentDetailModal._id?.substring(0,6)} - Detaylar</h3>
              <button 
                onClick={() => setShowShipmentDetailModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Sol Kısım - Taşıma Detayları */}
                <div>
                  <h4 className="font-medium text-lg mb-4">Taşıma Bilgileri</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Müşteri</p>
                        <p className="font-medium">{showShipmentDetailModal.customer}</p>
                        <p className="text-xs text-gray-500">{showShipmentDetailModal.customerCompany}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Taşıyıcı</p>
                        <p className="font-medium">{showShipmentDetailModal.carrier}</p>
                        <p className="text-xs text-gray-500">{showShipmentDetailModal.carrierCompany}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Nereden</p>
                        <p className="font-medium">{showShipmentDetailModal.from}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Nereye</p>
                        <p className="font-medium">{showShipmentDetailModal.to}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Durum</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(showShipmentDetailModal.status)}`}>
                          {showShipmentDetailModal.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tarih</p>
                        <p className="font-medium">{new Date(showShipmentDetailModal.date).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Yük Tipi</p>
                        <p className="font-medium">{showShipmentDetailModal.cargoType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Araç Tipi</p>
                        <p className="font-medium">{showShipmentDetailModal.vehicleType}</p>
                      </div>
                    </div>

                    {showShipmentDetailModal.notes && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <span className="font-medium">Notlar: </span>
                          {showShipmentDetailModal.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Sürücü Konum Bilgisi */}
                  {showShipmentDetailModal.status === 'Taşınıyor' && (
                    <div className="bg-gray-50 p-4 rounded-lg mt-4">
                      <div className="flex items-center mb-2">
                        <FaMapMarkerAlt className="text-orange-500 mr-2" />
                        <span className="font-medium">Sürücü Konum Bilgisi</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {showShipmentDetailModal.driverLocation ? (
                          <>
                            <p>Son Konum: {showShipmentDetailModal.driverLocation.latitude}, {showShipmentDetailModal.driverLocation.longitude}</p>
                            <p>Son Güncelleme: {showShipmentDetailModal.driverLocation.formattedTime}</p>
                          </>
                        ) : (
                          <p className="text-orange-600">Sürücü henüz konum paylaşımı yapmadı.</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <div className="flex items-center mb-2">
                      <FaMoneyBillWave className="text-orange-500 mr-2" />
                      <span className="font-medium">Ücret Özeti</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-500">Toplam Tutar</p>
                        <p className="font-bold text-lg text-orange-600">{showShipmentDetailModal.amount}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-500">Taşıyıcıya Ödenecek</p>
                        <p className="font-bold text-lg text-orange-600">{showShipmentDetailModal.carrierPayment}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Sağ Kısım - Harita */}
                <div>
                  <h4 className="font-medium text-lg mb-4">Rota ve Konum Takibi</h4>
                  <div className="bg-gray-50 p-4 rounded-lg" style={{ height: '400px' }}>
                    {isLoaded ? (
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={getCoordinatesForCity(showShipmentDetailModal.from)}
                        zoom={8}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                      >
                        {/* Başlangıç noktası */}
                        <Marker
                          position={getCoordinatesForCity(showShipmentDetailModal.from)}
                          icon={{
                            url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                            scaledSize: new window.google.maps.Size(40, 40)
                          }}
                        />

                        {/* Varış noktası */}
                        <Marker
                          position={getCoordinatesForCity(showShipmentDetailModal.to)}
                          icon={{
                            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                            scaledSize: new window.google.maps.Size(40, 40)
                          }}
                        />

                        {/* Sürücü konumu */}
                        {showShipmentDetailModal.driverLocation && (
                          <Marker
                            position={{
                              lat: parseFloat(showShipmentDetailModal.driverLocation.latitude),
                              lng: parseFloat(showShipmentDetailModal.driverLocation.longitude)
                            }}
                            icon={{
                              url: '/truck-icon.png', // Özel kamyon ikonu
                              scaledSize: new window.google.maps.Size(32, 32),
                              anchor: new window.google.maps.Point(16, 16)
                            }}
                          />
                        )}

                        {/* Rota çizgisi */}
                        {directions && <DirectionsRenderer directions={directions} />}
                      </GoogleMap>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Görseller Modalı */}
      {showImagesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[80] p-4" onClick={(e) => {
          if (e.target === e.currentTarget) setShowImagesModal(false);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Taşıma Görselleri</h3>
              <button 
                onClick={() => setShowImagesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h4 className="font-medium text-lg mb-3">Müşteri Tarafından Eklenen Görseller</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {showShipmentDetailModal?.customerImages?.length > 0 ? (
                    showShipmentDetailModal.customerImages.map((image, index) => (
                      <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                        <img src={image} alt={`Yük Görseli ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 py-8 text-center text-gray-500">
                      Müşteri tarafından eklenmiş görsel bulunmuyor.
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-lg mb-3">Taşıyıcı Tarafından Eklenen Görseller</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {showShipmentDetailModal?.carrierImages?.length > 0 ? (
                    showShipmentDetailModal.carrierImages.map((image, index) => (
                      <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                        <img src={image} alt={`Taşıma Görseli ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 py-8 text-center text-gray-500">
                      Taşıyıcı tarafından eklenmiş görsel bulunmuyor.
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setShowImagesModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded"
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