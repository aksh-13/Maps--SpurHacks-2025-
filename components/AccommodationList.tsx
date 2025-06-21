'use client'

import { Star, MapPin, Bed, DollarSign, ExternalLink } from 'lucide-react'

interface Accommodation {
  id: number
  name: string
  type: string
  price: string
  rating: number
  image: string
  location: { lat: number; lng: number }
}

interface AccommodationListProps {
  accommodations: Accommodation[]
}

export default function AccommodationList({ accommodations }: AccommodationListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bed className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Accommodation Options</h3>
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-full">
            All
          </button>
          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-full">
            Hotels
          </button>
          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-full">
            Airbnb
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accommodations.map((accommodation) => (
          <div key={accommodation.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative">
              <img
                src={accommodation.image}
                alt={accommodation.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  accommodation.type === 'Hotel' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {accommodation.type}
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
                <span>Central location</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-gray-900">{accommodation.price}</span>
                </div>
                
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    View Details
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1">
                    <ExternalLink className="h-3 w-3" />
                    <span>Book</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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