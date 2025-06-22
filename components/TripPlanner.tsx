'use client'

import { useState } from 'react'
import { Send, MapPin, Calendar, Users, DollarSign, Info, Lightbulb } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import TripMap from './TripMap'
import AccommodationList from './AccommodationList'
import ItineraryView from './ItineraryView'

interface TripPlan {
  destination: string
  duration: string
  budget: string
  activities: string[]
  itinerary: {
    day: number
    title: string
    activities: string[]
    locations: { name: string; lat: number; lng: number }[]
  }[]
  accommodationSuggestions?: {
    name: string
    type: string
    priceRange: string
    bookingUrl: string
  }[]
  travelTips?: string[]
}

export default function TripPlanner({ onPlanningStart }: { onPlanningStart: () => void }) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'map' | 'itinerary' | 'accommodations' | 'tips'>('map')

  const generateTrip = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError(null)
    onPlanningStart()

    try {
      // Generate AI trip plan
      const response = await fetch('/api/generate-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API error: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success && data.tripPlan) {
        setTripPlan(data.tripPlan)
        setActiveTab('itinerary')
        toast.success('Trip plan generated successfully!')
      } else {
        throw new Error(data.error || 'Invalid response from trip generation API')
      }
    } catch (err: any) {
      console.error('Error generating trip:', err)
      setError(err.message || 'Failed to generate trip. Please try again.')
      toast.error('Failed to generate trip plan')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {!tripPlan ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tell us about your dream trip
            </h2>
            <p className="text-gray-600">
              Describe your ideal vacation and we'll create a personalized itinerary with 3D maps and accommodation options.
            </p>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., I want to spend 7 days in Paris with my family, budget around $3000, interested in art, food, and culture..."
                className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={generateTrip}
                disabled={isGenerating || !prompt.trim()}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isGenerating ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
                <span>{isGenerating ? 'Planning your trip...' : 'Generate Trip Plan'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Trip Summary */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3">
                <MapPin className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Destination</p>
                  <p className="font-semibold">{tripPlan.destination}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-semibold">{tripPlan.duration}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <DollarSign className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-semibold">{tripPlan.budget}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Activities</p>
                  <p className="font-semibold">{tripPlan.activities.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex space-x-1 mb-6 border-b">
              <button
                onClick={() => setActiveTab('itinerary')}
                className={`flex items-center space-x-2 px-4 py-2 transition-colors ${
                  activeTab === 'itinerary'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <span>Itinerary</span>
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center space-x-2 px-4 py-2 transition-colors ${
                  activeTab === 'map'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <span>3D Map</span>
              </button>
              <button
                onClick={() => setActiveTab('accommodations')}
                className={`flex items-center space-x-2 px-4 py-2 transition-colors ${
                  activeTab === 'accommodations'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <span>Accommodations</span>
              </button>
              {tripPlan.travelTips && tripPlan.travelTips.length > 0 && (
                <button
                  onClick={() => setActiveTab('tips')}
                  className={`flex items-center space-x-2 px-4 py-2 transition-colors ${
                    activeTab === 'tips'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <span>Travel Tips</span>
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px]">
              {activeTab === 'map' && <TripMap tripPlan={tripPlan} />}
              {activeTab === 'itinerary' && <ItineraryView tripPlan={tripPlan} />}
              {activeTab === 'accommodations' && (
                <AccommodationList 
                  location={tripPlan.destination}
                  checkIn="2024-01-15"
                  checkOut="2024-01-22"
                  guests={2}
                />
              )}
              {activeTab === 'tips' && tripPlan.travelTips && (
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-4">Travel Tips</h3>
                  <ul className="space-y-2">
                    {tripPlan.travelTips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Lightbulb className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
} 