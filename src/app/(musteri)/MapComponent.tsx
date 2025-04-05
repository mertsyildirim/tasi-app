'use client'

import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api'
import { useState, useEffect } from 'react'

interface MapProps {
  pickupMarker: MapMarker | null
  deliveryMarker: MapMarker | null
  routeInfo: RouteInfo | null
  onRouteFound: (info: { distance: string; duration: string }) => void
  isPickupSelecting?: boolean
  isDeliverySelecting?: boolean
  onLocationSelect?: (location: google.maps.LatLngLiteral) => void
}

interface MapMarker {
  lat: number
  lng: number
  title?: string
}

interface RouteInfo {
  distance: string
  duration: string
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

const center = {
  lat: 41.0082,
  lng: 28.9784
}

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false
}

export default function MapComponent({
  pickupMarker,
  deliveryMarker,
  routeInfo,
  onRouteFound,
  isPickupSelecting,
  isDeliverySelecting,
  onLocationSelect
}: MapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)

  useEffect(() => {
    if (map && pickupMarker && deliveryMarker) {
      const directionsService = new google.maps.DirectionsService()

      directionsService.route(
        {
          origin: { lat: pickupMarker.lat, lng: pickupMarker.lng },
          destination: { lat: deliveryMarker.lat, lng: deliveryMarker.lng },
          travelMode: google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === 'OK' && result) {
            setDirections(result)
            const route = result.routes[0]
            if (route && route.legs[0]) {
              onRouteFound({
                distance: route.legs[0].distance?.text || '',
                duration: route.legs[0].duration?.text || ''
              })
            }
          }
        }
      )
    }
  }, [map, pickupMarker, deliveryMarker])

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if ((isPickupSelecting || isDeliverySelecting) && onLocationSelect && e.latLng) {
      onLocationSelect({ lat: e.latLng.lat(), lng: e.latLng.lng() })
    }
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={11}
      options={mapOptions}
      onClick={handleMapClick}
      onLoad={setMap}
    >
      {pickupMarker && (
        <Marker
          position={pickupMarker}
          title={pickupMarker.title}
          label={{
            text: "A",
            color: "white"
          }}
        />
      )}
      {deliveryMarker && (
        <Marker
          position={deliveryMarker}
          title={deliveryMarker.title}
          label={{
            text: "B",
            color: "white"
          }}
        />
      )}
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  )
} 