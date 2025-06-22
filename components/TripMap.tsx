'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation } from 'lucide-react'

interface TripMapProps {
  tripPlan: {
    destination: string
    itinerary: {
      day: number
      locations: { name: string; lat: number; lng: number }[]
    }[]
    accommodations?: any[]
    accommodationSuggestions?: {
      name: string;
      type: string;
      priceRange: string;
      bookingUrl: string;
    }[];
  }
}

export default function TripMap({ tripPlan }: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Initialize map (you'll need to add your Mapbox access token)
    const initializeMap = async () => {
      try {
        const mapboxgl = await import('mapbox-gl')
        
        if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
          console.warn('Mapbox access token not found. Using fallback map.')
          return
        }

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [2.3522, 48.8566], // Paris coordinates
          zoom: 12,
          pitch: 45,
          bearing: 0
        })

        map.current.on('load', () => {
          setMapLoaded(true)
          addMarkers()
        })
      } catch (error) {
        console.error('Error loading mapbox:', error)
      }
    }

    initializeMap()

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [])

  const addMarkers = () => {
    if (!map.current || !mapLoaded) return

    // Add markers for all locations
    const itineraryLocations = tripPlan.itinerary.flatMap(day => day.locations)
    
    // Use accommodationSuggestions if available, otherwise use old accommodations field
    const accommodationLocations = (tripPlan.accommodationSuggestions || tripPlan.accommodations || []).map((acc: any) => ({
      name: acc.name,
      lat: acc.location?.lat, // Use optional chaining for safety
      lng: acc.location?.lng
    })).filter(acc => acc.lat && acc.lng) // Filter out any without coordinates

    const allLocations = [...itineraryLocations, ...accommodationLocations]

    allLocations.forEach((location, index) => {
      const el = document.createElement('div')
      el.className = 'marker'
      el.style.width = '25px'
      el.style.height = '25px'
      el.style.borderRadius = '50%'
      // Differentiate marker colors
      el.style.backgroundColor = index >= itineraryLocations.length ? '#3b82f6' : '#10b981'
      el.style.border = '3px solid white'
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
      el.style.cursor = 'pointer'

      new (window as any).mapboxgl.Marker(el)
        .setLngLat([location.lng, location.lat])
        .setPopup(
          new (window as any).mapboxgl.Popup({ offset: 25 })
            .setHTML(`<h3>${location.name}</h3>`)
        )
        .addTo(map.current)
    })
  }

  // Fallback map display when Mapbox is not available
  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <MapPin className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Interactive 3D Map</h3>
        <p className="text-gray-600 mb-4">
          To enable the interactive 3D map, please add your Mapbox access token to the environment variables.
        </p>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="font-medium text-gray-800 mb-2">Trip Locations:</h4>
          <div className="space-y-2 text-sm text-gray-600">
            {tripPlan.itinerary.map((day, dayIndex) => (
              <div key={dayIndex}>
                <p className="font-medium">Day {day.day}:</p>
                <ul className="ml-4 space-y-1">
                  {day.locations.map((location, locIndex) => (
                    <li key={locIndex} className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      {location.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {(tripPlan.accommodations || tripPlan.accommodationSuggestions) && (
              <div className="mt-4">
                <p className="font-medium">Accommodations:</p>
                <ul className="ml-4 space-y-1">
                  {(tripPlan.accommodations || tripPlan.accommodationSuggestions)?.map((acc: any, index: number) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      {acc.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
        <div className="flex items-center space-x-2">
          <Navigation className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">3D Trip Map</span>
        </div>
      </div>
      
      <div 
        ref={mapContainer} 
        className="w-full h-[600px] rounded-lg shadow-lg"
        style={{ minHeight: '600px' }}
      />
      
      <style jsx>{`
        .marker {
          transition: transform 0.2s;
        }
        .marker:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  )
} 