'use client'

import React, { useState, useEffect } from 'react'
import { FaTruck, FaBoxOpen, FaMapMarkedAlt, FaShieldAlt, FaClock, FaHandshake, FaLocationArrow, FaBuilding, FaHome, FaWarehouse, FaSpinner, FaPallet, FaBox, FaImage, FaTrash, FaMapMarkerAlt, FaCheck, FaStar, FaPhone, FaInfoCircle, FaCheckCircle, FaEnvelope, FaMapPin, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaSnowflake, FaBolt, FaTools, FaLock, FaMoneyBillWave, FaMapMarked, FaArrowLeft, FaSignOutAlt } from 'react-icons/fa'
import { GoogleMap, useLoadScript, Marker, DirectionsRenderer, Autocomplete } from '@react-google-maps/api'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../src/lib/auth'

const libraries = ["places"];

// API anahtarını environment variable'dan al
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Step Bar Component
const StepBar = ({ currentStep }) => {
  const steps = ['Taşıma Türü', 'Taşıma Detayları', 'İletişim', 'Taşıyıcı', 'Ödeme'];
  
  return (
    <div className="mb-8">
      <div className="relative pt-2">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-orange-500 h-full transition-all duration-300 ease-in-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        
        {/* Step Counter and Name */}
        <div className="mt-3 text-center">
          <span className="text-sm font-medium text-gray-600">
            Adım {currentStep + 1}/{steps.length} - {steps[currentStep]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function MusteriSayfasi() {
  const [pickupAddress, setPickupAddress] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedTransportType, setSelectedTransportType] = useState('')
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [showSearchingModal, setShowSearchingModal] = useState(false)
  const [showCarrierAcceptedModal, setShowCarrierAcceptedModal] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [directions, setDirections] = useState(null)
  const [map, setMap] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [mapError, setMapError] = useState(null)
  const [pickupAutocomplete, setPickupAutocomplete] = useState(null)
  const [deliveryAutocomplete, setDeliveryAutocomplete] = useState(null)
  const [pickupPlace, setPickupPlace] = useState(null)
  const [deliveryPlace, setDeliveryPlace] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [pickupMarker, setPickupMarker] = useState(null)
  const [deliveryMarker, setDeliveryMarker] = useState(null)
  const [otpSent, setOtpSent] = useState(false)
  const [showWaitingApprovalModal, setShowWaitingApprovalModal] = useState(false)
  const [showCarrierDetailsModal, setShowCarrierDetailsModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceModalStep, setServiceModalStep] = useState(0);
  const [showTransportDetails, setShowTransportDetails] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showDefaultModal, setShowDefaultModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [packageDetails, setPackageDetails] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [contentDetails, setContentDetails] = useState({
    weight: '',
    volume: '',
    pieces: '',
    description: '',
    specialNotes: ''
  });
  const [modalStep, setModalStep] = useState(0);
  const { isAuthenticated, user, logout } = useAuth();
  
  const router = useRouter()

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => URL.createObjectURL(file));
    setUploadedImages([...uploadedImages, ...newImages]);
  };

  const handleContentChange = (e) => {
    const { name, value } = e.target;
    setContentDetails({
      ...contentDetails,
      [name]: value
    });
  };

  const handleContinueToStep2 = () => {
    if (selectedService) {
      setModalStep(1);
    }
  };

  const handleBackToStep1 = () => {
    setServiceModalStep(1);
  };

  // Google Maps yükleme işlemi
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries,
    language: "tr",
    region: "TR"
  })

  useEffect(() => {
    if (loadError) {
      console.error("Google Maps yükleme hatası:", loadError);
      setMapError(loadError.message);
    }
  }, [loadError]);

  const containerStyle = {
    width: '100%',
    height: isMobile ? '250px' : '400px'
  }

  const center = {
    lat: 41.0082,
    lng: 28.9784
  }

  const pickupLatLng = {
    lat: 40.9969,
    lng: 29.0307 // Kadıköy
  }

  const deliveryLatLng = {
    lat: 41.0422,
    lng: 29.0083 // Beşiktaş
  }

  const onLoad = React.useCallback(function callback(map) {
    setMap(map)
  }, [])

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null)
  }, [])

  const onPickupLoad = (autocomplete) => {
    setPickupAutocomplete(autocomplete);
  }

  const onDeliveryLoad = (autocomplete) => {
    setDeliveryAutocomplete(autocomplete);
  }

  const onPickupPlaceChanged = () => {
    if (pickupAutocomplete !== null) {
      const place = pickupAutocomplete.getPlace();
      if (!place.geometry) {
        console.error("Seçilen yerin geometri bilgisi yok");
        return;
      }
      setPickupPlace(place);
      setPickupAddress(place.formatted_address);
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      setPickupMarker(location);
      
      // Seçilen konuma zoom yap
      map?.setZoom(16);
      setTimeout(() => {
        map?.panTo(location);
      }, 100);
      
      // Sadece her iki adres de seçiliyse rotayı güncelle
      if (deliveryPlace && deliveryPlace.geometry) {
        updateRoute(location, {
          lat: deliveryPlace.geometry.location.lat(),
          lng: deliveryPlace.geometry.location.lng()
        });
      }
    }
  }

  const onDeliveryPlaceChanged = () => {
    if (deliveryAutocomplete !== null) {
      const place = deliveryAutocomplete.getPlace();
      if (!place.geometry) {
        console.error("Seçilen yerin geometri bilgisi yok");
        return;
      }
      setDeliveryPlace(place);
      setDeliveryAddress(place.formatted_address);
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      setDeliveryMarker(location);
      
      // Seçilen konuma zoom yap
      map?.setZoom(16);
      setTimeout(() => {
        map?.panTo(location);
      }, 100);
      
      // Sadece her iki adres de seçiliyse rotayı güncelle
      if (pickupPlace && pickupPlace.geometry) {
        updateRoute({
          lat: pickupPlace.geometry.location.lat(),
          lng: pickupPlace.geometry.location.lng()
        }, location);
      }
    }
  }

  const updateRoute = (origin, destination) => {
    if (isLoaded && map) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            // Rota stilini özelleştir
            const directionsRendererOptions = {
              directions: result,
              options: {
                polylineOptions: {
                  strokeColor: '#f97316', // Turuncu renk (orange-500)
                  strokeWeight: 5
                },
                suppressMarkers: true // Varsayılan işaretçileri gizle
              }
            };
            setDirections(directionsRendererOptions);
            
            // Mesafe ve süre bilgilerini güncelle
            const route = result.routes[0];
            if (route && route.legs[0]) {
              setDistance(route.legs[0].distance.text);
              setDuration(route.legs[0].duration.text);
            }
            
            // İşaretçileri güncelle
            setPickupMarker(origin);
            setDeliveryMarker(destination);
            
            // Her iki noktayı gösterecek şekilde haritayı ayarla
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(origin);
            bounds.extend(destination);
            map?.fitBounds(bounds);
          } else {
            console.error(`Directions request failed: ${status}`);
            setMapError(`Rota bulunamadı: ${status}`);
          }
        }
      );
    }
  }

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

  const handlePickupInputChange = (e) => {
    setPickupAddress(e.target.value)
    if (e.target.value === '') {
      setPickupMarker(null)
      setPickupPlace(null)
      setDirections(null) // Rotayı sil
      if (deliveryMarker) {
        // Sadece teslimat noktası varsa ona zoom yap
        map?.panTo(deliveryMarker)
        map?.setZoom(16)
      } else {
        // Hiç nokta yoksa varsayılan konuma dön
        map?.panTo(center)
        map?.setZoom(12)
      }
    }
  }

  const handleDeliveryInputChange = (e) => {
    setDeliveryAddress(e.target.value)
    if (e.target.value === '') {
      setDeliveryMarker(null)
      setDeliveryPlace(null)
      setDirections(null) // Rotayı sil
      if (pickupMarker) {
        // Sadece alım noktası varsa ona zoom yap
        map?.panTo(pickupMarker)
        map?.setZoom(16)
      } else {
        // Hiç nokta yoksa varsayılan konuma dön
        map?.panTo(center)
        map?.setZoom(12)
      }
    }
  }

  const handlePickupFocus = () => {
    // Eğer teslimat noktası seçili değilse ve alım noktası seçiliyse
    if (pickupMarker && !deliveryMarker) {
      map?.panTo(pickupMarker)
      map?.setZoom(16)
    }
  }

  const handleDeliveryFocus = () => {
    // Eğer alım noktası seçili değilse ve teslimat noktası seçiliyse
    if (deliveryMarker && !pickupMarker) {
      map?.panTo(deliveryMarker)
      map?.setZoom(16)
    }
  }

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '')
    if (val.length <= 10) {
      setPhoneNumber(val)
      
      if (val.length > 0) {
        let formatted = val
        if (val.length > 3) {
          formatted = `${val.slice(0, 3)} ${val.slice(3)}`
        }
        if (val.length > 6) {
          formatted = `${formatted.slice(0, 7)} ${formatted.slice(7)}`
        }
        setFormattedPhoneNumber(formatted)
      } else {
        setFormattedPhoneNumber('')
      }
    }
  }

  const handlePhoneSubmit = () => {
    if (phoneNumber.length === 10) {
      setShowPhoneModal(false)
      setShowOTPModal(true)
    }
  }

  const handleOTPSubmit = () => {
    if (otpCode.length === 6) {
      setShowOTPModal(false)
      setShowSearchingModal(true)
    }
  }

  const handleTransportTypeSelect = (type) => {
    setSelectedTransportType(type);
    setShowModal(false);
    setCurrentStep(1); // Taşıma detayları adımı için 1
    setTimeout(() => {
      setShowSummaryModal(true);
    }, 200);
  };

  const handleFindCarrier = () => {
    setShowPhoneModal(true)
    setShowSummaryModal(false)
    setCurrentStep(2)
  }

  const handleBackToSummary = () => {
    setShowPhoneModal(false);
    setShowOTPModal(false);
    setOtpSent(false);
    setOtpCode('');
    setCurrentStep(1);
    setShowSummaryModal(true);
  };

  const handleBackToTransportType = () => {
    setShowSummaryModal(false);
    setCurrentStep(0);
    setShowModal(true);
  };

  const handlePhoneVerification = () => {
    if (otpCode.length === 6) {
      setShowSearchingModal(true)
      setCurrentStep(3)
      setTimeout(() => {
        setShowPhoneModal(false)
      }, 100)
    }
  }

  const handleTestSearch = () => {
    setShowSearchingModal(false)
    setShowWaitingApprovalModal(true)
  }

  const handleTestApproval = () => {
    setShowWaitingApprovalModal(false)
    setShowCarrierDetailsModal(true)
    setCurrentStep(3)
  }

  const handlePayment = () => {
    setShowCarrierDetailsModal(false)
    setShowPaymentModal(true)
    setCurrentStep(4)
  }

  const handlePaymentComplete = () => {
    // Ödeme tamamlandığında modalStep'i 7'ye ayarla
    setModalStep(7)
  }

  // Modal açılışlarında currentStep'i sıfırla
  useEffect(() => {
    if (showModal) {
      setCurrentStep(0)
    }
  }, [showModal])

  // ESC tuşu için event listener
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [showModal, showSummaryModal, showPhoneModal, showSearchingModal, showWaitingApprovalModal, showCarrierDetailsModal, showPaymentModal, showPaymentSuccessModal]);

  // Modal kapatma fonksiyonu
  const handleCloseModal = () => {
    // Sadece açık olan modalı kapat ve currentStep'i güncelle
    if (showPaymentSuccessModal) {
      setShowPaymentSuccessModal(false);
      setCurrentStep(4);
    } else if (showPaymentModal) {
      setShowPaymentModal(false);
      setCurrentStep(3);
    } else if (showCarrierDetailsModal) {
      setShowCarrierDetailsModal(false);
      setCurrentStep(3);
    } else if (showWaitingApprovalModal) {
      setShowWaitingApprovalModal(false);
      setCurrentStep(3);
    } else if (showSearchingModal) {
      setShowSearchingModal(false);
      setCurrentStep(2);
    } else if (showPhoneModal) {
      setShowPhoneModal(false);
      setCurrentStep(2);
    } else if (showOTPModal) {
      setShowOTPModal(false);
      setCurrentStep(2);
    } else if (showSummaryModal) {
      setShowSummaryModal(false);
      setCurrentStep(1);
    } else if (showModal) {
      setShowModal(false);
      setCurrentStep(0);
    }
  };

  // Devam Et butonuna tıklandığında
  const handleContinue = () => {
    if (pickupPlace && deliveryPlace) {
      // Mevcut adıma göre doğru modalı aç
      switch (currentStep) {
        case 0:
          setShowModal(true);
          break;
        case 1:
          setShowSummaryModal(true);
          break;
        case 2:
          setShowPhoneModal(true);
          break;
        case 3:
          setShowCarrierDetailsModal(true);
          break;
        case 4:
          setShowPaymentModal(true);
          break;
        default:
          setShowModal(true);
          setCurrentStep(0);
      }
    } else {
      // Adres seçimi yapılmamışsa modal açma
      alert("Lütfen önce alış ve teslimat adreslerini seçiniz.");
    }
  };

  // Mevcut onClick fonksiyonlarını güncelle
  const closeButtons = {
    showModal: () => setShowModal(false),
    showSummaryModal: () => setShowSummaryModal(false),
    showPhoneModal: () => setShowPhoneModal(false),
    showSearchingModal: () => setShowSearchingModal(false),
    showWaitingApprovalModal: () => setShowWaitingApprovalModal(false),
    showCarrierDetailsModal: () => setShowCarrierDetailsModal(false),
    showPaymentModal: () => setShowPaymentModal(false),
    showPaymentSuccessModal: () => setShowPaymentSuccessModal(false)
  };

  const handleBackToPhone = () => {
    setShowOTPModal(false);
    setShowPhoneModal(true);
  };

  const handleBackToCarrierSearch = () => {
    setShowCarrierDetailsModal(false);
    setShowSearchingModal(true);
    setCurrentStep(2);
  };

  const handleBackToCarrierDetails = () => {
    setShowWaitingApprovalModal(false);
    setShowCarrierDetailsModal(true);
    setCurrentStep(3);
  };

  const handleServicesClick = (e) => {
    e.preventDefault();
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Geri butonları için yeni fonksiyonlar
  const handleBackToPreviousStep = () => {
    // Sadece Adım 1 ve Adım 2'de geri dönüş işlemi yapılacak
    if (currentStep === 2) {
      // İletişim Bilgileri adımından Taşıma Detayları adımına dön
      setShowPhoneModal(false);
      setShowOTPModal(false);
      setShowSummaryModal(true);
      setCurrentStep(1);
    } else if (currentStep === 1) {
      // Taşıma Detayları adımından Taşıma Türü Seçimi adımına dön
      setShowSummaryModal(false);
      setShowModal(true);
      setCurrentStep(0);
    }
  };

  const handleBackToWaitingApproval = () => {
    setShowPaymentModal(false);
    setShowWaitingApprovalModal(true);
    setCurrentStep(3);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Modal içeriğini currentStep'e göre göster
  const renderModalContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
              Alış ve teslimat noktalarını harita üzerinde belirleyin.
            </p>
            <div className="mb-6 space-y-4">
              {isLoaded ? (
                <div className="relative">
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={12}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    options={{
                      zoomControl: true,
                      mapTypeControl: false,
                      streetViewControl: false,
                      fullscreenControl: true,
                    }}
                  >
                    {pickupMarker && (
                      <Marker 
                        position={pickupMarker}
                        icon={{
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: 10,
                          fillColor: '#22c55e',
                          fillOpacity: 1,
                          strokeColor: '#ffffff',
                          strokeWeight: 2,
                        }}
                      />
                    )}
                    {deliveryMarker && (
                      <Marker 
                        position={deliveryMarker}
                        icon={{
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: 10,
                          fillColor: '#ef4444',
                          fillOpacity: 1,
                          strokeColor: '#ffffff',
                          strokeWeight: 2,
                        }}
                      />
                    )}
                    {directions && (
                      <DirectionsRenderer
                        directions={directions}
                        options={{
                          polylineOptions: {
                            strokeColor: '#3b82f6',
                            strokeWeight: 6,
                            strokeOpacity: 0.8,
                          },
                          suppressMarkers: true,
                        }}
                      />
                    )}
                  </GoogleMap>
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="flex flex-col items-center text-gray-500">
                    <FaSpinner className="animate-spin text-3xl mb-2" />
                    <p>Harita yükleniyor...</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alış Noktası
                  </label>
                  {isLoaded ? (
                    <Autocomplete onLoad={onPickupLoad} onPlaceChanged={onPickupPlaceChanged}>
                      <input
                        type="text"
                        placeholder="Alış adresini girin"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                      />
                    </Autocomplete>
                  ) : (
                    <input
                      type="text"
                      placeholder="Harita yükleniyor..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      disabled
                    />
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teslimat Noktası
                  </label>
                  {isLoaded ? (
                    <Autocomplete onLoad={onDeliveryLoad} onPlaceChanged={onDeliveryPlaceChanged}>
                      <input
                        type="text"
                        placeholder="Teslimat adresini girin"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                      />
                    </Autocomplete>
                  ) : (
                    <input
                      type="text"
                      placeholder="Harita yükleniyor..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      disabled
                    />
                  )}
                </div>
              </div>
              
              {distance && duration && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Rota Bilgileri</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-blue-600">Mesafe</p>
                      <p className="font-medium text-blue-900">{distance}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600">Tahmini Süre</p>
                      <p className="font-medium text-blue-900">{duration}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700">Taşıma Türü</h3>
              <p className="text-gray-600">{selectedTransportType}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Alış Noktası</h3>
              <p className="text-gray-600">{pickupLocation}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Teslim Noktası</h3>
              <p className="text-gray-600">{deliveryLocation}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Tarih ve Saat</h3>
              <p className="text-gray-600">{selectedDate} {selectedTime}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Paket Bilgileri</h3>
              <p className="text-gray-600">{packageDetails}</p>
            </div>
          </div>
        )
      default:
        return null;
    }
  }

  return (
    <main className={`min-h-screen bg-gray-100 flex flex-col ${showModal || showSummaryModal || showPhoneModal || showSearchingModal || showWaitingApprovalModal || showCarrierDetailsModal || showPaymentModal || showPaymentSuccessModal ? 'modal-blur' : ''}`}>
      <div className="flex-grow">
        {/* Navigation */}
        <nav className="bg-white shadow-md py-4">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="Taşı.app" className="h-10" />
            </Link>
            <div className="hidden md:flex space-x-6 items-center">
              <a href="#" className="text-gray-600 hover:text-orange-600 transition">Anasayfa</a>
              <a 
                href="#services" 
                onClick={handleServicesClick}
                className="text-gray-600 hover:text-orange-600 transition group relative"
              >
                Hizmetlerimiz
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#features" className="text-gray-600 hover:text-orange-600 transition group relative">
                Neden Biz?
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <Link href="/contact" className="text-gray-600 hover:text-orange-600 transition group relative">
                İletişim
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    href="/profile" 
                    className="px-4 py-2 text-sm font-medium text-orange-600 bg-white border border-orange-600 rounded-md hover:bg-orange-50"
                  >
                    Profilim
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
                  >
                    Çıkış Yap
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login" className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700">
                    Giriş Yap
                  </Link>
                  <Link href="/register" className="px-4 py-2 text-sm font-medium text-orange-600 bg-white border border-orange-600 rounded-md hover:bg-orange-50">
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobil Menü */}
            <div className="md:hidden flex items-center">
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <Link 
                    href="/profile" 
                    className="px-3 py-1.5 text-xs font-medium text-orange-600 bg-white border border-orange-600 rounded-md hover:bg-orange-50"
                  >
                    Profilim
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
                  >
                    Çıkış
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login" className="px-3 py-1.5 text-xs font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700">
                    Giriş Yap
                  </Link>
                  <Link href="/register" className="px-3 py-1.5 text-xs font-medium text-orange-600 bg-white border border-orange-600 rounded-md hover:bg-orange-50">
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
        
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center py-8 md:py-12">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Güvenli ve Hızlı Taşımacılık Hizmeti
                </h1>
                <p className="text-white text-lg mb-8">
                  Türkiye'nin her yerine güvenli, hızlı ve ekonomik taşımacılık hizmeti. Tek tıkla taşıyıcı bulun, anlık takip edin.
                </p>
                <button
                  onClick={() => {
                    const servicesSection = document.getElementById('services');
                    servicesSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-orange-500 text-white px-8 py-3 rounded-xl hover:bg-orange-600 transition-all transform hover:scale-105 flex items-center text-lg"
                >
                  Hizmetlerimiz
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <div className="md:w-1/2 flex justify-center md:justify-end">
                <img 
                  src="/hero-truck.png" 
                  alt="Taşıma Hizmeti" 
                  className="max-w-full md:max-w-[90%] h-auto max-h-[300px] object-contain animate-float"
                  style={{
                    filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="container mx-auto px-4 py-12 -mt-16 bg-white rounded-t-3xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${isMobile ? "order-2 -mt-32" : ""} md:col-span-1 space-y-4`}>
              {!isMobile && <h2 className="text-2xl font-bold mb-6">Rotanızı Belirleyin</h2>}
              
              <div>
                <label className="block text-gray-700 mb-2">Alınacak Adres</label>
                <div className="relative z-50">
                  {isLoaded && (
                    <Autocomplete
                      onLoad={onPickupLoad}
                      onPlaceChanged={onPickupPlaceChanged}
                      options={{
                        componentRestrictions: { country: "tr" },
                        types: ["establishment", "geocode"],
                        fields: ["formatted_address", "geometry", "name", "place_id"]
                      }}
                    >
                      <input 
                        type="text" 
                        value={pickupAddress}
                        onChange={handlePickupInputChange}
                        onFocus={handlePickupFocus}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Alınacak adresi girin"
                      />
                    </Autocomplete>
                  )}
                  <button 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-orange-500"
                  >
                    <FaMapMarkerAlt />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Teslim Edilecek Adres</label>
                <div className="relative z-40">
                  {isLoaded && (
                    <Autocomplete
                      onLoad={onDeliveryLoad}
                      onPlaceChanged={onDeliveryPlaceChanged}
                      options={{
                        componentRestrictions: { country: "tr" },
                        types: ["establishment", "geocode"],
                        fields: ["formatted_address", "geometry", "name", "place_id"]
                      }}
                    >
                      <input 
                        type="text" 
                        value={deliveryAddress}
                        onChange={handleDeliveryInputChange}
                        onFocus={handleDeliveryFocus}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Teslim edilecek adresi girin"
                      />
                    </Autocomplete>
                  )}
                  <button 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-orange-500"
                  >
                    <FaMapMarkerAlt />
                  </button>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Rota Bilgisi</h3>
                <div>
                  {(!pickupPlace || !deliveryPlace) ? (
                    <p className="text-gray-500 text-sm mb-3">Önce adres seçimi yapınız.</p>
                  ) : (
                    <div className="flex space-x-6">
                      <div>
                        <span className="text-gray-600 block">Mesafe</span>
                        <span className="font-bold">{distance || '---'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">Süre</span>
                        <span className="font-bold">{duration || '---'}</span>
                      </div>
                    </div>
                  )}
                  <button
                    className={`w-full mt-3 px-4 py-2 rounded-lg transition ${
                      (!pickupPlace || !deliveryPlace) 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                    onClick={handleContinue}
                    disabled={!pickupPlace || !deliveryPlace}
                  >
                    Devam Et
                  </button>
                </div>
              </div>
            </div>
            
            <div className={`${isMobile ? "order-1 mb-4" : ""} md:col-span-2 h-[400px] md:h-[400px] relative`}>
              {isMobile && (
                <h2 className="text-2xl font-bold mb-4">Rotanızı Belirleyin</h2>
              )}
              {mapError && (
                <div className="h-[250px] md:h-[400px] w-full relative bg-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <FaInfoCircle className="mx-auto mb-2 text-3xl text-red-500" />
                    <p>Harita yüklenirken bir sorun oluştu.</p>
                    <p className="text-xs mt-2">Hata: {mapError}</p>
                  </div>
                </div>
              )}
              {!mapError && isLoaded && (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={center}
                  zoom={12}
                  onLoad={onLoad}
                  onUnmount={onUnmount}
                >
                  {directions ? (
                    <>
                      <DirectionsRenderer {...directions} />
                      <Marker 
                        position={pickupMarker} 
                        icon={{
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: 10,
                          fillColor: '#22c55e',
                          fillOpacity: 1,
                          strokeColor: '#ffffff',
                          strokeWeight: 2,
                        }}
                      />
                      <Marker 
                        position={deliveryMarker}
                        icon={{
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: 10,
                          fillColor: '#ef4444',
                          fillOpacity: 1,
                          strokeColor: '#ffffff',
                          strokeWeight: 2,
                        }}
                      />
                    </>
                  ) : (
                    <>
                      {pickupMarker && (
                        <Marker 
                          position={pickupMarker}
                          icon={{
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: '#22c55e',
                            fillOpacity: 1,
                            strokeColor: '#ffffff',
                            strokeWeight: 2,
                          }}
                        />
                      )}
                      {deliveryMarker && (
                        <Marker 
                          position={deliveryMarker}
                          icon={{
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: '#ef4444',
                            fillOpacity: 1,
                            strokeColor: '#ffffff',
                            strokeWeight: 2,
                          }}
                        />
                      )}
                    </>
                  )}
                </GoogleMap>
              )}
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div id="services" className="container mx-auto px-4 py-16 md:py-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Hizmetlerimiz</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            İhtiyacınıza en uygun taşıma hizmetini seçin, size en yakın taşıyıcıyı anında bulalım.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: 'express',
                title: 'Express Taşıma',
                icon: <FaBolt className="text-2xl" />,
                description: 'Acil gönderileriniz için hızlı ve öncelikli taşıma hizmeti.',
                soon: false,
                color: 'bg-blue-500'
              },
              {
                id: 'kurye',
                title: 'Kurye Hizmeti',
                icon: <FaBox className="text-2xl" />,
                description: 'Hızlı ve güvenli kurye taşıma hizmetleri ile küçük paketlerinizi aynı gün teslim ediyoruz.',
                soon: false,
                color: 'bg-purple-500'
              },
              {
                id: 'koli',
                title: 'Koli Taşıma',
                icon: <FaBoxOpen className="text-2xl" />,
                description: 'Küçük ve orta boy kolileriniz için güvenli taşıma çözümleri.',
                soon: false,
                color: 'bg-orange-500'
              },
              {
                id: 'palet',
                title: 'Paletli Taşıma',
                icon: <FaPallet className="text-2xl" />,
                description: 'Paletlenmiş ürünleriniz için profesyonel taşıma hizmeti.',
                soon: false,
                color: 'bg-green-500'
              },
              {
                id: 'parsiyel',
                title: 'Parsiyel Taşıma',
                icon: <FaTruck className="text-2xl" />,
                description: 'Farklı müşterilerin yüklerini aynı araçta taşıyarak ekonomik çözümler.',
                soon: false,
                color: 'bg-red-500'
              },
              {
                id: 'makine',
                title: 'Makine Taşıma',
                icon: <FaTools className="text-2xl" />,
                description: 'Ağır makineler için özel ekipmanlarla güvenli taşıma hizmeti.',
                soon: true,
                color: 'bg-gray-400'
              },
              {
                id: 'lowbed',
                title: 'Lowbed Taşıma',
                icon: <FaTruck className="text-2xl" />,
                description: 'Ağır ve büyük yükler için lowbed ile özel taşıma çözümleri.',
                soon: true,
                color: 'bg-gray-400'
              },
              {
                id: 'konteyner',
                title: 'Konteyner Taşıma',
                icon: <FaShieldAlt className="text-2xl" />,
                description: 'Uluslararası konteyner taşımacılığı ve gümrük hizmetleri.',
                soon: true,
                color: 'bg-gray-400'
              },
              {
                id: 'sogukzincir',
                title: 'Soğuk Zincir',
                icon: <FaSnowflake className="text-2xl" />,
                description: 'Sıcaklık kontrollü taşıma gerektiren ürünler için özel çözümler.',
                soon: true,
                color: 'bg-gray-400'
              }
            ].map((service) => (
              <div 
                key={service.id}
                className={`bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${
                  !service.soon ? 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer' : 'opacity-75'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/services/${service.id}`);
                }}
              >
                <div className={`${service.color} p-6 flex items-center justify-between`}>
                  <div className="text-white text-2xl">{service.icon}</div>
                  {service.soon && (
                    <span className="bg-white/20 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                      Yakında
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                  <p className={`text-sm ${service.soon ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    {service.description}
                  </p>
                  {!service.soon && (
                    <div 
                      className="flex items-center text-sm font-medium text-gray-900 hover:text-orange-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/services/${service.id}`);
                      }}
                    >
                      Taşıyıcı Bul
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="container mx-auto px-4 py-16 md:py-24">
          <div className="w-full h-px bg-gray-200 mb-16"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Neden Bizi Tercih Etmelisiniz?</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Taşı, yenilikçi yaklaşımı ve kullanıcı dostu arayüzü ile taşımacılık sektörüne yeni bir soluk getiriyor.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <FaClock className="text-2xl text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">7/24 Hizmet</h3>
              <p className="text-gray-600">
                Günün her saati taşıma ihtiyaçlarınız için yanınızdayız. Acil durumlar için öncelikli destek sağlıyoruz.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <FaShieldAlt className="text-2xl text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Güvenli Taşıma</h3>
              <p className="text-gray-600">
                Eşyalarınız sigortalı ve güvende. Profesyonel taşıyıcılarımız özenle seçiliyor ve düzenli denetleniyor.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <FaMoneyBillWave className="text-2xl text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Uygun Fiyat</h3>
              <p className="text-gray-600">
                Rekabetçi fiyatlarla kaliteli hizmet. Size en yakın taşıyıcıyı bularak maliyetleri optimize ediyoruz.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <FaMapMarkedAlt className="text-2xl text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Anlık Takip</h3>
              <p className="text-gray-600">
                Eşyalarınızın konumunu gerçek zamanlı takip edin. Taşıma sürecini harita üzerinden canlı olarak izleyin.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
            {/* Logo ve Açıklama */}
            <div className="col-span-1 md:col-span-3">
              <img src="/logo.png" alt="Taşı.app" className="h-8 mb-4" />
              <p className="text-gray-400 mb-4">
                Türkiye'nin en güvenilir ve hızlı taşımacılık platformu. Tek tıkla taşıyıcı bulun, anlık takip edin.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-orange-500 transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="col-span-1">
              <h3 className="text-lg font-semibold mb-4">Hizmetlerimiz</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-orange-500">Express Taşıma</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500">Koli Taşıma</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500">Paletli Taşıma</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500">Parsiyel Taşıma</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500">Kurye Hizmetleri</a></li>
              </ul>
            </div>

            <div className="col-span-1">
              <h3 className="text-lg font-semibold mb-4">Taşıyıcı</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/portal/login" className="text-gray-400 hover:text-orange-500">
                    Taşıyıcı Portal Girişi
                  </Link>
                </li>
                <li>
                  <Link href="/portal/register" className="text-gray-400 hover:text-orange-500 border border-gray-700 hover:border-orange-500 rounded px-3 py-1 inline-flex items-center transition-colors">
                    Taşıyıcı Olun
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-1">
              <h3 className="text-lg font-semibold mb-4">İletişim</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-400">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <span>+90 212 123 4567</span>
                </li>
                <li className="flex items-center text-gray-400">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  info@tasiapp.com
                </li>
                <li className="flex items-center text-gray-400">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  İstanbul, Türkiye
                </li>
              </ul>
            </div>
          </div>

          {/* Alt Footer */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 Taşı.app. Tüm hakları saklıdır.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-orange-500 text-sm transition">Gizlilik Politikası</a>
                <a href="#" className="text-gray-400 hover:text-orange-500 text-sm transition">Kullanım Şartları</a>
                <a href="#" className="text-gray-400 hover:text-orange-500 text-sm transition">KVKK</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showSummaryModal && selectedTransportType && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto relative">
              <StepBar currentStep={currentStep} />

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Taşıma Detayları</h2>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={handleCloseModal}
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sol Taraf - Rota ve Taşıma Bilgileri */}
                <div className="space-y-6">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">Rota Bilgisi</h3>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <div className="mt-1">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-500">Alınacak Adres</p>
                          <p className="text-gray-800">{pickupAddress}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="mt-1">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-500">Teslim Edilecek Adres</p>
                          <p className="text-gray-800">{deliveryAddress}</p>
                        </div>
                      </div>
                      <div className="flex justify-between mt-3 text-sm">
                        <span>Mesafe: {distance}</span>
                        <span>Süre: {duration}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Taşıma Türü: {selectedTransportType}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Taşınacak Ürün Açıklaması
                        </label>
                        <textarea
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          rows="3"
                          placeholder="Taşınacak ürünlerinizi detaylı bir şekilde açıklayın..."
                        ></textarea>
                      </div>

                      {selectedTransportType === 'Koli Taşıma' && (
                        <>
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                              Koli Adedi
                            </label>
                            <input
                              type="number"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="Adet"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                              Ortalama Koli Ağırlığı
                            </label>
                            <input
                              type="number"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="kg"
                            />
                          </div>
                        </>
                      )}

                      {selectedTransportType === 'Paletli Taşıma' && (
                        <>
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                              Palet Adedi
                            </label>
                            <input
                              type="number"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="Adet"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                              Palet Başına Ağırlık
                            </label>
                            <input
                              type="number"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="kg"
                            />
                          </div>
                        </>
                      )}

                      {selectedTransportType === 'Parsiyel Taşıma' && (
                        <>
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                              Toplam Hacim
                            </label>
                            <input
                              type="number"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="m³"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                              Toplam Ağırlık
                            </label>
                            <input
                              type="number"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="kg"
                            />
                          </div>
                        </>
                      )}

                      {selectedTransportType === 'Express Taşıma' && (
                        <>
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                              Paket Boyutu
                            </label>
                            <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                              <option value="">Seçiniz</option>
                              <option value="small">Küçük Boy</option>
                              <option value="medium">Orta Boy</option>
                              <option value="large">Büyük Boy</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                              Teslimat Önceliği
                            </label>
                            <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                              <option value="">Seçiniz</option>
                              <option value="normal">Normal</option>
                              <option value="express">Express (3 Saat)</option>
                              <option value="vip">VIP (90 Dakika)</option>
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sağ Taraf - Görsel Yükleme ve Ek Bilgiler */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Görseller</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="text-center">
                        <FaImage className="mx-auto text-gray-400 text-4xl mb-2" />
                        <p className="text-gray-600 mb-2">Yüklenecek ürünlerin fotoğraflarını ekleyin</p>
                        <p className="text-gray-400 text-sm mb-4">PNG, JPG formatında max. 5 MB</p>
                        <button className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-200 transition">
                          Görsel Yükle
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Ek Hizmetler</h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="form-checkbox text-orange-500 rounded" />
                        <span>Yükleme Yardımı</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="form-checkbox text-orange-500 rounded" />
                        <span>İndirme Yardımı</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="form-checkbox text-orange-500 rounded" />
                        <span>Taşıma Sigortası</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Ek Notlar</h3>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows="3"
                      placeholder="Taşıyıcıya iletmek istediğiniz ek notları yazabilirsiniz..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between items-center">
                <button
                  className="px-6 py-2 text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50 transition flex items-center"
                  onClick={handleCloseModal}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Geri
                </button>
                <button
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center"
                  onClick={handleFindCarrier}
                >
                  İleri
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPhoneModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-4xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto relative">
              <StepBar currentStep={currentStep} />

              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">İletişim Bilgileri</h2>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={handleCloseModal}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                {/* Sol Taraf - Telefon ve Kod Doğrulama */}
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Telefon Numarası</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center">
                        <span className="bg-gray-100 p-2 sm:p-3 rounded-l-lg border border-r-0 border-gray-300 text-gray-600 text-sm sm:text-base">+90</span>
                        <input
                          type="text"
                          value={formattedPhoneNumber}
                          onChange={handlePhoneChange}
                          className="flex-1 p-2 sm:p-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                          placeholder="5XX XXX XX XX"
                          disabled={otpSent}
                        />
                      </div>
                      {!otpSent && (
                        <button
                          className={`w-full px-4 py-2 rounded-lg transition ${
                            phoneNumber.length === 10
                              ? 'bg-orange-500 hover:bg-orange-600 text-white'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                          onClick={() => {
                            if (phoneNumber.length === 10) {
                              setOtpSent(true);
                            }
                          }}
                          disabled={phoneNumber.length !== 10}
                        >
                          Kod Gönder
                        </button>
                      )}
                    </div>
                  </div>

                  {otpSent && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Doğrulama Kodu</h3>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          {`+90 ${formattedPhoneNumber} numarasına gönderilen 6 haneli kodu girin.`}
                        </p>
                        <input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-center text-2xl tracking-wider"
                          placeholder="· · · · · ·"
                          maxLength={6}
                        />
                        <div className="flex justify-between items-center mt-2">
                          <button
                            className="text-orange-500 text-sm hover:text-orange-600"
                            onClick={() => {
                              setOtpSent(false);
                              setOtpCode('');
                            }}
                          >
                            Numarayı Değiştir
                          </button>
                          <button
                            className="text-orange-500 text-sm hover:text-orange-600"
                          >
                            Kodu Tekrar Gönder
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sağ Taraf - Bilgilendirme */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-orange-50 p-4 sm:p-6 rounded-lg">
                    <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Neden Telefon Numarası?</h3>
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Telefon numaranız:
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <FaCheck className="text-green-500 mt-1 mr-2" />
                          <span className="text-gray-600">Taşıyıcılarla güvenli iletişim kurmanızı sağlar</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheck className="text-green-500 mt-1 mr-2" />
                          <span className="text-gray-600">Taşıma sürecinde anlık bilgilendirmeler alırsınız</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheck className="text-green-500 mt-1 mr-2" />
                          <span className="text-gray-600">Hesabınızın güvenliğini artırır</span>
                        </li>
                      </ul>
                      <p className="text-sm text-gray-500 mt-4">
                        Telefon numaranız gizli tutulur ve sadece eşleştiğiniz taşıyıcı ile paylaşılır.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 flex justify-between items-center border-t pt-4 sm:pt-6">
                <button
                  className="px-4 sm:px-6 py-2 text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50 transition flex items-center text-sm sm:text-base"
                  onClick={handleCloseModal}
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Geri
                </button>
                {otpSent && (
                  <button
                    className={`px-6 py-2 rounded-lg transition flex items-center ${
                      otpCode.length === 6
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={handlePhoneVerification}
                    disabled={otpCode.length !== 6}
                  >
                    İleri
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-md w-full mx-4 md:mx-auto text-center">
            <div className="mb-4">
              <FaSpinner className="animate-spin text-orange-500 w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Taşıyıcı Aranıyor</h2>
            <p className="text-gray-600 mb-6">Taşıma talebiniz için en uygun taşıyıcıyı arıyoruz. Bu işlem birkaç dakika sürebilir.</p>
            
            <button
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              onClick={() => setShowSearchingModal(false)}
            >
              İptal
            </button>
          </div>
        </div>
      )}
      
      {showSearchingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 md:mx-auto">
            <div className="mb-6 relative flex justify-center">
              {selectedTransportType === 'Express Taşıma' && (
                <div className="relative">
                  <FaBolt className="text-orange-500 w-16 h-16 animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-200 to-transparent opacity-50 animate-[shimmer_1s_infinite]" />
                </div>
              )}
              {selectedTransportType === 'Kurye Hizmeti' && (
                <div className="animate-bounce">
                  <FaBox className="text-orange-500 w-16 h-16" />
                </div>
              )}
              {selectedTransportType === 'Koli Taşıma' && (
                <div className="animate-pulse">
                  <FaBoxOpen className="text-orange-500 w-16 h-16" />
                </div>
              )}
              {selectedTransportType === 'Paletli Taşıma' && (
                <div className="animate-pulse">
                  <FaPallet className="text-orange-500 w-16 h-16" />
                </div>
              )}
              {selectedTransportType === 'Parsiyel Taşıma' && (
                <div className="relative">
                  <FaTruck className="text-orange-500 w-16 h-16 animate-[moveLeftRight_3s_infinite]" />
                </div>
              )}
              {!['Express Taşıma', 'Kurye Hizmeti', 'Koli Taşıma', 'Paletli Taşıma', 'Parsiyel Taşıma'].includes(selectedTransportType) && (
                <FaSpinner className="animate-spin text-orange-500 w-16 h-16" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-4 text-center">Taşıyıcı Aranıyor</h2>
            <div className="space-y-4">
              <p className="text-gray-600 text-center">
                {selectedTransportType} için en uygun taşıyıcıyı arıyoruz.
              </p>
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FaInfoCircle className="text-orange-500" />
                  <span className="font-medium">Arama Kriterleri:</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1 ml-6">
                  <li>• {distance} mesafede</li>
                  <li>• {selectedTransportType} deneyimi olan</li>
                  <li>• Müsait durumda olan taşıyıcılar</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col space-y-2 mt-6">
              <button
                className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => setShowSearchingModal(false)}
              >
                İptal
              </button>
              <button
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                onClick={handleTestSearch}
              >
                Test: Taşıyıcı Bul
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showWaitingApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 md:mx-auto">
            <div className="mb-6 relative flex justify-center">
              <div className="relative">
                <FaCheckCircle className="text-orange-500 w-16 h-16" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-center">Taşıyıcılar Bulundu!</h2>
            <div className="space-y-4">
              <p className="text-gray-600 text-center">
                3 taşıyıcı bulundu ve onayları bekleniyor. İlk onay veren taşıyıcı sizinle eşleşecek.
              </p>
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
            <div className="flex flex-col space-y-2 mt-6">
              <button
                className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={handleCloseModal}
              >
                İptal
              </button>
              <button
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                onClick={handleTestApproval}
              >
                Test: Taşıyıcı Onayladı
              </button>
            </div>
          </div>
        </div>
      )}

      {showCarrierDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto relative">
            <StepBar currentStep={currentStep} />

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Taşıyıcı Onayı</h2>
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={handleCloseModal}
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Taşıyıcı Bilgileri */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                    <img src="/carrier-avatar.png" alt="Taşıyıcı" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Ahmet Yılmaz</h3>
                    <div className="flex items-center">
                      <FaStar className="text-yellow-400 mr-1" />
                      <span className="font-medium">4.8</span>
                      <span className="text-gray-500 text-sm ml-1">(124 taşıma)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center">
                    <FaTruck className="text-orange-500 mr-2" />
                    <span>34 ABC 123 - Mercedes Sprinter</span>
                  </div>
                  <div className="flex items-center">
                    <FaShieldAlt className="text-orange-500 mr-2" />
                    <span>Kimlik ve Araç Belgeleri Doğrulandı</span>
                  </div>
                  <div className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2" />
                    <span>2 yıldır üye</span>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-green-800">Son Yorumlar</h4>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="flex text-yellow-400">
                          <FaStar />
                          <FaStar />
                          <FaStar />
                          <FaStar />
                          <FaStar />
                        </div>
                      </div>
                      <p className="ml-2 text-sm text-gray-600">
                        "Çok dikkatli ve profesyonel bir taşıma hizmeti. Tam zamanında teslim."
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="flex text-yellow-400">
                          <FaStar />
                          <FaStar />
                          <FaStar />
                          <FaStar />
                          <FaStar />
                        </div>
                      </div>
                      <p className="ml-2 text-sm text-gray-600">
                        "Güvenilir ve hızlı teslimat. Kesinlikle tavsiye ederim."
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Taşıma Özeti */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">Taşıma Özeti</h3>
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <h4 className="font-medium mb-2">Rota Bilgileri</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start">
                          <div className="mt-1">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          </div>
                          <div className="ml-3">
                            <p className="text-gray-500">Alınacak Adres</p>
                            <p className="text-gray-800">{pickupAddress}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="mt-1">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          </div>
                          <div className="ml-3">
                            <p className="text-gray-500">Teslim Edilecek Adres</p>
                            <p className="text-gray-800">{deliveryAddress}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-b pb-4">
                      <h4 className="font-medium mb-2">Taşıma Detayları</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Taşıma Türü</p>
                          <p className="font-medium">{selectedTransportType}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Mesafe</p>
                          <p className="font-medium">{distance}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tahmini Süre</p>
                          <p className="font-medium">{duration}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tahmini Varış</p>
                          <p className="font-medium">14:30</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Seçilen Ek Hizmetler</h4>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <FaCheck className="text-green-500 mr-2" />
                          <span>Yükleme Yardımı</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <FaCheck className="text-green-500 mr-2" />
                          <span>İndirme Yardımı</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <FaCheck className="text-green-500 mr-2" />
                          <span>Taşıma Sigortası</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
                  onClick={handlePayment}
                >
                  Devam Et
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto relative">
            <StepBar currentStep={currentStep} />

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Ödeme</h2>
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={handleCloseModal}
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sol Taraf - Ödeme Detayları */}
              <div className="space-y-6">
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">Ödeme Özeti</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Taşıma Ücreti</span>
                      <span className="font-medium">₺750,00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Yükleme Yardımı</span>
                      <span className="font-medium">₺50,00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">İndirme Yardımı</span>
                      <span className="font-medium">₺50,00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Taşıma Sigortası</span>
                      <span className="font-medium">₺100,00</span>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Toplam</span>
                        <span className="text-orange-600">₺950,00</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">KDV dahil fiyattır</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 text-blue-700">
                    <FaInfoCircle className="text-xl" />
                    <h4 className="font-medium">Güvenli Ödeme</h4>
                  </div>
                  <p className="text-sm text-blue-600 mt-2">
                    Ödemeniz taşıma tamamlanana kadar güvenli bir şekilde tarafımızda tutulur. Taşıma başarıyla tamamlandıktan sonra taşıyıcıya aktarılır.
                  </p>
                </div>
              </div>

              {/* Sağ Taraf - Kart Bilgileri */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-lg mb-4">Kart Bilgileri</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Kart Üzerindeki İsim
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Kart sahibinin adı soyadı"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Kart Numarası
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="•••• •••• •••• ••••"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-2">
                          <img src="/visa.svg" alt="Visa" className="h-6" />
                          <img src="/mastercard.svg" alt="Mastercard" className="h-6" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Son Kullanma Tarihi
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="AA/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="•••"
                          maxLength="3"
                        />
                      </div>
                    </div>

                    <div className="mt-2">
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="form-checkbox text-orange-500 rounded" />
                        <span className="text-sm text-gray-600">Kart bilgilerimi sonraki ödemeler için kaydet</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Üyelik Fırsatları Bölümü */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <FaStar className="w-8 h-8 text-yellow-300" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg">Üye Ol, Fırsatları Yakala!</h3>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center">
                          <FaCheck className="w-4 h-4 mr-2 text-yellow-300" />
                          İlk taşımanıza özel %10 indirim
                        </p>
                        <p className="flex items-center">
                          <FaCheck className="w-4 h-4 mr-2 text-yellow-300" />
                          Özel kampanya ve duyurulardan haberdar olun
                        </p>
                        <p className="flex items-center">
                          <FaCheck className="w-4 h-4 mr-2 text-yellow-300" />
                          Geçmiş taşımalarınızı kolayca takip edin
                        </p>
                      </div>
                      <button
                        className="w-full mt-2 px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium flex items-center justify-center"
                        onClick={() => window.location.href = '/uye-ol'}
                      >
                        Hemen Üye Ol
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
                  onClick={handlePaymentComplete}
                >
                  <span>₺950,00 Öde</span>
                  <FaLock />
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Ödemeyi tamamlayarak 
                    <a href="#" className="text-orange-500 hover:text-orange-600 mx-1">kullanım şartlarını</a>
                    kabul etmiş olursunuz
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPaymentSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto relative">
            <div className="text-center space-y-6">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <FaCheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center">
                  <FaLock className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-800">Ödeme Tamamlandı!</h2>
                <p className="text-gray-600">Taşıma talebiniz başarıyla oluşturuldu.</p>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg text-left">
                <h3 className="font-semibold text-lg mb-4">Sonraki Adımlar</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-orange-600 font-semibold">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Taşıyıcı Hazırlığı</h4>
                      <p className="text-sm text-gray-600">Taşıyıcı {pickupAddress} adresine doğru yola çıkacak.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-orange-600 font-semibold">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Yükleme</h4>
                      <p className="text-sm text-gray-600">Taşıyıcı konuma vardığında size bildirim gelecek.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-orange-600 font-semibold">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Teslimat</h4>
                      <p className="text-sm text-gray-600">Yük {deliveryAddress} adresine teslim edilecek.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-left">
                <div className="flex items-center space-x-3 text-blue-700">
                  <FaInfoCircle className="text-xl flex-shrink-0" />
                  <p className="text-sm">
                    Taşıma sürecini uygulamamız üzerinden takip edebilirsiniz. Tüm güncellemeler için bildirim alacaksınız.
                  </p>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
                  onClick={() => window.location.href = '/portal'}
                >
                  Taşıma Takibi
                  <FaTruck className="ml-2" />
                </button>
                <button
                  className="w-full px-6 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={handleCloseModal}
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yeni Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-6xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto relative">
              {/* Step Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-center space-x-2">
                  <div className={`flex items-center ${serviceModalStep >= 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      serviceModalStep >= 0 ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                    }`}>
                      1
                    </div>
                    <span className="ml-2 font-medium">Adres Bilgileri</span>
                  </div>
                  <div className={`w-16 h-0.5 ${serviceModalStep >= 1 ? 'bg-orange-500' : 'bg-gray-300'}`} />
                  <div className={`flex items-center ${serviceModalStep >= 1 ? 'text-orange-500' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      serviceModalStep >= 1 ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                    }`}>
                      2
                    </div>
                    <span className="ml-2 font-medium">Taşıma Detayları</span>
                  </div>
                </div>
              </div>

              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                  {serviceModalStep === 0 ? 'Rotanızı Belirleyin' : 'Taşıma Detayları'}
                </h2>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => {
                    setShowMapModal(false);
                    setServiceModalStep(0);
                    setSelectedService(null);
                  }}
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Step Content */}
              {serviceModalStep === 0 ? (
                // Step 1: Adres Bilgileri
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Mevcut adres ve harita içeriği */}
                  <div className="md:col-span-1 space-y-4">
                    {/* Alınacak Adres */}
                    <div>
                      <label className="block text-gray-700 mb-2">Alınacak Adres</label>
                      <div className="relative z-50">
                        {isLoaded && (
                          <Autocomplete
                            onLoad={onPickupLoad}
                            onPlaceChanged={onPickupPlaceChanged}
                            options={{
                              componentRestrictions: { country: "tr" },
                              types: ["establishment", "geocode"],
                              fields: ["formatted_address", "geometry", "name", "place_id"]
                            }}
                          >
                            <input 
                              type="text" 
                              value={pickupAddress}
                              onChange={handlePickupInputChange}
                              onFocus={handlePickupFocus}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="Alınacak adresi girin"
                            />
                          </Autocomplete>
                        )}
                      </div>
                    </div>

                    {/* Teslim Edilecek Adres */}
                    <div>
                      <label className="block text-gray-700 mb-2">Teslim Edilecek Adres</label>
                      <div className="relative z-40">
                        {isLoaded && (
                          <Autocomplete
                            onLoad={onDeliveryLoad}
                            onPlaceChanged={onDeliveryPlaceChanged}
                            options={{
                              componentRestrictions: { country: "tr" },
                              types: ["establishment", "geocode"],
                              fields: ["formatted_address", "geometry", "name", "place_id"]
                            }}
                          >
                            <input 
                              type="text" 
                              value={deliveryAddress}
                              onChange={handleDeliveryInputChange}
                              onFocus={handleDeliveryFocus}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="Teslim edilecek adresi girin"
                            />
                          </Autocomplete>
                        )}
                      </div>
                    </div>

                    {/* Rota Bilgisi */}
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h3 className="font-bold text-lg mb-2">Rota Bilgisi</h3>
                      <div>
                        {(!pickupPlace || !deliveryPlace) ? (
                          <p className="text-gray-500 text-sm mb-3">Önce adres seçimi yapınız.</p>
                        ) : (
                          <div className="flex space-x-6">
                            <div>
                              <span className="text-gray-600 block">Mesafe</span>
                              <span className="font-bold">{distance || '---'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600 block">Süre</span>
                              <span className="font-bold">{duration || '---'}</span>
                            </div>
                          </div>
                        )}
                        <button
                          className={`w-full mt-3 px-4 py-2 rounded-lg transition ${
                            (!pickupPlace || !deliveryPlace) 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-orange-500 text-white hover:bg-orange-600'
                          }`}
                          onClick={() => {
                            if (pickupPlace && deliveryPlace) {
                              setServiceModalStep(1);
                            }
                          }}
                          disabled={!pickupPlace || !deliveryPlace}
                        >
                          Devam Et
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Harita */}
                  <div className="md:col-span-2 h-[400px] bg-gray-100 rounded-lg">
                    {isLoaded ? (
                      <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={12}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                      >
                        {/* Mevcut harita içeriği */}
                        {directions && <DirectionsRenderer {...directions} />}
                        {pickupMarker && (
                          <Marker 
                            position={pickupMarker}
                            icon={{
                              path: window.google.maps.SymbolPath.CIRCLE,
                              scale: 10,
                              fillColor: '#22c55e',
                              fillOpacity: 1,
                              strokeColor: '#ffffff',
                              strokeWeight: 2,
                            }}
                          />
                        )}
                        {deliveryMarker && (
                          <Marker 
                            position={deliveryMarker}
                            icon={{
                              path: window.google.maps.SymbolPath.CIRCLE,
                              scale: 10,
                              fillColor: '#ef4444',
                              fillOpacity: 1,
                              strokeColor: '#ffffff',
                              strokeWeight: 2,
                            }}
                          />
                        )}
                      </GoogleMap>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <FaSpinner className="animate-spin text-orange-500 text-3xl" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Step 2: Taşıma Detayları
                <div className="space-y-6">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg text-orange-700">Seçilen Hizmet: {selectedService}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ürün Açıklaması */}
                    <div>
                      <label className="block text-gray-700 mb-2">Ürün Açıklaması</label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-32"
                        placeholder="Taşınacak ürünler hakkında detaylı bilgi verin"
                      />
                    </div>

                    {/* Ek Bilgiler */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2">Tahmini Ağırlık (kg)</label>
                        <input
                          type="number"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Örn: 1000"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">Paket/Koli Sayısı</label>
                        <input
                          type="number"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Örn: 5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ek Hizmetler */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Ek Hizmetler</h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="form-checkbox text-orange-500 rounded" />
                        <span>Yükleme Yardımı</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="form-checkbox text-orange-500 rounded" />
                        <span>İndirme Yardımı</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="form-checkbox text-orange-500 rounded" />
                        <span>Nakliyat Sigortası</span>
                      </label>
                    </div>
                  </div>

                  {/* Notlar */}
                  <div>
                    <label className="block text-gray-700 mb-2">Ek Notlar</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-24"
                      placeholder="Taşıyıcının bilmesi gereken ek bilgiler"
                    />
                  </div>

                  {/* Butonlar */}
                  <div className="flex space-x-4">
                    <button
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      onClick={() => setServiceModalStep(0)}
                    >
                      Geri
                    </button>
                    <button
                      className="flex-1 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                      onClick={() => {
                        setShowMapModal(false);
                        setCurrentStep(2);
                        setShowPhoneModal(true);
                      }}
                    >
                      Devam Et
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Taşıma Detayları Modal */}
      {showTransportDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Taşıma Detayları</h2>
              <button 
                onClick={() => setShowTransportDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Seçilen Taşıma Türü */}
              <div className="bg-orange-50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-orange-600 mb-2">Seçilen Taşıma Türü</h3>
                <p className="text-gray-700">{selectedTransportType}</p>
              </div>

              {/* Temel Bilgiler */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alış Adresi</label>
                  <p className="text-gray-900">{pickupLocation}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teslimat Adresi</label>
                  <p className="text-gray-900">{deliveryLocation}</p>
                </div>
              </div>

              {/* Taşıma Türüne Özel Alanlar */}
              {selectedTransportType === 'Depo Taşıma' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Depo Tipi</label>
                      <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                        <option>Kapalı Depo</option>
                        <option>Açık Depo</option>
                        <option>Soğuk Zincir Depo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Depo Büyüklüğü (m²)</label>
                      <input type="number" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Özel Gereksinimler</label>
                    <textarea className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" rows="2"></textarea>
                  </div>
                </div>
              )}

              {selectedTransportType === 'Paletli Taşıma' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Palet Sayısı</label>
                      <input type="number" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Palet Tipi</label>
                      <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                        <option>Euro Palet</option>
                        <option>Standart Palet</option>
                        <option>Özel Palet</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yükleme/Boşaltma Gereksinimleri</label>
                    <textarea className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" rows="2"></textarea>
                  </div>
                </div>
              )}

              {selectedTransportType === 'Koli Taşıma' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Koli Sayısı</label>
                      <input type="number" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Koli Boyutu</label>
                      <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                        <option>Küçük Boy</option>
                        <option>Orta Boy</option>
                        <option>Büyük Boy</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Özel Paketleme Gereksinimleri</label>
                    <textarea className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" rows="2"></textarea>
                  </div>
                </div>
              )}

              {selectedTransportType === 'Parsiyel Taşıma' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parsiyel Tipi</label>
                      <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                        <option>LTL (Less Than Truckload)</option>
                        <option>FTL (Full Truckload)</option>
                        <option>Karma Yük</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Yaklaşık Hacim (m³)</label>
                      <input type="number" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yükleme/Boşaltma Detayları</label>
                    <textarea className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" rows="2"></textarea>
                  </div>
                </div>
              )}

              {selectedTransportType === 'Evden Eve Nakliyat' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ev/Oda Sayısı</label>
                      <input type="number" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Taşınacak Eşya Listesi</label>
                      <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                        <option>Tam Ev</option>
                        <option>Oda + Eşya</option>
                        <option>Sadece Eşya</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Özel Taşıma Gereksinimleri</label>
                    <textarea className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" rows="2"></textarea>
                  </div>
                </div>
              )}

              {/* Tarih ve Saat Seçimi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alış Tarihi</label>
                  <input type="date" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alış Saati</label>
                  <input type="time" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                </div>
              </div>

              {/* Notlar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ek Notlar</label>
                <textarea className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" rows="2"></textarea>
              </div>

              {/* Butonlar */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={handleBackToTransportType}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Geri
                </button>
                <button
                  onClick={handleFindCarrier}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  Taşıyıcı Bul
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* İletişim Bilgileri Modal */}
      {showContactInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* ... existing code ... */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                onClick={handleBackToSummary}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Geri
              </button>
              <button
                onClick={handlePhoneVerification}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                Devam Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Özet Modalı */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Özet</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Taşıma Türü</h3>
                <p className="text-gray-600">{selectedTransportType}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Alış Noktası</h3>
                <p className="text-gray-600">{pickupLocation}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Teslim Noktası</h3>
                <p className="text-gray-600">{deliveryLocation}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Tarih ve Saat</h3>
                <p className="text-gray-600">{selectedDate} {selectedTime}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Paket Bilgileri</h3>
                <p className="text-gray-600">{packageDetails}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={handleBackToTransportType}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Geri
              </button>
              <button
                onClick={handleContinue}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Devam Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Telefon Modalı */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Telefon Numarası</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon Numarası
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="05XX XXX XX XX"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={handleBackToSummary}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Geri
              </button>
              <button
                onClick={handlePhoneSubmit}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Devam Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Modalı */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Doğrulama Kodu</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doğrulama Kodu
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="6 haneli kodu giriniz"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={handleBackToPhone}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Geri
              </button>
              <button
                onClick={handleOTPSubmit}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Doğrula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Taşıyıcı Detayları Modalı */}
      {showCarrierDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Taşıyıcı Detayları</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                  <img src="/carrier-avatar.png" alt="Taşıyıcı" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-medium">Ahmet Yılmaz</h3>
                  <p className="text-sm text-gray-500">4.8 ★ (120 değerlendirme)</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Araç Bilgileri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Araç Tipi</p>
                    <p className="font-medium">Kamyonet</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Plaka</p>
                    <p className="font-medium">34 ABC 123</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={handleBackToCarrierSearch}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Geri
              </button>
              <button
                onClick={handleTestApproval}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Taşıyıcıyı Seç
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onay Bekleme Modalı */}
      {showWaitingApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Onay Bekleniyor</h2>
            </div>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaClock className="text-3xl text-orange-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">Taşıyıcı Onayı Bekleniyor</h3>
              <p className="text-gray-500">Taşıyıcı talebinizi onayladığında size bildirim gelecektir.</p>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={handleBackToCarrierDetails}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Geri
              </button>
              <button
                onClick={handlePayment}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Ödemeye Geç
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 shadow-xl">
            {modalStep === 0 && (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Taşıma Türü Seçimi</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">Adım</span>
                      <span className="text-lg font-bold text-orange-500">1/5</span>
                    </div>
                    <button 
                      onClick={handleCloseModal}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div 
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-colors ${
                      selectedService === 'express' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-orange-500'
                    }`}
                    onClick={() => setSelectedService('express')}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Express Taşıma</h3>
                    </div>
                    <p className="text-gray-600">Aynı gün teslimat için hızlı taşıma hizmetleri</p>
                  </div>

                  <div 
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-colors ${
                      selectedService === 'courier' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-orange-500'
                    }`}
                    onClick={() => setSelectedService('courier')}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Kurye Hizmeti</h3>
                    </div>
                    <p className="text-gray-600">Hızlı ve güvenli kurye taşıma hizmetleri</p>
                  </div>

                  <div 
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-colors ${
                      selectedService === 'package' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-orange-500'
                    }`}
                    onClick={() => setSelectedService('package')}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Koli Taşıma</h3>
                    </div>
                    <p className="text-gray-600">Koli ve paket taşıma hizmetleri</p>
                  </div>

                  <div 
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-colors ${
                      selectedService === 'pallet' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-orange-500'
                    }`}
                    onClick={() => setSelectedService('pallet')}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Paletli Taşıma</h3>
                    </div>
                    <p className="text-gray-600">Paletli yük taşıma hizmetleri</p>
                  </div>

                  <div 
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-colors ${
                      selectedService === 'partial' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-orange-500'
                    }`}
                    onClick={() => setSelectedService('partial')}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Parsiyel Taşıma</h3>
                    </div>
                    <p className="text-gray-600">Parsiyel yük taşıma hizmetleri</p>
                  </div>

                  <div className="p-6 border-2 border-gray-200 rounded-xl relative">
                    <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Yakında
                    </div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Makine Taşıma</h3>
                    </div>
                    <p className="text-gray-600">Ağır makine ve ekipman taşıma hizmetleri</p>
                  </div>

                  <div className="p-6 border-2 border-gray-200 rounded-xl relative">
                    <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Yakında
                    </div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Lowbed Taşıma</h3>
                    </div>
                    <p className="text-gray-600">Özel lowbed araçlarla ağır nakliyat</p>
                  </div>

                  <div className="p-6 border-2 border-gray-200 rounded-xl relative">
                    <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Yakında
                    </div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Konteyner Taşıma</h3>
                    </div>
                    <p className="text-gray-600">Konteyner taşıma ve lojistik hizmetleri</p>
                  </div>

                  <div className="p-6 border-2 border-gray-200 rounded-xl relative">
                    <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Yakında
                    </div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Soğuk Zincir</h3>
                    </div>
                    <p className="text-gray-600">Soğuk zincir taşıma hizmetleri</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleContinueToStep2}
                    disabled={!selectedService}
                    className={`px-8 py-4 rounded-lg text-white text-lg font-semibold transition-colors ${
                      selectedService 
                        ? 'bg-orange-500 hover:bg-orange-600' 
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Devam Et
                  </button>
                </div>
              </>
            )}
            
            {modalStep === 1 && (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Taşıma Detayları</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">Adım</span>
                      <span className="text-lg font-bold text-orange-500">2/5</span>
                    </div>
                    <button 
                      onClick={handleCloseModal}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="mb-8">
                  <div className="p-4 bg-gray-50 rounded-lg mb-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Rota Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="flex items-start">
                          <div className="mt-1 mr-2">
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                              </svg>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alış Adresi</label>
                            <p className="text-gray-800">{pickupAddress || "Seçilmedi"}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-start">
                          <div className="mt-1 mr-2">
                            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                              </svg>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teslimat Adresi</label>
                            <p className="text-gray-800">{deliveryAddress || "Seçilmedi"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-sm">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-gray-700 font-medium">Mesafe:</span>
                        <span className="text-gray-900 ml-2">{distance || "Hesaplanıyor..."}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-700 font-medium">Tahmini Süre:</span>
                        <span className="text-gray-900 ml-2">{duration || "Hesaplanıyor..."}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Seçilen Taşıma Türü: {selectedService}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ağırlık (kg)</label>
                        <input
                          type="number"
                          name="weight"
                          value={contentDetails.weight}
                          onChange={handleContentChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Örn: 100"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hacim (m³)</label>
                        <input
                          type="number"
                          name="volume"
                          value={contentDetails.volume}
                          onChange={handleContentChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Örn: 2.5"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adet</label>
                        <input
                          type="number"
                          name="pieces"
                          value={contentDetails.pieces}
                          onChange={handleContentChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Örn: 5"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Özel Notlar</label>
                        <input
                          type="text"
                          name="specialNotes"
                          value={contentDetails.specialNotes}
                          onChange={handleContentChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Örn: Kırılgan, Soğuk zincir"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                      <textarea
                        name="description"
                        value={contentDetails.description}
                        onChange={handleContentChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Taşınacak eşyalar hakkında detaylı bilgi veriniz"
                      ></textarea>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Görsel Yükleme</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-600">Görselleri yüklemek için tıklayın veya sürükleyin</span>
                        <span className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG (max. 5MB)</span>
                      </label>
                    </div>
                    
                    {uploadedImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img src={image} alt={`Yüklenen görsel ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                            <button
                              onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== index))}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setModalStep(0)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-base font-medium"
                  >
                    Geri
                  </button>
                  <button
                    onClick={() => setModalStep(2)}
                    className="px-8 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-lg font-semibold"
                  >
                    Devam Et
                  </button>
                </div>
              </>
            )}
            
            {modalStep === 2 && (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Taşıma Özeti</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">Adım</span>
                      <span className="text-lg font-bold text-orange-500">3/5</span>
                    </div>
                    <button 
                      onClick={handleCloseModal}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="mb-8">
                  {/* Rota Bilgileri */}
                  <div className="bg-white rounded-lg shadow-md p-5 mb-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Rota Bilgileri</h3>
                    <div className="space-y-3">
                      <div className="flex">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white mr-3 flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Alış Adresi</label>
                          <p className="text-gray-800">{pickupAddress}</p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white mr-3 flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Teslimat Adresi</label>
                          <p className="text-gray-800">{deliveryAddress}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between px-2 mt-4 text-sm">
                        <div className="flex items-center">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mr-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <span>Mesafe: <strong>{distance}</strong></span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mr-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span>Tahmini Süre: <strong>{duration}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Yük Bilgileri */}
                  <div className="bg-white rounded-lg shadow-md p-5 mb-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Yük Bilgileri</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Taşıma Türü</label>
                        <p className="text-gray-800">{selectedService}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Ağırlık</label>
                        <p className="text-gray-800">{contentDetails.weight ? `${contentDetails.weight} kg` : "-"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Hacim</label>
                        <p className="text-gray-800">{contentDetails.volume ? `${contentDetails.volume} m³` : "-"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Adet</label>
                        <p className="text-gray-800">{contentDetails.pieces || "-"}</p>
                      </div>
                    </div>
                    
                    {contentDetails.specialNotes && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-500">Özel Notlar</label>
                        <p className="text-gray-800">{contentDetails.specialNotes}</p>
                      </div>
                    )}
                    
                    {contentDetails.description && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Açıklama</label>
                        <p className="text-gray-800">{contentDetails.description}</p>
                      </div>
                    )}
                    
                    {uploadedImages.length > 0 && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-500 mb-2">Yüklenen Görseller ({uploadedImages.length})</label>
                        <div className="flex flex-wrap gap-2">
                          {uploadedImages.slice(0, 4).map((image, index) => (
                            <img 
                              key={index} 
                              src={image} 
                              alt={`Yüklenen görsel ${index + 1}`} 
                              className="w-16 h-16 object-cover rounded-md" 
                            />
                          ))}
                          {uploadedImages.length > 4 && (
                            <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                              <span className="text-sm text-gray-600">+{uploadedImages.length - 4}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Tahmini Fiyat */}
                  <div className="bg-white rounded-lg shadow-md p-5 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Tahmini Fiyat</h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Mesafe bazlı hesaplama</p>
                        <p className="text-gray-600">
                          <span className="text-xs">{distance} için yaklaşık fiyat</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-orange-500">
                          {/* Basit bir fiyat hesaplama: Mesafe x 2.5 TL (örnek) */}
                          {distance ? 
                            `₺${(parseFloat(distance.replace(/[^\d.]/g, '')) * 2.5).toFixed(2)}` : 
                            "Hesaplanıyor..."}
                        </p>
                        <p className="text-xs text-gray-500">*KDV dahil</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-orange-50 rounded-lg p-4 border border-orange-100">
                      <div className="flex items-start">
                        <div className="text-orange-500 mr-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-700">
                          Bu fiyat tahminidir. Kesin fiyat, taşıyıcı firma tarafından onaylandıktan sonra belirlenecektir. 
                          Yolculuk sırasında oluşabilecek ek ücretler (bekleme, otopark, vb.) fiyata dahil değildir.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => setModalStep(1)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-base font-medium"
                  >
                    Geri
                  </button>
                  <button
                    onClick={() => setModalStep(3)}
                    className="px-8 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-lg font-semibold"
                  >
                    Onayla ve Devam Et
                  </button>
                </div>
              </>
            )}
            
            {modalStep === 3 && (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">İletişim Bilgileri</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">Adım</span>
                      <span className="text-lg font-bold text-orange-500">4/5</span>
                    </div>
                    <button 
                      onClick={handleCloseModal}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="mb-8">
                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Telefon Numaranızı Doğrulayın</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Taşıyıcılarımızın sizinle iletişime geçebilmesi için telefon numaranızı girmeniz gerekiyor. 
                        Girdiğiniz numara üzerinden doğrulama kodu gönderilecektir.
                      </p>
                    </div>
                    
                    {!otpSent ? (
                      <div>
                        <div className="relative mb-6">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="text-gray-500">+90</span>
                          </div>
                          <input
                            type="tel"
                            value={formattedPhoneNumber}
                            onChange={handlePhoneChange}
                            placeholder="5XX XXX XXXX"
                            className="w-full pl-14 pr-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                            maxLength={12}
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (phoneNumber.length === 10) {
                              setOtpSent(true);
                            } else {
                              alert("Lütfen geçerli bir telefon numarası giriniz.");
                            }
                          }}
                          disabled={phoneNumber.length !== 10}
                          className={`w-full py-4 rounded-lg text-white text-lg font-semibold transition-colors ${
                            phoneNumber.length === 10 
                              ? 'bg-orange-500 hover:bg-orange-600' 
                              : 'bg-gray-300 cursor-not-allowed'
                          }`}
                        >
                          Doğrulama Kodu Gönder
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="text-center mb-4">
                          <p className="text-gray-600">
                            <span className="font-medium text-gray-800">+90 {formattedPhoneNumber}</span> numaralı telefona 
                            gönderilen 6 haneli doğrulama kodunu giriniz
                          </p>
                          <button 
                            className="text-orange-500 text-sm mt-1 hover:text-orange-600"
                            onClick={() => setOtpSent(false)}
                          >
                            Numarayı Değiştir
                          </button>
                        </div>
                        
                        <div className="mb-6">
                          <input
                            type="text"
                            value={otpCode}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              if (val.length <= 6) {
                                setOtpCode(val);
                              }
                            }}
                            placeholder="6 haneli kod"
                            className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg text-center tracking-widest"
                            maxLength={6}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center mb-6">
                          <div className="text-sm text-gray-500">
                            <span>Kod gelmedi mi?</span>
                            <button className="text-orange-500 ml-1 hover:text-orange-600">
                              Tekrar Gönder
                            </button>
                          </div>
                          <div className="text-sm text-gray-600">
                            Kalan süre: <span className="font-medium">02:59</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            if (otpCode.length === 6) {
                              setModalStep(4);
                            } else {
                              alert("Lütfen 6 haneli doğrulama kodunu giriniz.");
                            }
                          }}
                          disabled={otpCode.length !== 6}
                          className={`w-full py-4 rounded-lg text-white text-lg font-semibold transition-colors ${
                            otpCode.length === 6 
                              ? 'bg-orange-500 hover:bg-orange-600' 
                              : 'bg-gray-300 cursor-not-allowed'
                          }`}
                        >
                          Doğrula ve Devam Et
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              
                <div className="flex justify-between">
                  <button
                    onClick={() => setModalStep(2)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-base font-medium"
                  >
                    Geri
                  </button>
                </div>
              </>
            )}
            
            {modalStep === 4 && (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">En Uygun Taşıyıcılar Aranıyor</h2>
                  <button 
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="mb-8 relative">
                    <div className="w-24 h-24 border-t-4 border-orange-500 border-solid rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Taşıyıcılar Taranıyor</h3>
                  <p className="text-gray-600 text-center max-w-md mb-8">
                    Sistemimiz bölgenizdeki kayıtlı taşıyıcılar arasında taşıma talebi için en uygun taşıyıcıyı arıyor.
                    Bu işlem birkaç dakika sürebilir.
                  </p>
                  
                  <div className="w-full max-w-md bg-orange-50 rounded-lg p-4 border border-orange-100 mb-8">
                    <div className="flex">
                      <div className="text-orange-500 mr-3 flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">
                          İlk uygun taşıyıcı bulunduğunda bilgilendirileceksiniz. Lütfen bu ekranı kapatmayın.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-base font-medium"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={() => setModalStep(5)}
                    className="px-8 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-lg font-semibold"
                  >
                    Test Devam Et
                  </button>
                </div>
              </>
            )}
            
            {modalStep === 5 && (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Taşıyıcılar Bulundu - Onay Bekleniyor</h2>
                  <button 
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                      <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Uygun Taşıyıcılar Bulundu!</h3>
                    <p className="text-gray-600 max-w-md">
                      Taşıma talebiniz için uygun taşıyıcılar bulundu. Taşıyıcıların talep onayı bekleniyor.
                    </p>
                  </div>
                  
                  <div className="w-full max-w-lg mb-8">
                    <div className="bg-white rounded-lg shadow-md p-5 border border-gray-100 mb-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-800">Ahmet Yılmaz Nakliyat</h4>
                          <div className="flex items-center">
                            <div className="flex items-center mr-2">
                              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-500">(4.8, 120 değerlendirme)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            <span>Tahmini Fiyat: <strong>₺750.00</strong></span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Tahmini Varış: <strong>1 Saat</strong></span>
                          </div>
                        </div>
                        <div className="flex items-center justify-center text-orange-500 animate-pulse">
                          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">Onay Bekleniyor</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-5 border border-gray-100">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-800">Hızlı Lojistik A.Ş.</h4>
                          <div className="flex items-center">
                            <div className="flex items-center mr-2">
                              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-500">(4.1, 85 değerlendirme)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            <span>Tahmini Fiyat: <strong>₺820.00</strong></span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Tahmini Varış: <strong>45 Dakika</strong></span>
                          </div>
                        </div>
                        <div className="flex items-center justify-center text-orange-500 animate-pulse">
                          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">Onay Bekleniyor</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full max-w-lg bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex">
                      <div className="text-blue-500 mr-3 flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">
                          Taşıyıcılardan biri talebi onayladığında bilgilendirileceksiniz. Taşıyıcıların onayı 5-10 dakika içinde beklenmektedir.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => setModalStep(4)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-base font-medium"
                  >
                    Geri
                  </button>
                  <button
                    onClick={() => setModalStep(6)}
                    className="px-8 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-lg font-semibold"
                  >
                    Test Kabul Et
                  </button>
                </div>
              </>
            )}
            
            {modalStep === 6 && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Ödeme İşlemi</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">Adım</span>
                      <span className="text-lg font-bold text-orange-500">5/5</span>
                    </div>
                    <button 
                      onClick={handleCloseModal}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Taşıma Özeti</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex items-start mb-4">
                        <div className="mt-1 mr-3 flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Alım Adresi</p>
                          <p className="text-base text-gray-800">{pickupAddress}</p>
                        </div>
                      </div>
                      <div className="flex items-start mb-4">
                        <div className="mt-1 mr-3 flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Teslimat Adresi</p>
                          <p className="text-base text-gray-800">{deliveryAddress}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-start mb-4">
                        <div className="mt-1 mr-3 flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Taşıma Türü</p>
                          <p className="text-base text-gray-800">{selectedService || "Express Taşıma"}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="mt-1 mr-3 flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Taşıyıcı</p>
                          <p className="text-base text-gray-800">Ahmet Yılmaz Nakliyat</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-base text-gray-700">
                      <span>Taşıma Ücreti</span>
                      <span>₺700.00</span>
                    </div>
                    <div className="flex justify-between text-base text-gray-700">
                      <span>Hizmet Bedeli</span>
                      <span>₺50.00</span>
                    </div>
                    <div className="flex justify-between text-base text-gray-700">
                      <span>KDV (%18)</span>
                      <span>₺135.00</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between text-lg font-medium text-gray-900">
                        <span>Toplam</span>
                        <span>₺885.00</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Ödeme Detayları</h3>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-1">Kart Üzerindeki İsim</label>
                        <input
                          type="text"
                          id="cardHolder"
                          placeholder="Kart sahibinin adı soyadı"
                          className="w-full px-4 py-3 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Kart Numarası</label>
                        <div className="relative">
                          <input
                            type="text"
                            id="cardNumber"
                            placeholder="•••• •••• •••• ••••"
                            className="w-full px-4 py-3 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                          />
                          <div className="absolute right-3 top-3 flex space-x-1">
                            <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M2 10V14C2 14.5523 2.44772 15 3 15H21C21.5523 15 22 14.5523 22 14V10C22 9.44772 21.5523 9 21 9H3C2.44772 9 2 9.44772 2 10Z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">Son Kullanma Tarihi</label>
                        <input
                          type="text"
                          id="expiryDate"
                          placeholder="AA/YY"
                          className="w-full px-4 py-3 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                        <input
                          type="text"
                          id="cvv"
                          placeholder="•••"
                          className="w-full px-4 py-3 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center">
                        <input
                          id="saveCard"
                          name="saveCard"
                          type="checkbox"
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label htmlFor="saveCard" className="ml-2 block text-sm text-gray-700">
                          Kart bilgilerimi kaydet
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => setModalStep(5)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-base font-medium"
                  >
                    Geri
                  </button>
                  <button
                    onClick={handlePaymentComplete}
                    className="px-8 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-lg font-semibold"
                  >
                    Ödemeyi Tamamla
                  </button>
                </div>
              </>
            )}
            
            {modalStep === 7 && (
              <>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-bold text-gray-900">Taşıma Randevunuz Oluşturuldu</h2>
                  <button 
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="overflow-y-auto max-h-[65vh]">
                  <div className="flex flex-col items-center justify-center py-2 mb-3">
                    <div className="relative inline-block mb-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="absolute -top-1 -right-1 bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Ödeme Başarılı!</h3>
                    <p className="text-gray-600 text-center text-sm max-w-md mb-4">
                      Taşıma randevunuz başarıyla oluşturuldu. Taşıyıcı en kısa sürede size ulaşacak.
                    </p>
                    
                    <div className="w-full bg-white rounded-lg shadow-sm p-3 border border-gray-100 mb-3">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Taşıma Bilgileri</p>
                      
                      <div className="space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-start">
                            <div className="mr-1.5 flex-shrink-0">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Randevu Kodu</p>
                              <p className="font-semibold text-gray-800">TS-24061894</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="mr-1.5 flex-shrink-0">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Taşıma Tarihi</p>
                              <p className="font-semibold text-gray-800">27.06.2023, 14:30</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-start mb-1.5">
                            <div className="mr-1.5 flex-shrink-0">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Alım Adresi</p>
                              <p className="text-gray-800">{pickupAddress}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="mr-1.5 flex-shrink-0">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Teslimat Adresi</p>
                              <p className="text-gray-800">{deliveryAddress}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 pt-1.5">
                          <div className="flex items-start">
                            <div className="mr-1.5 flex-shrink-0">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Ödeme</p>
                              <p className="font-semibold text-gray-800">₺885 <span className="text-green-500 text-xxs font-normal">(Ödendi)</span></p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="mr-1.5 flex-shrink-0">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Taşıyıcı</p>
                              <p className="text-gray-800">Ahmet Yılmaz Nakliyat</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-orange-50 rounded-lg p-3 border border-orange-100 mb-3">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Sonraki Adımlar</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                            <span className="text-orange-600 font-medium text-xs">1</span>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">Taşıyıcı Hazırlığı</p>
                            <p className="text-xs text-gray-600">Taşıyıcı belirtilen saatte alım adresine gelecek.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                            <span className="text-orange-600 font-medium text-xs">2</span>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">Bildirimler</p>
                            <p className="text-xs text-gray-600">Taşıma süreci boyunca SMS ve e-posta yoluyla bilgilendirileceksiniz.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                            <span className="text-orange-600 font-medium text-xs">3</span>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">Teslimat</p>
                            <p className="text-xs text-gray-600">Yükünüz teslimat adresine ulaştığında işlem tamamlanacak.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-blue-50 rounded-lg p-2 border border-blue-100 mb-3">
                      <div className="flex">
                        <div className="text-blue-500 mr-1.5 flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-700">
                            Sorularınız için 0850 123 45 67 numaralı telefondan müşteri hizmetlerimize ulaşabilirsiniz.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-2 mt-1">
                  <button
                    onClick={() => window.location.href = '/portal/siparislerim'}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs font-medium flex items-center justify-center sm:flex-1"
                  >
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Taşımalarım
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium sm:flex-1"
                  >
                    Ana Sayfaya Dön
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
} 
