'use client'

import { useState, useEffect } from 'react'
import { Star, MapPin, Bed, DollarSign, ExternalLink, Building, Home } from 'lucide-react'
import { accommodationService, AccommodationSearchParams, UnifiedAccommodationResult } from '@/services/hotels/accommodation-service'

interface AccommodationListProps {
  location: string
  checkIn?: string
  checkOut?: string
  guests?: number
}

export default function AccommodationList({ 
  location, 
  checkIn = '2024-01-15', 
  checkOut = '2024-01-20', 
  guests = 2 
}: AccommodationListProps) {
  const [accommodations, setAccommodations] = useState<UnifiedAccommodationResult[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | 'hotels' | 'rentals'>('all')
  const [airbnbLink, setAirbnbLink] = useState('')

  useEffect(() => {
    loadAccommodations()
  }, [location, checkIn, checkOut, guests])

  const loadAccommodations = async () => {
    setLoading(true)
    try {
      const searchParams: AccommodationSearchParams = {
        location,
        checkIn,
        checkOut,
        guests,
        type: 'both'
      }

      const results = await accommodationService.searchAccommodations(searchParams)
      setAccommodations(results)

      // Generate Airbnb link as alternative
      const airbnbUrl = accommodationService.generateAirbnbLink(location, checkIn, checkOut, guests)
      setAirbnbLink(airbnbUrl)
    } catch (error) {
      console.error('Error loading accommodations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAccommodations = accommodations.filter(acc => {
    if (activeFilter === 'all') return true
    return acc.type === (activeFilter === 'hotels' ? 'hotel' : 'rental')
  })

  const getTypeIcon = (type: 'hotel' | 'rental') => {
    return type === 'hotel' ? <Building className="h-4 w-4" /> : <Home className="h-4 w-4" />
  }

  const getTypeLabel = (type: 'hotel' | 'rental') => {
    return type === 'hotel' ? 'Hotel' : 'Rental'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bed className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">Accommodation Options</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bed className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Accommodation Options</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              activeFilter === 'all'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('hotels')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              activeFilter === 'hotels'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Hotels
          </button>
          <button
            onClick={() => setActiveFilter('rentals')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              activeFilter === 'rentals'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Rentals
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAccommodations.map((accommodation) => (
          <div key={accommodation.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative">
              <img
                src={accommodation.image}
                alt={accommodation.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${
                  accommodation.type === 'hotel' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {getTypeIcon(accommodation.type)}
                  <span>{getTypeLabel(accommodation.type)}</span>
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  <span className="text-xs font-medium">{accommodation.rating}</span>
                </div>
              </div>
            </div>

            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2">{accommodation.name}</h4>
              
              <div className="flex items-center space-x-1 text-sm text-gray-500 mb-3">
                <MapPin className="h-3 w-3" />
                <span>{accommodation.address}</span>
              </div>

              {accommodation.type === 'rental' && (
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span>{accommodation.bedrooms} bed{accommodation.bedrooms !== 1 ? 's' : ''}</span>
                  <span>{accommodation.bathrooms} bath{accommodation.bathrooms !== 1 ? 's' : ''}</span>
                  <span>Up to {accommodation.maxGuests} guests</span>
                </div>
              )}

              {accommodation.type === 'rental' && accommodation.hostName && (
                <div className="text-sm text-gray-600 mb-3">
                  Hosted by {accommodation.hostName}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-gray-900">{accommodation.price}</span>
                </div>
                
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    View Details
                  </button>
                  <a
                    href={accommodation.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Book</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Airbnb Alternative */}
      {airbnbLink && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 border border-pink-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Also check out Airbnb</h4>
              <p className="text-sm text-gray-600 mb-3">
                Find unique stays and local experiences in {location}
              </p>
            </div>
            <a
              href={airbnbLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all flex items-center space-x-2"
            >
              <span>Browse Airbnb</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Booking Tips</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-600">Book early for better rates and availability</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-600">Check cancellation policies before booking</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-600">Read recent reviews for current conditions</p>
          </div>
        </div>
      </div>
    </div>
  )
}