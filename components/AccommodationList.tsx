'use client'

import { useState, useEffect } from 'react'
import { Star, MapPin, Bed, DollarSign, ExternalLink, Building, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Hotel {
  id: string
  name: string
  rating: number
  price: number
  currency: string
  location: string
  imageUrl?: string
  amenities?: string[]
  description?: string
  bookingUrl?: string
}

interface AccommodationListProps {
  location: string
  checkIn?: string
  checkOut?: string
  guests?: number
}

export default function AccommodationList({ 
  location, 
  checkIn, 
  checkOut, 
  guests = 2 
}: AccommodationListProps) {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState<string | null>(null)

  // Generate default dates if not provided
  const getDefaultDates = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    return {
      checkIn: checkIn || tomorrow.toISOString().split('T')[0],
      checkOut: checkOut || nextWeek.toISOString().split('T')[0]
    }
  }

  const { checkIn: defaultCheckIn, checkOut: defaultCheckOut } = getDefaultDates()

  useEffect(() => {
    loadHotels()
  }, [location, defaultCheckIn, defaultCheckOut, guests])

  const loadHotels = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/hotels?destination=${encodeURIComponent(location)}&checkInDate=${defaultCheckIn}&checkOutDate=${defaultCheckOut}&adults=${guests}&children=0&rooms=1`
      )
      
      if (response.ok) {
        const data = await response.json()
        setHotels(data.hotels || [])
      } else {
        console.error('Failed to load hotels')
      }
    } catch (error) {
      console.error('Error loading hotels:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookingClick = async (hotel: Hotel) => {
    if (!hotel.bookingUrl) return
    
    setBookingLoading(hotel.id)
    
    try {
      // Check if it's a Google Hotels URL
      const isGoogleHotels = hotel.bookingUrl.includes('google.com/travel/hotels')
      
      if (isGoogleHotels) {
        toast.success(`Opening ${hotel.name} on Google Hotels...`)
      } else {
        toast.success(`Searching for ${hotel.name} on Booking.com...`)
      }
      
      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Open the booking URL in a new tab
      const newWindow = window.open(hotel.bookingUrl, '_blank', 'noopener,noreferrer')
      
      // Check if the window opened successfully
      if (!newWindow) {
        toast.error('Popup blocked! Please allow popups for this site.')
      } else {
        // Show additional info about the booking process
        setTimeout(() => {
          if (isGoogleHotels) {
            toast.success(`Opened ${hotel.name} on Google Hotels. You should see the specific hotel!`, {
              duration: 4000
            })
          } else {
            toast.success(`Opened ${hotel.name} search on Booking.com. Look for the hotel in the search results!`, {
              duration: 4000
            })
          }
        }, 1000)
      }
    } catch (error) {
      console.error('Error opening booking link:', error)
      toast.error('Failed to open booking link. Try the search button below.')
    } finally {
      // Reset loading state after a short delay
      setTimeout(() => setBookingLoading(null), 500)
    }
  }

  const handleSearchBookingClick = async () => {
    try {
      const url = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(location)}&checkin=${defaultCheckIn}&checkout=${defaultCheckOut}&group_adults=${guests}`
      toast.success(`Opening Booking.com search for ${location}...`)
      
      // Add a small delay to show the toast
      await new Promise(resolve => setTimeout(resolve, 150))
      
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Error opening search link:', error)
      toast.error('Failed to open search link')
    }
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
          <h3 className="text-xl font-semibold text-gray-900">Hotel Options in {location}</h3>
        </div>
      </div>

      {/* Info section about booking process */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium">Booking Process:</p>
            <p>Click "Book" to search for the specific hotel on Google Hotels. This provides better results for finding the exact hotel you want.</p>
          </div>
        </div>
      </div>

      {hotels.length === 0 ? (
        <div className="text-center py-12">
          <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No hotels found</h4>
          <p className="text-gray-500">Try adjusting your search criteria or dates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'}
                  alt={hotel.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 bg-blue-100 text-blue-800">
                    <Building className="h-4 w-4" />
                    <span>Hotel</span>
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="text-xs font-medium">{hotel.rating}</span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{hotel.name}</h4>
                
                <div className="flex items-center space-x-1 text-sm text-gray-500 mb-3">
                  <MapPin className="h-3 w-3" />
                  <span>{hotel.location}</span>
                </div>

                {hotel.description && (
                  <p className="text-sm text-gray-600 mb-3">{hotel.description}</p>
                )}

                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {hotel.amenities.slice(0, 3).map((amenity, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-gray-900">
                      ${hotel.price} {hotel.currency}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      View Details
                    </button>
                    {hotel.bookingUrl && (
                      <button
                        onClick={() => handleBookingClick(hotel)}
                        disabled={bookingLoading === hotel.id}
                        title={`Search for ${hotel.name} on Google Hotels`}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                      >
                        {bookingLoading === hotel.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <ExternalLink className="h-3 w-3" />
                        )}
                        <span>{bookingLoading === hotel.id ? 'Opening...' : 'Book'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-blue-900">Need more options?</h4>
            <p className="text-sm text-blue-700">Explore additional accommodation types and deals.</p>
          </div>
          <button
            onClick={handleSearchBookingClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Search on Booking.com</span>
          </button>
        </div>
      </div>
    </div>
  )
}