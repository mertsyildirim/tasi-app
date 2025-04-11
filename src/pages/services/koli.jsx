import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { 
  FaTruck, FaClock, FaMapMarkedAlt, FaBoxOpen, FaBox, 
  FaShieldAlt, FaArrowLeft, FaSpinner 
} from 'react-icons/fa'
import { 
  useLoadScript, 
  GoogleMap, 
  Marker, 
  Autocomplete, 
  DirectionsRenderer 
} from '@react-google-maps/api'

const libraries = ['places']
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

export default function KoliPage() {
  const router = useRouter()
  const [pickup, setPickup] = useState('')
  const [delivery, setDelivery] = useState('')
  const [pickupMarker, setPickupMarker] = useState(null)
  const [deliveryMarker, setDeliveryMarker] = useState(null)
  const [pickupAutocomplete, setPickupAutocomplete] = useState(null)
  const [deliveryAutocomplete, setDeliveryAutocomplete] = useState(null)
  const [directions, setDirections] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [pickupError, setPickupError] = useState('')
  const [deliveryError, setDeliveryError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [koliCount, setKoliCount] = useState(1)
  const [koliWeight, setKoliWeight] = useState(5)
  const [koliSize, setKoliSize] = useState('medium') // small, medium, large

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries,
    language: "tr",
    region: "TR"
  })

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  const containerStyle = {
    width: '100%',
    height: isMobile ? '300px' : '450px',
  }

  const center = {
    lat: 41.0082,
    lng: 28.9784 // İstanbul
  }

  const onLoad = map => {
    // Map yüklendikten sonra yapılacak işlemler
  }

  const onUnmount = map => {
    // Map bileşeni kaldırıldığında yapılacak işlemler
  }

  const onPickupLoad = autocomplete => {
    setPickupAutocomplete(autocomplete)
  }

  const onDeliveryLoad = autocomplete => {
    setDeliveryAutocomplete(autocomplete)
  }

  const onPickupPlaceChanged = () => {
    if (pickupAutocomplete) {
      const place = pickupAutocomplete.getPlace()
      if (place.geometry) {
        setPickup(place.formatted_address)
        setPickupMarker({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        })
        setPickupError('')

        // Eğer teslimat noktası da seçilmişse rota çiz
        if (deliveryMarker) {
          calculateRoute(
            { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() },
            deliveryMarker
          )
        }
      }
    }
  }

  const onDeliveryPlaceChanged = () => {
    if (deliveryAutocomplete) {
      const place = deliveryAutocomplete.getPlace()
      if (place.geometry) {
        setDelivery(place.formatted_address)
        setDeliveryMarker({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        })
        setDeliveryError('')

        // Eğer alış noktası da seçilmişse rota çiz
        if (pickupMarker) {
          calculateRoute(
            pickupMarker,
            { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
          )
        }
      }
    }
  }

  const calculateRoute = (origin, destination) => {
    if (!window.google) return

    const directionsService = new window.google.maps.DirectionsService()
    directionsService.route(
      {
        origin: new window.google.maps.LatLng(origin.lat, origin.lng),
        destination: new window.google.maps.LatLng(destination.lat, destination.lng),
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result)
          // Mesafe ve süre bilgisini al
          const route = result.routes[0].legs[0]
          setDistance(route.distance.text)
          setDuration(route.duration.text)
        } else {
          console.error(`Rota hesaplanamadı: ${status}`)
        }
      }
    )
  }

  const getKoliSizeLabel = () => {
    switch (koliSize) {
      case 'small':
        return 'Küçük Koli (30x30x30cm)'
      case 'medium':
        return 'Orta Boy Koli (50x40x30cm)'
      case 'large':
        return 'Büyük Koli (60x60x40cm)'
      default:
        return 'Orta Boy Koli (50x40x30cm)'
    }
  }

  const handleContinue = () => {
    let hasError = false

    if (!pickup) {
      setPickupError('Lütfen alış noktasını belirtin')
      hasError = true
    }

    if (!delivery) {
      setDeliveryError('Lütfen teslimat noktasını belirtin')
      hasError = true
    }

    if (!hasError) {
      setIsProcessing(true)
      // Taşıma bilgilerini sakla ve taşıyıcı bulma sayfasına yönlendir
      setTimeout(() => {
        localStorage.setItem('koliDelivery', JSON.stringify({
          pickup,
          delivery,
          distance,
          duration,
          koliCount,
          koliWeight,
          koliSize,
          type: 'Koli Taşıma'
        }))
        router.push('/tasiyici-bul')
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FaTruck className="text-orange-500 text-3xl" />
              <span className="ml-2 text-xl font-bold text-gray-800">Taşı_App</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-600 hover:text-orange-500">Ana Sayfa</a>
              <a href="/#services" className="text-gray-600 hover:text-orange-500">Hizmetler</a>
              <a href="/#about" className="text-gray-600 hover:text-orange-500">Hakkımızda</a>
              <a href="/#contact" className="text-gray-600 hover:text-orange-500">İletişim</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center text-gray-600 hover:text-orange-500"
          >
            <FaArrowLeft className="mr-2" />
            Ana Sayfaya Dön
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-orange-500 text-white p-6">
            <h1 className="text-3xl font-bold flex items-center">
              <FaBoxOpen className="mr-3" />
              Koli Taşıma
            </h1>
            <p className="mt-2">Küçük ve orta boy kolileriniz için güvenli taşıma çözümleri.</p>
          </div>

          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Taşıma Detayları</h2>
              <p className="text-gray-600 mb-4">
                Alış ve teslimat noktalarını seçerek koli taşıma hizmetimizden hemen yararlanmaya başlayın.
              </p>

              {loadError && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
                  Harita yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
                </div>
              )}

              {/* Koli Bilgileri */}
              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-700 mb-3">Koli Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Koli Adedi
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={koliCount}
                      onChange={(e) => setKoliCount(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ortalama Ağırlık (kg)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={koliWeight}
                      onChange={(e) => setKoliWeight(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <h3 className="text-base font-medium text-gray-700 mb-3">Koli Boyutu</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      koliSize === 'small' 
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                    onClick={() => setKoliSize('small')}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0 ${
                        koliSize === 'small' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                      }`}>
                        {koliSize === 'small' && (
                          <div className="w-3 h-3 bg-white rounded-full m-auto"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Küçük Koli</p>
                        <p className="text-sm text-gray-500">30x30x30cm</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      koliSize === 'medium' 
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                    onClick={() => setKoliSize('medium')}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0 ${
                        koliSize === 'medium' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                      }`}>
                        {koliSize === 'medium' && (
                          <div className="w-3 h-3 bg-white rounded-full m-auto"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Orta Boy Koli</p>
                        <p className="text-sm text-gray-500">50x40x30cm</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      koliSize === 'large' 
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                    onClick={() => setKoliSize('large')}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0 ${
                        koliSize === 'large' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                      }`}>
                        {koliSize === 'large' && (
                          <div className="w-3 h-3 bg-white rounded-full m-auto"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Büyük Koli</p>
                        <p className="text-sm text-gray-500">60x60x40cm</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Harita */}
              <div className="mb-6">
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={11}
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
                            strokeColor: '#f97316',
                            strokeWeight: 6,
                            strokeOpacity: 0.8,
                          },
                          suppressMarkers: true,
                        }}
                      />
                    )}
                  </GoogleMap>
                ) : (
                  <div className="w-full rounded-lg bg-gray-100 flex items-center justify-center" style={{ height: isMobile ? '300px' : '450px' }}>
                    <div className="text-center">
                      <FaSpinner className="animate-spin text-3xl text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Harita Yükleniyor...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Alış ve Teslimat Adresleri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alış Noktası
                  </label>
                  {isLoaded ? (
                    <Autocomplete onLoad={onPickupLoad} onPlaceChanged={onPickupPlaceChanged}>
                      <div>
                        <input
                          type="text"
                          value={pickup}
                          onChange={(e) => setPickup(e.target.value)}
                          placeholder="Alış adresini girin"
                          className={`w-full px-4 py-2 border ${pickupError ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                        />
                        {pickupError && <p className="mt-1 text-sm text-red-600">{pickupError}</p>}
                      </div>
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
                      <div>
                        <input
                          type="text"
                          value={delivery}
                          onChange={(e) => setDelivery(e.target.value)}
                          placeholder="Teslimat adresini girin"
                          className={`w-full px-4 py-2 border ${deliveryError ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                        />
                        {deliveryError && <p className="mt-1 text-sm text-red-600">{deliveryError}</p>}
                      </div>
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

              {/* Rota Bilgileri */}
              {distance && duration && (
                <div className="mb-8 p-4 bg-orange-50 border border-orange-100 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-800 mb-2">Rota Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-orange-600">Mesafe</p>
                      <p className="font-medium text-orange-900">{distance}</p>
                    </div>
                    <div>
                      <p className="text-sm text-orange-600">Tahmini Süre</p>
                      <p className="font-medium text-orange-900">{duration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-orange-600">Koli Adedi</p>
                      <p className="font-medium text-orange-900">{koliCount} adet</p>
                    </div>
                    <div>
                      <p className="text-sm text-orange-600">Koli Boyutu</p>
                      <p className="font-medium text-orange-900">{getKoliSizeLabel()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Hizmet Avantajları */}
              <div className="border-t pt-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">Koli Taşıma Avantajları</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start">
                    <div className="shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 rounded-md bg-orange-100 text-orange-600">
                        <FaBoxOpen />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium">Güvenli Paketleme</h4>
                      <p className="mt-1 text-sm text-gray-500">Kolileriniz özenle paketlenir ve korunur</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 rounded-md bg-orange-100 text-orange-600">
                        <FaMapMarkedAlt />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium">Kapıdan Kapıya</h4>
                      <p className="mt-1 text-sm text-gray-500">Kapıdan alım ve kapıya teslim hizmeti</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 rounded-md bg-orange-100 text-orange-600">
                        <FaShieldAlt />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium">Tam Sigorta</h4>
                      <p className="mt-1 text-sm text-gray-500">Tüm kolileriniz beyan değerinde sigortalanır</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Devam Butonu */}
              <div className="text-right">
                <button
                  onClick={handleContinue}
                  disabled={isProcessing || !pickupMarker || !deliveryMarker}
                  className={`px-8 py-3 rounded-lg text-white font-medium ${
                    isProcessing || !pickupMarker || !deliveryMarker
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <FaSpinner className="animate-spin mr-2" />
                      İşleniyor...
                    </span>
                  ) : (
                    "Taşıyıcı Bul"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 