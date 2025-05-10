'use client'

import React, { useState, useEffect } from 'react'
import { FaSearch, FaEye, FaCheck, FaTimes, FaSms, FaMapMarkerAlt, FaTruck, FaCompass, FaCalendarAlt, FaMoneyBillWave, FaEnvelope, FaSpinner, FaClipboardList } from 'react-icons/fa'
import AdminLayout from '../../components/admin/Layout'
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api'
import axios from 'axios'
import { useRouter } from 'next/router'

// Google Maps API anahtarı
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyAKht3SqaVJpufUdq-vVQEfBEQKejT9Z8k";

export default function RequestsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showRequestDetailModal, setShowRequestDetailModal] = useState(null)
  const [showConfirmSmsModal, setShowConfirmSmsModal] = useState(null)
  const [smsSending, setSmsSending] = useState(false)
  const [smsSuccess, setSmsSuccess] = useState(false)
  const [directions, setDirections] = useState(null)
  const [map, setMap] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRequests, setTotalRequests] = useState(0)
  const [requests, setRequests] = useState([])
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
    
    if (!city) return cities['İstanbul'];
    
    const cityName = city.split(',')[0].trim();
    return cities[cityName] || cities['İstanbul']; // Varsayılan olarak İstanbul
  }

  // API'den talep verilerini getirme
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Talepler için veriler getiriliyor...');
        
        // Farklı token kaynaklarını kontrol et
        let token = null;
        
        // 1. localStorage'dan 'token' anahtarı ile kontrol et
        const localToken = localStorage.getItem('token');
        if (localToken) {
          console.log('localStorage\'dan token bulundu');
          token = localToken;
        } 
        // 2. localStorage'dan 'auth_token' anahtarı ile kontrol et
        else {
          const authToken = localStorage.getItem('auth_token');
          if (authToken) {
            console.log('localStorage\'dan auth_token bulundu');
            token = authToken;
          }
        }
        
        // 3. sessionStorage'dan kontrol et
        if (!token) {
          console.log('localStorage\'da token bulunamadı, sessionStorage kontrol ediliyor...');
          const sessionToken = sessionStorage.getItem('token');
          if (sessionToken) {
            console.log('sessionStorage\'dan token bulundu');
            token = sessionToken;
          }
        }
        
        // 4. localStorage'daki user verisinden token almayı dene
        if (!token) {
          console.log('Diğer kaynaklarda token bulunamadı, kullanıcı bilgisinden token alınıyor...');
          const userData = localStorage.getItem('user');
          if (userData) {
            try {
              const user = JSON.parse(userData);
              if (user.token) {
                console.log('User verisinden token bulundu');
                token = user.token;
              }
            } catch (e) {
              console.error('Kullanıcı verisi parse edilemedi:', e);
            }
          }
        }
        
        if (!token) {
          console.log('Hiçbir yerden token bulunamadı, giriş sayfasına yönlendiriliyor');
          router.replace('/admin');
          return;
        }
        
        console.log('Token bulundu, API isteği gönderiliyor...');
        
        // API'den talepleri getir
        let apiUrl = `/api/admin/requests?page=${currentPage}&limit=${itemsPerPage}`;
        
        // Filtre ekle
        if (selectedTab !== 'all') {
          apiUrl += `&status=${selectedTab}`;
        }
        
        // Arama terimi ekle
        if (searchTerm) {
          apiUrl += `&search=${encodeURIComponent(searchTerm)}`;
        }
        
        console.log('API URL:', apiUrl);
        
        const response = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('API yanıtı alındı:', response.status);
        
        if (response.data.success) {
          const { requests: requestsData, pagination } = response.data;
          console.log(`${requestsData.length} talep verisi alındı`);
          
          setRequests(requestsData);
          setTotalPages(pagination.totalPages);
          setTotalRequests(pagination.total);
        } else {
          console.error('API başarısız yanıt döndü:', response.data);
          setError(response.data.message || 'Talepler alınırken bir hata oluştu');
        }
      } catch (error) {
        console.error('Talep verilerini alma hatası:', error);
        
        // Hata detaylarını kaydet
        let errorMessage = 'Talep verileri alınırken bir sorun oluştu.';
        let shouldRedirect = false;
        
        if (error.response) {
          // Sunucudan yanıt geldi ancak 2XX aralığında bir durum kodu değil
          console.error('Hata yanıtı:', error.response.status, error.response.data);
          
          if (error.response.status === 401) {
            errorMessage = 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.';
            shouldRedirect = true;
            
            // Token'ları temizle
            localStorage.removeItem('token');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
          } else if (error.response.status === 403) {
            errorMessage = 'Bu sayfaya erişim izniniz yok.';
          } else if (error.response.status === 404) {
            errorMessage = 'API endpoint bulunamadı. Lütfen sistem yöneticinize başvurun.';
          } else if (error.response.status === 500) {
            errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
          }
          
          errorMessage += ' Detay: ' + (error.response.data?.message || error.message);
        } else if (error.request) {
          // İstek yapıldı ancak yanıt alınamadı
          console.error('İstek gönderildi ancak yanıt alınamadı');
          errorMessage = 'Sunucu yanıt vermiyor. Lütfen internet bağlantınızı kontrol edin.';
        } else {
          // İstek ayarlanırken bir şeyler ters gitti
          console.error('İstek oluşturulurken hata:', error.message);
          errorMessage = 'İstek oluşturulurken bir hata oluştu: ' + error.message;
        }
        
        setError(errorMessage);
        
        // Yönlendirme gerekiyorsa
        if (shouldRedirect) {
          console.log('Giriş sayfasına yönlendiriliyor...');
          router.replace('/admin');
        }
      } finally {
        setLoading(false);
      }
    };
    
    // Router hazır olduğunda ve bileşen mount edildiğinde verileri getir
    if (router.isReady) {
      console.log('Router hazır, verileri getirme başlatılıyor');
      fetchRequests();
    }
  }, [router.isReady, router, currentPage, selectedTab, searchTerm]);

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
  const confirmSendSMS = async () => {
    if (!showConfirmSmsModal) return;
    
    setSmsSending(true);
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      
      if (!token) {
        alert('Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.');
        router.replace('/admin');
        return;
      }
      
      // API'ye SMS gönderme isteği
      const response = await axios.post(
        `/api/admin/requests/sms`, 
        { requestId: showConfirmSmsModal.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSmsSuccess(true);
        
        // Talep listesini güncelle
        setRequests(prevRequests => 
          prevRequests.map(req => 
            req.id === showConfirmSmsModal.id 
              ? { ...req, status: 'İndirim SMS Gönderildi' } 
              : req
          )
        );
        
        // Başarı mesajını 2 saniye göster, sonra modalı kapat
        setTimeout(() => {
          setSmsSuccess(false);
          setShowConfirmSmsModal(null);
        }, 2000);
      } else {
        alert(response.data.message || 'SMS gönderirken bir hata oluştu');
      }
    } catch (error) {
      console.error('SMS gönderme hatası:', error);
      alert('SMS gönderirken bir sorun oluştu: ' + (error.response?.data?.message || error.message));
    } finally {
      setSmsSending(false);
    }
  };

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
                <p className="text-2xl font-bold">{totalRequests}</p>
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
                <p className="text-2xl font-bold">
                  {selectedTab === 'new' ? requests.length : '...'}
                </p>
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
                <p className="text-2xl font-bold">
                  {selectedTab === 'awaiting' ? requests.length : '...'}
                </p>
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
                <p className="text-2xl font-bold">
                  {selectedTab === 'canceled' ? requests.length : '...'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Talep Tablosu */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <FaSpinner className="animate-spin mr-3 h-8 w-8 text-orange-500" />
                <p className="text-lg text-gray-600">Talepler yükleniyor...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                  onClick={() => router.reload()}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  Yeniden Dene
                </button>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Talep No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Güzergah</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Araç Tipi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih / Saat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.length > 0 ? (
                    requests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.customerName}</div>
                            <div className="text-sm text-gray-500">{request.customerPhone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">
                              <FaMapMarkerAlt className="inline-block mr-1 text-green-500" />
                              {request.pickupLocation}
                            </div>
                            <div className="text-sm text-gray-900">
                              <FaMapMarkerAlt className="inline-block mr-1 text-red-500" />
                              {request.deliveryLocation}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{request.distance}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.vehicle}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{request.date}</div>
                          <div className="text-sm text-gray-500">{request.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewRequest(request)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Talep Detayı"
                            >
                              <FaEye />
                            </button>
                            {(request.status === 'Taşıyıcı Onayı Olmadı' || request.status === 'İptal Edildi') && (
                              <button
                                onClick={() => handleSendSMS(request)}
                                className="text-green-600 hover:text-green-900 transition-colors"
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
                      <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                        {selectedTab !== 'all' ? 'Bu durumda talep bulunamadı.' : 'Hiç talep bulunamadı.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          
          {!loading && !error && requests.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Toplam <span className="font-medium">{totalRequests}</span> talepten{' '}
                <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>-
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalRequests)}</span> arası gösteriliyor
              </div>
              
              {totalPages > 1 && (
                <div className="flex flex-wrap justify-center gap-1">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Önceki
                  </button>
                  
                  {getPageNumbers().map((pageNumber, index) => (
                    <button
                      key={index}
                      onClick={() => typeof pageNumber === 'number' ? handlePageChange(pageNumber) : null}
                      className={`px-3 py-1 rounded-md text-sm ${
                        pageNumber === currentPage
                          ? 'bg-orange-500 text-white'
                          : pageNumber === '...'
                          ? 'bg-white border border-gray-300 text-gray-400 cursor-default'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      disabled={pageNumber === '...'}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Sonraki
                  </button>
                </div>
              )}
            </div>
          )}
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
                          options={{
                            zoomControl: true,
                            mapTypeControl: false,
                            streetViewControl: false,
                            fullscreenControl: true,
                          }}
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
                          {!directions && (
                            <>
                              <Marker 
                                position={getCoordinatesForCity(showRequestDetailModal.pickupLocation)} 
                                icon={{
                                  path: window.google.maps.SymbolPath.CIRCLE,
                                  scale: 10,
                                  fillColor: '#10B981', // yeşil - başlangıç
                                  fillOpacity: 0.8,
                                  strokeColor: '#FFFFFF',
                                  strokeWeight: 2,
                                }}
                              />
                              <Marker 
                                position={getCoordinatesForCity(showRequestDetailModal.deliveryLocation)} 
                                icon={{
                                  path: window.google.maps.SymbolPath.CIRCLE,
                                  scale: 10,
                                  fillColor: '#EF4444', // kırmızı - bitiş
                                  fillOpacity: 0.8,
                                  strokeColor: '#FFFFFF',
                                  strokeWeight: 2,
                                }}
                              />
                            </>
                          )}
                        </GoogleMap>
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-100">
                          <FaSpinner className="animate-spin text-orange-500 mr-2" size={20} />
                          <span className="text-gray-500">Harita yükleniyor...</span>
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