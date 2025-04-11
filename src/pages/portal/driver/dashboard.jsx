import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DriverLayout from '../../../components/portal/DriverLayout';
import { FaTruck, FaRoute, FaMapMarkedAlt, FaMedal, FaMoneyBillWave, FaChartLine, FaCalendarAlt, FaBell, FaMapMarkerAlt } from 'react-icons/fa';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import Link from 'next/link';

const libraries = ['places', 'geometry', 'drawing'];

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px'
};

const defaultCenter = {
  lat: 41.0082,
  lng: 28.9784
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  gestureHandling: 'greedy'
};

// Platform kontrolü için yardımcı fonksiyon
const getPlatformInfo = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return {
      platform: 'ios',
      isMobile: true,
      isIOS: true, 
      isAndroid: false
    };
  }
  
  // Android detection
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
};

export default function DriverDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completed: 0,
    inProgress: 0,
    distance: 0,
    earnings: 0
  });
  const [tasks, setTasks] = useState([]);
  const [locationStatus, setLocationStatus] = useState({
    supported: false,
    active: false,
    lastPosition: null,
    permissionStatus: 'prompt',
    watchId: null
  });

  const [map, setMap] = useState(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
    version: "weekly"
  });

  const [platformInfo] = useState(typeof window !== 'undefined' ? getPlatformInfo() : { platform: 'unknown', isMobile: false });

  const onMapLoad = React.useCallback((map) => {
    setMap(map);
  }, []);

  // Oturum token'ının varlığını ve geçerliliğini kontrol et
  const checkAuthToken = () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.error("Oturum bilgileri bulunamadı");
        return false;
      }
      
      const user = JSON.parse(userData);
      if (!user.token) {
        console.error("Token bulunamadı");
        return false;
      }
      
      // Token formatını kontrol et
      const tokenParts = user.token.split('.');
      if (tokenParts.length !== 3) {
        console.error("Token formatı geçersiz");
        return false;
      }
      
      // Tokenın geçerlilik süresini kontrol et
      try {
        const base64Url = tokenParts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        if (payload.exp) {
          const expDate = new Date(payload.exp * 1000);
          const now = new Date();
          
          if (expDate < now) {
            console.error("Token süresi dolmuş");
            return false;
          }
          
          const timeLeft = expDate - now;
          const minutesLeft = Math.round(timeLeft / (1000 * 60));
          console.log(`Token geçerlilik süresi: ${minutesLeft} dakika`);
        }
      } catch (e) {
        console.error("Token içeriği kontrol edilemedi:", e);
        // Token içeriği okunamasa bile devam etmemizi sağlar
        console.log("Token içeriği kontrol edilemedi ancak formatta sorun yok, devam edilecek");
        return true;
      }
      
      return true;
    } catch (e) {
      console.error("Oturum kontrolü sırasında hata:", e);
      return false;
    }
  };

  // Konum izni isteme fonksiyonu
  const requestLocationPermission = async () => {
    try {
      if (!isLoaded) {
        alert('Harita yükleniyor, lütfen bekleyin...');
        return;
      }
      
      // Oturum token kontrolü - hata olsa bile devam et
      if (!checkAuthToken()) {
        console.warn('Oturum token kontrolü başarısız, ancak konum izni isteniyor');
        // Oturum hatası bildirimi yapıyoruz, ancak konum izni istemeye devam ediyoruz
        setLocationStatus(prev => ({
          ...prev,
          authWarning: true
        }));
      } else {
        console.log("Oturum token kontrolü başarılı");
      }

      console.log("Platform bilgisi:", platformInfo);
      console.log("Konum izni isteniyor...");

      if (navigator.geolocation) {
        // Konum izin ayarları - mobil için optimize edildi
        const geolocationOptions = {
          enableHighAccuracy: true, // Yüksek doğruluk için daima true kullan
          timeout: platformInfo.isMobile ? 30000 : 15000, // Mobilde daha uzun timeout
          maximumAge: 0 // Her zaman en güncel konumu al
        };
        
        console.log("Konum izin ayarları:", geolocationOptions);
        
        // Konum erişimi öncesi bilgilendirme mesajı (özellikle iOS için önemli)
        if (platformInfo.isIOS) {
          alert("Konum paylaşımı için izin isteği gönderdik. Lütfen 'İzin Ver' seçeneğini seçin.\n\nEğer konum izni çalışmazsa:\n1. Ayarlar > Safari > Konum\n2. Konum erişimini 'Sor' veya 'İzin Ver' olarak ayarlayın");
        } else if (platformInfo.isAndroid) {
          alert("Konum paylaşımı için izin isteği gönderdik. Lütfen 'İzin Ver' seçeneğini seçin.\n\nEğer konum çalışmazsa, telefon ayarlarından Chrome'a konum erişimi izni verildiğinden emin olun.");
        }
        
        // Konum almayı dene
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            console.log("Konum başarıyla alındı:", position.coords);
            
            try {
              // Konum bilgisini güncelledik, ancak sunucuya göndermeden önce
              // sürücü UI'ını güncelleyelim
              const locationData = {
                latitude,
                longitude,
                accuracy: accuracy,
                timestamp: new Date(),
                formattedTime: new Date().toLocaleTimeString('tr-TR')
              };

              // Konum durumunu hemen güncelle (sunucu yanıtını beklemeden)
              setLocationStatus(prev => ({
                ...prev,
                supported: true,
                permissionStatus: 'granted',
                active: true,
                lastPosition: locationData
              }));
              
              // Konum takibini başlat
              startLocationTracking();
              
              // Konum bilgisini sunucuya gönder
              const sendSuccess = await sendLocationToServer({
                latitude,
                longitude,
                accuracy: accuracy,
                timestamp: new Date().toISOString(),
                platform: platformInfo.platform
              });
              
              if (sendSuccess) {
                console.log("İlk konum sunucuya başarıyla gönderildi");
                alert(`Konum paylaşımı başladı! (${platformInfo.platform} cihazında)`);
              } else {
                console.warn("İlk konum sunucuya gönderilemedi, ancak konum izleme devam ediyor");
                alert(`Konum paylaşımı başlatıldı, ancak sunucuya gönderimde sorun olabilir. Konum takibi devam ediyor.`);
              }
            } catch (error) {
              console.error('Konum gönderme hatası:', error);
              // Konum alındı, ama sunucuya gönderilemedi
              // Yine de konum izlemeye devam ediyoruz
              alert(`Konum algılandı, ancak sunucuyla iletişim kurulamadı. Konum paylaşımı kısmi olarak aktif.`);
            }
          },
          (error) => {
            console.error('Konum alma hatası kodu:', error.code, 'mesaj:', error.message);
            let errorMessage = 'Konum izni gerekiyor.\n\n';
            
            if (error.code === 1) { // PERMISSION_DENIED
              if (platformInfo.isIOS) {
                errorMessage = 'Konum izni reddedildi veya verilmedi. Lütfen:\n\n' +
                  '1. Ayarlar uygulamasını açın\n' +
                  '2. Gizlilik ve Güvenlik > Konum Servisleri bölümüne gidin\n' +
                  '3. Konum Servisleri\'nin açık olduğundan emin olun\n' +
                  '4. Safari > Konum kısmında "İzin Ver" seçeneğini seçin\n' + 
                  '5. Sayfayı tamamen kapatıp yeniden açın';
              } else if (platformInfo.isAndroid) {
                errorMessage = 'Konum izni reddedildi veya verilmedi. Lütfen:\n\n' +
                  '1. Telefon Ayarlarını açın\n' +
                  '2. Uygulamalar > Chrome veya kullandığınız tarayıcıyı seçin\n' +
                  '3. İzinler > Konum\n' +
                  '4. "İzin Ver" seçeneğini seçin\n' +
                  '5. Sayfayı tamamen kapatıp yeniden açın';
              } else {
                errorMessage = 'Tarayıcı ayarlarından konum iznini vermeniz gerekiyor.\n' +
                  'Adres çubuğunun solundaki kilit/bilgi ikonuna tıklayıp konum izinlerini kontrol edin.';
              }
            } else if (error.code === 2) { // POSITION_UNAVAILABLE
              if (platformInfo.isMobile) {
                errorMessage = 'Konum bilgisi alınamıyor. Lütfen:\n\n' +
                  '1. GPS\'in açık olduğundan emin olun\n' +
                  '2. WiFi\'ı açın (konum doğruluğunu artırır)\n' +
                  '3. Açık bir alanda olduğunuzdan emin olun\n' +
                  '4. Telefonunuzu yeniden başlatmayı deneyin';
              } else {
                errorMessage = 'Konum bilgisi alınamıyor. Konum servislerinin açık olduğundan emin olun.';
              }
            } else if (error.code === 3) { // TIMEOUT
              errorMessage = 'Konum bilgisi alırken zaman aşımı oluştu.\n\n' +
                '1. İnternet bağlantınızı kontrol edin\n' +
                '2. GPS sinyalinizin güçlü olduğu bir alanda olduğunuzdan emin olun\n' +
                '3. Tekrar deneyin';
            }

            alert(errorMessage);
            
            setLocationStatus(prev => ({
              ...prev,
              active: false,
              permissionStatus: 'denied',
              lastPosition: null
            }));
          },
          geolocationOptions
        );
      } else {
        alert('Tarayıcınız konum servisini desteklemiyor. Lütfen başka bir tarayıcı kullanın.');
      }
    } catch (error) {
      console.error('Konum izni hatası:', error);
      alert('Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.');
    }
  };

  // Konum izlemeyi başlat
  const startLocationTracking = () => {
    if (!isLoaded || !navigator.geolocation) {
      console.error("Harita yüklenmedi veya konum desteklenmiyor");
      return;
    }

    console.log("Sürücü konum izleme başlatılıyor, platform:", platformInfo.platform);

    // Konum izleme ayarları - platformlara özel ayarlar
    const watchOptions = {
      enableHighAccuracy: true, // Her platformda yüksek doğruluk gerekiyor
      timeout: platformInfo.isMobile ? 30000 : 15000, // Mobil cihazlarda daha uzun timeout
      maximumAge: 0 // Her zaman en güncel konumu istiyoruz
    };
    
    console.log("Konum izleme ayarları:", watchOptions);

    // Mobil tarayıcılar için ek kontrollerle konum izleme başlat
    try {
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude, accuracy, heading, speed } = position.coords;
          const timestamp = new Date().toISOString();
          
          console.log("Yeni konum alındı:", { 
            lat: latitude, 
            lng: longitude, 
            acc: accuracy,
            platform: platformInfo.platform 
          });
          
          try {
            // Önce UI durumunu güncelle, API başarısız olsa bile
            setLocationStatus(prev => ({
              ...prev,
              active: true,
              errorCount: 0, // Başarılı konum alındığında hata sayacını sıfırla
              lastPosition: {
                latitude,
                longitude,
                accuracy,
                timestamp: new Date(),
                formattedTime: new Date().toLocaleTimeString('tr-TR'),
                heading: heading || null,
                speed: speed || null
              }
            }));
            
            // Konum verilerini hazırla
            let locationData = {
              latitude,
              longitude,
              accuracy,
              heading,
              speed,
              timestamp,
              platform: platformInfo.platform
            };

            // Konum verilerini arka planda gönder (await kullanmayalım)
            // Böylece konum takibi, API çağrısı başarısız olsa bile devam eder
            sendLocationToServer(locationData)
              .then(success => {
                if (!success) {
                  console.warn("Konum gönderimi başarısız, ancak izleme devam ediyor");
                  // Hatayı UI'a yansıtmak isterseniz burada ekleyebilirsiniz
                }
              })
              .catch(error => {
                console.error("Konum gönderimi sırasında hata:", error);
                // Sessizce hatayı gizleyelim, konum izleme devam etsin
              });
          } catch (error) {
            console.error('Konum işleme hatası:', error);
            // Konum alınıyor ancak gönderilemiyor, izlemeyi durdurma
            // Sessizce hatayı gizle, izleme devam etsin
          }
        },
        (error) => {
          console.error('Konum izleme hatası kodu:', error.code, 'mesaj:', error.message);
          
          let errorMessage = 'Konum izleme durdu. ';
          
          if (error.code === 1) { // PERMISSION_DENIED
            errorMessage += 'Konum izni reddedildi. ';
            if (platformInfo.isIOS) {
              errorMessage += 'iOS ayarlarından Safari -> Konum izinlerini kontrol edin ve uygulamaya izin verin.';
            } else if (platformInfo.isAndroid) {
              errorMessage += 'Android ayarlarından Uygulamalar -> Tarayıcı -> İzinler kısmından konum iznini kontrol edin.';
            } else {
              errorMessage += 'Tarayıcı ayarlarından konum iznini kontrol edin.';
            }
            
            // İzin hatasında konum izlemeyi durdur
            stopLocationTracking();
            
            // Alert yerine UI'daki hata durumu ile gösterelim
            setLocationStatus(prev => ({
              ...prev,
              active: false,
              permissionStatus: 'denied',
              error: errorMessage
            }));
            
            alert(errorMessage);
          } else if (error.code === 2) { // POSITION_UNAVAILABLE
            errorMessage += 'Konum bilgisi alınamıyor. ';
            
            if (platformInfo.isMobile) {
              errorMessage += 'Lütfen şunları kontrol edin:\n' +
                '1. GPS açık mı?\n' + 
                '2. WiFi bağlantınız var mı?\n' +
                '3. Açık bir alanda mısınız?';
            } else {
              errorMessage += 'Konum servislerinin açık olduğundan emin olun.';
            }
            
            // Konum alınamıyor hatası genellikle geçicidir
            console.warn(errorMessage);
            
            // UI'da uyarı göster ama izlemeyi durdurma
            setLocationStatus(prev => ({
              ...prev,
              permissionStatus: 'unavailable',
              error: errorMessage,
              errorCount: (prev.errorCount || 0) + 1
            }));
            
            // Sadece 3 kez arka arkaya hata alırsak kullanıcıyı uyar
            if (locationStatus.errorCount >= 3) {
              alert(errorMessage + "\n\nKonum servisleri çalışmıyor. Lütfen telefonunuzun konum ayarlarını kontrol edin.");
            }
          } else if (error.code === 3) { // TIMEOUT
            errorMessage += 'Konum bilgisi alırken zaman aşımı oluştu. ';
            
            if (platformInfo.isMobile) {
              errorMessage += 'Lütfen internet bağlantınızı ve GPS sinyalinizi kontrol edin.';
            } else {
              errorMessage += 'İnternet bağlantınızı kontrol edin.';
            }
            
            // Timeout hatası genellikle geçicidir
            console.warn(errorMessage);
            
            // UI'da uyarı göster ama izlemeyi durdurma
            setLocationStatus(prev => ({
              ...prev,
              timeoutWarning: true,
              error: errorMessage,
              errorCount: (prev.errorCount || 0) + 1
            }));
            
            // Sadece 3 kez arka arkaya hata alırsak kullanıcıyı uyar
            if (locationStatus.errorCount >= 3) {
              alert(errorMessage);
            }
          } else {
            // Diğer bilinmeyen hatalar için durdur
            stopLocationTracking();
            alert(errorMessage);
          }
        },
        watchOptions
      );

      setLocationStatus(prev => ({
        ...prev,
        watchId,
        active: true,
        startTime: new Date()
      }));
    } catch (watchError) {
      console.error("Konum izleme başlatılırken beklenmeyen hata:", watchError);
      alert("Konum izleme başlatılamadı. Lütfen tarayıcınızın konum servislerini kontrol edin ve sayfayı yenileyin.");
      
      setLocationStatus(prev => ({
        ...prev,
        active: false,
        error: "Konum izleme başlatılamadı: " + (watchError.message || "Bilinmeyen hata")
      }));
    }
  };

  // Konum verilerini sunucuya gönder
  const sendLocationToServer = async (locationData) => {
    try {
      // Gönderilecek verileri kontrol et
      if (!locationData || typeof locationData !== 'object') {
        console.error('Geçersiz konum verisi:', locationData);
        throw new Error('Geçersiz konum verisi');
      }

      if (!locationData.latitude || !locationData.longitude) {
        console.error('Konum verisinde enlem/boylam eksik:', locationData);
        throw new Error('Konum bilgileri eksik');
      }

      // Sayısal değerleri kontrol et ve format dönüşümlerini yap
      const formattedData = {
        latitude: parseFloat(locationData.latitude),
        longitude: parseFloat(locationData.longitude),
        accuracy: locationData.accuracy ? parseFloat(locationData.accuracy) : undefined,
        heading: locationData.heading ? parseFloat(locationData.heading) : undefined,
        speed: locationData.speed ? parseFloat(locationData.speed) : undefined,
        timestamp: locationData.timestamp || new Date().toISOString(),
        platform: locationData.platform || platformInfo.platform
      };

      // Adres varsa ekle
      if (locationData.address) {
        formattedData.address = locationData.address;
      }

      // Sunucu URL'sini belirle - ÖNEMLİ: Konum API'sinin güvenle çalışması için HTTPS kullan
      const hostname = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : '';
      
      // Her zaman HTTPS kullan (localhost dahil) - konum API'si için güvenlik gereklidir
      const apiProtocol = 'https:';
      
      // Eğer localhost ise direkt port'u 3000 olarak ayarla
      const apiPort = (hostname === 'localhost' || hostname === '127.0.0.1') ? ':3000' : port;
      
      const apiUrl = `${apiProtocol}//${hostname}${apiPort}/api/drivers/location`;
      
      console.log("Konum gönderilen API URL:", apiUrl);
      console.log("Gönderilecek konum verileri:", formattedData);
      
      // Oturum bilgilerini al
      let authToken = null;
      let userId = null;
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          authToken = user.token;
          userId = user.id;
          
          console.log("Kullanıcı bilgileri:", {
            id: userId,
            role: user.type || user.role,
            tokenVar: authToken ? 'Evet' : 'Hayır'
          });
          
          if (!authToken) {
            console.warn("Oturum token'ı bulunamadı");
          } else {
            console.log("Oturum token'ı kullanılacak");
          }
        } else {
          console.warn("Oturum bilgileri bulunamadı");
        }
      } catch (e) {
        console.error("Oturum bilgileri alınamadı:", e);
      }
      
      // Headers oluştur
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Kimlik doğrulama token'ı varsa ekle
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      // Güvenilirlik için deneme sayısı
      const maxRetries = 3;
      let currentRetry = 0;
      let success = false;
      let lastError = null;
      
      while (currentRetry < maxRetries && !success) {
        try {
          // API isteği gönder
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(formattedData),
            credentials: 'include', // Cookie tabanlı kimlik doğrulama için
            mode: 'cors' // CORS politikası
          });
          
          // Yanıt tipini kontrol et
          const contentType = response.headers.get("content-type");
          
          if (response.ok) {
            if (contentType && contentType.indexOf("application/json") !== -1) {
              const responseData = await response.json();
              console.log("Konum yanıtı alındı:", responseData);
              
              // Yanıt başarılı olsa bile içerikte hata olabilir
              if (responseData.success === false) {
                console.warn("Sunucu başarılı yanıt verdi ama işlem başarısız:", responseData.error);
                
                // Yine de UI'ı güncelleyelim
                setLocationStatus(prev => ({
                  ...prev,
                  active: true,
                  serverError: responseData.error || "Bilinmeyen sunucu hatası",
                  lastPosition: {
                    latitude: formattedData.latitude,
                    longitude: formattedData.longitude,
                    accuracy: formattedData.accuracy,
                    timestamp: new Date(),
                    formattedTime: new Date().toLocaleTimeString('tr-TR'),
                    address: formattedData.address || null
                  }
                }));
                
                // Gerçek bir hata gibi işleyip 3 deneme yaptıralım
                throw new Error(responseData.error || "Sunucu işlemi başarısız");
              }
              
              console.log("Konum başarıyla gönderildi:", responseData);
              
              setLocationStatus(prev => ({
                ...prev,
                active: true,
                lastPosition: {
                  latitude: formattedData.latitude,
                  longitude: formattedData.longitude,
                  accuracy: formattedData.accuracy,
                  timestamp: new Date(),
                  formattedTime: new Date().toLocaleTimeString('tr-TR'),
                  address: formattedData.address || null
                }
              }));
              
              success = true;
              return true;
            } else {
              // JSON olmayan başarılı yanıt 
              const textSample = await response.text();
              console.log("JSON olmayan başarılı yanıt alındı");
              console.log("Yanıt tipi:", contentType);
              console.log("Yanıt içeriği (ilk 100 karakter):", textSample.substring(0, 100));
              
              // HTML yanıt genellikle kimlik doğrulama sayfasına yönlendirme içerir
              if (textSample.includes("<html") || textSample.includes("<!DOCTYPE")) {
                console.warn("HTML yanıt alındı, muhtemelen oturum sorunu var");
                // Yeniden deneme için bu denemeyi atlayalım
                lastError = new Error("Sunucu HTML yanıtı döndürdü, yeniden deneniyor");
                currentRetry++;
                continue;
              } else {
                // Diğer başarılı yanıtlar
                setLocationStatus(prev => ({
                  ...prev,
                  active: true,
                  lastPosition: {
                    latitude: formattedData.latitude,
                    longitude: formattedData.longitude,
                    accuracy: formattedData.accuracy,
                    timestamp: new Date(),
                    formattedTime: new Date().toLocaleTimeString('tr-TR')
                  }
                }));
                
                success = true;
                return true;
              }
            }
          } else {
            // Hata yanıtı
            let errorMessage = `HTTP Hata ${response.status}`;
            let errorDetails = {};
            let isAuthError = false;
            
            if (response.status === 401 || response.status === 403) {
              isAuthError = true;
              errorMessage = 'Oturum doğrulama hatası';
              
              // Token yenilemesi için kullanıcı hesabını yeniden yüklemeyi deneyelim
              try {
                const user = JSON.parse(localStorage.getItem('user')) || {};
                console.log("Oturum yenileme denemesi...");
                
                // Token yenileme mantığı buraya eklenebilir
                // Şimdilik basit bir yeniden giriş sayfasına yönlendirme denemesi yapıyoruz
                if (currentRetry === maxRetries - 1) {
                  alert('Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.');
                  window.location.href = '/login';
                  return false;
                }
              } catch (refreshError) {
                console.error("Oturum yenileme hatası:", refreshError);
              }
            }
            
            if (contentType && contentType.indexOf("application/json") !== -1) {
              try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
                errorDetails = errorData.details || {};
                console.error("Sunucu hata detayı:", JSON.stringify(errorData));
              } catch (e) {
                console.error("JSON hata yanıtı işlenemedi", e);
              }
            } else {
              // JSON olmayan hata yanıtı
              const errorText = await response.text();
              console.error('HTTP hata yanıtı (tam mesaj):', errorText);
            }
            
            console.error("Konum gönderme hatası:", errorMessage, "HTTP Status:", response.status, "Detaylar:", errorDetails);
            
            if (isAuthError) {
              // Oturum hatası durumunda, token yenileme denememiz başarısız oldu, tekrar deneyelim
              lastError = new Error(errorMessage);
              currentRetry++;
              continue;
            }
            
            throw new Error(errorMessage);
          }
        } catch (fetchError) {
          console.error(`Konum gönderme denemesi ${currentRetry + 1}/${maxRetries} hatası:`, fetchError);
          lastError = fetchError;
          currentRetry++;
          
          // Son deneme değilse kısa bir beklemeden sonra tekrar dene
          if (currentRetry < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      // Tüm denemeler başarısız olduysa
      if (!success) {
        throw lastError || new Error("Konum gönderilemedi, tüm denemeler başarısız oldu");
      }
      
      return success;
    } catch (error) {
      console.error("Konum gönderme hatası:", error.message, error.stack);
      
      // Hata sayacını artır
      const errorCount = locationStatus.errorCount || 0;
      
      // Belirli aralıklarla kullanıcıyı uyar
      if (errorCount % 5 === 0) {
        const isAuthError = error.message.includes('Oturum') || 
                           error.message.includes('token') ||
                           error.message.includes('yetki');
        
        if (isAuthError) {
          console.warn("Oturum hatası algılandı, ancak konum izleme devam ediyor");
          
          // Sadece konsola yazdır, kullanıcıyı rahatsız etme
          // alert(`Oturum hatası: ${error.message}`);
        } else if (platformInfo.isMobile) {
          // Daha detaylı hata görüntüleme
          alert(`Konum güncellenemedi: ${error.message}\n\nLütfen ekran görüntüsünü alıp destek ekibine gönderin.`);
        }
      }
      
      setLocationStatus(prev => ({
        ...prev,
        errorCount: errorCount + 1
      }));
      
      return false;
    }
  };

  // Konum izlemeyi durdur
  const stopLocationTracking = () => {
    if (locationStatus.watchId) {
      navigator.geolocation.clearWatch(locationStatus.watchId);
      setLocationStatus(prev => ({
        ...prev,
        active: false,
        watchId: null,
        lastPosition: null
      }));
    }
  };

  // Konum paylaşımını aç/kapat
  const toggleLocation = () => {
    if (locationStatus.active) {
      stopLocationTracking();
    } else {
      requestLocationPermission();
    }
  };

  // Konum durumunu render et
  const renderLocationStatus = () => {
    if (!isLoaded) {
      return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mr-2"></div>
            <span>Harita yükleniyor...</span>
          </div>
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="text-red-500">
            Harita yüklenirken hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.
          </div>
        </div>
      );
    }
    
    // Oturum uyarısı
    const showAuthWarning = locationStatus.authWarning || locationStatus.authError;
    
    // Konum doğruluğu düşükse uyarı göster
    const showAccuracyWarning = locationStatus.lastPosition && 
                              locationStatus.lastPosition.accuracy && 
                              locationStatus.lastPosition.accuracy > 100;

    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-lg font-semibold mb-4">Konum Takibi</h2>
        
        {/* Oturum uyarı mesajı */}
        {showAuthWarning && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-yellow-700">
                  Oturum bilgilerinizde sorun olabilir. Konum takibi çalışıyor, ancak sunucuya gönderimde sorunlar yaşanabilir.
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Bu sorun devam ederse lütfen tekrar giriş yapın.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Platform bilgisi */}
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm text-blue-700">
                Platform: <span className="font-semibold">{platformInfo.platform}</span>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {platformInfo.isIOS && "iOS cihazınız için konum izinlerini Ayarlar > Safari > Konum kısmından kontrol ediniz."}
                {platformInfo.isAndroid && "Android cihazınız için konum izinlerini Ayarlar > Uygulamalar > Tarayıcı > İzinler kısmından kontrol ediniz."}
                {!platformInfo.isMobile && "Masaüstü tarayıcı için adres çubuğu solundaki izinleri kontrol ediniz."}
              </p>
            </div>
          </div>
        </div>
        
        {/* Konum doğruluğu uyarısı */}
        {showAccuracyWarning && (
          <div className="mb-4 p-2 bg-orange-50 border border-orange-200 rounded-md">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-orange-700">
                  Düşük Konum Doğruluğu: {locationStatus.lastPosition.accuracy.toFixed(0)} metre
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Konumunuzun doğruluğu düşük. Daha yüksek doğruluk için:
                </p>
                <ul className="text-xs text-orange-600 mt-1 list-disc list-inside">
                  <li>Cihazınızın konum ayarlarında "Yüksek Doğruluk" modunu etkinleştirin</li>
                  <li>Açık alanda veya pencere kenarında durun</li>
                  <li>Wi-Fi'ı açın (konum doğruluğunu artırır)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <span>Konum Paylaşımı</span>
          <div 
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${locationStatus.active ? 'bg-green-500' : 'bg-gray-300'}`}
            onClick={toggleLocation}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${locationStatus.active ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </div>
        </div>
        
        {locationStatus.permissionStatus === 'denied' && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
            <p>Konum iznini reddettiniz. Konumunuzu paylaşmak için izin vermeniz gerekiyor.</p>
            <p className="mt-1 text-xs">
              {platformInfo.isIOS && "iOS'ta konum izinlerini Ayarlar > Safari > Konum kısmından açmanız gerekiyor."}
              {platformInfo.isAndroid && "Android'de konum izinlerini Ayarlar > Uygulamalar > Chrome > İzinler kısmından açmanız gerekiyor."}
            </p>
            <button 
              onClick={requestLocationPermission}
              className="mt-2 px-4 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
            >
              İzin Ver
            </button>
          </div>
        )}
        
        {locationStatus.active ? (
          <>
            <div className="text-sm text-green-600 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Konumunuz paylaşılıyor
            </div>
            
            {locationStatus.lastPosition && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Enlem/Boylam:</span>
                  <span className="font-medium">{locationStatus.lastPosition.latitude.toFixed(6)}, {locationStatus.lastPosition.longitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Doğruluk:</span>
                  <span className={`font-medium ${locationStatus.lastPosition.accuracy > 100 ? 'text-orange-600' : locationStatus.lastPosition.accuracy > 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {locationStatus.lastPosition.accuracy ? `${Math.round(locationStatus.lastPosition.accuracy)} m` : 'Bilinmiyor'}
                    {locationStatus.lastPosition.accuracy <= 10 && ' (Yüksek)'}
                    {locationStatus.lastPosition.accuracy > 10 && locationStatus.lastPosition.accuracy <= 50 && ' (Orta)'}
                    {locationStatus.lastPosition.accuracy > 50 && locationStatus.lastPosition.accuracy <= 100 && ' (Düşük)'}
                    {locationStatus.lastPosition.accuracy > 100 && ' (Çok Düşük)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Son Güncelleme:</span>
                  <span className="font-medium">{locationStatus.lastPosition.formattedTime}</span>
                </div>
                {locationStatus.lastPosition.address && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Adres:</span>
                    <span className="font-medium text-right">{locationStatus.lastPosition.address}</span>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-500 mb-3">
            Konum paylaşımı kapalı. Konumunuzu paylaşmak için açın.
          </div>
        )}
        
        <button
          onClick={locationStatus.active ? stopLocationTracking : requestLocationPermission}
          className={`w-full py-2 rounded-md text-white font-medium mt-3 ${locationStatus.active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
        >
          {locationStatus.active ? 'Konum Paylaşımını Durdur' : 'Konum Paylaşımını Başlat'}
        </button>
        
        {/* Konum doğruluğu bilgi paneli */}
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-700 mb-2">Konum Doğruluğunu Artırmak İçin:</h3>
          <ul className="text-xs text-blue-600 list-disc list-inside space-y-1">
            <li>Cihaz ayarlarından konum servislerini "Yüksek Doğruluk" moduna ayarlayın</li>
            <li>Wi-Fi'ı açık tutun (konum doğruluğunu artırır)</li>
            <li>Açık alanda veya pencere kenarında durun</li>
            <li>Tarayıcı ayarlarından "Hassas konum" iznini etkinleştirin</li>
            <li>Cihazınızın GPS özelliğinin açık olduğundan emin olun</li>
            {platformInfo.isIOS && <li>iOS: Ayarlar → Gizlilik → Konum Servisleri → Safari → "Tam Konum" seçeneğini işaretleyin</li>}
            {platformInfo.isAndroid && <li>Android: Ayarlar → Konum → Google Konum Doğruluğu → Yüksek Doğruluk modunu açın</li>}
          </ul>
        </div>
        
        {/* Konum hata ayıklama bilgisi */}
        <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-500">
          <details>
            <summary className="cursor-pointer font-medium">Konum Sorunları İçin Gelişmiş Çözümler</summary>
            <div className="mt-2 space-y-2">
              <p>Konum çalışmıyorsa şunları deneyin:</p>
              <ol className="list-decimal list-inside pl-2 space-y-1">
                <li>Tarayıcıyı tamamen kapatıp yeniden açın</li>
                <li>Telefonunuzu uçak moduna alıp çıkarın</li>
                <li>GPS'i kapatıp yeniden açın</li>
                <li>Tarayıcı önbelleğini temizleyin</li>
                <li>Farklı bir tarayıcı deneyin (Chrome, Safari veya Firefox)</li>
                <li>Telefonunuzu yeniden başlatın</li>
              </ol>
            </div>
          </details>
        </div>
      </div>
    );
  };

  useEffect(() => {
    // Token kontrolü
    const userData = localStorage.getItem('userData');
    if (!userData) {
      console.error('Token bulunamadı');
      router.push('/portal/login');
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (!user.token) {
        console.error('Geçersiz token formatı');
        router.push('/portal/login');
        return;
      }

      // Token'ı decode et
      const tokenData = JSON.parse(atob(user.token));
      
      // Token süresi kontrolü
      if (tokenData.exp < Math.floor(Date.now() / 1000)) {
        console.error('Token süresi dolmuş');
        localStorage.removeItem('userData');
        router.push('/portal/login');
        return;
      }

      // Sürücü rolü kontrolü
      if (tokenData.role !== 'driver') {
        console.error('Geçersiz kullanıcı rolü');
        router.push('/portal/login');
        return;
      }

      // Kullanıcı bilgilerini state'e kaydet
      setUser(user);
    } catch (error) {
      console.error('Token doğrulama hatası:', error);
      localStorage.removeItem('userData');
      router.push('/portal/login');
    }
  }, [router]);

  const handleLogout = () => {
    // Konum izlemeyi durdur
    if (locationStatus.watchId) {
      navigator.geolocation.clearWatch(locationStatus.watchId);
    }
    
    // Tüm oturum verilerini temizle
    localStorage.removeItem('userData');
    
    // State'i temizle
    setUser(null);
    setLocationStatus({
      supported: false,
      active: false,
      lastPosition: null,
      permissionStatus: 'prompt',
      watchId: null
    });
    
    // Login sayfasına yönlendir
    router.push('/portal/login');
  };

  if (loading) {
    return (
      <DriverLayout title="Sürücü Paneli">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </DriverLayout>
    );
  }

  return (
    <DriverLayout title="Sürücü Paneli">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderLocationStatus()}

        {/* Hoşgeldiniz Kartı */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Hoş Geldiniz, {user?.formattedName || 'Sürücü'}!
                </h2>
                <p className="mt-1 text-sm text-orange-100">
                  Bugün {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  {stats.inProgress > 0 ? `${stats.inProgress} Aktif Taşıma` : 'Aktif Taşıma Yok'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-100 rounded-md p-3">
                  <FaTruck className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tamamlanan Taşımalar
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.completed}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <FaRoute className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Toplam Mesafe
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.distance} km
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                  <FaMoneyBillWave className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Toplam Kazanç
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.earnings} ₺
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <FaMedal className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Performans Puanı
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        4.8/5
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Aktif Görevler */}
            <div className="lg:col-span-2 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Yaklaşan Görevlerim</h3>
                <Link href="/portal/driver/active-tasks" className="text-sm text-orange-600 hover:text-orange-800">
                  Tümünü Görüntüle →
                </Link>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {tasks.length === 0 ? (
                    <li className="py-4 px-4 sm:px-6 flex items-center justify-center">
                      <p className="text-gray-500 text-sm">Yaklaşan görev bulunmuyor</p>
                    </li>
                  ) : (
                    tasks.map((task) => (
                      <li key={task.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                        <Link href={`/portal/driver/active-tasks`} className="block">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {task.title}
                              </p>
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <FaCalendarAlt className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                <p>{task.date}</p>
                              </div>
                            </div>
                            <div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                task.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {task.status === 'active' ? 'Aktif' : 'Beklemede'}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="text-sm text-gray-500 grid grid-cols-1 sm:grid-cols-2 gap-y-1">
                              <div className="flex items-center">
                                <FaMapMarkedAlt className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                <span>Alınacak: {task.pickup}</span>
                              </div>
                              <div className="flex items-center">
                                <FaMapMarkedAlt className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                <span>Teslim: {task.delivery}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            {/* Bildirimler ve Duyurular */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FaBell className="mr-2 text-orange-500" />
                  Bildirimler
                </h3>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  <li className="px-4 py-4 sm:px-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-orange-200 flex items-center justify-center">
                          <FaTruck className="h-4 w-4 text-orange-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          Yeni Görev Atandı
                        </p>
                        <p className="text-sm text-gray-500">
                          İstanbul Kadıköy - Ankara Çankaya Arası Taşıma
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          15 dakika önce
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="px-4 py-4 sm:px-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center">
                          <FaChartLine className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          Performans Güncellendi
                        </p>
                        <p className="text-sm text-gray-500">
                          Geçen ay performansınız 4.8/5 olarak değerlendirildi.
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          1 gün önce
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="px-4 py-4 sm:px-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center">
                          <FaMoneyBillWave className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          Ödeme Yapıldı
                        </p>
                        <p className="text-sm text-gray-500">
                          Geçen ayın ödemesi hesabınıza yatırılmıştır.
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          3 gün önce
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DriverLayout>
  );
} 