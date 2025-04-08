'use client'

import React, { useState, useEffect } from 'react'
import { FaTruck, FaBoxOpen, FaMapMarkedAlt, FaShieldAlt, FaClock, FaHandshake, FaLocationArrow, FaBuilding, FaHome, FaWarehouse, FaSpinner, FaPallet, FaBox, FaImage, FaTrash, FaMapMarkerAlt, FaCheck, FaStar, FaPhone, FaInfoCircle, FaCheckCircle, FaEnvelope, FaMapPin, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaSnowflake, FaBolt, FaTools, FaLock } from 'react-icons/fa'
import { GoogleMap, useLoadScript, Marker, DirectionsRenderer, Autocomplete } from '@react-google-maps/api'
import Link from 'next/link'

const libraries = ["places"];

// API anahtarını doğrudan tanımlayalım
const GOOGLE_MAPS_API_KEY = "AIzaSyAKht3SqaVJpufUdq-vVQEfBEQKejT9Z8k";

// Step Bar Component
const StepBar = ({ currentStep }) => (
  <div className="mb-8">
    <div className="flex justify-between items-center relative">
      <div className="absolute top-4 left-[10%] right-[10%] flex z-0">
        <div className={`h-0.5 flex-1 mx-4 ${currentStep > 0 ? 'bg-orange-500' : 'bg-gray-200'}`} />
        <div className={`h-0.5 flex-1 mx-4 ${currentStep > 1 ? 'bg-orange-500' : 'bg-gray-200'}`} />
        <div className={`h-0.5 flex-1 mx-4 ${currentStep > 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
        <div className={`h-0.5 flex-1 mx-4 ${currentStep > 3 ? 'bg-orange-500' : 'bg-gray-200'}`} />
      </div>
      
      <div className="flex justify-between items-center w-full relative z-10">
        {['Taşıma Türü', 'Taşıma Detayları', 'İletişim', 'Taşıyıcı', 'Ödeme'].map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white ${
              index <= currentStep ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {index + 1}
            </div>
            <div className="text-xs mt-2 font-medium text-center whitespace-nowrap">
              {step}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

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
    setSelectedTransportType(type)
    setShowModal(false)
    setCurrentStep(1)
    setTimeout(() => {
      setShowSummaryModal(true)
    }, 200)
  }

  const handleFindCarrier = () => {
    setShowPhoneModal(true)
    setShowSummaryModal(false)
    setCurrentStep(2)
  }

  const handleBackToSummary = () => {
    setShowPhoneModal(false)
    setOtpSent(false)
    setOtpCode('')
    setCurrentStep(1)
    setTimeout(() => {
      setShowSummaryModal(true)
    }, 200)
  }

  const handleBackToTransportType = () => {
    setShowSummaryModal(false)
    setCurrentStep(0)
    setTimeout(() => {
      setShowModal(true)
    }, 200)
  }

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
    setShowPaymentModal(false)
    setShowPaymentSuccessModal(true)
  }

  // Modal açılışlarında currentStep'i sıfırla
  useEffect(() => {
    if (showModal) {
      setCurrentStep(0)
    }
  }, [showModal])

  return (
    <main className={`min-h-screen bg-gray-100 flex flex-col ${showModal || showSummaryModal || showPhoneModal ? 'modal-blur' : ''}`}>
      <div className="flex-grow">
        {/* Navigation */}
        <nav className="bg-white shadow-md py-4">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-orange-600">Taşı.app</h1>
            <div className="hidden md:flex space-x-6 items-center">
              <a href="#services" className="text-gray-600 hover:text-orange-600 transition">Hizmetlerimiz</a>
              <a href="#features" className="text-gray-600 hover:text-orange-600 transition">Neden Biz?</a>
              <a href="#" className="text-gray-600 hover:text-orange-600 transition">İletişim</a>
              <Link href="/kullanici" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition">Müşteri Girişi</Link>
              <Link href="/tasiyici" className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-200 transition">Taşıyıcı Girişi</Link>
            </div>
            <div className="block md:hidden">
              <button className="text-orange-600 p-2 focus:outline-none">
                ☰
              </button>
            </div>
          </div>
        </nav>
        
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Taşıma İşleriniz için Tek Adres</h1>
                <p className="text-xl mb-6">Yükünüzü güvenle taşıyoruz. Hemen taşıyıcı bulun ve anında fiyat alın.</p>
                <button 
                  className="bg-white text-orange-600 font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
                >
                  Hizmetlerimizi Keşfedin
                </button>
              </div>
              <div className="md:w-1/2 flex justify-center md:justify-end">
                <img src="/hero-image.png" alt="Taşıma Hizmeti" className="max-h-80" />
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
                    onClick={() => {
                      if (pickupPlace && deliveryPlace) {
                        setShowModal(true);
                        // Haritayı mevcut konumunda tut
                        const currentCenter = map?.getCenter();
                        const currentZoom = map?.getZoom();
                        setTimeout(() => {
                          map?.setCenter(currentCenter);
                          map?.setZoom(currentZoom);
                        }, 100);
                      }
                    }}
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
        <div id="services" className="container mx-auto px-4 py-8 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Hizmetlerimiz</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-orange-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <FaWarehouse className="text-orange-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">Depo Taşıma</h3>
              <p className="text-gray-600">Depo ve antrepo taşıma hizmetlerimizle büyük hacimli eşyalarınızı güvenle taşıyoruz.</p>
              <button 
                className="mt-4 text-orange-500 font-semibold hover:text-orange-700 w-full md:w-auto"
                onClick={() => handleTransportTypeSelect('Depo Taşıma')}
              >
                Taşıyıcı Bul &rarr;
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-orange-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <FaPallet className="text-orange-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">Paletli Taşıma</h3>
              <p className="text-gray-600">Paletlenmiş ürünlerinizi özenle taşıyor, lojistik sürecinizi kolaylaştırıyoruz.</p>
              <button 
                className="mt-4 text-orange-500 font-semibold hover:text-orange-700 w-full md:w-auto"
                onClick={() => handleTransportTypeSelect('Paletli Taşıma')}
              >
                Taşıyıcı Bul &rarr;
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-orange-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <FaBox className="text-orange-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">Koli Taşıma</h3>
              <p className="text-gray-600">Küçük ve orta boy kolilerinizin teslimatını hızlı ve güvenli bir şekilde gerçekleştiriyoruz.</p>
              <button 
                className="mt-4 text-orange-500 font-semibold hover:text-orange-700 w-full md:w-auto"
                onClick={() => handleTransportTypeSelect('Koli Taşıma')}
              >
                Taşıyıcı Bul &rarr;
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-orange-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <FaTruck className="text-orange-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">Parsiyel Taşıma</h3>
              <p className="text-gray-600">Farklı müşterilerin yüklerini aynı araçta taşıyarak ekonomik çözümler sunuyoruz.</p>
              <button 
                className="mt-4 text-orange-500 font-semibold hover:text-orange-700 w-full md:w-auto"
                onClick={() => handleTransportTypeSelect('Parsiyel Taşıma')}
              >
                Taşıyıcı Bul &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-50 py-10 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Neden Bizi Tercih Etmelisiniz?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="bg-orange-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <FaShieldAlt className="text-orange-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-2">Güvenli Taşıma</h3>
                <p className="text-gray-600">Eşyalarınız sigortalı olarak taşınır, herhangi bir hasar durumunda tam koruma sağlıyoruz.</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="bg-orange-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <FaClock className="text-orange-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-2">Hızlı Teslimat</h3>
                <p className="text-gray-600">Zamanında teslimat garantisi ile yüklerinizi belirlenen sürede yerine ulaştırıyoruz.</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="bg-orange-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <FaHandshake className="text-orange-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-2">Profesyonel Ekip</h3>
                <p className="text-gray-600">Deneyimli personelimiz ile taşıma sürecinin her aşamasında profesyonel hizmet sunuyoruz.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 md:py-10 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Taşı.app</h3>
              <p className="text-gray-400 mb-4">Türkiye'nin lider lojistik ve taşımacılık platformu. Güvenli ve hızlı taşıma hizmetleri için bizi tercih edin.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition"><FaFacebook size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><FaTwitter size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><FaInstagram size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><FaLinkedin size={20} /></a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Hizmetlerimiz</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Depo Taşıma</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Paletli Taşıma</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Koli Taşıma</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Parsiyel Taşıma</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Evden Eve Nakliyat</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Şirket</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Hakkımızda</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Kariyer</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Gizlilik Politikası</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Kullanım Şartları</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">İletişim</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <FaMapPin className="mr-2 text-orange-500" />
                  <span className="text-gray-400">İstanbul, Türkiye</span>
                </li>
                <li className="flex items-center">
                  <FaPhone className="mr-2 text-orange-500" />
                  <span className="text-gray-400">+90 (212) 123 45 67</span>
                </li>
                <li className="flex items-center">
                  <FaEnvelope className="mr-2 text-orange-500" />
                  <span className="text-gray-400">info@tasi.app</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} Taşı.app. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto relative">
              <StepBar currentStep={currentStep} />
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Taşıma Türünü Seçin</h2>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">Yükünüze en uygun taşıma türünü seçin. Her türlü taşıma ihtiyacınız için özel çözümler sunuyoruz.</p>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    id: 'express',
                    title: 'Express Taşıma',
                    icon: <FaBolt />,
                    description: 'Acil gönderileriniz için hızlı ve öncelikli taşıma hizmeti.',
                    soon: false
                  },
                  {
                    id: 'kurye',
                    title: 'Kurye Hizmeti',
                    icon: <FaBox />,
                    description: 'Hızlı ve güvenli kurye hizmetleri ile küçük paketlerinizi aynı gün teslim ediyoruz.',
                    soon: false
                  },
                  {
                    id: 'koli',
                    title: 'Koli Taşıma',
                    icon: <FaBoxOpen />,
                    description: 'Küçük ve orta boy kolileriniz için güvenli taşıma çözümleri.',
                    soon: false
                  },
                  {
                    id: 'palet',
                    title: 'Paletli Taşıma',
                    icon: <FaPallet />,
                    description: 'Paletlenmiş ürünleriniz için profesyonel taşıma hizmeti.',
                    soon: false
                  },
                  {
                    id: 'parsiyel',
                    title: 'Parsiyel Taşıma',
                    icon: <FaTruck />,
                    description: 'Farklı müşterilerin yüklerini aynı araçta taşıyarak ekonomik çözümler.',
                    soon: false
                  },
                  {
                    id: 'makine',
                    title: 'Makine Taşıma',
                    icon: <FaTools />,
                    description: 'Ağır makineler için özel ekipmanlarla güvenli taşıma hizmeti.',
                    soon: true
                  },
                  {
                    id: 'lowbed',
                    title: 'Lowbed Taşıma',
                    icon: <FaTruck />,
                    description: 'Ağır ve büyük yükler için lowbed ile özel taşıma çözümleri.',
                    soon: true
                  },
                  {
                    id: 'konteyner',
                    title: 'Konteyner Taşıma',
                    icon: <FaShieldAlt />,
                    description: 'Uluslararası konteyner taşımacılığı ve gümrük hizmetleri.',
                    soon: true
                  },
                  {
                    id: 'sogukzincir',
                    title: 'Soğuk Zincir',
                    icon: <FaSnowflake />,
                    description: 'Sıcaklık kontrollü taşıma gerektiren ürünler için özel çözümler.',
                    soon: true
                  }
                ].map((service) => (
                  <div 
                    key={service.id}
                    className={`p-6 border rounded-xl cursor-pointer transition-all group relative ${
                      selectedTransportType === service.title
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-500 hover:shadow-lg'
                    }`}
                    onClick={() => !service.soon && setSelectedTransportType(service.title)}
                  >
                    {service.soon && (
                      <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Yakında
                      </div>
                    )}
                    <div className="flex items-center mb-3">
                      <div className={`p-3 rounded-lg transition-colors ${
                        selectedTransportType === service.title
                          ? 'bg-orange-500'
                          : 'bg-orange-100 group-hover:bg-orange-500'
                      }`}>
                        <div className={`text-xl ${
                          selectedTransportType === service.title
                            ? 'text-white'
                            : 'text-orange-500 group-hover:text-white'
                        }`}>
                          {service.icon}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold ml-3">{service.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{service.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex justify-between items-center">
                <p className="text-sm text-gray-500">Özel taşıma ihtiyaçlarınız için bizimle iletişime geçebilirsiniz.</p>
                <button
                  className={`px-6 py-2 rounded-lg transition flex items-center ${
                    selectedTransportType
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (selectedTransportType) {
                      setShowModal(false);
                      setShowSummaryModal(true);
                    }
                  }}
                  disabled={!selectedTransportType}
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
                  onClick={() => setShowSummaryModal(false)}
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

              <div className="mt-8 flex justify-between items-center border-t pt-6">
                <button
                  className="px-6 py-2 text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50 transition flex items-center"
                  onClick={handleBackToTransportType}
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
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto relative modal-enter-active">
              <StepBar currentStep={currentStep} />

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">İletişim Bilgileri</h2>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => setShowPhoneModal(false)}
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sol Taraf - Telefon ve Kod Doğrulama */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Telefon Numarası</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <span className="bg-gray-100 p-3 rounded-l-lg border border-r-0 border-gray-300 text-gray-600">+90</span>
                        <input
                          type="text"
                          value={formattedPhoneNumber}
                          onChange={handlePhoneChange}
                          className="flex-1 p-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                <div className="space-y-6">
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">Neden Telefon Numarası?</h3>
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

              <div className="mt-8 flex justify-between items-center border-t pt-6">
                <button
                  className="px-6 py-2 text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50 transition flex items-center"
                  onClick={handleBackToSummary}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                onClick={() => setShowWaitingApprovalModal(false)}
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
                onClick={() => setShowCarrierDetailsModal(false)}
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
            {/* Step Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center relative">
                {['Taşıma Türü', 'Taşıma Detayları', 'İletişim', 'Taşıyıcı', 'Ödeme'].map((step, index) => (
                  <div key={index} className="flex flex-col items-center z-10 bg-white">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index <= currentStep ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="text-xs mt-2 font-medium text-center whitespace-nowrap">
                      {step}
                    </div>
                  </div>
                ))}
                {/* Çizgileri ayrı bir katmanda render et */}
                <div className="absolute top-4 left-0 right-0 flex justify-between z-0">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`h-0.5 w-full mx-4 ${
                        index < currentStep ? 'bg-orange-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Ödeme</h2>
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setShowPaymentModal(false)}
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
                          <img src="/visa.png" alt="Visa" className="h-6" />
                          <img src="/mastercard.png" alt="Mastercard" className="h-6" />
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
                  onClick={() => setShowPaymentSuccessModal(false)}
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .pac-container {
          z-index: 1000 !important;
          border-radius: 0.5rem;
          margin-top: 4px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .pac-item {
          padding: 8px 12px;
          cursor: pointer;
        }
        .pac-item:hover {
          background-color: #f3f4f6;
        }
        .pac-item-query {
          font-size: 14px;
        }
        @media (max-width: 768px) {
          .pac-container {
            width: calc(100% - 32px) !important;
            left: 16px !important;
          }
        }
        
        /* Blur effect when modal is open */
        .modal-blur > *:not(.fixed) {
          filter: blur(4px);
          transition: filter 0.2s ease-in-out;
          pointer-events: none;
        }

        /* Modal transition effects */
        .modal-enter {
          opacity: 0;
          transform: scale(0.95);
        }
        .modal-enter-active {
          opacity: 1;
          transform: scale(1);
          transition: opacity 200ms ease-out, transform 200ms ease-out;
        }
        .modal-exit {
          opacity: 1;
          transform: scale(1);
        }
        .modal-exit-active {
          opacity: 0;
          transform: scale(0.95);
          transition: opacity 200ms ease-in, transform 200ms ease-in;
        }

        @keyframes moveLeftRight {
          0% { transform: translateX(-50px); }
          50% { transform: translateX(50px); }
          100% { transform: translateX(-50px); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </main>
  )
} 