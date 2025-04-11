import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PortalLayout from '../../components/portal/Layout';
import { FaTruck, FaBox, FaMoneyBillWave, FaUsers, FaChartLine, FaRegClock, FaRegCalendarAlt, FaMapMarkerAlt, FaTimes, FaWeight, FaPhone, FaUser, FaBuilding, FaFileAlt, FaMoneyBill } from 'react-icons/fa';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Modal kapatma fonksiyonu
  const closeModal = () => {
    setSelectedShipment(null);
    setShowModal(false);
  };

  // ESC tuşu ile modalı kapatma
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) closeModal();
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/portal/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Örnek gönderi verileri
  const activeShipments = [
    { 
      id: 'TRK0012', 
      type: 'kurye', 
      origin: 'İstanbul', 
      destination: 'Ankara',
      status: 'Taşınıyor',
      date: '12 Mart 2024',
      originCoords: { lat: 41.0082, lng: 28.9784 },
      destinationCoords: { lat: 39.9334, lng: 32.8597 },
      weight: '250 kg',
      volume: '2 m³',
      customer: {
        name: 'Ahmet Yılmaz',
        company: 'ABC Lojistik Ltd. Şti.',
        phone: '+90 532 123 4567'
      },
      receiver: {
        name: 'Mehmet Demir',
        company: 'XYZ Dağıtım A.Ş.',
        phone: '+90 533 765 4321'
      },
      price: '₺2,500',
      paymentStatus: 'Ödendi',
      notes: 'Kırılacak eşya içerir, dikkatli taşınmalıdır.',
      documents: ['İrsaliye', 'Teslimat Formu'],
      estimatedTime: '4 saat',
      distance: '450 km',
      driver: {
        name: 'Ali Kaya',
        phone: '+90 535 999 8888',
        vehiclePlate: '34 ABC 123'
      }
    },
    { 
      id: 'TRK0023', 
      type: 'express', 
      origin: 'İzmir', 
      destination: 'Antalya',
      status: 'Depoda',
      date: '14 Mart 2024',
      originCoords: { lat: 38.4237, lng: 27.1428 },
      destinationCoords: { lat: 36.8841, lng: 30.7056 },
      weight: '180 kg',
      volume: '1.5 m³',
      customer: {
        name: 'Zeynep Arslan',
        company: 'DEF Kargo Ltd. Şti.',
        phone: '+90 532 987 6543'
      },
      receiver: {
        name: 'Hakan Şahin',
        company: 'MNO Dağıtım A.Ş.',
        phone: '+90 533 456 7890'
      },
      price: '₺1,800',
      paymentStatus: 'Beklemede',
      notes: 'Soğuk zincir ürünü, sıcaklık kontrolü gerekli.',
      documents: ['İrsaliye', 'Soğuk Zincir Formu'],
      estimatedTime: '5 saat',
      distance: '480 km',
      driver: {
        name: 'Murat Özkan',
        phone: '+90 535 111 2222',
        vehiclePlate: '35 MNO 456'
      }
    },
    { 
      id: 'TRK0045', 
      type: 'palet', 
      origin: 'Bursa', 
      destination: 'Kocaeli',
      status: 'Taşınıyor',
      date: '15 Mart 2024',
      originCoords: { lat: 40.1824, lng: 29.0670 },
      destinationCoords: { lat: 40.8533, lng: 29.8815 },
      weight: '750 kg',
      volume: '4 m³',
      customer: {
        name: 'Can Yıldız',
        company: 'GHI Lojistik A.Ş.',
        phone: '+90 532 345 6789'
      },
      receiver: {
        name: 'Ayşe Demir',
        company: 'PQR Sanayi Ltd. Şti.',
        phone: '+90 533 890 1234'
      },
      price: '₺3,200',
      paymentStatus: 'Ödendi',
      notes: 'Ağır yük, forklift gerekli.',
      documents: ['İrsaliye', 'Ağır Yük Formu'],
      estimatedTime: '2 saat',
      distance: '150 km',
      driver: {
        name: 'Emre Kaya',
        phone: '+90 535 333 4444',
        vehiclePlate: '16 PQR 789'
      }
    }
  ];

  const recentShipments = [
    { 
      id: 'TRK0001', 
      type: 'kurye', 
      origin: 'İstanbul', 
      destination: 'İzmir',
      status: 'Teslim Edildi',
      date: '10 Mart 2024',
      originCoords: { lat: 41.0082, lng: 28.9784 },
      destinationCoords: { lat: 38.4237, lng: 27.1428 },
      weight: '120 kg',
      volume: '1 m³',
      customer: {
        name: 'Deniz Yılmaz',
        company: 'RST Ticaret Ltd. Şti.',
        phone: '+90 532 567 8901'
      },
      receiver: {
        name: 'Berk Aydın',
        company: 'UVW Market A.Ş.',
        phone: '+90 533 234 5678'
      },
      price: '₺1,500',
      paymentStatus: 'Ödendi',
      notes: 'Teslimat başarıyla tamamlandı.',
      documents: ['İrsaliye', 'Teslimat Formu'],
      estimatedTime: '6 saat',
      distance: '480 km',
      driver: {
        name: 'Serkan Demir',
        phone: '+90 535 555 6666',
        vehiclePlate: '34 RST 123'
      }
    },
    { 
      id: 'TRK0002', 
      type: 'express', 
      origin: 'Ankara', 
      destination: 'Konya',
      status: 'Teslim Edildi',
      date: '9 Mart 2024',
      originCoords: { lat: 39.9334, lng: 32.8597 },
      destinationCoords: { lat: 37.8719, lng: 32.4843 },
      weight: '200 kg',
      volume: '1.8 m³',
      customer: {
        name: 'Merve Çelik',
        company: 'YZA Tekstil Ltd. Şti.',
        phone: '+90 532 789 0123'
      },
      receiver: {
        name: 'Kemal Yıldırım',
        company: 'BCD Mağazacılık A.Ş.',
        phone: '+90 533 901 2345'
      },
      price: '₺1,200',
      paymentStatus: 'Ödendi',
      notes: 'Zamanında teslim edildi.',
      documents: ['İrsaliye', 'Teslimat Formu'],
      estimatedTime: '3 saat',
      distance: '260 km',
      driver: {
        name: 'Okan Yılmaz',
        phone: '+90 535 777 8888',
        vehiclePlate: '06 YZA 456'
      }
    },
    { 
      id: 'TRK0003', 
      type: 'palet', 
      origin: 'Adana', 
      destination: 'Mersin',
      status: 'Teslim Edildi',
      date: '7 Mart 2024',
      originCoords: { lat: 37.0000, lng: 35.3213 },
      destinationCoords: { lat: 36.8000, lng: 34.6333 },
      weight: '500 kg',
      volume: '3 m³',
      customer: {
        name: 'Cem Karaca',
        company: 'EFG Sanayi A.Ş.',
        phone: '+90 532 123 4567'
      },
      receiver: {
        name: 'Selin Yılmaz',
        company: 'HIJ Depo Ltd. Şti.',
        phone: '+90 533 567 8901'
      },
      price: '₺900',
      paymentStatus: 'Ödendi',
      notes: 'Sorunsuz teslim edildi.',
      documents: ['İrsaliye', 'Teslimat Formu'],
      estimatedTime: '1 saat',
      distance: '70 km',
      driver: {
        name: 'Burak Şahin',
        phone: '+90 535 999 0000',
        vehiclePlate: '01 EFG 789'
      }
    }
  ];

  // Örnek ödeme verileri
  const recentPayments = [
    {
      id: 'PMT001',
      amount: '₺2,500',
      status: 'Ödendi',
      date: '15 Mart 2024',
      method: 'Banka Transferi',
      description: 'Mart Ayı 1. Dönem Ödemesi',
      period: '1-15 Mart 2024',
      paymentDate: '15 Mart 2024',
      totalDeliveries: 12,
      totalDistance: '1,450 km'
    },
    {
      id: 'PMT002',
      amount: '₺1,800',
      status: 'İşleniyor',
      date: '29 Şubat 2024',
      method: 'Banka Transferi',
      description: 'Şubat Ayı 2. Dönem Ödemesi',
      period: '16-29 Şubat 2024',
      paymentDate: '1 Mart 2024',
      totalDeliveries: 8,
      totalDistance: '980 km'
    },
    {
      id: 'PMT003',
      amount: '₺3,200',
      status: 'Ödendi',
      date: '15 Şubat 2024',
      method: 'Banka Transferi',
      description: 'Şubat Ayı 1. Dönem Ödemesi',
      period: '1-15 Şubat 2024',
      paymentDate: '15 Şubat 2024',
      totalDeliveries: 15,
      totalDistance: '1,850 km'
    }
  ];

  // Örnek fatura verileri
  const recentInvoices = [
    {
      id: 'INV001',
      amount: '₺2,950',
      status: 'Onaylandı',
      date: '15 Mart 2024',
      period: '1-15 Mart 2024',
      type: 'e-Fatura',
      invoiceNo: 'TAS2024000123',
      totalDeliveries: 12,
      totalDistance: '1,450 km'
    },
    {
      id: 'INV002',
      amount: '₺2,124',
      status: 'İnceleniyor',
      date: '29 Şubat 2024',
      period: '16-29 Şubat 2024',
      type: 'e-Fatura',
      invoiceNo: 'TAS2024000122',
      totalDeliveries: 8,
      totalDistance: '980 km'
    },
    {
      id: 'INV003',
      amount: '₺3,776',
      status: 'Onaylandı',
      date: '15 Şubat 2024',
      period: '1-15 Şubat 2024',
      type: 'e-Fatura',
      invoiceNo: 'TAS2024000121',
      totalDeliveries: 15,
      totalDistance: '1,850 km'
    }
  ];

  // Gönderi türüne göre icon render etme
  const renderShipmentIcon = (type) => {
    switch(type) {
      case 'kurye':
        return <FaTruck className="text-orange-500" />;
      case 'express':
        return <FaBox className="text-orange-500" />;
      case 'palet':
        return <FaBox className="text-orange-500" />;
      default:
        return <FaBox className="text-orange-500" />;
    }
  };

  // Detay modalı
  const ShipmentDetailModal = () => {
    if (!selectedShipment) return null;

    const mapContainerStyle = {
      width: '100%',
      height: '400px'
    };

    const center = {
      lat: selectedShipment.originCoords.lat,
      lng: selectedShipment.originCoords.lng
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Taşıma Detayları</h2>
              <p className="text-sm text-gray-500 mt-1">#{selectedShipment.id}</p>
            </div>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Durum ve Temel Bilgiler */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="p-3 rounded-full bg-orange-100 mr-4">
                  {renderShipmentIcon(selectedShipment.type)}
                </span>
                <div>
                  <p className="text-lg font-semibold">{selectedShipment.type.toUpperCase()}</p>
                  <p className="text-sm text-gray-500">{selectedShipment.date}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold px-4 py-2 rounded-full ${
                selectedShipment.status === 'Teslim Edildi' ? 'bg-green-100 text-green-800' :
                selectedShipment.status === 'Taşınıyor' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {selectedShipment.status}
              </span>
            </div>

            {/* Harita */}
            <div className="h-[400px] bg-gray-100 rounded-lg overflow-hidden">
              <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={7}
                  options={{
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                  }}
                >
                  {/* Çıkış noktası */}
                  <Marker
                    position={selectedShipment.originCoords}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                    }}
                  />
                  {/* Varış noktası */}
                  <Marker
                    position={selectedShipment.destinationCoords}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                    }}
                  />
                </GoogleMap>
              </LoadScript>
            </div>

            {/* Detay Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Konum Bilgileri */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-gray-800">Konum Bilgileri</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="text-orange-500 mt-1 mr-3" />
                    <div>
                      <p className="font-medium">Çıkış Noktası</p>
                      <p className="text-gray-600">{selectedShipment.origin}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="text-green-500 mt-1 mr-3" />
                    <div>
                      <p className="font-medium">Varış Noktası</p>
                      <p className="text-gray-600">{selectedShipment.destination}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kargo Bilgileri */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-gray-800">Kargo Bilgileri</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FaWeight className="text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">Ağırlık</p>
                      <p className="text-gray-600">{selectedShipment.weight}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaBox className="text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">Hacim</p>
                      <p className="text-gray-600">{selectedShipment.volume}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Müşteri Bilgileri */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-gray-800">Gönderici Bilgileri</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FaUser className="text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">İsim</p>
                      <p className="text-gray-600">{selectedShipment.customer?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaBuilding className="text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">Firma</p>
                      <p className="text-gray-600">{selectedShipment.customer?.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaPhone className="text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">Telefon</p>
                      <p className="text-gray-600">{selectedShipment.customer?.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alıcı Bilgileri */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-gray-800">Alıcı Bilgileri</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FaUser className="text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">İsim</p>
                      <p className="text-gray-600">{selectedShipment.receiver?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaBuilding className="text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">Firma</p>
                      <p className="text-gray-600">{selectedShipment.receiver?.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaPhone className="text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">Telefon</p>
                      <p className="text-gray-600">{selectedShipment.receiver?.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Taşıma Bilgileri */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-gray-800">Taşıma Bilgileri</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FaTruck className="text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">Sürücü</p>
                      <p className="text-gray-600">{selectedShipment.driver?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaRegClock className="text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">Tahmini Süre</p>
                      <p className="text-gray-600">{selectedShipment.estimatedTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">Mesafe</p>
                      <p className="text-gray-600">{selectedShipment.distance}</p>
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
                      <p className="text-gray-600">{selectedShipment.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaFileAlt className="text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">Ödeme Durumu</p>
                      <p className="text-gray-600">{selectedShipment.paymentStatus}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notlar */}
            {selectedShipment.notes && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Notlar</h3>
                <p className="text-gray-600">{selectedShipment.notes}</p>
              </div>
            )}

            {/* Dökümanlar */}
            {selectedShipment.documents && selectedShipment.documents.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-800 mb-2">Dökümanlar</h3>
                <div className="flex gap-2">
                  {selectedShipment.documents.map((doc, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Gönderi card'ını render etme
  const renderShipmentCard = (shipment, isRecent = false) => (
    <div key={shipment.id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500 hover:shadow-lg transition duration-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <span className="p-2 rounded-full bg-orange-100 mr-3">
            {renderShipmentIcon(shipment.type)}
          </span>
          <div>
            <h3 className="font-bold text-gray-800">{shipment.id}</h3>
            <p className="text-sm text-gray-500">{shipment.type.toUpperCase()}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          shipment.status === 'Teslim Edildi' ? 'bg-green-100 text-green-800' :
          shipment.status === 'Taşınıyor' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {shipment.status}
        </span>
      </div>

      <div className="flex items-center text-sm mb-2">
        <FaMapMarkerAlt className="text-gray-400 mr-1" />
        <span className="text-gray-600">{shipment.origin}</span>
        <span className="mx-2">→</span>
        <FaMapMarkerAlt className="text-gray-400 mr-1" />
        <span className="text-gray-600">{shipment.destination}</span>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center text-xs text-gray-500">
          <FaRegCalendarAlt className="mr-1" />
          {shipment.date}
        </div>
        <button 
          onClick={() => {
            setSelectedShipment(shipment);
            setShowModal(true);
          }}
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          Detayları Gör
        </button>
      </div>
    </div>
  );

  return (
    <PortalLayout title="Kontrol Paneli">
      <div className="space-y-6 p-4">
        {/* İstatistikler */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-3">
              <div className="p-3 bg-orange-100 rounded-full">
                <FaTruck className="h-5 w-5 text-orange-500" />
              </div>
              <span className="text-xs text-orange-700 font-semibold bg-orange-50 px-2 py-1 rounded-full">
                Aktif
              </span>
            </div>
            <h3 className="text-gray-500 text-sm mb-1">Aktif Taşımalar</h3>
            <p className="text-2xl font-bold text-gray-800">3</p>
            <p className="mt-2 text-xs text-green-600">
              <FaChartLine className="inline mr-1" />
              <span>%12 artış</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-3">
              <div className="p-3 bg-orange-100 rounded-full">
                <FaMoneyBillWave className="h-5 w-5 text-orange-500" />
              </div>
              <span className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-1 rounded-full">
                Bu Ay
              </span>
            </div>
            <h3 className="text-gray-500 text-sm mb-1">Toplam Kazanç</h3>
            <p className="text-2xl font-bold text-gray-800">₺4,250</p>
            <p className="mt-2 text-xs text-green-600">
              <FaChartLine className="inline mr-1" />
              <span>%8 artış</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-3">
              <div className="p-3 bg-orange-100 rounded-full">
                <FaUsers className="h-5 w-5 text-orange-500" />
              </div>
              <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-2 py-1 rounded-full">
                Toplam
              </span>
            </div>
            <h3 className="text-gray-500 text-sm mb-1">Müşteriler</h3>
            <p className="text-2xl font-bold text-gray-800">124</p>
            <p className="mt-2 text-xs text-green-600">
              <FaChartLine className="inline mr-1" />
              <span>%5 artış</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-3">
              <div className="p-3 bg-orange-100 rounded-full">
                <FaChartLine className="h-5 w-5 text-orange-500" />
              </div>
              <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded-full">
                Bu Hafta
              </span>
            </div>
            <h3 className="text-gray-500 text-sm mb-1">Performans</h3>
            <p className="text-2xl font-bold text-gray-800">%95</p>
            <p className="mt-2 text-xs text-green-600">
              <FaChartLine className="inline mr-1" />
              <span>%2 artış</span>
            </p>
          </div>
        </div>

        {/* Aktif Gönderiler - Mobil */}
        <div className="block md:hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Aktif Taşımalar</h2>
            <button 
              onClick={() => router.push('/portal/shipments')}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Tümünü Gör
            </button>
          </div>
          <div className="space-y-4">
            {activeShipments.map(shipment => renderShipmentCard(shipment))}
          </div>
        </div>

        {/* Son Gönderiler - Mobil */}
        <div className="block md:hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Son Tamamlanan Taşımalar</h2>
            <button 
              onClick={() => router.push('/portal/shipments?tab=history')}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Tümünü Gör
            </button>
          </div>
          <div className="space-y-4">
            {recentShipments.map(shipment => renderShipmentCard(shipment, true))}
          </div>
        </div>

        {/* Desktop View - 2 Kolonlu Düzen */}
        <div className="hidden md:grid md:grid-cols-2 gap-6">
          {/* Aktif Gönderiler */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Aktif Taşımalar</h2>
              <button 
                onClick={() => router.push('/portal/shipments')}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Tümünü Gör
              </button>
            </div>
            <div className="space-y-4">
              {activeShipments.map(shipment => renderShipmentCard(shipment))}
            </div>
          </div>

          {/* Son Gönderiler */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Son Tamamlanan Taşımalar</h2>
              <button 
                onClick={() => router.push('/portal/shipments?tab=history')}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Tümünü Gör
              </button>
            </div>
            <div className="space-y-4">
              {recentShipments.map(shipment => renderShipmentCard(shipment, true))}
            </div>
          </div>
        </div>

        {/* Ödemelerim ve Faturalarım */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Ödemelerim */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full mr-3">
                  <FaMoneyBillWave className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Ödemeler</h2>
              </div>
              <button 
                onClick={() => router.push('/portal/payments')}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Tümünü Gör
              </button>
            </div>
            <div className="space-y-4">
              {recentPayments.map(payment => (
                <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-full ${
                        payment.status === 'Ödendi' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <FaMoneyBill className={`h-4 w-4 ${
                          payment.status === 'Ödendi' ? 'text-green-600' : 'text-blue-600'
                        }`} />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{payment.description}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span>Dönem: {payment.period}</span>
                        <span className="mx-2">•</span>
                        <span>{payment.totalDeliveries} Taşıma</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">{payment.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      payment.status === 'Ödendi' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Faturalarım */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full mr-3">
                  <FaFileAlt className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Faturalar</h2>
              </div>
              <button 
                onClick={() => router.push('/portal/invoices')}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Tümünü Gör
              </button>
            </div>
            <div className="space-y-4">
              {recentInvoices.map(invoice => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-full ${
                        invoice.status === 'Onaylandı' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <FaFileAlt className={`h-4 w-4 ${
                          invoice.status === 'Onaylandı' ? 'text-green-600' : 'text-blue-600'
                        }`} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium text-gray-800">{invoice.invoiceNo}</p>
                        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {invoice.type}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span>Dönem: {invoice.period}</span>
                        <span className="mx-2">•</span>
                        <span>{invoice.totalDeliveries} Taşıma</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">{invoice.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      invoice.status === 'Onaylandı' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {showModal && <ShipmentDetailModal />}
    </PortalLayout>
  );
} 