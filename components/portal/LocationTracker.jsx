import React, { useState, useEffect, useRef } from 'react';
import { startTracking, stopTracking, isTrackingActive, getCurrentPosition, isGoogleMapsLoaded, getPlatformInfo, logLocationError } from '@/lib/geolocation';
import { FaMapMarkerAlt, FaToggleOn, FaToggleOff, FaCheckCircle, FaExclamationTriangle, FaSpinner, FaGoogle, FaMobileAlt, FaLaptop } from 'react-icons/fa';

/**
 * Sürücünün konum izleme durumunu yöneten bileşen
 * @param {Object} props
 * @param {Function} props.onChange Konum izleme durumu değiştiğinde çağrılacak fonksiyon
 * @param {string} props.taskId İlişkili görev ID'si (opsiyonel)
 * @param {boolean} props.autoStart Otomatik başlama (varsayılan: false)
 * @param {number} props.updateInterval Güncelleme aralığı (ms cinsinden, varsayılan: 30000 - 30 saniye)
 */
export default function LocationTracker({ onChange, taskId, autoStart = false, updateInterval = 30000 }) {
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState('not_requested'); // not_requested, granted, denied, unavailable
  const [lastLocation, setLastLocation] = useState(null);
  const [error, setError] = useState(null);
  const [sendCount, setSendCount] = useState(0);
  const [lastSend, setLastSend] = useState(null);
  const [usingGoogleMaps, setUsingGoogleMaps] = useState(false);
  const [platformInfo, setPlatformInfo] = useState(null);
  const [serverUrl, setServerUrl] = useState('');
  const mountedRef = useRef(true);

  useEffect(() => {
    // Cihaz bilgilerini al
    const platform = getPlatformInfo();
    setPlatformInfo(platform);
    console.log("Cihaz bilgileri:", platform);
    
    // Sunucu URL'sini belirle (CORS sorunları için tam URL kullan)
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    const baseUrl = `${protocol}//${hostname}${port}`;
    setServerUrl(baseUrl);
    console.log("API endpoint base URL:", baseUrl);
    
    // Google Maps API durumunu kontrol et
    const gmapsAvailable = isGoogleMapsLoaded();
    setUsingGoogleMaps(gmapsAvailable);
    console.log("Google Maps API durumu:", gmapsAvailable ? "Yüklü" : "Yüklü değil");
    
    // Oturum bilgilerini kontrol et
    checkAuthStatus();
    
    // Konum servislerini kontrol et
    checkLocationPermission();
    
    // Bileşen kaldırıldığında izlemeyi durdur
    return () => {
      mountedRef.current = false;
      if (isTrackingActive()) {
        stopTracking();
      }
    };
  }, []);

  useEffect(() => {
    // Otomatik başlama
    if (autoStart && permissionStatus === 'granted' && !tracking) {
      console.log("Otomatik konum izleme başlatılıyor...");
      startLocationTracking();
    }
  }, [autoStart, permissionStatus]);

  // Oturum bilgilerini kontrol et
  const checkAuthStatus = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.token) {
          console.log("Oturum token'ı mevcut");
          
          // Token formatını ve içeriğini kontrol et
          const tokenParts = user.token.split('.');
          if (tokenParts.length === 3) {
            console.log("JWT token formatı geçerli");
            
            // Tokenın içeriğine bir göz at (production'da tehlikeli olabilir ama debugging aşamasında sorun çözmek için yararlı)
            try {
              const base64Url = tokenParts[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const payload = JSON.parse(window.atob(base64));
              
              // Token expire time
              if (payload.exp) {
                const expDate = new Date(payload.exp * 1000);
                const now = new Date();
                const timeLeft = expDate - now;
                const minutesLeft = Math.round(timeLeft / (1000 * 60));
                
                console.log(`Token geçerlilik süresi: ${minutesLeft} dakika`);
                if (minutesLeft < 30) {
                  console.warn("Token'ın süresi yakında dolacak!");
                  // Burada otomatik token yenileme yapılabilir
                }
              }
            } catch (e) {
              console.error("Token içeriği analiz edilemedi:", e);
            }
          } else {
            console.warn("JWT token formatı beklendiği gibi değil");
          }
        } else {
          console.warn("Oturum token'ı bulunamadı - konum paylaşımı çalışmayabilir");
        }
      } else {
        console.warn("Oturum bilgileri bulunamadı - konum paylaşımı çalışmayabilir");
      }
    } catch (e) {
      console.error("Oturum kontrolü yapılırken hata:", e);
    }
  };

  // Konum izinlerini kontrol et
  const checkLocationPermission = () => {
    setLoading(true);
    console.log("Konum izinleri kontrol ediliyor...");
    
    if (!('geolocation' in navigator)) {
      console.error("Cihaz konum API'sini desteklemiyor");
      setPermissionStatus('unavailable');
      setLoading(false);
      return;
    }

    // Konum izinlerini kontrol et
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' })
        .then((result) => {
          if (!mountedRef.current) return;
          
          console.log("Konum izni durumu:", result.state);
          
          if (result.state === 'granted') {
            setPermissionStatus('granted');
            // Test amaçlı tek bir konum al
            getCurrentPosition(
              (position) => {
                setLastLocation(position);
                console.log("Test konumu alındı:", position);
                setLoading(false);
              },
              (error) => {
                logLocationError(error);
                setError(error.message);
                console.error("Test konumu alınamadı:", error);
                setLoading(false);
              }
            );
          } else if (result.state === 'prompt') {
            setPermissionStatus('not_requested');
            setLoading(false);
          } else {
            setPermissionStatus('denied');
            setLoading(false);
          }
          
          // İzin değişikliklerini dinle
          result.onchange = () => {
            if (!mountedRef.current) return;
            console.log("Konum izni değişti:", result.state);
            setPermissionStatus(result.state === 'granted' ? 'granted' : 'denied');
          };
        })
        .catch((error) => {
          if (!mountedRef.current) return;
          console.error('İzin sorgulaması hatası:', error);
          setPermissionStatus('unavailable');
          setLoading(false);
          
          // Doğrudan izin isteme yolunu dene
          tryDirectPermissionRequest();
        });
    } else {
      console.log("Permissions API desteklenmiyor, doğrudan konum almayı deneyeceğiz");
      tryDirectPermissionRequest();
    }
  };
  
  // Doğrudan konum almayı dene
  const tryDirectPermissionRequest = () => {
    // İzin API'si yoksa, test amaçlı konum almayı dene
    getCurrentPosition(
      (position) => {
        if (!mountedRef.current) return;
        setLastLocation(position);
        setPermissionStatus('granted');
        setLoading(false);
        console.log("Test konumu alındı (alternatif):", position);
      },
      (error) => {
        if (!mountedRef.current) return;
        logLocationError(error);
        setPermissionStatus('denied');
        setError(error.message);
        setLoading(false);
        console.error("Test konumu alınamadı (alternatif):", error);
      }
    );
  };

  // Konum izlemeyi başlat
  const startLocationTracking = () => {
    setLoading(true);
    setError(null);
    console.log("Konum izleme başlatılıyor...");
    
    const onLocationUpdate = async (position, sendToServer = false) => {
      if (!mountedRef.current) return;
      
      console.log("Konum güncellendi:", position);
      setLastLocation(position);
      
      // onChange callback'i çağır
      if (onChange) {
        onChange({
          tracking: true,
          location: position
        });
      }
      
      // Sunucuya gönder
      if (sendToServer) {
        try {
          // Konum formatını API'nin beklediği şekilde düzenle
          const locationData = {
            latitude: position.latitude,
            longitude: position.longitude,
            accuracy: position.accuracy,
            speed: position.speed,
            heading: position.heading,
            timestamp: position.timestamp,
            taskId: taskId || undefined,
            platform: platformInfo ? platformInfo.platform : undefined
          };
          
          // Google Maps'ten gelen ek verileri ekle
          if (position.address) {
            locationData.address = position.address;
          }
          
          if (position.placeId) {
            locationData.placeId = position.placeId;
          }
          
          console.log("Sunucuya gönderilecek konum:", locationData);
          
          // API endpoint URL'si (tam URL kullanarak CORS sorunlarını önle)
          const protocol = window.location.protocol;
          const hostname = window.location.hostname;
          const port = window.location.port ? `:${window.location.port}` : '';
          
          // Localhost için HTTP, diğer adresler için HTTPS zorla
          const apiProtocol = (hostname === 'localhost' || hostname === '127.0.0.1') 
            ? protocol 
            : 'https:';
          
          const apiUrl = `${apiProtocol}//${hostname}${port}/api/drivers/location`;
          console.log("Konum gönderilen API URL:", apiUrl);
          
          // Oturum bilgilerini alın
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
          
          // Tüm isteklerde kullanılacak başlıkları oluştur
          const headers = {
            'Content-Type': 'application/json'
          };
          
          // Kimlik doğrulama başlığını ekle (varsa)
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
          }
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(locationData),
            credentials: 'include' // Cookie tabanlı kimlik doğrulama için
          });
          
          if (!mountedRef.current) return;
          
          if (response.ok) {
            // Yanıt içeriğini kontrol et
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
              const responseData = await response.json();
              console.log("Konum gönderme başarılı:", responseData);
              setSendCount(prev => prev + 1);
              setLastSend(new Date());
            } else {
              // JSON olmayan yanıt
              console.warn("Sunucu JSON olmayan bir yanıt döndü:", contentType);
              const text = await response.text();
              console.log("Yanıt içeriği (ilk 100 karakter):", text.substring(0, 100));
              setSendCount(prev => prev + 1);
              setLastSend(new Date());
            }
          } else {
            const contentType = response.headers.get("content-type");
            let errorMessage = `HTTP Hata ${response.status}`;
            
            if (contentType && contentType.indexOf("application/json") !== -1) {
              try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
              } catch (e) {
                console.error("JSON hata yanıtı işlenemedi", e);
              }
            } else {
              // JSON olmayan hata yanıtı
              const errorText = await response.text();
              console.error('HTTP hata yanıtı (ilk 100 karakter):', errorText.substring(0, 100));
              
              if (response.status === 401 || response.status === 403) {
                errorMessage = 'Oturum süresi dolmuş olabilir. Lütfen tekrar giriş yapın.';
                // Oturum yenilemesi için burada yönlendirme veya yeniden oturum açma mantığı eklenebilir
              }
            }
            
            console.error('Konum gönderme hatası:', errorMessage, 'HTTP Status:', response.status);
            setError(`Konum gönderilemedi: ${errorMessage}`);
          }
        } catch (error) {
          console.error('Konum gönderme hatası (network):', error.message, error.stack);
          setError(`Konum gönderilemedi: ${error.message}`);
        }
      }
    };
    
    const onLocationError = (error) => {
      if (!mountedRef.current) return;
      
      const errorMsg = logLocationError(error);
      console.error("Konum izleme hatası:", errorMsg);
      
      // Konum izni reddedildiyse tekrar izin iste
      if (error.code === 1) { // PERMISSION_DENIED
        setPermissionStatus('denied');
      }
      
      setError(error.message);
      setTracking(false);
      setLoading(false);
      
      // onChange callback'i çağır
      if (onChange) {
        onChange({
          tracking: false,
          error: error.message
        });
      }
    };
    
    // Optimize edilmiş konum izleme ayarları
    const trackingOptions = {
      enableHighAccuracy: platformInfo && platformInfo.isMobile ? false : true,
      timeout: platformInfo && platformInfo.isMobile ? 60000 : 30000,
      maximumAge: platformInfo && platformInfo.isMobile ? 10000 : 5000
    };
    
    console.log(`Konum izleme başlatılıyor... Platform: ${platformInfo ? platformInfo.platform : 'bilinmiyor'}, Google Maps: ${usingGoogleMaps ? 'Aktif' : 'Pasif'}, Aralık: ${updateInterval}ms`);
    console.log("Konum izleme ayarları:", trackingOptions);
    
    const success = startTracking(onLocationUpdate, onLocationError, updateInterval, trackingOptions);
    
    if (success) {
      setTracking(true);
      console.log("Konum izleme başarıyla başlatıldı");
    } else {
      setError('Konum izleme başlatılamadı');
      console.error("Konum izleme başlatılamadı");
    }
    
    setLoading(false);
  };

  // Konum izlemeyi durdur
  const stopLocationTracking = () => {
    console.log("Konum izleme durduruluyor...");
    stopTracking();
    setTracking(false);
    
    // onChange callback'i çağır
    if (onChange) {
      onChange({
        tracking: false
      });
    }
    
    console.log("Konum izleme durduruldu");
  };

  // Konum iznini iste (kullanıcı etkileşimi gerekiyor)
  const requestLocationPermission = () => {
    setLoading(true);
    console.log("Konum izni isteniyor...");
    
    getCurrentPosition(
      (position) => {
        if (!mountedRef.current) return;
        setLastLocation(position);
        setPermissionStatus('granted');
        setLoading(false);
        console.log("Konum izni verildi, konum alındı:", position);
      },
      (error) => {
        if (!mountedRef.current) return;
        const errorMsg = logLocationError(error);
        setError(error.message);
        setPermissionStatus('denied');
        setLoading(false);
        console.error("Konum izni hatası:", errorMsg);
      },
      // İzin alma modunda optimize edilmiş ayarlar
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 0
      }
    );
  };

  const toggleTracking = () => {
    if (tracking) {
      stopLocationTracking();
    } else {
      if (permissionStatus === 'granted') {
        startLocationTracking();
      } else {
        requestLocationPermission();
      }
    }
  };

  // İzin durumuna göre içerik
  const renderPermissionContent = () => {
    switch (permissionStatus) {
      case 'not_requested':
        return (
          <div className="p-4 bg-blue-50 rounded-md text-center">
            <p className="text-sm text-blue-600 mb-2">
              Konum bilginizi paylaşmanız gerekiyor
            </p>
            <button
              onClick={requestLocationPermission}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <FaSpinner className="animate-spin mr-2" />
                  İzin isteniyor...
                </span>
              ) : (
                'Konum İzni Ver'
              )}
            </button>
          </div>
        );
      
      case 'denied':
        return (
          <div className="p-4 bg-red-50 rounded-md">
            <div className="flex items-center text-red-600 mb-2">
              <FaExclamationTriangle className="mr-2" />
              <span className="text-sm font-medium">Konum izni reddedildi</span>
            </div>
            <p className="text-xs text-red-500">
              Konum bilgilerinize erişim izni vermeniz gerekiyor. Tarayıcı ayarlarından konum izinlerini kontrol edin.
            </p>
          </div>
        );
      
      case 'unavailable':
        return (
          <div className="p-4 bg-red-50 rounded-md">
            <div className="flex items-center text-red-600 mb-2">
              <FaExclamationTriangle className="mr-2" />
              <span className="text-sm font-medium">Konum hizmeti kullanılamıyor</span>
            </div>
            <p className="text-xs text-red-500">
              Cihazınız veya tarayıcınız konum hizmetlerini desteklemiyor veya devre dışı bırakılmış.
            </p>
          </div>
        );
      
      case 'granted':
        return null; // İzin verildi, normal görünümü göster
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FaMapMarkerAlt className="text-orange-500 mr-2" />
          <h3 className="text-lg font-medium">Konum İzleme</h3>
        </div>
        
        {permissionStatus === 'granted' && (
          <button
            onClick={toggleTracking}
            className={`flex items-center ${tracking ? 'text-green-500' : 'text-gray-400'}`}
            disabled={loading}
          >
            {tracking ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
          </button>
        )}
      </div>
      
      {renderPermissionContent()}
      
      {error && (
        <div className="p-3 bg-red-50 rounded-md mb-4">
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}
      
      {permissionStatus === 'granted' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Konum İzleme</span>
            <span className={`text-sm font-medium ${tracking ? 'text-green-500' : 'text-gray-500'}`}>
              {tracking ? 'Aktif' : 'Pasif'}
            </span>
          </div>
          
          {lastLocation && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Son Konum</span>
                <span className="text-sm text-gray-700">
                  {lastLocation.latitude.toFixed(6)}, {lastLocation.longitude.toFixed(6)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Doğruluk</span>
                <span className="text-sm text-gray-700">
                  {lastLocation.accuracy ? `${Math.round(lastLocation.accuracy)} m` : 'Bilinmiyor'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Son Güncelleme</span>
                <span className="text-sm text-gray-700">
                  {lastLocation.formattedTime}
                </span>
              </div>
            </>
          )}
          
          {tracking && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Gönderilen Konum</span>
              <span className="text-sm text-gray-700">
                {sendCount} adet
                {lastSend && ` (Son: ${lastSend.toLocaleTimeString()})`}
              </span>
            </div>
          )}
          
          {tracking ? (
            <div className="p-3 bg-green-50 rounded-md">
              <div className="flex items-center text-green-600">
                <FaCheckCircle className="mr-2" />
                <span className="text-sm">Konumunuz aktif görevlerde paylaşılıyor</span>
              </div>
            </div>
          ) : permissionStatus === 'granted' && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">
                Konum izlemeyi başlatmak için düğmeye tıklayın
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 