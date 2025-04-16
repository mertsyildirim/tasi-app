import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import PortalLayout from '../../components/portal/Layout';
import { FaTruck, FaBox, FaMoneyBillWave, FaUsers, FaChartLine, FaRegClock, FaRegCalendarAlt, FaMapMarkerAlt, FaTimes, FaWeight, FaPhone, FaUser, FaBuilding, FaFileAlt, FaMoneyBill, FaBell } from 'react-icons/fa';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import axios from 'axios';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalShipments: 0,
    activeShipments: 0, 
    completedShipments: 0,
    pendingPayments: 0,
    totalRevenue: '₺0',
    todayShipments: 0,
    totalDrivers: 0,
    totalVehicles: 0,
    monthlyRevenue: 0,
    pendingDocuments: 0,
    notifications: []
  });

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

  // Aktif gönderi verilerini getir
  const [activeShipments, setActiveShipments] = useState([]);
  const [recentShipments, setRecentShipments] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');

        if (!token || !userData) {
          router.push('/portal/login');
          return;
        }

        const user = JSON.parse(userData);
        const allowedRoles = ['carrier', 'driver', 'admin'];
        const hasAllowedRole = user.roles?.some(role => allowedRoles.includes(role)) || allowedRoles.includes(user.role);

        if (!hasAllowedRole && user.email !== 'mert@tasiapp.com') {
          router.push('/portal/dashboard');
          return;
        }

        // Kullanıcı profili
        const userResponse = await axios.get('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (userResponse.data.success) {
          setUser(userResponse.data.user);
        }

        // Dashboard istatistikleri
        const statsResponse = await axios.get('/api/portal/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (statsResponse.data.success) {
          setStats(statsResponse.data);
        }

        // Aktif taşımaları getir
        const activeShipmentsResponse = await axios.get('/api/shipments/active', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (activeShipmentsResponse.data.success) {
          setActiveShipments(activeShipmentsResponse.data.shipments);
        }

        // Son taşımaları getir
        const recentShipmentsResponse = await axios.get('/api/shipments/recent', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (recentShipmentsResponse.data.success) {
          setRecentShipments(recentShipmentsResponse.data.shipments);
        }

        // Son ödemeleri getir
        const paymentsResponse = await axios.get('/api/payments/recent', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (paymentsResponse.data.success) {
          setRecentPayments(paymentsResponse.data.payments);
        }

        // Son faturaları getir
        const invoicesResponse = await axios.get('/api/invoices/recent', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (invoicesResponse.data.success) {
          setRecentInvoices(invoicesResponse.data.invoices);
        }

      } catch (error) {
        console.error('Dashboard veri yükleme hatası:', error);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          router.push('/portal/login');
          return;
        }
        
        setError('Dashboard verileri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
    <>
      <Head>
        <title>Panel - TaşıApp</title>
        <meta name="description" content="TaşıApp Taşıyıcı Portalı Panel" />
      </Head>
      <PortalLayout title="Kontrol Paneli">
        <div className="flex flex-col h-full">
          <div className="flex-grow py-4 px-4">
            {/* Dashboard içeriği */}
            <div className="grid grid-cols-1 gap-6 pb-6">
              
              {/* Özet Kartları */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <p className="text-2xl font-bold text-gray-800">{stats.activeShipments}</p>
                  <p className="mt-2 text-xs text-green-600">
                    <FaChartLine className="inline mr-1" />
                    <span>{stats.todayShipments} yeni</span>
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
                  <p className="text-2xl font-bold text-gray-800">{stats.totalRevenue}</p>
                  <p className="mt-2 text-xs text-green-600">
                    <FaChartLine className="inline mr-1" />
                    <span>{stats.pendingPayments} bekleyen ödeme</span>
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
                  <p className="text-2xl font-bold text-gray-800">{stats.totalShipments}</p>
                  <p className="mt-2 text-xs text-green-600">
                    <FaChartLine className="inline mr-1" />
                    <span>{stats.completedShipments} tamamlanmış</span>
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
                  <p className="text-2xl font-bold text-gray-800">{stats.activeShipments > 0 ? ((stats.completedShipments / stats.activeShipments) * 100).toFixed(2) : '0'}%</p>
                  <p className="mt-2 text-xs text-green-600">
                    <FaChartLine className="inline mr-1" />
                    <span>{stats.completedShipments} tamamlanmış</span>
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
          </div>
          
          {/* Alt çizgi - ekranın altına sabitlenmiş */}
          <div className="w-full border-t border-gray-200 mt-auto"></div>
        </div>
        {showModal && <ShipmentDetailModal />}
      </PortalLayout>
    </>
  );
} 