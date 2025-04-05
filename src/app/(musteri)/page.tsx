'use client'

import { Libraries, LoadScript, Autocomplete } from '@react-google-maps/api'
import { useState, useRef, useEffect } from 'react'
import { FaTruck, FaBoxOpen, FaMapMarkedAlt, FaShieldAlt, FaClock, FaHandshake, FaLocationArrow, FaBuilding, FaHome, FaWarehouse, FaSpinner, FaPallet, FaBox, FaImage, FaTrash, FaMapMarkerAlt, FaCheck, FaStar, FaPhone, FaInfoCircle, FaCheckCircle } from 'react-icons/fa'
import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center bg-gray-100">
      <FaSpinner className="animate-spin text-orange-500 w-8 h-8" />
    </div>
  )
})

interface MapMarker {
  lat: number
  lng: number
  title?: string
}

interface RouteInfo {
  distance: string
  duration: string
}

export default function Home() {
  const [pickupAddress, setPickupAddress] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [isPickupSelecting, setIsPickupSelecting] = useState(false)
  const [isDeliverySelecting, setIsDeliverySelecting] = useState(false)
  const [pickupMarker, setPickupMarker] = useState<MapMarker | null>(null)
  const [deliveryMarker, setDeliveryMarker] = useState<MapMarker | null>(null)
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedTransportType, setSelectedTransportType] = useState('')
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [showSearchingModal, setShowSearchingModal] = useState(false)
  const [showCarrierAcceptedModal, setShowCarrierAcceptedModal] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [formData, setFormData] = useState({
    sigortaIstegi: false,
    date: null
  })

  const pickupAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const deliveryAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const libraries: Libraries = ['places']

  const loadScriptOptions = {
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyAKht3SqaVJpufUdq-vVQEfBEQKejT9Z8k",
    libraries,
    language: 'tr',
    region: 'TR'
  }

  const handlePickupAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    pickupAutocompleteRef.current = autocomplete
  }

  const handleDeliveryAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    deliveryAutocompleteRef.current = autocomplete
  }

  const handlePickupSelect = (place: google.maps.places.PlaceResult) => {
    if (place.geometry && place.geometry.location) {
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        title: place.formatted_address || place.name || ''
      }
      console.log('Pickup location:', location)
      setPickupMarker(location)
      setPickupAddress(place.formatted_address || '')
      setIsPickupSelecting(false)
    }
  }

  const handleDeliverySelect = (place: google.maps.places.PlaceResult) => {
    if (place.geometry && place.geometry.location) {
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        title: place.formatted_address || place.name || ''
      }
      console.log('Delivery location:', location)
      setDeliveryMarker(location)
      setDeliveryAddress(place.formatted_address || '')
      setIsDeliverySelecting(false)
    }
  }

  const handleLocationSelect = (location: google.maps.LatLngLiteral) => {
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ location }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        if (isPickupSelecting) {
          setPickupMarker({
            ...location,
            title: results[0].formatted_address
          })
          setPickupAddress(results[0].formatted_address)
          setIsPickupSelecting(false)
        } else if (isDeliverySelecting) {
          setDeliveryMarker({
            ...location,
            title: results[0].formatted_address
          })
          setDeliveryAddress(results[0].formatted_address)
          setIsDeliverySelecting(false)
        }
      }
    })
  }

  const handlePickupInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPickupAddress(e.target.value)
  }

  const handleDeliveryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeliveryAddress(e.target.value)
  }

  const handleRouteFound = (info: RouteInfo) => {
    setRouteInfo(info)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedImages(prev => [...prev, ...files])
  }

  const handleImageDelete = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleTransportTypeSelect = (type: string) => {
    setSelectedTransportType(type)
    setShowModal(false)
    setShowSummaryModal(true)
  }

  const handleFindCarrier = () => {
    if (routeInfo && selectedTransportType) {
      setShowPhoneModal(true)
    } else {
      alert('Lütfen önce bir rota ve taşıma türü seçin')
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
  };

  const handlePhoneSubmit = () => {
    if (phoneNumber.length === 10) {
      setShowPhoneModal(false)
      setShowOTPModal(true)
      console.log(`SMS gönderildi: +90${phoneNumber}`)
    }
  };

  const handleOTPSubmit = () => {
    if (otpCode.length === 6) {
      setShowOTPModal(false)
      setShowSearchingModal(true)
      console.log(`OTP doğrulandı: ${otpCode}`)
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-left">
              <h2 className="text-6xl md:text-7xl font-bold mb-6 text-white">TaşıApp</h2>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Güvenilir Taşımacılık Hizmeti
              </h1>
              <div className="text-xl mb-8 space-y-2">
                <p>TaşıApp ile yükünüzü güvenle taşıyın.</p>
                <p>En uygun taşıyıcıyı anında bulun ve kolayca rezerve edin.</p>
                <p>İstediğiniz gün ve saatte orada olalım.</p>
              </div>
            </div>
            <div>
              <div className="h-[400px] rounded-lg overflow-hidden shadow-lg bg-white relative">
                <LoadScript {...loadScriptOptions} onLoad={() => setIsScriptLoaded(true)}>
                  {isScriptLoaded ? (
                    <>
                      {routeInfo && (
                        <div className="absolute top-0 left-0 right-0 z-10 bg-white p-4 rounded-t-lg shadow-lg border-b border-gray-200">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <FaLocationArrow className="text-orange-500 mr-2" />
                              <span className="text-gray-600">Mesafe:</span>
                              <span className="ml-2 font-semibold text-orange-600">{routeInfo.distance}</span>
                            </div>
                            <div className="flex items-center">
                              <FaClock className="text-orange-500 mr-2" />
                              <span className="text-gray-600">Tahmini Süre:</span>
                              <span className="ml-2 font-semibold text-orange-600">{routeInfo.duration}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <MapComponent
                        pickupMarker={pickupMarker}
                        deliveryMarker={deliveryMarker}
                        routeInfo={routeInfo}
                        onRouteFound={handleRouteFound}
                        isPickupSelecting={isPickupSelecting}
                        isDeliverySelecting={isDeliverySelecting}
                        onLocationSelect={handleLocationSelect}
                      />
                      <div className="absolute bottom-4 left-4 right-4 space-y-2">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Autocomplete
                              onLoad={(autocomplete) => {
                                pickupAutocompleteRef.current = autocomplete
                              }}
                              onPlaceChanged={() => {
                                const place = pickupAutocompleteRef.current?.getPlace()
                                if (place) {
                                  handlePickupSelect(place)
                                }
                              }}
                            >
                              <input
                                type="text"
                                placeholder="Alınacak Adres"
                                value={pickupAddress}
                                onChange={(e) => setPickupAddress(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900 font-medium shadow-lg"
                              />
                            </Autocomplete>
                          </div>
                          <button
                            onClick={() => setIsPickupSelecting(true)}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 font-medium shadow-lg whitespace-nowrap"
                          >
                            <FaMapMarkedAlt />
                            Haritadan Seç
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Autocomplete
                              onLoad={(autocomplete) => {
                                deliveryAutocompleteRef.current = autocomplete
                              }}
                              onPlaceChanged={() => {
                                const place = deliveryAutocompleteRef.current?.getPlace()
                                if (place) {
                                  handleDeliverySelect(place)
                                }
                              }}
                            >
                              <input
                                type="text"
                                placeholder="Teslim Adresi"
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900 font-medium shadow-lg"
                              />
                            </Autocomplete>
                          </div>
                          <button
                            onClick={() => setIsDeliverySelecting(true)}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 font-medium shadow-lg whitespace-nowrap"
                          >
                            <FaMapMarkedAlt />
                            Haritadan Seç
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                  )}
                </LoadScript>
              </div>

              {(!pickupAddress || !deliveryAddress || !routeInfo) && (
                <div className="mt-4 flex items-center justify-center text-white text-lg gap-2">
                  <FaMapMarkerAlt className="text-2xl" />
                  Başlamak için alış ve teslimat adreslerini girin.
                </div>
              )}
              
              {pickupAddress && deliveryAddress && routeInfo && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-8 py-3 bg-white text-orange-500 rounded-lg hover:bg-orange-50 font-semibold shadow-lg transition-colors"
                  >
                    Taşıma Türünü Seç
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hizmetlerimiz Section */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Hizmetlerimiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Depo Taşıma */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <FaWarehouse className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Depo Taşıma</h3>
              <p className="text-gray-600 mb-4">
                Büyük ölçekli depo taşıma operasyonları için özel ekipman ve deneyimli ekiplerimizle hizmetinizdeyiz.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Forklift hizmeti
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Envanter yönetimi
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  7/24 operasyon
                </li>
              </ul>
            </div>

            {/* Paletli Taşıma */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <FaPallet className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Paletli Taşıma</h3>
              <p className="text-gray-600 mb-4">
                Endüstriyel ürünleriniz için güvenli ve hızlı palet taşıma hizmeti. Özel ekipmanlarla hasarsız teslimat.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Hidrolik lift sistemi
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Rampa hizmeti
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Zamanında teslimat
                </li>
              </ul>
            </div>

            {/* Koli Taşıma */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <FaBox className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Koli Taşıma</h3>
              <p className="text-gray-600 mb-4">
                Küçük ölçekli taşımalarınız için ekonomik ve hızlı koli taşıma hizmeti. Özel paketleme malzemeleriyle güvenli teslimat.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Özel paketleme
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Kırılacak eşya koruması
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Hızlı teslimat
                </li>
              </ul>
            </div>

            {/* Parsiyel Taşıma */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <FaTruck className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Parsiyel Taşıma</h3>
              <p className="text-gray-600 mb-4">
                Farklı müşterilerin yüklerini birleştirerek ekonomik çözümler. Düzenli sevkiyatlarla maliyet avantajı.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Ekonomik fiyatlandırma
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Düzenli sevkiyat
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  Takip sistemi
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Taşıma Türü Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h3 className="text-2xl font-semibold mb-6">Taşıma Türünü Seçin</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleTransportTypeSelect('ev')}
                className="flex items-center p-4 border rounded-lg hover:bg-orange-50 transition-colors"
              >
                <FaHome className="w-6 h-6 text-orange-500 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Ev Taşıma</div>
                  <div className="text-sm text-gray-600">Evinizi güvenle taşıyalım</div>
                </div>
              </button>
              <button
                onClick={() => handleTransportTypeSelect('ofis')}
                className="flex items-center p-4 border rounded-lg hover:bg-orange-50 transition-colors"
              >
                <FaBuilding className="w-6 h-6 text-orange-500 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Ofis Taşıma</div>
                  <div className="text-sm text-gray-600">İşyerinizi profesyonelce taşıyalım</div>
                </div>
              </button>
              <button
                onClick={() => handleTransportTypeSelect('esya')}
                className="flex items-center p-4 border rounded-lg hover:bg-orange-50 transition-colors"
              >
                <FaBoxOpen className="w-6 h-6 text-orange-500 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Eşya Taşıma</div>
                  <div className="text-sm text-gray-600">Tek bir eşya veya birkaç parça</div>
                </div>
              </button>
              <button
                onClick={() => handleTransportTypeSelect('diger')}
                className="flex items-center p-4 border rounded-lg hover:bg-orange-50 transition-colors"
              >
                <FaTruck className="w-6 h-6 text-orange-500 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Diğer</div>
                  <div className="text-sm text-gray-600">Özel taşıma ihtiyaçları</div>
                </div>
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Özet Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h3 className="text-2xl font-semibold mb-6">Taşıma Özeti</h3>
            <div className="space-y-4">
              <div>
                <div className="font-medium text-gray-700">Alınacak Adres:</div>
                <div className="text-gray-600">{pickupAddress}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Teslim Adresi:</div>
                <div className="text-gray-600">{deliveryAddress}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Mesafe:</div>
                <div className="text-gray-600">{routeInfo?.distance}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Tahmini Süre:</div>
                <div className="text-gray-600">{routeInfo?.duration}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Taşıma Türü:</div>
                <div className="text-gray-600">
                  {selectedTransportType === 'ev'
                    ? 'Ev Taşıma'
                    : selectedTransportType === 'ofis'
                    ? 'Ofis Taşıma'
                    : selectedTransportType === 'esya'
                    ? 'Eşya Taşıma'
                    : 'Diğer'}
                </div>
              </div>
              {selectedTransportType === 'ev' && (
                <div>
                  <div className="font-medium text-gray-700 mb-2">Ev Fotoğrafları:</div>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Ev fotoğrafı ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleImageDelete(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {selectedImages.length < 4 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400"
                      >
                        <FaImage className="w-6 h-6" />
                      </button>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                İptal
              </button>
              <button
                onClick={handleFindCarrier}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Taşıyıcı Bul
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Taşıyıcı Aranıyor Modal */}
      {showSearchingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-2xl font-bold">Taşıyıcı Aranıyor</h3>
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-l-2 border-orange-500"></div>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <FaSpinner className="w-16 h-16 text-orange-500 animate-spin mb-6" />
                <p className="text-gray-700 mb-8">
                  Bu işlem ortalama 15 dakika sürecektir. Ayrıca taşıyıcınızı bulduğumuzda size bir sms göndereceğiz.
                </p>
                
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg w-full max-w-lg mb-8">
                  <div className="flex">
                    <FaInfoCircle className="text-blue-500 w-6 h-6 mr-2 flex-shrink-0" />
                    <p className="text-blue-800 text-sm">
                      Taşıyıcı bulma işlemi tahmini 15 dakika sürebilir. Taşıyıcı bulunduğunda size bildirim göndereceğiz. Uygulamadan çıkabilirsiniz.
                    </p>
                  </div>
                </div>

                {/* Test butonu, normal durumda gösterilmemeli */}
                <button
                  onClick={() => {
                    setShowSearchingModal(false)
                    setShowCarrierAcceptedModal(true)
                  }}
                  className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 mt-4"
                >
                  Test: Taşıyıcı Bulundu
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-center">
                <button
                  onClick={() => setShowSearchingModal(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 bg-white rounded border border-gray-300 hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Telefon Numarası Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-2xl font-bold mb-6">Telefon Numaranız</h3>
            <p className="text-gray-600 mb-6">
              Size özel taşıyıcı teklifleri almak için lütfen telefon numaranızı girin.
            </p>
            
            <div className="mb-6">
              <div className="flex">
                <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                  <span className="text-gray-500">+90</span>
                </div>
                <input
                  type="tel"
                  placeholder="(5XX) XXX XX XX"
                  value={formattedPhoneNumber}
                  onChange={handlePhoneChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setShowPhoneModal(false)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 bg-white rounded border border-gray-300 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handlePhoneSubmit}
                disabled={phoneNumber.length !== 10}
                className={`px-6 py-2 rounded ${
                  phoneNumber.length === 10
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Doğrulama Kodu Gönder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Doğrulama Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-2xl font-bold mb-6">Telefon Doğrulama</h3>
            <p className="text-gray-600 mb-2">
              +90 {formattedPhoneNumber} numaralı telefonunuza gönderilen 6 haneli doğrulama kodunu girin.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Kod gelmedi mi? <button className="text-orange-500 hover:text-orange-600">Tekrar Gönder</button>
            </p>
            
            <div className="mb-6">
              <input
                type="text"
                placeholder="X X X X X X"
                value={otpCode}
                onChange={(e) => {
                  // Sadece rakamları al ve 6 haneye sınırla
                  const val = e.target.value.replace(/\D/g, '')
                  if (val.length <= 6) {
                    setOtpCode(val)
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-center tracking-[1em]"
                maxLength={11}
              />
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setShowOTPModal(false)
                  setShowPhoneModal(true)
                }}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 bg-white rounded border border-gray-300 hover:bg-gray-50"
              >
                Geri Dön
              </button>
              <button
                onClick={handleOTPSubmit}
                disabled={otpCode.length !== 6}
                className={`px-6 py-2 rounded ${
                  otpCode.length === 6
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Doğrula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Taşıyıcı Kabul Edildi Modal */}
      {showCarrierAcceptedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-green-50">
              <h3 className="text-2xl font-bold text-green-700">Taşıyıcı Bulundu!</h3>
              <div className="flex items-center">
                <FaCheckCircle className="text-green-500 w-6 h-6 mr-2" />
                <span className="text-green-600 font-medium">Fiyat Onaylandı</span>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-blue-800 mb-4">Taşıyıcı Bilgileri</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-gray-600">İsim:</span>
                      <span className="font-medium">Gü****** Na*****</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-gray-600">Firma:</span>
                      <span className="font-medium">Hızlı Taşımacılık Ltd. Şti.</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-gray-600">Değerlendirme:</span>
                      <div className="flex items-center">
                        <div className="flex">
                          <FaStar className="text-yellow-400 w-4 h-4" />
                          <FaStar className="text-yellow-400 w-4 h-4" />
                          <FaStar className="text-yellow-400 w-4 h-4" />
                          <FaStar className="text-yellow-400 w-4 h-4" />
                          <FaStar className="text-yellow-400 w-4 h-4" />
                        </div>
                        <span className="text-sm text-gray-600 ml-2">(125 değerlendirme)</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-gray-600">Toplam Taşıma:</span>
                      <span className="font-medium">842</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <h4 className="font-medium text-orange-800 mb-4">Taşıma Detayları</h4>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="w-24 text-gray-600">Alış:</span>
                      <span className="font-medium">{pickupAddress}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-24 text-gray-600">Teslimat:</span>
                      <span className="font-medium">{deliveryAddress}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-gray-600">Taşıma Türü:</span>
                      <span className="font-medium">
                        {selectedTransportType === 'ev'
                          ? 'Ev Taşıma'
                          : selectedTransportType === 'ofis'
                          ? 'Ofis Taşıma'
                          : selectedTransportType === 'esya'
                          ? 'Eşya Taşıma'
                          : 'Diğer'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-gray-600">Tarih:</span>
                      <span className="font-medium">15 Mayıs 2023, 09:00</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                <h4 className="font-medium text-gray-800 mb-4">Fiyat Bilgisi</h4>
                <div className="grid grid-cols-2 gap-y-2">
                  <div className="text-gray-600">Temel Ücret:</div>
                  <div className="text-right font-medium">₺1,200.00</div>
                  <div className="text-gray-600">Mesafe Ücreti:</div>
                  <div className="text-right font-medium">₺350.00</div>
                  {selectedTransportType === 'ev' && (
                    <>
                      <div className="text-gray-600">Sigorta Ücreti:</div>
                      <div className="text-right font-medium">₺150.00</div>
                    </>
                  )}
                  <div className="text-gray-800 font-semibold border-t border-gray-200 pt-2 mt-2">Toplam:</div>
                  <div className="text-right font-bold text-orange-600 border-t border-gray-200 pt-2 mt-2">
                    {selectedTransportType === 'ev' ? '₺1,700.00' : '₺1,550.00'}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Önemli Bilgilendirmeler</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <FaInfoCircle className="text-orange-500 mt-1 flex-shrink-0" />
                    <p>Taşıyıcı iletişim bilgileri SMS olarak gönderilmiştir. Karşılıklı iletişime geçerek detayları konuşabilirsiniz.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaInfoCircle className="text-orange-500 mt-1 flex-shrink-0" />
                    <p>Taşıma işlemi tamamlandıktan sonra ödeme yapmanız gerekmektedir. Taşıyıcıya taşıma öncesinde ödeme yapmayınız.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaInfoCircle className="text-orange-500 mt-1 flex-shrink-0" />
                    <p>Herhangi bir sorun yaşamanız durumunda 0850 123 45 67 numaralı destek hattımızdan yardım alabilirsiniz.</p>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setShowCarrierAcceptedModal(false)
                    setShowSearchingModal(true)
                  }}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 bg-white rounded border border-gray-300 hover:bg-gray-50"
                >
                  Geri
                </button>
                <button
                  onClick={() => {
                    setShowCarrierAcceptedModal(false)
                    setShowPaymentModal(true)
                  }}
                  className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Ödeme Yap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ödeme Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-2xl font-bold">Ödeme Bilgileri</h3>
              <FaCheckCircle className="text-green-500 h-6 w-6" />
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6">
                <div className="flex items-center mb-2">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <h4 className="font-medium text-green-700">Taşıyıcı Onaylandı</h4>
                </div>
                <p className="text-gray-700">
                  Taşıyıcınız hazır. Taşıma işlemi tamamlandıktan sonra aşağıdaki ödeme yöntemlerinden birini kullanabilirsiniz.
                </p>
              </div>
              
              <h4 className="font-medium text-gray-800 mb-4">Ödeme Seçenekleri</h4>
              
              <div className="space-y-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-orange-200 hover:bg-orange-50 transition-colors cursor-pointer">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    </div>
                    <div>
                      <h5 className="font-medium">Nakit Ödeme</h5>
                      <p className="text-sm text-gray-600">Taşıma işlemi tamamlandığında taşıyıcıya nakit olarak ödeme yapabilirsiniz.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-orange-200 hover:bg-orange-50 transition-colors cursor-pointer">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-white rounded-full border border-gray-300 mr-3"></div>
                    <div>
                      <h5 className="font-medium">Kredi Kartı</h5>
                      <p className="text-sm text-gray-600">Taşıma işlemi tamamlandığında taşıyıcınız size kredi kartı ile ödeme yapabileceğiniz bir link gönderecektir.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-orange-200 hover:bg-orange-50 transition-colors cursor-pointer">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-white rounded-full border border-gray-300 mr-3"></div>
                    <div>
                      <h5 className="font-medium">Havale / EFT</h5>
                      <p className="text-sm text-gray-600">Taşıma işlemi tamamlandığında taşıyıcınız size banka hesap bilgilerini paylaşacaktır.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex">
                  <FaInfoCircle className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-blue-700 mb-2">Önemli Bilgiler</h5>
                    <ul className="text-sm text-gray-700 space-y-1 list-disc pl-4">
                      <li>Ödeme işlemini taşıma tamamlandıktan sonra yapmanız gerekmektedir.</li>
                      <li>Taşıyıcıya taşıma öncesinde ödeme yapmayınız.</li>
                      <li>Taşıma sırasında oluşan hasarlar için 24 saat içinde bildirim yapınız.</li>
                      <li>Sorun yaşamanız durumunda 0850 123 45 67 numaralı müşteri hizmetlerimizi arayabilirsiniz.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    setShowCarrierAcceptedModal(true)
                  }}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 bg-white rounded border border-gray-300 hover:bg-gray-50"
                >
                  Geri
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                >
                  Anladım
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
} 