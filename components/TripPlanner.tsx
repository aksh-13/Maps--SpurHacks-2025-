'use client'

import { useState } from 'react'
import { Send, MapPin, Calendar, Users, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'
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
    activities: string[]
    locations: { name: string; lat: number; lng: number }[]
  }[]
  accommodations: any[]
}

export default function TripPlanner({ onPlanningStart }: { onPlanningStart: () => void }) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null)
  const [activeTab, setActiveTab] = useState<'map' | 'itinerary' | 'accommodations'>('map')

  const generateTrip = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    onPlanningStart()

    try {
      // Simulate AI trip generation (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const mockTripPlan: TripPlan = {
        destination: 'Paris, France',
        duration: '7 days',
        budget: '$2,500',
        activities: ['Visit Eiffel Tower', 'Louvre Museum', 'Seine River Cruise', 'Notre-Dame Cathedral'],
        itinerary: [
          {
            day: 1,
            activities: ['Arrive in Paris', 'Check into hotel', 'Eiffel Tower visit', 'Dinner at local bistro'],
            locations: [
              { name: 'Eiffel Tower', lat: 48.8584, lng: 2.2945 },
              { name: 'Hotel', lat: 48.8566, lng: 2.3522 }
            ]
          },
          {
            day: 2,
            activities: ['Louvre Museum', 'Walk along Champs-Élysées', 'Arc de Triomphe'],
            locations: [
              { name: 'Louvre Museum', lat: 48.8606, lng: 2.3376 },
              { name: 'Arc de Triomphe', lat: 48.8738, lng: 2.2950 }
            ]
          }
        ],
        accommodations: [
          {
            id: 1,
            name: 'Hotel Le Meurice',
            type: 'Hotel',
            price: '$350/night',
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
            location: { lat: 48.8663, lng: 2.3295 }
          },
          {
            id: 2,
            name: 'Charming Paris Apartment',
            type: 'Airbnb',
            price: '$180/night',
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
            location: { lat: 48.8566, lng: 2.3522 }
          }
        ]
      }

      setTripPlan(mockTripPlan)
    } catch (error) {
      console.error('Error generating trip:', error)
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
            <div className="flex space-x-1 mb-6">
              <button
                onClick={() => setActiveTab('map')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                3D Map
              </button>
              <button
                onClick={() => setActiveTab('itinerary')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'itinerary'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Itinerary
              </button>
              <button
                onClick={() => setActiveTab('accommodations')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'accommodations'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Accommodations
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px]">
              {activeTab === 'map' && <TripMap tripPlan={tripPlan} />}
              {activeTab === 'itinerary' && <ItineraryView tripPlan={tripPlan} />}
              {activeTab === 'accommodations' && <AccommodationList accommodations={tripPlan.accommodations} />}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
} 