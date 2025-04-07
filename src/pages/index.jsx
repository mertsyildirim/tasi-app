'use client'

import React, { useState, useEffect } from 'react'
import { FaTruck, FaBoxOpen, FaMapMarkedAlt, FaShieldAlt, FaClock, FaHandshake, FaLocationArrow, FaBuilding, FaHome, FaWarehouse, FaSpinner, FaPallet, FaBox, FaImage, FaTrash, FaMapMarkerAlt, FaCheck, FaStar, FaPhone, FaInfoCircle, FaCheckCircle, FaEnvelope, FaMapPin, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api'
import Script from 'next/script'
import Link from 'next/link'

// API anahtarını doğrudan tanımlayalım
const GOOGLE_MAPS_API_KEY = "AIzaSyAKht3SqaVJpufUdq-vVQEfBEQKejT9Z8k";

export default function MusteriSayfasi() {
  const [pickupAddress, setPickupAddress] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [pickupLocation, setPickupLocation] = useState(null)
  const [deliveryLocation, setDeliveryLocation] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedTransportType, setSelectedTransportType] = useState('')
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [showSearchingModal, setShowSearchingModal] = useState(false)
  const [showCarrierAcceptedModal, setShowCarrierAcceptedModal] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [directions, setDirections] = useState(null)
  const [map, setMap] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [mapError, setMapError] = useState(null)

  // Google Maps yükleme işlemi
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  })

  const [searchBoxPickup, setSearchBoxPickup] = useState(null)
  const [searchBoxDelivery, setSearchBoxDelivery] = useState(null)

  useEffect(() => {
    if (isLoaded && window.google) {
      // Alım adresi için autocomplete
      const pickupInput = document.getElementById('pickup-input')
      const pickupAutocomplete = new window.google.maps.places.Autocomplete(pickupInput, {
        componentRestrictions: { country: 'tr' },
        fields: ['formatted_address', 'geometry']
      })

      // Teslimat adresi için autocomplete
      const deliveryInput = document.getElementById('delivery-input')
      const deliveryAutocomplete = new window.google.maps.places.Autocomplete(deliveryInput, {
        componentRestrictions: { country: 'tr' },
        fields: ['formatted_address', 'geometry']
      })

      // Alım adresi seçildiğinde
      pickupAutocomplete.addListener('place_changed', () => {
        const place = pickupAutocomplete.getPlace()
        if (!place.geometry) return

        setPickupAddress(place.formatted_address)
        setPickupLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        })

        // Eğer her iki konum da seçiliyse rotayı çiz
        if (deliveryLocation) {
          drawRoute(
            { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() },
            deliveryLocation
          )
        }
      })

      // Teslimat adresi seçildiğinde
      deliveryAutocomplete.addListener('place_changed', () => {
        const place = deliveryAutocomplete.getPlace()
        if (!place.geometry) return

        setDeliveryAddress(place.formatted_address)
        setDeliveryLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        })

        // Eğer her iki konum da seçiliyse rotayı çiz
        if (pickupLocation) {
          drawRoute(
            pickupLocation,
            { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
          )
        }
      })
    }
  }, [isLoaded])

  const drawRoute = (origin, destination) => {
    if (!isLoaded || !map) return

    const directionsService = new window.google.maps.DirectionsService()

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result)
        } else {
          console.error(`Rota bulunamadı: ${status}`)
          setMapError(`Rota bulunamadı: ${status}`)
        }
      }
    )
  }

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
  }

  const handleDeliveryInputChange = (e) => {
    setDeliveryAddress(e.target.value)
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

  const handleFindCarrier = () => {
    setShowPhoneModal(true)
  }

  const handleTransportTypeSelect = (type) => {
    setSelectedTransportType(type)
    setShowModal(false)
    setShowSummaryModal(true)
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col">
      {/* Google Maps API'yi doğrudan ekleyelim */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="beforeInteractive"
      />
      
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
            <div className={`${isMobile ? "order-2" : ""} md:col-span-1 space-y-4`}>
              <h2 className="text-2xl font-bold mb-6">Rotanızı Belirleyin & Rezervasyon Yaptırın</h2>
              
              <div>
                <label className="block text-gray-700 mb-2">Alım Adresi</label>
                <div className="relative">
                  <input 
                    id="pickup-input"
                    type="text" 
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Alım adresini girin"
                  />
                  <button 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-orange-500"
                  >
                    <FaMapMarkerAlt />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Teslimat Adresi</label>
                <div className="relative">
                  <input 
                    id="delivery-input"
                    type="text" 
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Teslimat adresini girin"
                  />
                  <button 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-orange-500"
                  >
                    <FaMapMarkerAlt />
                  </button>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Rota Bilgisi</h3>
                <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex justify-between'}`}>
                  <div>
                    <span className="text-gray-600 block">Mesafe</span>
                    <span className="font-bold">10.5 km</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block">Süre</span>
                    <span className="font-bold">25 dk</span>
                  </div>
                  <button
                    className={`bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition ${isMobile ? 'w-full mt-2' : ''}`}
                    onClick={() => setShowModal(true)}
                  >
                    Devam Et
                  </button>
                </div>
              </div>
            </div>
            
            <div className={`${isMobile ? "order-1 mb-4" : ""} md:col-span-2 h-[400px] md:h-[400px] relative`}>
              {mapError && (
                <div className="h-[250px] md:h-[400px] w-full relative bg-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <FaInfoCircle className="mx-auto mb-2 text-3xl text-red-500" />
                    <p>Harita yüklenirken bir sorun oluştu.</p>
                    <p className="text-xs mt-2">Hata: {mapError}</p>
                  </div>
                </div>
              )}
              {!mapError && isLoaded ? (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={pickupLocation || center}
                  zoom={12}
                  onLoad={onLoad}
                  onUnmount={onUnmount}
                >
                  {directions ? (
                    <DirectionsRenderer directions={directions} />
                  ) : (
                    <>
                      {pickupLocation && (
                        <Marker 
                          position={pickupLocation}
                          icon={{
                            url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                          }}
                        />
                      )}
                      {deliveryLocation && (
                        <Marker 
                          position={deliveryLocation}
                          icon={{
                            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                          }}
                        />
                      )}
                    </>
                  )}
                </GoogleMap>
              ) : (!mapError && !isLoaded) ? (
                <div className={`h-[250px] md:h-[400px] w-full relative bg-gray-200 flex items-center justify-center`}>
                  <div className="text-center text-gray-600">
                    <FaSpinner className="mx-auto mb-2 text-3xl text-orange-500 animate-spin" />
                    <p>Harita yükleniyor...</p>
                  </div>
                </div>
              ) : null}
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
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-md w-full mx-4 md:mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-4">Telefon Numaranız</h2>
            <p className="text-gray-600 mb-4">Taşıyıcı araması için telefon numaranızı girin.</p>
            
            <div className="flex items-center mb-4">
              <span className="bg-gray-100 p-3 rounded-l-lg border border-r-0 border-gray-300">+90</span>
              <input
                type="text"
                value={formattedPhoneNumber}
                onChange={handlePhoneChange}
                className="flex-1 p-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="5XX XXX XX XX"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => setShowPhoneModal(false)}
              >
                İptal
              </button>
              <button
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                onClick={handlePhoneSubmit}
                disabled={phoneNumber.length !== 10}
              >
                Devam Et
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-md w-full mx-4 md:mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-4">Doğrulama Kodu</h2>
            <p className="text-gray-600 mb-4">{`+90 ${formattedPhoneNumber} numarasına gönderilen 6 haneli kodu girin.`}</p>
            
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-center text-2xl tracking-wider"
              placeholder="· · · · · ·"
              maxLength={6}
            />
            
            <div className="mt-4 flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => setShowOTPModal(false)}
              >
                İptal
              </button>
              <button
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                onClick={handleOTPSubmit}
                disabled={otpCode.length !== 6}
              >
                Doğrula
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showSearchingModal && (
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
      
      {showSummaryModal && selectedTransportType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-2xl w-full mx-4 md:mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-4">Taşıma Özeti</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border-b pb-4 md:border-b-0 md:pb-0 md:border-r md:pr-4">
                <h3 className="font-semibold text-lg">Rota Bilgisi</h3>
                <p className="text-gray-600">
                  <span className="font-medium">Alım:</span> {pickupAddress || "İstanbul, Kadıköy"}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Teslimat:</span> {deliveryAddress || "İstanbul, Beşiktaş"}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Mesafe:</span> 10.5 km
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Süre:</span> 25 dk
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">Taşıma Türü</h3>
                <p className="text-gray-600">
                  <span className="font-medium">Hizmet:</span> {selectedTransportType}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Sigorta:</span> Opsiyonel
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:justify-end space-y-2 md:space-y-0 space-x-0 md:space-x-3">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                onClick={() => setShowSummaryModal(false)}
              >
                İptal
              </button>
              <button
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                onClick={handleFindCarrier}
              >
                Taşıyıcı Bul
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
} 