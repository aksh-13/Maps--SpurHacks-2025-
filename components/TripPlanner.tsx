'use client'

import { useState, useEffect } from 'react'
import { Send, MapPin, Calendar, Users, DollarSign, Info, Lightbulb, Plane, Bookmark, BookmarkPlus } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import TripMap from './TripMap'
import AccommodationList from './AccommodationList'
import ItineraryView from './ItineraryView'
import FlightsSection from './FlightsSection'
import { userTripsService } from '@/services/trips/user-trips'
import { localAuthService } from '@/services/auth/local-auth'

interface TripPlan {
  destination: string
  duration: string
  budget: string
  bestTimeToVisit?: string
  weather?: string
  timezone?: string
  language?: string
  currency?: string
  activities: string[]
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
  accommodationSuggestions?: {
    name: string
    type: string
    priceRange: string
    location?: string
    amenities?: string[]
    pros?: string[]
    cons?: string[]
    bookingUrl: string
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

export default function TripPlanner({ onPlanningStart }: { onPlanningStart: () => void }) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'map' | 'itinerary' | 'accommodations' | 'flights' | 'tips' | 'cultural'>('map')
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // Debug logging for tab changes
  useEffect(() => {
    console.log('Active tab changed to:', activeTab)
  }, [activeTab])

  // Debug logging for flights tab
  useEffect(() => {
    if (activeTab === 'flights' && tripPlan) {
      console.log('Flights tab active, destination:', tripPlan.destination)
    }
  }, [activeTab, tripPlan])

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

  const saveTrip = async () => {
    if (!tripPlan) return

    setIsSaving(true)
    try {
      const currentUser = await localAuthService.getCurrentUser()
      if (!currentUser) {
        toast.error('Please sign in to save trips')
        return
      }

      const savedTrip = await userTripsService.saveTrip({
        title: `${tripPlan.destination} - ${tripPlan.duration}`,
        destination: tripPlan.destination,
        duration: tripPlan.duration,
        budget: tripPlan.budget,
        prompt: prompt,
        tripPlan: tripPlan,
        tags: ['generated', tripPlan.destination.toLowerCase()]
      })

      if (savedTrip) {
        setIsSaved(true)
        toast.success('Trip saved to My Trips!')
      } else {
        toast.error('Failed to save trip')
      }
    } catch (error) {
      console.error('Error saving trip:', error)
      toast.error('Failed to save trip')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {!tripPlan ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-hover"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary-900 mb-4">
              Tell us about your dream trip
            </h2>
            <p className="text-primary-600">
              Describe your ideal vacation and we'll create a personalized itinerary with 3D maps and accommodation options.
            </p>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., I want to spend 7 days in Paris with my family, budget around $3000, interested in art, food, and culture..."
                className="input-field h-32 resize-none"
              />
            </div>

            {error && (
              <div className="text-error-700 text-sm bg-error-50 p-4 rounded-xl border border-error-200 text-center">
                {error}
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={generateTrip}
                disabled={isGenerating || !prompt.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Generate Trip Plan</span>
                  </>
                )}
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
          <div className="card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-primary-900 mb-2">
                  {tripPlan.destination}
                </h2>
                <div className="flex flex-wrap gap-4 text-sm text-primary-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{tripPlan.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{tripPlan.budget}</span>
                  </div>
                  {tripPlan.bestTimeToVisit && (
                    <div className="flex items-center space-x-1">
                      <Lightbulb className="h-4 w-4" />
                      <span>Best: {tripPlan.bestTimeToVisit}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3 mt-4 md:mt-0">
                <button
                  onClick={saveTrip}
                  disabled={isSaving || isSaved}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                    isSaved 
                      ? 'bg-success-100 text-success-700 cursor-default' 
                      : 'bg-accent-600 text-white hover:bg-accent-700 disabled:opacity-50'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : isSaved ? (
                    <>
                      <Bookmark className="h-4 w-4" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="h-4 w-4" />
                      <span>Save Trip</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setTripPlan(null)}
                  className="btn-secondary"
                >
                  Start New Trip
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-surface-200">
            {[
              { id: 'map', label: '3D Map', icon: MapPin },
              { id: 'itinerary', label: 'Itinerary', icon: Calendar },
              { id: 'accommodations', label: 'Hotels', icon: Users },
              { id: 'flights', label: 'Flights', icon: Plane },
              { id: 'tips', label: 'Travel Tips', icon: Info },
              { id: 'cultural', label: 'Cultural Info', icon: Lightbulb },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    console.log('Tab clicked:', tab.id)
                    setActiveTab(tab.id as any)
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-accent-100 text-accent-700 border border-accent-200'
                      : 'text-primary-600 hover:text-accent-600 hover:bg-surface-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="card">
            {activeTab === 'map' && <TripMap tripPlan={tripPlan} />}
            {activeTab === 'itinerary' && <ItineraryView tripPlan={tripPlan} />}
            {activeTab === 'accommodations' && (
              <AccommodationList 
                location={tripPlan.destination}
              />
            )}
            {activeTab === 'flights' && (
              <div>
                <FlightsSection 
                  destination={tripPlan.destination}
                  duration={tripPlan.duration}
                />
              </div>
            )}
            {activeTab === 'tips' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-primary-900 mb-4">Travel Tips</h3>
                  <ul className="space-y-3">
                    {tripPlan.travelTips?.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-primary-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {tripPlan.packingList && (
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-3">Packing List</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <h5 className="font-medium text-primary-800 mb-2">Essentials</h5>
                        <ul className="space-y-1 text-sm text-primary-600">
                          {tripPlan.packingList.essentials?.map((item, index) => (
                            <li key={index}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-primary-800 mb-2">Seasonal</h5>
                        <ul className="space-y-1 text-sm text-primary-600">
                          {tripPlan.packingList.seasonal?.map((item, index) => (
                            <li key={index}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-primary-800 mb-2">Optional</h5>
                        <ul className="space-y-1 text-sm text-primary-600">
                          {tripPlan.packingList.optional?.map((item, index) => (
                            <li key={index}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'cultural' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-primary-900 mb-4">Cultural Insights</h3>
                  {tripPlan.culturalInsights?.customs && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-primary-800 mb-3">Local Customs</h4>
                      <ul className="space-y-2">
                        {tripPlan.culturalInsights.customs.map((custom, index) => (
                          <li key={index} className="text-primary-700">• {custom}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {tripPlan.culturalInsights?.etiquette && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-primary-800 mb-3">Etiquette</h4>
                      <ul className="space-y-2">
                        {tripPlan.culturalInsights.etiquette.map((rule, index) => (
                          <li key={index} className="text-primary-700">• {rule}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {tripPlan.culturalInsights?.language && (
                    <div>
                      <h4 className="text-lg font-semibold text-primary-800 mb-3">Basic Phrases</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-surface-50 p-4 rounded-xl">
                          <div className="font-medium text-primary-800">Hello</div>
                          <div className="text-primary-600">{tripPlan.culturalInsights.language.hello}</div>
                        </div>
                        <div className="bg-surface-50 p-4 rounded-xl">
                          <div className="font-medium text-primary-800">Thank You</div>
                          <div className="text-primary-600">{tripPlan.culturalInsights.language.thankYou}</div>
                        </div>
                        <div className="bg-surface-50 p-4 rounded-xl">
                          <div className="font-medium text-primary-800">Goodbye</div>
                          <div className="text-primary-600">{tripPlan.culturalInsights.language.goodbye}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {tripPlan.emergencyInfo && (
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-3">Emergency Information</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {tripPlan.emergencyInfo.police && (
                        <div className="bg-error-50 p-4 rounded-xl border border-error-200">
                          <div className="font-medium text-error-800">Police</div>
                          <div className="text-error-700">{tripPlan.emergencyInfo.police}</div>
                        </div>
                      )}
                      {tripPlan.emergencyInfo.hospital && (
                        <div className="bg-error-50 p-4 rounded-xl border border-error-200">
                          <div className="font-medium text-error-800">Hospital</div>
                          <div className="text-error-700">{tripPlan.emergencyInfo.hospital}</div>
                        </div>
                      )}
                      {tripPlan.emergencyInfo.embassy && (
                        <div className="bg-error-50 p-4 rounded-xl border border-error-200">
                          <div className="font-medium text-error-800">Embassy</div>
                          <div className="text-error-700">{tripPlan.emergencyInfo.embassy}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
} 