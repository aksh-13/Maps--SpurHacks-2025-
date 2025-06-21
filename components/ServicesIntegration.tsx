'use client'

import { useState, useEffect } from 'react'
import { 
  Cloud, 
  Globe, 
  Music, 
  Wifi, 
  Plane, 
  CreditCard, 
  Languages,
  MapPin,
  Calendar,
  Users,
  Star,
  ExternalLink
} from 'lucide-react'
import { motion } from 'framer-motion'

interface ServiceStatus {
  name: string
  status: 'connected' | 'fallback' | 'error'
  description: string
  icon: React.ReactNode
}

export default function ServicesIntegration() {
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([])
  const [activeService, setActiveService] = useState<string | null>(null)
  const [weatherData, setWeatherData] = useState<any>(null)
  const [translationData, setTranslationData] = useState<any>(null)
  const [flightData, setFlightData] = useState<any>(null)
  const [musicData, setMusicData] = useState<any>(null)
  const [esimData, setEsimData] = useState<any>(null)

  const services = [
    {
      name: 'Weather Service',
      icon: <Cloud className="h-6 w-6" />,
      description: 'Real-time weather forecasts and packing recommendations',
      endpoint: '/api/weather?location=Paris&days=7'
    },
    {
      name: 'Translation Service',
      icon: <Languages className="h-6 w-6" />,
      description: 'Real-time translation and phrase books',
      endpoint: '/api/translate?action=languages'
    },
    {
      name: 'Flight Service',
      icon: <Plane className="h-6 w-6" />,
      description: 'Flight search and booking options',
      endpoint: '/api/flights?action=airports&query=paris'
    },
    {
      name: 'Music Service',
      icon: <Music className="h-6 w-6" />,
      description: 'AI-powered music recommendations',
      endpoint: '/api/music?action=popular'
    },
    {
      name: 'eSIM Service',
      icon: <Wifi className="h-6 w-6" />,
      description: 'eSIM plans and connectivity solutions',
      endpoint: '/api/esim?action=recommendations&destination=France&duration=7'
    },
    {
      name: 'Payment Service',
      icon: <CreditCard className="h-6 w-6" />,
      description: 'Secure payment processing',
      status: 'connected'
    }
  ]

  useEffect(() => {
    checkServiceStatuses()
  }, [])

  const checkServiceStatuses = async () => {
    const statuses: ServiceStatus[] = []

    for (const service of services) {
      try {
        if (service.endpoint) {
          const response = await fetch(service.endpoint)
          const status = response.ok ? 'connected' : 'fallback'
          statuses.push({
            name: service.name,
            status,
            description: service.description,
            icon: service.icon
          })
        } else {
          statuses.push({
            name: service.name,
            status: service.status as 'connected' | 'fallback' | 'error',
            description: service.description,
            icon: service.icon
          })
        }
      } catch (error) {
        statuses.push({
          name: service.name,
          status: 'fallback',
          description: service.description,
          icon: service.icon
        })
      }
    }

    setServiceStatuses(statuses)
  }

  const testWeatherService = async () => {
    setActiveService('weather')
    try {
      const response = await fetch('/api/weather?location=Paris&days=7')
      const data = await response.json()
      setWeatherData(data)
    } catch (error) {
      console.error('Weather service test failed:', error)
    }
  }

  const testTranslationService = async () => {
    setActiveService('translation')
    try {
      const response = await fetch('/api/translate?action=phrasebook&language=fr')
      const data = await response.json()
      setTranslationData(data)
    } catch (error) {
      console.error('Translation service test failed:', error)
    }
  }

  const testFlightService = async () => {
    setActiveService('flight')
    try {
      const response = await fetch('/api/flights?action=search&origin=JFK&destination=CDG&departureDate=2024-02-15&passengers=2')
      const data = await response.json()
      setFlightData(data)
    } catch (error) {
      console.error('Flight service test failed:', error)
    }
  }

  const testMusicService = async () => {
    setActiveService('music')
    try {
      const response = await fetch('/api/music?action=recommendations&destination=Paris&mood=romantic')
      const data = await response.json()
      setMusicData(data)
    } catch (error) {
      console.error('Music service test failed:', error)
    }
  }

  const testESIMService = async () => {
    setActiveService('esim')
    try {
      const response = await fetch('/api/esim?action=recommendations&destination=France&duration=7')
      const data = await response.json()
      setEsimData(data)
    } catch (error) {
      console.error('eSIM service test failed:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100'
      case 'fallback': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '🟢'
      case 'fallback': return '🟡'
      case 'error': return '🔴'
      default: return '⚪'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Connected Services Dashboard
          </h2>
          <p className="text-gray-600">
            All your travel services are integrated and ready to enhance your trip planning experience.
          </p>
        </div>

        {/* Service Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {serviceStatuses.map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-blue-600">
                    {service.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                </div>
                <span className="text-2xl">{getStatusIcon(service.status)}</span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{service.description}</p>
              
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                {service.status === 'connected' ? 'Connected' : 
                 service.status === 'fallback' ? 'Using Fallback' : 'Error'}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Service Testing Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Test Services</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              onClick={testWeatherService}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Test Weather
            </button>
            <button
              onClick={testTranslationService}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Test Translation
            </button>
            <button
              onClick={testFlightService}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Test Flights
            </button>
            <button
              onClick={testMusicService}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm"
            >
              Test Music
            </button>
            <button
              onClick={testESIMService}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
            >
              Test eSIM
            </button>
          </div>
        </div>

        {/* Service Results */}
        {activeService && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {activeService.charAt(0).toUpperCase() + activeService.slice(1)} Service Results
            </h3>
            
            {activeService === 'weather' && weatherData && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Cloud className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-semibold">{weatherData.location}</h4>
                    <p className="text-sm text-gray-600">
                      {weatherData.current.temperature}°C, {weatherData.current.description}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {weatherData.recommendations.clothing.slice(0, 4).map((item: string, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 text-sm">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeService === 'translation' && translationData && (
              <div className="space-y-4">
                <h4 className="font-semibold">French Phrase Book</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {translationData.slice(0, 2).map((category: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium mb-2">{category.category}</h5>
                      <div className="space-y-2">
                        {category.phrases.slice(0, 3).map((phrase: any, phraseIndex: number) => (
                          <div key={phraseIndex} className="text-sm">
                            <div className="font-medium">{phrase.english}</div>
                            <div className="text-gray-600">{phrase.translated}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeService === 'flight' && flightData && (
              <div className="space-y-4">
                <h4 className="font-semibold">Flight Options</h4>
                <div className="space-y-3">
                  {flightData.slice(0, 3).map((flight: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{flight.airline} {flight.flightNumber}</div>
                          <div className="text-sm text-gray-600">
                            {flight.origin} → {flight.destination}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${flight.price}</div>
                          <div className="text-sm text-gray-600">{flight.duration}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeService === 'music' && musicData && (
              <div className="space-y-4">
                <h4 className="font-semibold">Music Recommendations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {musicData.slice(0, 2).map((playlist: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium mb-2">{playlist.name}</h5>
                      <p className="text-sm text-gray-600 mb-3">{playlist.description}</p>
                      <div className="text-sm">
                        <div className="flex items-center space-x-2">
                          <Music className="h-4 w-4" />
                          <span>{playlist.tracks.length} tracks</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeService === 'esim' && esimData && (
              <div className="space-y-4">
                <h4 className="font-semibold">eSIM Recommendations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {esimData.recommendedPlans.slice(0, 2).map((plan: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium mb-2">{plan.name}</h5>
                      <div className="text-sm space-y-1">
                        <div>Data: {plan.data}</div>
                        <div>Duration: {plan.duration}</div>
                        <div className="font-semibold">${plan.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Integration Benefits */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Global Coverage</h4>
            <p className="text-sm text-gray-600">
              Access to services worldwide with local expertise and recommendations
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">AI-Powered</h4>
            <p className="text-sm text-gray-600">
              Intelligent recommendations based on your preferences and travel style
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Seamless Integration</h4>
            <p className="text-sm text-gray-600">
              All services work together to create a unified travel experience
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 