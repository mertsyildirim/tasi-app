'use client'

import React, { useState, useEffect } from 'react'
import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaShippingFast, FaBoxOpen, FaCalendarAlt, FaTimes, FaTruck, FaMapMarkerAlt, FaMoneyBillWave, FaFileImage, FaMapMarked, FaCompass, FaArrowRight, FaSpinner } from 'react-icons/fa'
import AdminLayout from '../../components/admin/Layout'
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api'

// Google Maps API anahtarı
const GOOGLE_MAPS_API_KEY = "AIzaSyAKht3SqaVJpufUdq-vVQEfBEQKejT9Z8k";

export default function ShipmentsPage() {
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showShipmentDetailModal, setShowShipmentDetailModal] = useState(null)
  const [showImagesModal, setShowImagesModal] = useState(false)
  const [directions, setDirections] = useState(null)
  const [map, setMap] = useState(null)
  const [vehiclePosition, setVehiclePosition] = useState(null)

  // Google Maps yükleme
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  })

  // Map container style
  const containerStyle = {
    width: '100%',
    height: '350px'
  }

  // Harita merkezi - İstanbul
  const center = {
    lat: 41.0082,
    lng: 28.9784
  }

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
    
    const cityName = city.split(',')[0].trim();
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

  // Örnek taşıma verileri
  const shipments = [
    { 
      id: 1, 
      customer: 'Ahmet Yılmaz',
      customerCompany: 'ABC Tekstil Ltd.',
      carrier: 'Mehmet Kaya', 
      carrierCompany: 'Kaya Nakliyat',
      from: 'İstanbul, Kadıköy', 
      to: 'İstanbul, Beşiktaş', 
      status: 'Tamamlandı', 
      amount: '₺350',
      carrierPayment: '₺280', 
      date: '03.04.2023',
      cargoType: 'Mobilya',
      vehicleType: 'Kamyon' 
    },
    { 
      id: 2, 
      customer: 'Ayşe Demir',
      customerCompany: 'Demir Mobilya A.Ş.',
      carrier: 'Fatma Çelik', 
      carrierCompany: 'Çelik Taşımacılık',
      from: 'Ankara, Çankaya', 
      to: 'Ankara, Keçiören', 
      status: 'Taşınıyor', 
      amount: '₺420',
      carrierPayment: '₺340', 
      date: '05.04.2023',
      cargoType: 'Ofis Malzemeleri',
      vehicleType: 'Kamyonet' 
    },
    { 
      id: 3, 
      customer: 'Ali Öztürk',
      customerCompany: 'Öztürk Market',
      carrier: 'Mehmet Kaya', 
      carrierCompany: 'Kaya Nakliyat',
      from: 'İzmir, Karşıyaka', 
      to: 'İzmir, Konak', 
      status: 'Tarih Bekliyor', 
      amount: '₺280',
      carrierPayment: '₺230', 
      date: '07.04.2023',
      cargoType: 'Gıda Ürünleri',
      vehicleType: 'Soğutucu Kamyon' 
    },
    { 
      id: 4, 
      customer: 'Ahmet Yılmaz',
      customerCompany: 'ABC Tekstil Ltd.',
      carrier: 'Fatma Çelik', 
      carrierCompany: 'Çelik Taşımacılık',
      from: 'İstanbul, Ümraniye', 
      to: 'İstanbul, Ataşehir', 
      status: 'Tamamlandı', 
      amount: '₺300',
      carrierPayment: '₺250', 
      date: '01.04.2023',
      cargoType: 'Tekstil Ürünleri',
      vehicleType: 'Panelvan' 
    },
    { 
      id: 5, 
      customer: 'Ayşe Demir',
      customerCompany: 'Demir Mobilya A.Ş.',
      carrier: 'Mehmet Kaya', 
      carrierCompany: 'Kaya Nakliyat',
      from: 'Ankara, Etimesgut', 
      to: 'Ankara, Sincan', 
      status: 'İptal Edildi', 
      amount: '₺390',
      carrierPayment: '₺0', 
      date: '02.04.2023',
      cargoType: 'Mobilya',
      vehicleType: 'Tır' 
    },
    { 
      id: 6, 
      customer: 'Kemal Yıldız',
      customerCompany: 'Yıldız İnşaat Ltd.',
      carrier: 'Osman Kılıç', 
      carrierCompany: 'Kılıç Lojistik',
      from: 'İstanbul, Beylikdüzü', 
      to: 'İstanbul, Esenyurt', 
      status: 'Taşıyıcı Ödemesi Bekleniyor', 
      amount: '₺450',
      carrierPayment: '₺370', 
      date: '04.04.2023',
      cargoType: 'İnşaat Malzemeleri',
      vehicleType: 'Damperli Kamyon' 
    },
    { 
      id: 7, 
      customer: 'Zeynep Öz',
      customerCompany: 'Öz Elektronik A.Ş.',
      carrier: 'Hasan Sarı', 
      carrierCompany: 'Sarı Nakliyat',
      from: 'İstanbul, Maltepe', 
      to: 'İstanbul, Kartal', 
      status: 'Taşıyıcı Ödemesi Bekleniyor', 
      amount: '₺320',
      carrierPayment: '₺250', 
      date: '03.04.2023',
      cargoType: 'Elektronik Eşya',
      vehicleType: 'Kapalı Kasa' 
    },
  ];

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

  // Filtreleme
  const filteredShipments = shipments.filter(shipment => {
    // Tab filtresi
    const tabFilter = 
      selectedTab === 'all' ? true :
      selectedTab === 'date-waiting' ? shipment.status === 'Tarih Bekliyor' :
      selectedTab === 'in-progress' ? shipment.status === 'Taşınıyor' :
      selectedTab === 'payment-waiting' ? shipment.status === 'Taşıyıcı Ödemesi Bekleniyor' :
      selectedTab === 'completed' ? shipment.status === 'Tamamlandı' :
      selectedTab === 'canceled' ? shipment.status === 'İptal Edildi' :
      true;
    
    // Arama filtresi
    const searchFilter = 
      searchTerm === '' ? true :
      shipment.id.toString().includes(searchTerm) ||
      shipment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.carrierCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    return tabFilter && searchFilter;
  })

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

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-full mr-4">
              <FaShippingFast className="text-orange-600" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Toplam Taşıma</h3>
              <p className="text-2xl font-bold">{shipments.length}</p>
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
              <p className="text-2xl font-bold">{shipments.filter(s => s.status === 'Tamamlandı').length}</p>
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
              <p className="text-2xl font-bold">{shipments.filter(s => s.status === 'Taşınıyor').length}</p>
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
              <p className="text-2xl font-bold">{shipments.filter(s => s.status === 'Beklemede').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Taşıma Tablosu */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{shipment.id}</td>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900 transition-colors" 
                        title="Görüntüle"
                        onClick={() => setShowShipmentDetailModal(shipment)}
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
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Toplam <span className="font-medium">{filteredShipments.length}</span> taşıma
          </div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
              Önceki
            </button>
            <button className="px-3 py-1 border border-gray-300 bg-orange-50 text-orange-600 rounded-md text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
              Sonraki
            </button>
          </div>
        </div>
      </div>

      {/* Taşıma Detay Modal */}
      {showShipmentDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget && !showImagesModal) setShowShipmentDetailModal(null);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Taşıma #{showShipmentDetailModal.id} - Detaylar</h3>
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
                    
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <FaCompass className="text-orange-500 mr-2" />
                        <span className="font-medium">Rota Bilgileri</span>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                            <FaMapMarkerAlt className="text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Alınacak Konum</p>
                            <p className="font-medium">{showShipmentDetailModal.from}</p>
                          </div>
                        </div>
                        <div className="border-l-2 border-dashed border-gray-300 h-8 ml-4"></div>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-2">
                            <FaMapMarkerAlt className="text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Teslim Edilecek Konum</p>
                            <p className="font-medium">{showShipmentDetailModal.to}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Yük Tipi</p>
                        <p className="font-medium">{showShipmentDetailModal.cargoType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Araç Tipi</p>
                        <p className="font-medium">{showShipmentDetailModal.vehicleType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tarih</p>
                        <p className="font-medium">{showShipmentDetailModal.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Durum</p>
                        <p className="font-medium">
                          <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(showShipmentDetailModal.status)}`}>
                            {showShipmentDetailModal.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ücret Bilgileri */}
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
                
                {/* Sağ Kısım - Harita ve Takip */}
                <div>
                  <h4 className="font-medium text-lg mb-4">Rota Haritası</h4>
                  <div className="border rounded-lg overflow-hidden mb-4">
                    {isLoaded ? (
                      <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={7}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                      >
                        {directions ? (
                          <DirectionsRenderer directions={directions} />
                        ) : (
                          <>
                            <Marker 
                              position={getCoordinatesForCity(showShipmentDetailModal.from)} 
                              icon={{
                                url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                              }}
                            />
                            <Marker 
                              position={getCoordinatesForCity(showShipmentDetailModal.to)} 
                              icon={{
                                url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                              }}
                            />
                          </>
                        )}
                        
                        {vehiclePosition && (
                          <Marker 
                            position={vehiclePosition}
                            icon={{
                              url: "http://maps.google.com/mapfiles/ms/icons/truck.png",
                              scaledSize: new window.google.maps.Size(32, 32),
                            }}
                          />
                        )}
                      </GoogleMap>
                    ) : (
                      <div className="bg-gray-200 h-[350px] flex items-center justify-center">
                        <div className="text-center">
                          <FaSpinner className="mx-auto animate-spin text-orange-500 text-2xl mb-2" />
                          <p className="text-gray-600">Harita yükleniyor...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {showShipmentDetailModal.status === 'Taşınıyor' && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-2">
                        <FaTruck className="text-blue-500 mr-2" />
                        <span className="font-medium text-blue-800">Araç Canlı Takip</span>
                      </div>
                      <p className="text-sm text-blue-600 mb-3">
                        Araç şu anda taşıma sürecinde. Harita üzerinde görünen kamyon ikonu taşıyıcının konumunu göstermektedir.
                      </p>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="flex justify-between text-sm">
                          <div>
                            <span className="text-gray-500">Tahmini Varış:</span>
                            <span className="ml-1 font-medium">2 saat 30 dakika</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Kalan Mesafe:</span>
                            <span className="ml-1 font-medium">125 km</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-center mt-4">
                    <button 
                      className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded flex items-center"
                      onClick={() => setShowImagesModal(true)}
                    >
                      <FaFileImage className="mr-2" />
                      Taşıma Görselleri
                    </button>
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
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img src="https://via.placeholder.com/300" alt="Yük Görseli" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img src="https://via.placeholder.com/300" alt="Yük Görseli" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-lg mb-3">Taşıyıcı Tarafından Eklenen Görseller</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img src="https://via.placeholder.com/300" alt="Taşıma Görseli" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img src="https://via.placeholder.com/300" alt="Taşıma Görseli" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img src="https://via.placeholder.com/300" alt="Taşıma Görseli" className="w-full h-full object-cover" />
                  </div>
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