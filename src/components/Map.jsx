import { useEffect, useRef } from 'react';

const Map = ({ pickupAreas = [], deliveryAreas = [] }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Harita yüklendiğinde çalışacak
    const initMap = () => {
      // Türkiye'nin merkezi koordinatları
      const turkeyCenter = { lat: 39.9334, lng: 32.8597 };
      
      // Harita oluştur
      const map = new window.google.maps.Map(mapRef.current, {
        center: turkeyCenter,
        zoom: 6,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });
      
      mapInstanceRef.current = map;
      
      // Önceki işaretçileri temizle
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      
      // Alınacak adresleri ekle (mavi)
      pickupAreas.forEach(area => {
        const marker = new window.google.maps.Marker({
          position: area.coordinates,
          map,
          title: area.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: area.color || '#3B82F6',
            fillOpacity: 0.7,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
        });
        
        // Bilgi penceresi ekle
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div class="p-2"><strong>${area.name}</strong><br>Alınacak Adres</div>`,
        });
        
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
        
        markersRef.current.push(marker);
      });
      
      // Teslim edilecek adresleri ekle (yeşil)
      deliveryAreas.forEach(area => {
        const marker = new window.google.maps.Marker({
          position: area.coordinates,
          map,
          title: area.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: area.color || '#10B981',
            fillOpacity: 0.7,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
        });
        
        // Bilgi penceresi ekle
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div class="p-2"><strong>${area.name}</strong><br>Teslim Edilecek Adres</div>`,
        });
        
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
        
        markersRef.current.push(marker);
      });
    };
    
    // Google Maps API'sinin yüklenip yüklenmediğini kontrol et
    if (window.google && window.google.maps) {
      initMap();
    } else {
      // API yüklenmemişse, yüklenmesini bekle
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogleMaps);
          initMap();
        }
      }, 100);
      
      // Temizleme fonksiyonu
      return () => clearInterval(checkGoogleMaps);
    }
    
    // Temizleme fonksiyonu
    return () => {
      if (mapInstanceRef.current) {
        markersRef.current.forEach(marker => marker.setMap(null));
      }
    };
  }, [pickupAreas, deliveryAreas]);
  
  return (
    <div ref={mapRef} className="w-full h-full">
      {/* Google Maps burada yüklenecek */}
    </div>
  );
};

export default Map; 