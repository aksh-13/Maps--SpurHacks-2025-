'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, DollarSign, ExternalLink, Filter } from 'lucide-react'

interface Event {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  venue: {
    name: string
    address: string
    latitude?: number
    longitude?: number
  }
  category: string
  price: string
  url?: string
  image?: string
}

interface LiveEventsProps {
  city?: string
  onEventSelect?: (event: Event) => void
}

const categories = [
  { value: 'all', label: 'All Events' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'music', label: 'Music' },
  { value: 'sports', label: 'Sports' },
  { value: 'culture', label: 'Culture' },
  { value: 'art', label: 'Art' },
  { value: 'adventure', label: 'Adventure' }
]

export default function LiveEvents({ city = 'Toronto', onEventSelect }: LiveEventsProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        city,
        category: selectedCategory
      })
      
      const response = await fetch(`/api/events?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setEvents(data.events)
      } else {
        setError(data.error || 'Failed to fetch events')
      }
    } catch (err) {
      setError('Failed to fetch events')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [city, selectedCategory])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const isToday = (dateString: string) => {
    const eventDate = new Date(dateString).toDateString()
    const today = new Date().toDateString()
    return eventDate === today
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary-900">Live Events in {city}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchEvents}
            className="mt-4 btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary-900">Live Events in {city}</h2>
          <p className="text-primary-600 mt-1">
            {events.length} events happening today and upcoming
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary-600" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600">
            Try selecting a different category or check back later for new events.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => onEventSelect?.(event)}
            >
              {event.image && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isToday(event.startDate) && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Today
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                    {event.category}
                  </div>
                </div>
              )}
              
              <div className="p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                  {event.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                    {formatDate(event.startDate)}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-primary-500" />
                    {formatTime(event.startDate)}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                    <span className="line-clamp-1">{event.venue.name}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-primary-500" />
                    {event.price}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventSelect?.(event)
                    }}
                    className="btn-primary text-sm px-4 py-2"
                  >
                    View Details
                  </button>
                  
                  {event.url && (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center text-primary-600 hover:text-primary-700 text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Visit
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
