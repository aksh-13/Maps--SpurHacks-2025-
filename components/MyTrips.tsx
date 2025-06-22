'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Star, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Bookmark,
  BookmarkPlus,
  Tag,
  MessageSquare,
  Clock,
  TrendingUp,
  Globe,
  Heart
} from 'lucide-react'
import { userTripsService, type SavedTrip } from '@/services/trips/user-trips'
import { localAuthService } from '@/services/auth/local-auth'

export default function MyTrips() {
  const [trips, setTrips] = useState<SavedTrip[]>([])
  const [filteredTrips, setFilteredTrips] = useState<SavedTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'favorites' | 'recent'>('all')
  const [selectedTrip, setSelectedTrip] = useState<SavedTrip | null>(null)
  const [showTripDetails, setShowTripDetails] = useState(false)
  const [stats, setStats] = useState({
    totalTrips: 0,
    favoriteTrips: 0,
    totalDestinations: 0,
    averageBudget: 0,
    mostVisitedDestination: ''
  })
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadTrips()
      loadStats()
    }
  }, [user])

  useEffect(() => {
    filterTrips()
  }, [trips, searchQuery, filter])

  const checkUser = async () => {
    const currentUser = await localAuthService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }

  const loadTrips = async () => {
    const userTrips = await userTripsService.getUserTrips()
    setTrips(userTrips)
  }

  const loadStats = async () => {
    const tripStats = await userTripsService.getTripStats()
    setStats(tripStats)
  }

  const filterTrips = () => {
    let filtered = trips

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(trip =>
        trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply category filter
    switch (filter) {
      case 'favorites':
        filtered = filtered.filter(trip => trip.isFavorite)
        break
      case 'recent':
        filtered = filtered.slice(0, 5) // Show only 5 most recent
        break
      default:
        break
    }

    setFilteredTrips(filtered)
  }

  const handleToggleFavorite = async (tripId: string) => {
    await userTripsService.toggleFavorite(tripId)
    loadTrips()
    loadStats()
  }

  const handleDeleteTrip = async (tripId: string) => {
    if (confirm('Are you sure you want to delete this trip?')) {
      await userTripsService.deleteTrip(tripId)
      loadTrips()
      loadStats()
    }
  }

  const handleViewTrip = (trip: SavedTrip) => {
    setSelectedTrip(trip)
    setShowTripDetails(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-2 border-accent-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bookmark className="w-8 h-8 text-accent-600" />
        </div>
        <h3 className="text-lg font-semibold text-primary-900 mb-2">Sign in to view your trips</h3>
        <p className="text-primary-600">Create an account or sign in to save and manage your trip plans.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-900">My Trips</h2>
          <p className="text-primary-600">Manage and organize your saved trip plans</p>
        </div>
        <div className="flex items-center space-x-2">
          <BookmarkPlus className="w-5 h-5 text-accent-600" />
          <span className="text-sm text-primary-600">{trips.length} trips saved</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center">
              <Globe className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <p className="text-sm text-primary-600">Total Trips</p>
              <p className="text-xl font-bold text-primary-900">{stats.totalTrips}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-error-600" />
            </div>
            <div>
              <p className="text-sm text-primary-600">Favorites</p>
              <p className="text-xl font-bold text-primary-900">{stats.favoriteTrips}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-primary-600">Destinations</p>
              <p className="text-xl font-bold text-primary-900">{stats.totalDestinations}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-primary-600">Avg Budget</p>
              <p className="text-xl font-bold text-primary-900">${stats.averageBudget.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" />
          <input
            type="text"
            placeholder="Search trips by title, destination, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-accent-600 text-white' 
                : 'bg-surface-100 text-primary-600 hover:bg-surface-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === 'favorites' 
                ? 'bg-accent-600 text-white' 
                : 'bg-surface-100 text-primary-600 hover:bg-surface-200'
            }`}
          >
            <Star className="w-4 h-4 inline mr-1" />
            Favorites
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === 'recent' 
                ? 'bg-accent-600 text-white' 
                : 'bg-surface-100 text-primary-600 hover:bg-surface-200'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-1" />
            Recent
          </button>
        </div>
      </div>

      {/* Trips Grid */}
      {filteredTrips.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-primary-900 mb-2">
            {searchQuery ? 'No trips found' : 'No trips saved yet'}
          </h3>
          <p className="text-primary-600">
            {searchQuery 
              ? 'Try adjusting your search terms or filters.' 
              : 'Start planning your next adventure and save your trips here!'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="card hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => handleViewTrip(trip)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary-900 mb-1 line-clamp-2">
                        {trip.title}
                      </h3>
                      <div className="flex items-center text-sm text-primary-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {trip.destination}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleFavorite(trip.id)
                      }}
                      className={`p-2 rounded-full transition-colors ${
                        trip.isFavorite 
                          ? 'text-error-600 bg-error-50' 
                          : 'text-primary-400 hover:text-error-600 hover:bg-error-50'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${trip.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-primary-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {trip.duration}
                    </div>
                    <div className="flex items-center text-sm text-primary-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      {trip.budget}
                    </div>
                  </div>

                  {/* Tags */}
                  {trip.tags && trip.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {trip.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-accent-100 text-accent-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {trip.tags.length > 3 && (
                        <span className="px-2 py-1 bg-surface-100 text-primary-600 text-xs rounded-full">
                          +{trip.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-primary-500">
                    <span>{formatDate(trip.createdAt)}</span>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewTrip(trip)
                        }}
                        className="p-1 text-primary-400 hover:text-accent-600"
                        title="View Details"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTrip(trip.id)
                        }}
                        className="p-1 text-primary-400 hover:text-error-600"
                        title="Delete Trip"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Trip Details Modal */}
      {showTripDetails && selectedTrip && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTripDetails(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="card w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-primary-900 mb-2">
                    {selectedTrip.title}
                  </h2>
                  <div className="flex items-center text-primary-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {selectedTrip.destination}
                  </div>
                </div>
                <button
                  onClick={() => setShowTripDetails(false)}
                  className="p-2 text-primary-400 hover:text-primary-600"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-primary-900 mb-3">Trip Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-3 text-primary-400" />
                      <span className="text-primary-700">{selectedTrip.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-3 text-primary-400" />
                      <span className="text-primary-700">{selectedTrip.budget}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-3 text-primary-400" />
                      <span className="text-primary-700">
                        Created {formatDate(selectedTrip.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-primary-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTrip.tags && selectedTrip.tags.length > 0 ? (
                      selectedTrip.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-accent-100 text-accent-700 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-primary-500 text-sm">No tags added</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-primary-900 mb-3">Original Prompt</h3>
                <div className="bg-surface-50 p-4 rounded-xl">
                  <p className="text-primary-700">{selectedTrip.prompt}</p>
                </div>
              </div>

              {selectedTrip.notes && (
                <div className="mb-6">
                  <h3 className="font-semibold text-primary-900 mb-3">Notes</h3>
                  <div className="bg-surface-50 p-4 rounded-xl">
                    <p className="text-primary-700 whitespace-pre-wrap">{selectedTrip.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-surface-200">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleToggleFavorite(selectedTrip.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                      selectedTrip.isFavorite 
                        ? 'bg-error-50 text-error-600' 
                        : 'bg-surface-100 text-primary-600 hover:bg-surface-200'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${selectedTrip.isFavorite ? 'fill-current' : ''}`} />
                    <span>{selectedTrip.isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
                  </button>
                </div>
                <button
                  onClick={() => handleDeleteTrip(selectedTrip.id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-error-50 text-error-600 rounded-xl hover:bg-error-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Trip</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
} 