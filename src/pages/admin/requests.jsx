'use client'

import React, { useState, useEffect } from 'react'
import { FaSearch, FaEye, FaCheck, FaTimes, FaSms, FaMapMarkerAlt, FaTruck, FaCompass, FaCalendarAlt, FaMoneyBillWave, FaEnvelope, FaSpinner, FaClipboardList } from 'react-icons/fa'
import AdminLayout from '../../components/admin/Layout'
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api'

// Google Maps API anahtarı
const GOOGLE_MAPS_API_KEY = "AIzaSyAKht3SqaVJpufUdq-vVQEfBEQKejT9Z8k";

export default function RequestsPage() {
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showRequestDetailModal, setShowRequestDetailModal] = useState(null)
  const [showConfirmSmsModal, setShowConfirmSmsModal] = useState(null)
  const [smsSending, setSmsSending] = useState(false)
  const [smsSuccess, setSmsSuccess] = useState(false)
  const [directions, setDirections] = useState(null)
  const [map, setMap] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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
      'Mersin': { lat: 36.8120, lng: 34.6415 },
      'Eskişehir': { lat: 39.7667, lng: 30.5256 },
      'Muğla': { lat: 37.2153, lng: 28.3636 },
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
        } else {
          console.error(`Rota bulunamadı: ${status}`);
        }
      }
    );
  };

  // Modal açıldığında harita rotasını çiz
  useEffect(() => {
    if (showRequestDetailModal && isLoaded) {
      getRoute(showRequestDetailModal.pickupLocation, showRequestDetailModal.deliveryLocation);
    }
  }, [showRequestDetailModal, isLoaded]);

  // ESC tuşu ile modal'ları kapatma
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showConfirmSmsModal) {
          setShowConfirmSmsModal(null);
        } else if (showRequestDetailModal) {
          setShowRequestDetailModal(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Modal açıkken body scroll'u engelle
    if (showRequestDetailModal || showConfirmSmsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [showRequestDetailModal, showConfirmSmsModal]);

  // Talep görüntüleme işlemi
  const handleViewRequest = (request) => {
    setShowRequestDetailModal(request);
  };

  // SMS gönderme işlemi
  const handleSendSMS = (request) => {
    setShowConfirmSmsModal(request);
  };

  // SMS gönderme onayı
  const confirmSendSMS = () => {
    setSmsSending(true);
    
    // SMS gönderme simülasyonu
    setTimeout(() => {
      setSmsSending(false);
      setSmsSuccess(true);
      
      // Başarı mesajını 2 saniye göster, sonra modalı kapat
      setTimeout(() => {
        setSmsSuccess(false);
        setShowConfirmSmsModal(null);
      }, 2000);
    }, 2000);
  };

  // Örnek talepler
  const requests = [
    {
      id: 'TL-1234',
      customerName: 'Ahmet Yılmaz',
      customerPhone: '0532 123 4567',
      pickupLocation: 'İstanbul, Kadıköy',
      deliveryLocation: 'Ankara, Çankaya',
      distance: '450 km',
      vehicle: 'Kamyon (10 ton)',
      status: 'Yeni',
      date: '12.07.2023',
      time: '14:30',
      price: '8.500 ₺',
      description: 'Ev eşyası taşıma talebi, hassas eşyalar var.',
      carrierId: null,
      carrier: null,
      payment: null
    },
    {
      id: 'TL-1235',
      customerName: 'Ayşe Kaya',
      customerPhone: '0533 456 7890',
      pickupLocation: 'İzmir, Karşıyaka',
      deliveryLocation: 'Muğla, Bodrum',
      distance: '240 km',
      vehicle: 'Kamyonet (3 ton)',
      status: 'Taşıyıcı Onayı Bekleniyor',
      date: '15.07.2023',
      time: '09:00',
      price: '4.250 ₺',
      description: 'Ofis taşıma işlemi, bilgisayar ekipmanları mevcut.',
      carrierId: 'TS-5678',
      carrier: 'Hızlı Nakliyat Ltd.',
      payment: null
    },
    {
      id: 'TL-1236',
      customerName: 'Mehmet Demir',
      customerPhone: '0535 789 0123',
      pickupLocation: 'Ankara, Kızılay',
      deliveryLocation: 'Konya, Meram',
      distance: '260 km',
      vehicle: 'Tır (20 ton)',
      status: 'Taşıyıcı Onayı Olmadı',
      date: '18.07.2023',
      time: '11:45',
      price: '9.750 ₺',
      description: 'Fabrika ekipmanı taşıma işlemi, ağır yük.',
      carrierId: 'TS-6789',
      carrier: 'Güçlü Taşımacılık A.Ş.',
      payment: null
    },
    {
      id: 'TL-1237',
      customerName: 'Zeynep Şahin',
      customerPhone: '0536 012 3456',
      pickupLocation: 'Bursa, Nilüfer',
      deliveryLocation: 'İstanbul, Beşiktaş',
      distance: '150 km',
      vehicle: 'Kamyon (8 ton)',
      status: 'Ödeme Bekleniyor',
      date: '20.07.2023',
      time: '15:00',
      price: '3.850 ₺',
      description: 'Restoran ekipmanları taşıma işlemi.',
      carrierId: 'TS-7890',
      carrier: 'Elit Lojistik A.Ş.',
      payment: 'Beklemede'
    },
    {
      id: 'TL-1238',
      customerName: 'Ali Can',
      customerPhone: '0537 234 5678',
      pickupLocation: 'Antalya, Konyaaltı',
      deliveryLocation: 'Mersin, Mezitli',
      distance: '470 km',
      vehicle: 'Kamyonet (2 ton)',
      status: 'İptal Edildi',
      date: '22.07.2023',
      time: '10:30',
      price: '5.200 ₺',
      description: 'Kişisel eşya taşıma talebi, iptal edildi.',
      carrierId: null,
      carrier: null,
      payment: null
    },
    {
      id: 'TL-1239',
      customerName: 'Fatma Yıldız',
      customerPhone: '0538 345 6789',
      pickupLocation: 'Eskişehir, Tepebaşı',
      deliveryLocation: 'Ankara, Mamak',
      distance: '230 km',
      vehicle: 'Kamyon (12 ton)',
      status: 'İndirim SMS Gönderildi',
      date: '25.07.2023',
      time: '13:15',
      price: '6.750 ₺',
      description: 'Mağaza eşyası taşıma talebi, iptal edilip indirim sms\'i gönderildi.',
      carrierId: null,
      carrier: null,
      payment: null
    }
  ]

  // Durum tiplerine göre renk belirleme
  const getStatusColor = (status) => {
    switch (status) {
      case 'Yeni':
        return 'bg-blue-100 text-blue-800';
      case 'Taşıyıcı Onayı Bekleniyor':
        return 'bg-indigo-100 text-indigo-800';
      case 'Taşıyıcı Onayı Olmadı':
        return 'bg-yellow-100 text-yellow-800';
      case 'Ödeme Bekleniyor':
        return 'bg-purple-100 text-purple-800';
      case 'İptal Edildi':
        return 'bg-red-100 text-red-800';
      case 'İndirim SMS Gönderildi':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Sekme seçenekleri
  const tabs = [
    { id: 'all', label: 'Tümü' },
    { id: 'new', label: 'Yeni' },
    { id: 'awaiting', label: 'Taşıyıcı Onayı Beklenenler' },
    { id: 'rejected', label: 'Taşıyıcı Onayı Olmadı' },
    { id: 'payment', label: 'Ödeme Bekleniyor' },
    { id: 'canceled', label: 'İptal Edildi' },
    { id: 'sms', label: 'İndirim SMS Gönderildi' }
  ]

  // Seçilen sekmeye göre filtreleme
  const filteredRequests = requests.filter(request => {
    // Arama terimini kontrolü
    if (searchTerm && !request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !request.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !request.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !request.deliveryLocation.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Sekme filtresi
    if (selectedTab === 'all') return true;
    else if (selectedTab === 'new') return request.status === 'Yeni';
    else if (selectedTab === 'awaiting') return request.status === 'Taşıyıcı Onayı Bekleniyor';
    else if (selectedTab === 'rejected') return request.status === 'Taşıyıcı Onayı Olmadı';
    else if (selectedTab === 'payment') return request.status === 'Ödeme Bekleniyor';
    else if (selectedTab === 'canceled') return request.status === 'İptal Edildi';
    else if (selectedTab === 'sms') return request.status === 'İndirim SMS Gönderildi';
    
    return true;
  });

  // Sayfalama için hesaplamalar
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredRequests.slice(startIndex, endIndex)

  // Sayfa değiştirme fonksiyonu
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  // Sayfa numaralarını oluşturma fonksiyonu
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5 // Görünecek maksimum sayfa numarası
    
    if (totalPages <= maxVisiblePages) {
      // Toplam sayfa sayısı maxVisiblePages'den az ise tüm sayfaları göster
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Toplam sayfa sayısı maxVisiblePages'den fazla ise akıllı sayfalama yap
      if (currentPage <= 3) {
        // Başlangıç sayfalarındaysa
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push('...')
        pageNumbers.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Son sayfalardaysa
        pageNumbers.push(1)
        pageNumbers.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        // Ortadaki sayfalardaysa
        pageNumbers.push(1)
        pageNumbers.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push('...')
        pageNumbers.push(totalPages)
      }
    }
    
    return pageNumbers
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Talepler</h1>
          <div className="flex flex-col w-full md:flex-row md:w-auto gap-4">
            <div className="relative w-full md:w-auto">
              <input
                type="text"
                placeholder="Talep ara..."
                className="pl-10 pr-4 py-2 w-full md:min-w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Sekmeler */}
        <div className="flex overflow-x-auto pb-2 mb-6 gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedTab === tab.id 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } mb-2`}
              onClick={() => setSelectedTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <FaClipboardList className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Toplam Talep</h3>
                <p className="text-2xl font-bold">{requests.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FaClipboardList className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Yeni Talepler</h3>
                <p className="text-2xl font-bold">{requests.filter(request => request.status === 'Yeni').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <FaClipboardList className="text-yellow-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Bekleyen Onaylar</h3>
                <p className="text-2xl font-bold">{requests.filter(request => request.status === 'Taşıyıcı Onayı Bekleniyor').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <FaClipboardList className="text-red-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">İptal Edilen</h3>
                <p className="text-2xl font-bold">{requests.filter(request => request.status === 'İptal Edildi').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Talepler Tablosu */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Talep No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rota</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.customerName}</div>
                        <div className="text-sm text-gray-500">{request.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <FaMapMarkerAlt className="text-red-500 mr-1 flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{request.pickupLocation}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-900 mt-1">
                          <FaMapMarkerAlt className="text-green-500 mr-1 flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{request.deliveryLocation}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{request.distance} • {request.vehicle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <FaCalendarAlt className="text-gray-400 mr-1" />
                          {request.date}
                        </div>
                        <div className="flex items-center text-sm text-green-600 mt-1">
                          <FaMoneyBillWave className="mr-1" />
                          {request.price}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button 
                            className="p-1.5 bg-blue-100 rounded-full text-blue-600 hover:bg-blue-200 transition-colors"
                            onClick={() => handleViewRequest(request)}
                            title="Detayları Görüntüle"
                          >
                            <FaEye />
                          </button>
                          
                          {request.status === 'İptal Edildi' && (
                            <button 
                              className="p-1.5 bg-green-100 rounded-full text-green-600 hover:bg-green-200 transition-colors"
                              onClick={() => handleSendSMS(request)}
                              title="İndirim SMS'i Gönder"
                            >
                              <FaSms />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Kriterlere uygun talep bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Toplam <span className="font-medium">{filteredRequests.length}</span> talepten{' '}
              <span className="font-medium">{startIndex + 1}</span>-
              <span className="font-medium">{Math.min(endIndex, filteredRequests.length)}</span> arası gösteriliyor
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                Önceki
              </button>
              
              {getPageNumbers().map((pageNumber, index) => (
                <button
                  key={index}
                  onClick={() => typeof pageNumber === 'number' && handlePageChange(pageNumber)}
                  className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${
                    pageNumber === currentPage
                      ? 'bg-orange-50 text-orange-600 border-orange-200'
                      : pageNumber === '...'
                      ? 'cursor-default'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  disabled={pageNumber === '...'}
                >
                  {pageNumber}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                Sonraki
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Talep Detay Modal */}
      {showRequestDetailModal && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4" 
          onClick={() => setShowRequestDetailModal(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Talep Detayları</h2>
                  <p className="text-gray-500">#{showRequestDetailModal.id}</p>
                </div>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowRequestDetailModal(null)}
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Müşteri Bilgileri</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm"><span className="font-medium">Adı:</span> {showRequestDetailModal.customerName}</p>
                      <p className="text-sm mt-2"><span className="font-medium">Telefon:</span> {showRequestDetailModal.customerPhone}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Rota Bilgileri</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm flex items-center">
                        <FaMapMarkerAlt className="text-red-500 mr-2" /> 
                        <span className="font-medium">Alım:</span> {showRequestDetailModal.pickupLocation}
                      </p>
                      <p className="text-sm mt-2 flex items-center">
                        <FaMapMarkerAlt className="text-green-500 mr-2" /> 
                        <span className="font-medium">Teslimat:</span> {showRequestDetailModal.deliveryLocation}
                      </p>
                      <p className="text-sm mt-2 flex items-center">
                        <FaCompass className="text-blue-500 mr-2" /> 
                        <span className="font-medium">Mesafe:</span> {showRequestDetailModal.distance}
                      </p>
                      <p className="text-sm mt-2 flex items-center">
                        <FaTruck className="text-gray-500 mr-2" /> 
                        <span className="font-medium">Araç:</span> {showRequestDetailModal.vehicle}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Taşıma Detayları</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm flex items-center">
                        <FaCalendarAlt className="text-orange-500 mr-2" /> 
                        <span className="font-medium">Tarih:</span> {showRequestDetailModal.date}, {showRequestDetailModal.time}
                      </p>
                      <p className="text-sm mt-2 flex items-center">
                        <FaMoneyBillWave className="text-green-500 mr-2" /> 
                        <span className="font-medium">Fiyat:</span> {showRequestDetailModal.price}
                      </p>
                      <p className="text-sm mt-2">
                        <span className="font-medium">Açıklama:</span> {showRequestDetailModal.description}
                      </p>
                    </div>
                  </div>

                  {showRequestDetailModal.carrierId && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-700 mb-2">Taşıyıcı Bilgileri</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm"><span className="font-medium">Taşıyıcı:</span> {showRequestDetailModal.carrier}</p>
                        <p className="text-sm mt-2"><span className="font-medium">Taşıyıcı ID:</span> {showRequestDetailModal.carrierId}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Rota Haritası</h3>
                    <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: "350px" }}>
                      {isLoaded ? (
                        <GoogleMap
                          mapContainerStyle={containerStyle}
                          center={center}
                          zoom={7}
                          onLoad={onLoad}
                          onUnmount={onUnmount}
                        >
                          {directions && (
                            <DirectionsRenderer
                              directions={directions}
                              options={{
                                polylineOptions: {
                                  strokeColor: "#FF5500",
                                  strokeWeight: 4
                                },
                                suppressMarkers: false
                              }}
                            />
                          )}
                        </GoogleMap>
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-100">
                          <FaSpinner className="animate-spin text-gray-400" size={30} />
                          <span className="ml-2 text-gray-500">Harita yükleniyor...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Durum Bilgisi</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(showRequestDetailModal.status)}`}>
                        {showRequestDetailModal.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SMS Gönderme Onay Modal */}
      {showConfirmSmsModal && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4" 
          onClick={() => setShowConfirmSmsModal(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">SMS Gönderimi</h2>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmSmsModal(null)}
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {smsSuccess ? (
                <div className="text-center py-6">
                  <FaCheck className="mx-auto text-green-500 mb-3" size={40} />
                  <p className="text-green-600 font-semibold text-lg">SMS başarıyla gönderildi!</p>
                  <p className="text-gray-500 mt-1">{showConfirmSmsModal.customerPhone} numarasına indirim SMS'i gönderildi.</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-6">
                    <span className="font-semibold">{showConfirmSmsModal.customerName}</span> ({showConfirmSmsModal.customerPhone}) numaralı müşteriye indirim SMS'i göndermek istediğinize emin misiniz?
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-sm font-medium text-gray-700">SMS Metni:</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Sayın {showConfirmSmsModal.customerName}, iptal ettiğiniz taşıma talebiniz için üzgünüz. Bir sonraki taşıma işleminizde %15 indirim sağlamak istiyoruz. Detaylar için bizi arayabilirsiniz.
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      className="px-4 py-2 bg-gray-100 rounded-md text-gray-600 hover:bg-gray-200 transition-colors"
                      onClick={() => setShowConfirmSmsModal(null)}
                    >
                      Vazgeç
                    </button>
                    <button
                      className="px-4 py-2 bg-orange-500 rounded-md text-white hover:bg-orange-600 transition-colors flex items-center"
                      onClick={confirmSendSMS}
                      disabled={smsSending}
                    >
                      {smsSending ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <FaEnvelope className="mr-2" />
                          SMS Gönder
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  )
} 
                        <FaMapMarkerAlt className="text-red-500 mr-2" /> 
                        <span className="font-medium">Alım:</span> {showRequestDetailModal.pickupLocation}
                      </p>
                      <p className="text-sm mt-2 flex items-center">
                        <FaMapMarkerAlt className="text-green-500 mr-2" /> 
                        <span className="font-medium">Teslimat:</span> {showRequestDetailModal.deliveryLocation}
                      </p>
                      <p className="text-sm mt-2 flex items-center">
                        <FaCompass className="text-blue-500 mr-2" /> 
                        <span className="font-medium">Mesafe:</span> {showRequestDetailModal.distance}
                      </p>
                      <p className="text-sm mt-2 flex items-center">
                        <FaTruck className="text-gray-500 mr-2" /> 
                        <span className="font-medium">Araç:</span> {showRequestDetailModal.vehicle}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Taşıma Detayları</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm flex items-center">
                        <FaCalendarAlt className="text-orange-500 mr-2" /> 
                        <span className="font-medium">Tarih:</span> {showRequestDetailModal.date}, {showRequestDetailModal.time}
                      </p>
                      <p className="text-sm mt-2 flex items-center">
                        <FaMoneyBillWave className="text-green-500 mr-2" /> 
                        <span className="font-medium">Fiyat:</span> {showRequestDetailModal.price}
                      </p>
                      <p className="text-sm mt-2">
                        <span className="font-medium">Açıklama:</span> {showRequestDetailModal.description}
                      </p>
                    </div>
                  </div>

                  {showRequestDetailModal.carrierId && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-700 mb-2">Taşıyıcı Bilgileri</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm"><span className="font-medium">Taşıyıcı:</span> {showRequestDetailModal.carrier}</p>
                        <p className="text-sm mt-2"><span className="font-medium">Taşıyıcı ID:</span> {showRequestDetailModal.carrierId}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Rota Haritası</h3>
                    <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: "350px" }}>
                      {isLoaded ? (
                        <GoogleMap
                          mapContainerStyle={containerStyle}
                          center={center}
                          zoom={7}
                          onLoad={onLoad}
                          onUnmount={onUnmount}
                        >
                          {directions && (
                            <DirectionsRenderer
                              directions={directions}
                              options={{
                                polylineOptions: {
                                  strokeColor: "#FF5500",
                                  strokeWeight: 4
                                },
                                suppressMarkers: false
                              }}
                            />
                          )}
                        </GoogleMap>
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-100">
                          <FaSpinner className="animate-spin text-gray-400" size={30} />
                          <span className="ml-2 text-gray-500">Harita yükleniyor...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Durum Bilgisi</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(showRequestDetailModal.status)}`}>
                        {showRequestDetailModal.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SMS Gönderme Onay Modal */}
      {showConfirmSmsModal && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4" 
          onClick={() => setShowConfirmSmsModal(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">SMS Gönderimi</h2>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmSmsModal(null)}
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {smsSuccess ? (
                <div className="text-center py-6">
                  <FaCheck className="mx-auto text-green-500 mb-3" size={40} />
                  <p className="text-green-600 font-semibold text-lg">SMS başarıyla gönderildi!</p>
                  <p className="text-gray-500 mt-1">{showConfirmSmsModal.customerPhone} numarasına indirim SMS'i gönderildi.</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-6">
                    <span className="font-semibold">{showConfirmSmsModal.customerName}</span> ({showConfirmSmsModal.customerPhone}) numaralı müşteriye indirim SMS'i göndermek istediğinize emin misiniz?
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-sm font-medium text-gray-700">SMS Metni:</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Sayın {showConfirmSmsModal.customerName}, iptal ettiğiniz taşıma talebiniz için üzgünüz. Bir sonraki taşıma işleminizde %15 indirim sağlamak istiyoruz. Detaylar için bizi arayabilirsiniz.
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      className="px-4 py-2 bg-gray-100 rounded-md text-gray-600 hover:bg-gray-200 transition-colors"
                      onClick={() => setShowConfirmSmsModal(null)}
                    >
                      Vazgeç
                    </button>
                    <button
                      className="px-4 py-2 bg-orange-500 rounded-md text-white hover:bg-orange-600 transition-colors flex items-center"
                      onClick={confirmSendSMS}
                      disabled={smsSending}
                    >
                      {smsSending ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <FaEnvelope className="mr-2" />
                          SMS Gönder
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  )
} 