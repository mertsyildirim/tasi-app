import { useEffect, useRef, useState } from 'react';

const Map = ({ pickupAreas = [], deliveryAreas = [] }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  useEffect(() => {
    // Google Maps API'sinin yüklenip yüklenmediğini kontrol et
    if (typeof window === 'undefined') return;

    const initMap = () => {
      try {
        if (!window.google || !window.google.maps) {
          setMapError('Google Maps API yüklenemedi');
          return;
        }

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
        setIsMapLoaded(true);
        
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
      } catch (error) {
        console.error('Harita yüklenirken hata:', error);
        setMapError('Harita yüklenirken bir hata oluştu');
      }
    };

    // Google Maps API'sinin yüklenmesini bekle
    const waitForGoogleMaps = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(waitForGoogleMaps);
        initMap();
      }
    }, 100);

    return () => {
      clearInterval(waitForGoogleMaps);
      if (mapInstanceRef.current) {
        markersRef.current.forEach(marker => marker.setMap(null));
      }
    };
  }, [pickupAreas, deliveryAreas]);
  
  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center text-gray-600">
          <p className="text-lg font-medium mb-2">Harita Yüklenemedi</p>
          <p className="text-sm">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapRef} className="w-full h-full rounded-lg">
      {!isMapLoaded && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      )}
    </div>
  );
};

export default Map; 