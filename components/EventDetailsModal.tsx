'use client'

import { motion } from 'framer-motion'
import { X, Calendar, Clock, MapPin, DollarSign, ExternalLink, Navigation } from 'lucide-react'

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

interface EventDetailsModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  onGetDirections?: (event: Event) => void
}

export default function EventDetailsModal({ 
  event, 
  isOpen, 
  onClose, 
  onGetDirections 
}: EventDetailsModalProps) {
  if (!isOpen || !event) return null

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }
  }

  const startDateTime = formatDateTime(event.startDate)
  const endDateTime = formatDateTime(event.endDate)

  const handleGetDirections = () => {
    if (event.venue.latitude && event.venue.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${event.venue.latitude},${event.venue.longitude}`
      window.open(url, '_blank')
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue.address)}`
      window.open(url, '_blank')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with image */}
        <div className="relative">
          {event.image && (
            <div className="h-64 overflow-hidden">
              <img
                src={event.image}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/70 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
            {event.category}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {event.name}
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {event.description}
          </p>
          
          {/* Event Details */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-primary-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">{startDateTime.date}</p>
                {startDateTime.date !== endDateTime.date && (
                  <p className="text-sm text-gray-600">to {endDateTime.date}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-gray-900">
                  {startDateTime.time}
                  {startDateTime.time !== endDateTime.time && ` - ${endDateTime.time}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-primary-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">{event.venue.name}</p>
                <p className="text-sm text-gray-600">{event.venue.address}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-primary-500" />
              <p className="text-gray-900 font-medium">{event.price}</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGetDirections}
              className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
            </button>
            
            {event.url && (
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 border border-primary-600 text-primary-600 hover:bg-primary-50 px-6 py-3 rounded-lg transition-colors font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Visit Website</span>
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
