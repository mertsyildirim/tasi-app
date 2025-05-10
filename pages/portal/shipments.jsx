import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PortalLayout from '../../components/portal/Layout';
import { FaTruck, FaBox, FaSearch, FaFilter, FaPlus, FaEye, FaTimes, FaChartLine, FaUsers, FaTachometerAlt, FaStar, FaIdCard, FaCar, FaRoute, FaMapMarkerAlt, FaClock, FaUser, FaBuilding, FaMoneyBill, FaFileAlt, FaRegCalendarAlt } from 'react-icons/fa';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

export default function Shipments() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Kullanıcı kontrolü
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/portal/login');
      return;
    }
    setLoading(false);
  }, [router]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <PortalLayout title="Taşımalar">
      <div className="space-y-6 p-4">
        {/* Üst Bilgi Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-orange-100 rounded-full">
                <FaBox className="h-5 w-5 text-orange-500" />
              </div>
              <span className="text-xs text-orange-700 font-semibold bg-orange-50 px-2 py-1 rounded-full">
                Toplam
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Taşıma Sayısı</h3>
            <p className="text-2xl font-bold text-gray-800">3</p>
            <p className="mt-2 text-xs text-green-600">
              <FaChartLine className="inline mr-1" />
              <span>%15 artış</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-green-100 rounded-full">
                <FaTruck className="h-5 w-5 text-green-500" />
              </div>
              <span className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-1 rounded-full">
                Aktif
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Aktif Taşımalar</h3>
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
            <h3 className="text-gray-500 text-sm">Tamamlanma Süresi</h3>
            <p className="text-2xl font-bold text-gray-800">18s</p>
            <p className="mt-2 text-xs text-green-600">
              <FaChartLine className="inline mr-1" />
              <span>%8 iyileşme</span>
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
            <h3 className="text-gray-500 text-sm">Başarı Oranı</h3>
            <p className="text-2xl font-bold text-gray-800">%95</p>
            <p className="mt-2 text-xs text-green-600">
              <FaChartLine className="inline mr-1" />
              <span>%3 artış</span>
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
                  placeholder="Taşımalarda ara..."
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
          
          {/* Filtre Dropdown */}
          {showFilters && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                  <select className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="">Tümü</option>
                    <option value="active">Aktif</option>
                    <option value="completed">Tamamlandı</option>
                    <option value="pending">Beklemede</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tarih Aralığı</label>
                  <select className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="">Tümü</option>
                    <option value="today">Bugün</option>
                    <option value="week">Bu Hafta</option>
                    <option value="month">Bu Ay</option>
                    <option value="custom">Özel Aralık</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sıralama</label>
                  <select className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="newest">En Yeni</option>
                    <option value="oldest">En Eski</option>
                    <option value="progress">İlerleme Durumu</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Uygula
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sevkiyat Listesi */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Taşıma Listesi</h3>
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

      {/* Sevkiyat Detay Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Taşıma Detayları</h3>
              <button 
                onClick={() => setSelectedShipment(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Durum ve Temel Bilgiler */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="p-3 rounded-full bg-orange-100 mr-4">
                    <FaTruck className="h-5 w-5 text-orange-500" />
                  </span>
                  <div>
                    <p className="text-lg font-semibold">{selectedShipment.id}</p>
                    <p className="text-sm text-gray-500">{selectedShipment.lastUpdate}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold px-4 py-2 rounded-full ${
                  selectedShipment.status === 'completed' ? 'bg-green-100 text-green-800' :
                  selectedShipment.status === 'active' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedShipment.status === 'active' ? 'Aktif' : 
                   selectedShipment.status === 'completed' ? 'Tamamlandı' : 
                   'Beklemede'}
                </span>
              </div>

              {/* Harita */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Konum Takibi</h3>
                <div className="h-[400px] rounded-lg overflow-hidden">
                  <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={selectedShipment.currentLocation}
                      zoom={8}
                      options={{
                        zoomControl: true,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                      }}
                    >
                      {/* Çıkış Noktası */}
                      <Marker
                        position={selectedShipment.currentLocation}
                        icon={{
                          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                        }}
                      />
                      {/* Varış Noktası */}
                      <Marker
                        position={{ lat: 39.9334, lng: 32.8597 }}
                        icon={{
                          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                        }}
                      />
                    </GoogleMap>
                  </LoadScript>
                </div>
              </div>

              {/* Detay Bilgileri */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Konum Bilgileri */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-gray-800">Konum Bilgileri</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="text-orange-500 mt-1 mr-3" />
                      <div>
                        <p className="font-medium">Çıkış Noktası</p>
                        <p className="text-gray-600">{selectedShipment.from}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="text-green-500 mt-1 mr-3" />
                      <div>
                        <p className="font-medium">Varış Noktası</p>
                        <p className="text-gray-600">{selectedShipment.to}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Araç ve Sürücü Bilgileri */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-gray-800">Araç ve Sürücü</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FaCar className="text-gray-500 mr-3" />
                      <div>
                        <p className="font-medium">Araç Plakası</p>
                        <p className="text-gray-600">{selectedShipment.vehicle}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaUser className="text-gray-500 mr-3" />
                      <div>
                        <p className="font-medium">Sürücü</p>
                        <p className="text-gray-600">{selectedShipment.driver}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ödeme Bilgileri */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-gray-800">Ödeme Bilgileri</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FaMoneyBill className="text-gray-500 mr-3" />
                      <div>
                        <p className="font-medium">Tutar</p>
                        <p className="text-gray-600">₺2,500</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaFileAlt className="text-gray-500 mr-3" />
                      <div>
                        <p className="font-medium">Ödeme Durumu</p>
                        <p className="text-gray-600">Ödendi</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notlar */}
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Notlar</h3>
                <p className="text-gray-600">Kırılacak eşya içerir, dikkatli taşınmalıdır.</p>
              </div>

              {/* Dökümanlar */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-800 mb-2">Dökümanlar</h3>
                <div className="flex gap-2">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    İrsaliye
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    Teslimat Formu
                  </span>
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