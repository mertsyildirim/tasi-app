'use client'

import { useEffect, useRef, useState } from 'react'
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api'
import { FaPlus, FaMinus } from 'react-icons/fa'

interface MapComponentProps {
  pickupMarker?: google.maps.LatLngLiteral
  deliveryMarker?: google.maps.LatLngLiteral
  routeInfo?: { distance: string; duration: string }
  onRouteFound?: (info: { distance: string; duration: string }) => void
  isPickupSelecting?: boolean
  isDeliverySelecting?: boolean
  onLocationSelect?: (location: google.maps.LatLngLiteral) => void
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem'
}

const defaultCenter = {
  lat: 41.0082,
  lng: 28.9784
}

const mapOptions: google.maps.MapOptions = {
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ],
  mapTypeControl: false,
  fullscreenControl: false,
  streetViewControl: false,
  rotateControl: false,
  scaleControl: false,
  zoomControl: true,
  panControl: false,
  clickableIcons: false,
  gestureHandling: 'greedy',
  disableDefaultUI: false
}

export default function MapComponent({
  pickupMarker,
  deliveryMarker,
  routeInfo,
  onRouteFound,
  isPickupSelecting,
  isDeliverySelecting,
  onLocationSelect,
}: MapComponentProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null)

  useEffect(() => {
    if (map) {
      // Harita tıklama olayını dinle
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng && onLocationSelect) {
          if (isPickupSelecting || isDeliverySelecting) {
            onLocationSelect(e.latLng.toJSON())
          }
        }
      })
    }
  }, [map, isPickupSelecting, isDeliverySelecting, onLocationSelect])

  useEffect(() => {
    if (pickupMarker && deliveryMarker && map) {
      const directionsService = new google.maps.DirectionsService()
      directionsService.route(
        {
          origin: pickupMarker,
          destination: deliveryMarker,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            setDirectionsResult(result)
            if (onRouteFound && result.routes[0]) {
              const route = result.routes[0]
              const distance = route.legs[0]?.distance?.text || ''
              const duration = route.legs[0]?.duration?.text || ''
              onRouteFound({ distance, duration })
            }
          }
        }
      )
    }
  }, [pickupMarker, deliveryMarker, map, onRouteFound])

  const onLoad = (map: google.maps.Map) => {
    setMap(map)
  }

  const handleZoomIn = () => {
    if (map) {
      map.setZoom((map.getZoom() || 0) + 1)
    }
  }

  const handleZoomOut = () => {
    if (map) {
      map.setZoom((map.getZoom() || 0) - 1)
    }
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        onLoad={onLoad}
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={11}
        options={mapOptions}
      >
        {pickupMarker && (
          <Marker
            position={pickupMarker}
            icon={{
              url: 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi.png',
              scaledSize: new google.maps.Size(20, 20)
            }}
          />
        )}
        {deliveryMarker && (
          <Marker
            position={deliveryMarker}
            icon={{
              url: 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi.png',
              scaledSize: new google.maps.Size(20, 20)
            }}
          />
        )}
        {directionsResult && (
          <DirectionsRenderer
            directions={directionsResult}
            options={{
              polylineOptions: {
                strokeColor: '#ff6b00',
                strokeWeight: 4
              }
            }}
          />
        )}
      </GoogleMap>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-100"
        >
          <FaPlus className="text-gray-600" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-100"
        >
          <FaMinus className="text-gray-600" />
        </button>
      </div>
    </div>
  )
} 