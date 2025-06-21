'use client'

import { Calendar, Clock, MapPin, Star } from 'lucide-react'

interface ItineraryViewProps {
  tripPlan: {
    destination: string
    itinerary: {
      day: number
      activities: string[]
      locations: { name: string; lat: number; lng: number }[]
    }[]
  }
}

export default function ItineraryView({ tripPlan }: ItineraryViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Calendar className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">Your Trip Itinerary</h3>
      </div>

      <div className="space-y-6">
        {tripPlan.itinerary.map((day, dayIndex) => (
          <div key={dayIndex} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                {day.day}
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Day {day.day}</h4>
            </div>

            <div className="space-y-4">
              {day.activities.map((activity, activityIndex) => (
                <div key={activityIndex} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{activity}</p>
                    {day.locations[activityIndex] && (
                      <div className="flex items-center space-x-1 mt-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-500">{day.locations[activityIndex].name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>2h</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Highlights of the day</span>
                </div>
                <span className="text-sm text-blue-600 font-medium">
                  {day.activities.length} activities
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-2">Trip Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-blue-600 font-medium">Total Days</p>
            <p className="text-blue-900">{tripPlan.itinerary.length}</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Total Activities</p>
            <p className="text-blue-900">
              {tripPlan.itinerary.reduce((total, day) => total + day.activities.length, 0)}
            </p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Locations</p>
            <p className="text-blue-900">
              {tripPlan.itinerary.reduce((total, day) => total + day.locations.length, 0)}
            </p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Destination</p>
            <p className="text-blue-900">{tripPlan.destination}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 