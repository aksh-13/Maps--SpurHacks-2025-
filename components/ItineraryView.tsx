'use client'

import { Calendar, Clock, MapPin, Star, DollarSign, Utensils, Train, Lightbulb, Globe, Phone, Briefcase, ExternalLink } from 'lucide-react'

interface ItineraryViewProps {
  tripPlan: {
    destination: string
    duration: string
    budget: string
    bestTimeToVisit?: string
    weather?: string
    timezone?: string
    language?: string
    currency?: string
    itinerary: {
      day: number
      title: string
      theme?: string
      morning?: {
        time: string
        activity: string
        location: { name: string; lat: number; lng: number; address?: string }
        duration: string
        cost: string
        tips: string
        bookingUrl?: string
        bookingPlatform?: string
      }
      afternoon?: {
        time: string
        activity: string
        location: { name: string; lat: number; lng: number; address?: string }
        duration: string
        cost: string
        tips: string
        bookingUrl?: string
        bookingPlatform?: string
      }
      evening?: {
        time: string
        activity: string
        location: { name: string; lat: number; lng: number; address?: string }
        duration: string
        cost: string
        tips: string
        bookingUrl?: string
        bookingPlatform?: string
      }
      transportation?: Array<{
        from: string
        to: string
        method: string
        duration: string
        cost: string
        details: string
        bookingUrl?: string
      }>
      dining?: Array<{
        meal: string
        restaurant: string
        cuisine: string
        priceRange: string
        specialty: string
        location: { name: string; lat: number; lng: number; address?: string }
        bookingUrl?: string
        bookingPlatform?: string
      }>
      highlights?: string[]
      totalCost?: string
    }[]
    transportation?: {
      airport?: string
      fromAirport?: string
      localTransport?: string
      recommendations?: string[]
    }
    dining?: {
      localCuisine?: string
      restaurantTypes?: string[]
      priceRanges?: {
        budget: string
        midRange: string
        luxury: string
      }
      recommendations?: string[]
    }
    culturalInsights?: {
      customs?: string[]
      etiquette?: string[]
      language?: {
        hello: string
        thankYou: string
        goodbye: string
      }
    }
    travelTips?: string[]
    emergencyInfo?: {
      police?: string
      hospital?: string
      embassy?: string
    }
    packingList?: {
      essentials?: string[]
      seasonal?: string[]
      optional?: string[]
    }
  }
}

export default function ItineraryView({ tripPlan }: ItineraryViewProps) {
  const getTimeSlotIcon = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning': return '🌅'
      case 'afternoon': return '☀️'
      case 'evening': return '🌆'
      default: return '🕐'
    }
  }

  const getTransportIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'metro': return '🚇'
      case 'bus': return '🚌'
      case 'walk': return '🚶'
      case 'taxi': return '🚕'
      case 'train': return '🚂'
      default: return '🚗'
    }
  }

  return (
    <div className="space-y-8">
      {/* Trip Overview */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Globe className="h-8 w-8" />
          <h2 className="text-2xl font-bold">Your Trip to {tripPlan.destination}</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{tripPlan.duration}</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>{tripPlan.budget}</span>
          </div>
          {tripPlan.bestTimeToVisit && (
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>Best: {tripPlan.bestTimeToVisit}</span>
            </div>
          )}
          {tripPlan.currency && (
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>{tripPlan.currency}</span>
            </div>
          )}
        </div>

        {tripPlan.weather && (
          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <p className="text-sm">🌤️ {tripPlan.weather}</p>
          </div>
        )}
      </div>

      {/* Detailed Itinerary */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Daily Itinerary</h3>
        </div>

        {tripPlan.itinerary.map((day, dayIndex) => (
          <div key={dayIndex} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            {/* Day Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                  {day.day}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{day.title}</h4>
                  {day.theme && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {day.theme} Theme
                    </span>
                  )}
                </div>
              </div>
              {day.totalCost && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Cost</p>
                  <p className="text-lg font-bold text-green-600">{day.totalCost}</p>
                </div>
              )}
            </div>

            {/* Time Slots */}
            <div className="space-y-6">
              {['morning', 'afternoon', 'evening'].map((timeSlot) => {
                const slot = day[timeSlot as keyof typeof day] as any
                if (!slot) return null

                return (
                  <div key={timeSlot} className="border-l-4 border-blue-200 pl-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl">{getTimeSlotIcon(timeSlot)}</span>
                      <h5 className="font-semibold text-gray-900 capitalize">{timeSlot}</h5>
                      <span className="text-sm text-gray-500">({slot.time})</span>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <p className="font-medium text-gray-900">{slot.activity}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{slot.location.name}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{slot.duration}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <DollarSign className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{slot.cost}</span>
                          </span>
                        </div>
                        {slot.bookingUrl && (
                          <a
                            href={slot.bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Book {slot.bookingPlatform || 'Now'}</span>
                          </a>
                        )}
                      </div>

                      <div className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                        <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800">{slot.tips}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Transportation */}
            {day.transportation && day.transportation.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h6 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Train className="h-4 w-4 text-gray-600" />
                  <span>Transportation</span>
                </h6>
                <div className="space-y-2">
                  {day.transportation.map((transport, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <span>{getTransportIcon(transport.method)}</span>
                        <span className="text-gray-600">{transport.from} → {transport.to}</span>
                        <span className="text-gray-500">({transport.duration}, {transport.cost})</span>
                      </div>
                      {transport.bookingUrl && (
                        <a
                          href={transport.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Book</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dining */}
            {day.dining && day.dining.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h6 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Utensils className="h-4 w-4 text-gray-600" />
                  <span>Dining</span>
                </h6>
                <div className="space-y-3">
                  {day.dining.map((meal, index) => (
                    <div key={index} className="bg-orange-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{meal.meal}</span>
                            <span className="text-sm text-gray-600">{meal.priceRange}</span>
                          </div>
                          <p className="text-sm text-gray-700">{meal.restaurant} - {meal.cuisine}</p>
                          <p className="text-xs text-gray-500">Specialty: {meal.specialty}</p>
                        </div>
                        {meal.bookingUrl && (
                          <a
                            href={meal.bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 px-3 py-1 bg-orange-600 text-white text-xs rounded-full hover:bg-orange-700 transition-colors ml-3"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Reserve {meal.bookingPlatform || 'Table'}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            {day.highlights && day.highlights.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h6 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Highlights</span>
                </h6>
                <div className="flex flex-wrap gap-2">
                  {day.highlights.map((highlight, index) => (
                    <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transportation Info */}
        {tripPlan.transportation && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Train className="h-5 w-5 text-blue-600" />
              <span>Transportation</span>
            </h4>
            <div className="space-y-3 text-sm">
              {tripPlan.transportation.airport && (
                <p><strong>Airport:</strong> {tripPlan.transportation.airport}</p>
              )}
              {tripPlan.transportation.fromAirport && (
                <p><strong>From Airport:</strong> {tripPlan.transportation.fromAirport}</p>
              )}
              {tripPlan.transportation.localTransport && (
                <p><strong>Local Transport:</strong> {tripPlan.transportation.localTransport}</p>
              )}
              {tripPlan.transportation.recommendations && (
                <div>
                  <strong>Recommendations:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {tripPlan.transportation.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cultural Insights */}
        {tripPlan.culturalInsights && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Globe className="h-5 w-5 text-green-600" />
              <span>Cultural Insights</span>
            </h4>
            <div className="space-y-3 text-sm">
              {tripPlan.culturalInsights.language && (
                <div>
                  <strong>Basic Phrases:</strong>
                  <div className="mt-1 space-y-1">
                    <p>Hello: {tripPlan.culturalInsights.language.hello}</p>
                    <p>Thank you: {tripPlan.culturalInsights.language.thankYou}</p>
                    <p>Goodbye: {tripPlan.culturalInsights.language.goodbye}</p>
                  </div>
                </div>
              )}
              {tripPlan.culturalInsights.customs && (
                <div>
                  <strong>Customs:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {tripPlan.culturalInsights.customs.map((custom, index) => (
                      <li key={index}>{custom}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emergency Info */}
        {tripPlan.emergencyInfo && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Phone className="h-5 w-5 text-red-600" />
              <span>Emergency Information</span>
            </h4>
            <div className="space-y-2 text-sm">
              {tripPlan.emergencyInfo.police && (
                <p><strong>Police:</strong> {tripPlan.emergencyInfo.police}</p>
              )}
              {tripPlan.emergencyInfo.hospital && (
                <p><strong>Hospital:</strong> {tripPlan.emergencyInfo.hospital}</p>
              )}
              {tripPlan.emergencyInfo.embassy && (
                <p><strong>Embassy:</strong> {tripPlan.emergencyInfo.embassy}</p>
              )}
            </div>
          </div>
        )}

        {/* Packing List */}
        {tripPlan.packingList && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-purple-600" />
              <span>Packing List</span>
            </h4>
            <div className="space-y-3 text-sm">
              {tripPlan.packingList.essentials && (
                <div>
                  <strong>Essentials:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {tripPlan.packingList.essentials.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {tripPlan.packingList.seasonal && (
                <div>
                  <strong>Seasonal:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {tripPlan.packingList.seasonal.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Travel Tips */}
      {tripPlan.travelTips && tripPlan.travelTips.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-4 flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <span>Travel Tips</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tripPlan.travelTips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">💡</span>
                <p className="text-sm text-blue-800">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 