/**
 * Geolocation hizmetleri ve konum izleme işlevleri
 */

// Konum izleme durumunu takip eden değişkenler
let watchId = null;
let isTracking = false;
let lastPosition = null;
let trackingInterval = null;
let locationUpdateCallback = null;
let locationErrorCallback = null;
let googleMapsLoaded = false;

/**
 * Cihazın konum özelliğine sahip olup olmadığını kontrol eder
 * @returns {boolean} Konum özelliği varsa true, yoksa false
 */
export function isGeolocationSupported() {
  return 'geolocation' in navigator;
}

/**
 * Google Maps API'sinin yüklenip yüklenmediğini kontrol eder
 * @returns {boolean} Google Maps API yüklendiyse true, aksi halde false
 */
export function isGoogleMapsLoaded() {
  return typeof google !== 'undefined' && google.maps;
}

/**
 * Konum hatalarını daha açıklayıcı şekilde gösterir
 * @param {GeolocationPositionError} error Konum hatası
 */
export function logLocationError(error) {
  let errorMessage = '';
  
  switch(error.code) {
    case 1: // PERMISSION_DENIED
      errorMessage = 'Konum izni reddedildi';
      break;
    case 2: // POSITION_UNAVAILABLE
      errorMessage = 'Konum bilgisi kullanılamıyor';
      break;
    case 3: // TIMEOUT
      errorMessage = 'Konum bilgisi zaman aşımına uğradı';
      break;
    default:
      errorMessage = 'Bilinmeyen konum hatası';
  }
  
  console.error(`Konum hatası: ${errorMessage} (${error.code}): ${error.message}`);
  return errorMessage;
}

/**
 * Tarayıcı/cihaz tipini belirler
 * @returns {Object} Platform bilgileri
 */
export function getPlatformInfo() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // iOS tespiti
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return {
      platform: 'ios',
      isMobile: true,
      isIOS: true,
      isAndroid: false
    };
  }
  
  // Android tespiti
  if (/android/i.test(userAgent)) {
    return {
      platform: 'android',
      isMobile: true,
      isIOS: false,
      isAndroid: true
    };
  }
  
  return {
    platform: 'desktop',
    isMobile: false,
    isIOS: false,
    isAndroid: false
  };
}

/**
 * Mevcut konumu tek seferlik alır
 * @param {Function} successCallback Başarılı konum alındığında çağrılacak fonksiyon
 * @param {Function} errorCallback Hata durumunda çağrılacak fonksiyon
 * @param {Object} options Geolocation API için opsiyonlar
 */
export function getCurrentPosition(successCallback, errorCallback, options = {}) {
  const platformInfo = getPlatformInfo();
  console.log("getCurrentPosition çağrıldı, platform:", platformInfo.platform);
  
  // Konum desteği kontrolü
  if (!isGeolocationSupported()) {
    console.error("Cihaz konum özelliğini desteklemiyor");
    if (errorCallback) {
      errorCallback(new Error('Cihazınız konum izlemeyi desteklemiyor.'));
    }
    return;
  }
  
  // Platform için optimize edilmiş ayarlar
  const defaultOptions = {
    enableHighAccuracy: platformInfo.isMobile ? false : true,
    timeout: platformInfo.isMobile ? 60000 : 20000,
    maximumAge: platformInfo.isMobile ? 10000 : 0
  };

  const geolocationOptions = { ...defaultOptions, ...options };
  console.log("Konum alma ayarları:", geolocationOptions);
  
  // Google Maps API kontrolü
  const useGoogleMaps = isGoogleMapsLoaded();
  console.log("Google Maps API kullanılarak konum alınacak:", useGoogleMaps ? "Evet" : "Hayır");

  try {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Konum başarıyla alındı:", position.coords);
        const locationData = formatPosition(position);
        lastPosition = locationData;
        
        // Google Maps ile konum verilerini zenginleştir
        if (useGoogleMaps && !platformInfo.isMobile) { // Mobil cihazlarda geocoding performans sorunları yaratabilir
          try {
            const geocoder = new google.maps.Geocoder();
            const latlng = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            
            geocoder.geocode({ location: latlng }, (results, status) => {
              if (status === "OK" && results[0]) {
                console.log("Google Maps ile adres bilgisi alındı");
                const enhancedLocation = {
                  ...locationData,
                  address: results[0].formatted_address || null,
                  placeId: results[0].place_id || null
                };
                
                lastPosition = enhancedLocation;
                
                if (successCallback) {
                  successCallback(enhancedLocation);
                }
              } else {
                console.warn("Google Maps ile adres bilgisi alınamadı:", status);
                if (successCallback) {
                  successCallback(locationData);
                }
              }
            });
          } catch (geocodeError) {
            console.error("Google Maps geocoding hatası:", geocodeError);
            if (successCallback) {
              successCallback(locationData);
            }
          }
        } else {
          if (successCallback) {
            successCallback(locationData);
          }
        }
      },
      (error) => {
        const errorMsg = logLocationError(error);
        console.error("Konum alma hatası:", errorMsg);
        
        if (errorCallback) {
          errorCallback(translateGeolocationError(error));
        }
      },
      geolocationOptions
    );
  } catch (error) {
    console.error("getCurrentPosition çağrısında hata:", error);
    if (errorCallback) {
      errorCallback(error);
    }
  }
}

/**
 * Konum izlemeyi başlatır ve düzenli aralıklarla konum günceller
 * @param {Function} updateCallback Konum güncellendiğinde çağrılacak fonksiyon
 * @param {Function} errorCallback Hata durumunda çağrılacak fonksiyon
 * @param {number} intervalMs Güncelleme aralığı (milisaniye)
 * @param {Object} options Geolocation API için opsiyonlar
 * @returns {boolean} İzleme başlatıldıysa true, başlatılamadıysa false
 */
export function startTracking(updateCallback, errorCallback, intervalMs = 10000, options = {}) {
  console.log("startTracking çağrıldı, aralık:", intervalMs);
  
  // Zaten izleme varsa durdur
  if (isTracking) {
    console.log("Önceki izleme durduruldu");
    stopTracking();
  }

  locationUpdateCallback = updateCallback;
  locationErrorCallback = errorCallback;

  // Platform bilgisini al
  const platformInfo = getPlatformInfo();
  console.log("Konum izleme başlatılıyor - Platform:", platformInfo.platform);
  
  // Cihaz türüne göre optimize edilmiş ayarlar
  const defaultOptions = {
    enableHighAccuracy: false, // Tutarlı sonuçlar için tüm platformlarda false kullanın
    timeout: platformInfo.isMobile ? 60000 : 30000,
    maximumAge: platformInfo.isMobile ? 10000 : 5000
  };

  const geolocationOptions = { ...defaultOptions, ...options };
  console.log("Konum izleme ayarları:", geolocationOptions);

  // İlk konum alımı
  try {
    getCurrentPosition(
      (position) => {
        console.log("İlk konum alındı:", position);
        lastPosition = position;
        if (locationUpdateCallback) {
          locationUpdateCallback(position);
        }
        
        // İlk konumu sunucuya gönder
        sendLocationDataToServer(position);
      },
      (error) => {
        console.error("İlk konum alınamadı:", error);
        if (locationErrorCallback) {
          locationErrorCallback(error);
        }
      },
      geolocationOptions
    );
  } catch (initialError) {
    console.error("İlk konum alma işleminde hata:", initialError);
  }

  // Sürekli izleme başlat
  try {
    if (navigator.geolocation) {
      console.log("watchPosition başlatılıyor...");
      
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          console.log("Yeni konum alındı:", position.coords);
          
          const locationData = formatPosition(position);
          lastPosition = locationData;
          
          // Konum güncelleme callback'i çağır
          if (locationUpdateCallback) {
            locationUpdateCallback(locationData);
          }
        },
        (error) => {
          const errorMsg = logLocationError(error);
          console.error("Konum izleme hatası:", errorMsg);
          
          if (locationErrorCallback) {
            locationErrorCallback(translateGeolocationError(error));
          }
        },
        geolocationOptions
      );
      
      console.log("watchPosition başarıyla başlatıldı, watchId:", watchId);
    } else {
      console.error("Geolocation API desteklenmiyor");
      if (locationErrorCallback) {
        locationErrorCallback(new Error('Cihazınız konum izlemeyi desteklemiyor.'));
      }
      return false;
    }
  } catch (error) {
    console.error("watchPosition çağrısında hata:", error);
    if (locationErrorCallback) {
      locationErrorCallback(error);
    }
    return false;
  }

  // Düzenli aralıklarla sunucuya konum gönderme
  console.log(`Sunucuya konum gönderme için interval ayarlanıyor: ${intervalMs}ms`);
  trackingInterval = setInterval(() => {
    if (lastPosition) {
      console.log("Sunucuya konum gönderiliyor:", lastPosition);
      sendLocationDataToServer(lastPosition);
    } else {
      console.warn("Sunucuya gönderilecek konum yok");
    }
  }, intervalMs);

  isTracking = true;
  return true;
}

/**
 * Konum izlemeyi durdurur
 */
export function stopTracking() {
  console.log("stopTracking çağrıldı");
  
  if (watchId !== null) {
    console.log("watchPosition durduruldu, watchId:", watchId);
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  if (trackingInterval !== null) {
    console.log("Konum gönderme interval'ı durduruldu");
    clearInterval(trackingInterval);
    trackingInterval = null;
  }

  isTracking = false;
  locationUpdateCallback = null;
  locationErrorCallback = null;
  console.log("Konum izleme tamamen durduruldu");
}

/**
 * Konum izleme durumunu kontrol eder
 * @returns {boolean} İzleme aktifse true, değilse false
 */
export function isTrackingActive() {
  return isTracking;
}

/**
 * Son kaydedilen konumu döndürür
 * @returns {Object|null} Son konum bilgisi veya null
 */
export function getLastPosition() {
  return lastPosition;
}

/**
 * İki konum arasındaki mesafeyi hesaplar (Haversine formülü)
 * @param {Object} pos1 İlk konum {latitude, longitude}
 * @param {Object} pos2 İkinci konum {latitude, longitude}
 * @returns {number} Kilometre cinsinden mesafe
 */
export function calculateDistance(pos1, pos2) {
  if (!pos1 || !pos2) return 0;

  const R = 6371; // Dünya yarıçapı (km)
  const dLat = degToRad(pos2.latitude - pos1.latitude);
  const dLon = degToRad(pos2.longitude - pos1.longitude);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(degToRad(pos1.latitude)) * Math.cos(degToRad(pos2.latitude)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Kilometre cinsinden mesafe
  
  return distance;
}

// Yardımcı fonksiyonlar

/**
 * Geolocation Position nesnesini daha kullanılabilir bir formata dönüştürür
 * @param {Position} position Geolocation API'den gelen Position nesnesi
 * @returns {Object} Biçimlendirilmiş konum bilgisi
 */
function formatPosition(position) {
  const { coords, timestamp } = position;
  
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    altitude: coords.altitude,
    altitudeAccuracy: coords.altitudeAccuracy,
    heading: coords.heading,
    speed: coords.speed,
    timestamp: timestamp,
    formattedTime: new Date(timestamp).toLocaleTimeString()
  };
}

/**
 * Geolocation hata kodlarını anlamlı hata mesajlarına çevirir
 * @param {PositionError} error Geolocation API'den gelen hata
 * @returns {Error} Açıklayıcı hata nesnesi
 */
function translateGeolocationError(error) {
  let message = 'Konum alınamadı';
  
  switch(error.code) {
    case error.PERMISSION_DENIED:
      message = 'Konum izni reddedildi. Tarayıcı ayarlarını ve konum servislerini kontrol edin.';
      break;
    case error.POSITION_UNAVAILABLE:
      message = 'Konum bilgisi mevcut değil. Konum servislerinizin açık olduğundan emin olun.';
      break;
    case error.TIMEOUT:
      message = 'Konum bilgisi alınırken zaman aşımı oluştu. İnternet bağlantınızı kontrol edin.';
      break;
    case error.UNKNOWN_ERROR:
      message = 'Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.';
      break;
  }
  
  return new Error(message);
}

/**
 * Dereceyi radyana çevirir
 * @param {number} deg Derece
 * @returns {number} Radyan
 */
function degToRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Konum verilerini API'ye gönderir
 * @param {Object} locationData Konum verileri
 * @returns {Promise<Object>} API yanıtı
 */
export async function sendLocationToApi(locationData) {
  try {
    // Sunucu URL'sini belirle
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    
    // Localhost için HTTP, diğer adresler için HTTPS zorla
    const apiProtocol = (hostname === 'localhost' || hostname === '127.0.0.1') 
      ? protocol 
      : 'https:';
    
    const apiUrl = `${apiProtocol}//${hostname}${port}/api/drivers/location`;
    
    console.log("Konum gönderilen API URL:", apiUrl);
    
    // Oturum token'ını al
    let authToken = null;
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        authToken = user.token;
      }
    } catch (e) {
      console.error("Oturum bilgileri alınamadı:", e);
    }
    
    if (!authToken) {
      console.error("Oturum token'ı bulunamadı, kimlik doğrulama başarısız olabilir");
    }
    
    // Headers oluştur
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Kimlik doğrulama token'ı varsa ekle
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    // API isteği
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(locationData),
      credentials: 'include' // Cookie tabanlı kimlik doğrulama için
    });
    
    // İstek başarılı mı?
    if (response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const responseData = await response.json();
        return { success: true, data: responseData };
      } else {
        // JSON olmayan yanıt
        const text = await response.text();
        console.warn("API JSON olmayan bir yanıt döndü:", contentType);
        console.log("Yanıt içeriği (ilk 100 karakter):", text.substring(0, 100));
        return { success: true, data: null };
      }
    } else {
      // Hata yanıtı
      const contentType = response.headers.get("content-type");
      let errorMessage = `HTTP Hata ${response.status}`;
      let detailedError = null;
      
      if (contentType && contentType.indexOf("application/json") !== -1) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          detailedError = errorData.details || null;
          console.error("Sunucu hata detayı:", JSON.stringify(errorData));
        } catch (e) {
          console.error("JSON hata yanıtı işlenemedi", e);
        }
      } else {
        // JSON olmayan hata yanıtı
        const errorText = await response.text();
        console.error('HTTP hata yanıtı (tam mesaj):', errorText);
        
        if (response.status === 401 || response.status === 403) {
          errorMessage = 'Oturum süresi dolmuş olabilir. Lütfen tekrar giriş yapın.';
        }
      }
      
      console.error('API hatası:', errorMessage, 'HTTP Status:', response.status);
      return { 
        success: false, 
        error: errorMessage,
        details: detailedError,
        status: response.status
      };
    }
  } catch (error) {
    console.error("API isteği hatası:", error.message, error.stack);
    return { 
      success: false, 
      error: error.message,
      isNetworkError: true 
    };
  }
}

/**
 * Konum verilerini sunucuya gönderir ve gerekirse callback'i çağırır
 * @param {Object} position Konum verileri
 */
async function sendLocationDataToServer(position) {
  // API'ye konum gönder
  const result = await sendLocationToApi({
    latitude: position.latitude,
    longitude: position.longitude,
    accuracy: position.accuracy,
    speed: position.speed,
    heading: position.heading,
    timestamp: new Date().toISOString(),
    platform: getPlatformInfo().platform,
    address: position.address,
    placeId: position.placeId
  });
  
  // Sonucu işle
  if (result.success) {
    console.log("Konum sunucuya başarıyla gönderildi:", result.data);
    if (locationUpdateCallback) {
      locationUpdateCallback(position, true); // true: sunucuya gönderilecek
    }
  } else {
    console.error("Konum sunucuya gönderilemedi:", result.error);
    if (locationErrorCallback) {
      const error = new Error(`Konum sunucuya gönderilemedi: ${result.error}`);
      locationErrorCallback(error);
    }
  }
}

export default {
  isGeolocationSupported,
  getCurrentPosition,
  startTracking,
  stopTracking,
  isTrackingActive,
  getLastPosition,
  calculateDistance,
  sendLocationToApi
}; 