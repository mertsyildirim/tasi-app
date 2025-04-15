import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import PortalLayout from '../../components/portal/Layout';
import { FaTruck, FaBox, FaSearch, FaFilter, FaPlus, FaEye, FaTimes, FaChartLine, FaUsers, FaTachometerAlt, FaStar, FaIdCard, FaCar, FaRoute, FaMapMarkerAlt, FaClock, FaUser, FaBuilding, FaPhone, FaEnvelope, FaRedo } from 'react-icons/fa';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

// Google Maps API anahtarı
const GOOGLE_MAPS_API_KEY = "AIzaSyAKht3SqaVJpufUdq-vVQEfBEQKejT9Z8k";

export default function Tracking() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const timeoutRef = useRef(null);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    driver: 'all'
  });

  useEffect(() => {
    // Kullanıcı kontrolü
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/portal/login');
      return;
    }
    setLoading(false);
    
    // Harita yükleme için 10 saniyelik bir zaman aşımı ayarla
    timeoutRef.current = setTimeout(() => {
      if (!mapLoaded) {
        setLoadingTimeout(true);
      }
    }, 10000);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [router, mapLoaded]);

  // Örnek sürücü verileri
  const [drivers] = useState([
    { 
      id: 'DRV001',
      name: 'Ahmet Yılmaz', 
      phone: '0532 555 1234',
      email: 'ahmet@example.com',
      vehicle: '34 ABC 123 - Mercedes-Benz Actros',
      license: 'B Sınıfı',
      status: 'active',
      totalDeliveries: 128,
      rating: 4.7,
      location: { lat: 41.0082, lng: 28.9784 },
      lastUpdate: '10:30'
    },
    { 
      id: 'DRV002',
      name: 'Mehmet Demir', 
      phone: '0533 444 5678',
      email: 'mehmet@example.com',
      vehicle: '06 XYZ 789 - Volvo FH16',
      license: 'B Sınıfı',
      status: 'active',
      totalDeliveries: 95,
      rating: 4.5,
      location: { lat: 39.9334, lng: 32.8597 },
      lastUpdate: '10:28'
    },
    { 
      id: 'DRV003',
      name: 'Ayşe Kaya', 
      phone: '0535 333 9012',
      email: 'ayse@example.com',
      vehicle: '35 DEF 456 - Scania R450',
      license: 'B Sınıfı',
      status: 'inactive',
      totalDeliveries: 67,
      rating: 4.3,
      location: { lat: 38.4237, lng: 27.1428 },
      lastUpdate: '10:25'
    }
  ]);

  // Örnek sevkiyat verileri
  const [shipments] = useState([
    {
      id: 'SH001',
      customer: 'ABC Lojistik',
      from: 'İstanbul',
      to: 'Ankara',
      status: 'active',
      progress: 65,
      currentLocation: { lat: 40.9862, lng: 29.0307 },
      estimatedArrival: '2024-02-21 14:30',
      vehicle: '34 ABC 123',
      driver: 'Ahmet Yılmaz',
      lastUpdate: '2024-02-20 15:45'
    },
    {
      id: 'SH002',
      customer: 'XYZ Taşımacılık',
      from: 'İzmir',
      to: 'Bursa',
      status: 'completed',
      progress: 100,
      currentLocation: { lat: 40.1824, lng: 29.0670 },
      estimatedArrival: '2024-02-19 16:00',
      vehicle: '35 XYZ 456',
      driver: 'Mehmet Demir',
      lastUpdate: '2024-02-19 15:30'
    },
    {
      id: 'SH003',
      customer: 'DEF Nakliyat',
      from: 'Antalya',
      to: 'İstanbul',
      status: 'pending',
      progress: 0,
      currentLocation: { lat: 36.8841, lng: 30.7056 },
      estimatedArrival: '2024-02-22 10:00',
      vehicle: '07 DEF 789',
      driver: 'Ayşe Kaya',
      lastUpdate: '2024-02-20 09:15'
    }
  ]);

  const mapContainerStyle = {
    width: '100%',
    height: '600px'
  };

  const center = {
    lat: 39.9334,
    lng: 32.8597
  };

  // Harita options'ları memo ile optimize ediliyor
  const mapOptions = useMemo(() => ({
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    gestureHandling: 'greedy',
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  }), []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    // Filtreleme işlemleri burada yapılacak
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      dateRange: 'all',
      driver: 'all'
    });
  };

  const handleMapLoad = () => {
    setMapLoaded(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleMapError = () => {
    setMapError(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const reloadMap = () => {
    // Sayfa yeniden yüklenmeden basit bir yeniden deneme mekanizması
    setMapError(false);
    setLoadingTimeout(false);
    setMapLoaded(false);
    
    // Yeniden yükleme öncesinde kısa bir gecikme ekleyin
    setTimeout(() => {
      const mapContainer = document.getElementById('map-container');
      if (mapContainer) {
        // İçeriği temizle ve yeniden oluştur
        mapContainer.innerHTML = '';
        renderMap();
      } else {
        // Element bulunamazsa sayfayı yenile
        window.location.reload();
      }
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const renderMap = () => {
    // Hata veya zaman aşımı durumlarında alternatif içerik göster
    if (mapError || loadingTimeout) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
          <div className="text-center p-6">
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
              <p>Haritada bir sorun oluştu.</p>
              <p className="text-sm mt-2">
                {mapError 
                  ? "Google Maps API yüklenirken hata oluştu." 
                  : "Harita uzun süre yüklenemedi. Bağlantınızı kontrol edin."}
              </p>
            </div>
            <button 
              onClick={reloadMap}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center justify-center mx-auto"
            >
              <FaRedo className="mr-2" /> Tekrar Dene
            </button>
          </div>
        </div>
      );
    }

    return (
      <div id="map-container" className="h-full w-full">
        <LoadScript 
          googleMapsApiKey={GOOGLE_MAPS_API_KEY}
          onLoad={handleMapLoad}
          onError={handleMapError}
          loadingElement={
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-orange-500 mx-auto mb-6"></div>
                <p className="text-gray-600">Harita yükleniyor...</p>
                <p className="text-gray-500 text-sm mt-2">Bu işlem biraz zaman alabilir</p>
                {!mapLoaded && !mapError && loadingTimeout && (
                  <button 
                    onClick={reloadMap}
                    className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center justify-center mx-auto"
                  >
                    <FaRedo className="mr-2" /> Tekrar Dene
                  </button>
                )}
              </div>
            </div>
          }
        >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={6}
            options={mapOptions}
          >
            {drivers.map(driver => (
              <Marker
                key={driver.id}
                position={driver.location}
                onClick={() => setSelectedDriver(driver)}
                icon={{
                  url: driver.status === 'active' 
                    ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                    : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                }}
              />
            ))}

            {selectedDriver && (
              <InfoWindow
                position={selectedDriver.location}
                onCloseClick={() => setSelectedDriver(null)}
              >
                <div className="p-2">
                  <h3 className="font-medium text-gray-900">{selectedDriver.name}</h3>
                  <p className="text-sm text-gray-500">{selectedDriver.vehicle}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Son güncelleme: {selectedDriver.lastUpdate}
                  </p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    );
  };

  return (
    <PortalLayout title="Takip">
      <div className="space-y-6 p-4">
        {/* Üst Bilgi Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-orange-100 rounded-full">
                <FaTruck className="h-5 w-5 text-orange-500" />
              </div>
              <span className="text-xs text-orange-700 font-semibold bg-orange-50 px-2 py-1 rounded-full">
                Toplam
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Aktif Sürücü</h3>
            <p className="text-2xl font-bold text-gray-800">2</p>
            <p className="mt-2 text-xs text-green-600">
              <FaChartLine className="inline mr-1" />
              <span>%67 oran</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-green-100 rounded-full">
                <FaBox className="h-5 w-5 text-green-500" />
              </div>
              <span className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-1 rounded-full">
                Aktif
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Aktif Taşıma</h3>
            <p className="text-2xl font-bold text-gray-800">1</p>
            <p className="mt-2 text-xs text-green-600">
              <FaChartLine className="inline mr-1" />
              <span>%33 oran</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaRoute className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded-full">
                Ortalama
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Sevkiyat/Sürücü</h3>
            <p className="text-2xl font-bold text-gray-800">97</p>
            <p className="mt-2 text-xs text-green-600">
              <FaChartLine className="inline mr-1" />
              <span>%12 artış</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-purple-100 rounded-full">
                <FaStar className="h-5 w-5 text-purple-500" />
              </div>
              <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-2 py-1 rounded-full">
                Performans
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Ortalama Puan</h3>
            <p className="text-2xl font-bold text-gray-800">4.5</p>
            <p className="mt-2 text-xs text-green-600">
              <FaChartLine className="inline mr-1" />
              <span>%5 artış</span>
            </p>
          </div>
        </div>

        {/* Arama ve Filtreler */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Sürücü veya taşıma ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
              >
                <FaFilter className="mr-2" />
                Filtrele
              </button>
            </div>
          </div>

          {/* Filtre Paneli */}
          {showFilters && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">Tümü</option>
                    <option value="active">Aktif</option>
                    <option value="completed">Tamamlandı</option>
                    <option value="pending">Beklemede</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tarih Aralığı</label>
                  <select
                    name="dateRange"
                    value={filters.dateRange}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">Tümü</option>
                    <option value="today">Bugün</option>
                    <option value="week">Bu Hafta</option>
                    <option value="month">Bu Ay</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sürücü</label>
                  <select
                    name="driver"
                    value={filters.driver}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">Tümü</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>{driver.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Sıfırla
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
                >
                  Uygula
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Harita ve Sürücü Listesi */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Harita */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sürücü Konumları</h3>
              <div className="h-[600px] relative">
                {renderMap()}
              </div>
            </div>
          </div>

          {/* Sürücü Listesi */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Aktif Sürücüler</h3>
              <div className="space-y-4">
                {drivers.map(driver => (
                  <div 
                    key={driver.id} 
                    className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                      selectedDriver?.id === driver.id ? 'border-orange-500 bg-orange-50' : ''
                    }`}
                    onClick={() => setSelectedDriver(driver)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{driver.name}</h4>
                        <p className="text-sm text-gray-500">{driver.vehicle}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {driver.status === 'active' ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <FaPhone className="text-blue-500 mr-2" />
                        <span>{driver.phone}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FaEnvelope className="text-blue-500 mr-2" />
                        <span>{driver.email}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                      <div className="flex items-center">
                        <FaStar className="text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{driver.rating}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FaClock className="mr-1" />
                        <span>{driver.lastUpdate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sevkiyat Listesi */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Aktif Taşımalar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shipments.map(shipment => (
              <div key={shipment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Taşıma #{shipment.id}</h4>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    shipment.status === 'active' ? 'bg-green-100 text-green-800' : 
                    shipment.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {shipment.status === 'active' ? 'Aktif' : 
                     shipment.status === 'completed' ? 'Tamamlandı' : 
                     'Beklemede'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <FaMapMarkerAlt className="text-blue-500 mr-2" />
                    <span>{shipment.from} → {shipment.to}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaCar className="text-blue-500 mr-2" />
                    <span>{shipment.vehicle}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaUser className="text-blue-500 mr-2" />
                    <span>{shipment.driver}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>İlerleme</span>
                    <span>{shipment.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        shipment.status === 'active' ? 'bg-green-500' : 
                        shipment.status === 'completed' ? 'bg-blue-500' : 
                        'bg-yellow-500'
                      }`}
                      style={{ width: `${shipment.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaClock className="mr-1" />
                    <span>{shipment.estimatedArrival}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedShipment(shipment)}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Detayları Gör
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sürücü Detay Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Sürücü Detayları</h3>
              <button 
                onClick={() => setSelectedDriver(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Sürücü Bilgileri</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <FaUser className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Ad Soyad</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedDriver.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <FaCar className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Araç</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedDriver.vehicle}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <FaIdCard className="h-5 w-5 text-purple-600" />
                      </div>
                  <div>
                        <p className="text-sm font-medium text-gray-900">Ehliyet Sınıfı</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedDriver.license}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">İletişim Bilgileri</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <FaPhone className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Telefon</p>
                          <p className="text-base text-gray-700">{selectedDriver.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <FaEnvelope className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">E-posta</p>
                          <p className="text-base text-gray-700">{selectedDriver.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                          <p className="text-sm font-medium text-gray-900">Konum</p>
                          <p className="text-base text-gray-700">
                            {selectedDriver.location.lat.toFixed(4)}, {selectedDriver.location.lng.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Sürücü İstatistikleri</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-500">Toplam Sevkiyat</p>
                        <p className="text-xl font-bold text-gray-900">{selectedDriver.totalDeliveries}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-500">Sürücü Puanı</p>
                        <div className="flex items-center">
                          <FaStar className="text-yellow-400 mr-1" />
                          <p className="text-xl font-bold text-gray-900">{selectedDriver.rating}</p>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-500">Durum</p>
                        <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                          selectedDriver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedDriver.status === 'active' ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedDriver(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sevkiyat Detay Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Sevkiyat Detayları</h3>
              <button 
                onClick={() => setSelectedShipment(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Sevkiyat Bilgileri</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <FaBox className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Sevkiyat No</p>
                        <p className="text-lg font-semibold text-gray-900">#{selectedShipment.id}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <FaBuilding className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Müşteri</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedShipment.customer}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <FaMapMarkerAlt className="h-5 w-5 text-purple-600" />
                      </div>
                  <div>
                        <p className="text-sm font-medium text-gray-900">Güzergah</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedShipment.from} → {selectedShipment.to}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Taşıma Detayları</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <FaCar className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Araç</p>
                          <p className="text-base text-gray-700">{selectedShipment.vehicle}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <FaUser className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Sürücü</p>
                          <p className="text-base text-gray-700">{selectedShipment.driver}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <FaClock className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Tahmini Varış</p>
                          <p className="text-base text-gray-700">{selectedShipment.estimatedArrival}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Sevkiyat Durumu</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-500">Durum</p>
                        <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                          selectedShipment.status === 'active' ? 'bg-green-100 text-green-800' : 
                          selectedShipment.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedShipment.status === 'active' ? 'Aktif' : 
                           selectedShipment.status === 'completed' ? 'Tamamlandı' : 
                           'Beklemede'}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-500">İlerleme</p>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                selectedShipment.status === 'active' ? 'bg-green-500' : 
                                selectedShipment.status === 'completed' ? 'bg-blue-500' : 
                                'bg-yellow-500'
                              }`}
                              style={{ width: `${selectedShipment.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{selectedShipment.progress}%</span>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-500">Son Güncelleme</p>
                        <p className="text-sm font-medium text-gray-900">{selectedShipment.lastUpdate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedShipment(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
} 