import { localAuthService } from '@/services/auth/local-auth'

export interface SavedTrip {
  id: string
  userId: string
  title: string
  destination: string
  duration: string
  budget: string
  prompt: string
  tripPlan: any // The full trip plan object
  createdAt: string
  updatedAt: string
  isFavorite?: boolean
  tags?: string[]
  notes?: string
}

class UserTripsService {
  private trips: SavedTrip[] = []

  constructor() {
    this.loadTrips()
  }

  private loadTrips() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('trip_planner_user_trips')
      if (stored) {
        this.trips = JSON.parse(stored)
      }
    }
  }

  private saveTrips() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('trip_planner_user_trips', JSON.stringify(this.trips))
    }
  }

  async saveTrip(tripData: {
    title: string
    destination: string
    duration: string
    budget: string
    prompt: string
    tripPlan: any
    tags?: string[]
    notes?: string
  }): Promise<SavedTrip | null> {
    try {
      const currentUser = await localAuthService.getCurrentUser()
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      const newTrip: SavedTrip = {
        id: this.generateId(),
        userId: currentUser.id,
        title: tripData.title,
        destination: tripData.destination,
        duration: tripData.duration,
        budget: tripData.budget,
        prompt: tripData.prompt,
        tripPlan: tripData.tripPlan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: false,
        tags: tripData.tags || [],
        notes: tripData.notes || ''
      }

      this.trips.push(newTrip)
      this.saveTrips()

      return newTrip
    } catch (error) {
      console.error('Error saving trip:', error)
      return null
    }
  }

  async getUserTrips(): Promise<SavedTrip[]> {
    try {
      const currentUser = await localAuthService.getCurrentUser()
      if (!currentUser) {
        return []
      }

      return this.trips
        .filter(trip => trip.userId === currentUser.id)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } catch (error) {
      console.error('Error getting user trips:', error)
      return []
    }
  }

  async getTripById(tripId: string): Promise<SavedTrip | null> {
    try {
      const currentUser = await localAuthService.getCurrentUser()
      if (!currentUser) {
        return null
      }

      const trip = this.trips.find(t => t.id === tripId && t.userId === currentUser.id)
      return trip || null
    } catch (error) {
      console.error('Error getting trip by ID:', error)
      return null
    }
  }

  async updateTrip(tripId: string, updates: Partial<SavedTrip>): Promise<boolean> {
    try {
      const currentUser = await localAuthService.getCurrentUser()
      if (!currentUser) {
        return false
      }

      const tripIndex = this.trips.findIndex(t => t.id === tripId && t.userId === currentUser.id)
      if (tripIndex === -1) {
        return false
      }

      this.trips[tripIndex] = {
        ...this.trips[tripIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      this.saveTrips()
      return true
    } catch (error) {
      console.error('Error updating trip:', error)
      return false
    }
  }

  async deleteTrip(tripId: string): Promise<boolean> {
    try {
      const currentUser = await localAuthService.getCurrentUser()
      if (!currentUser) {
        return false
      }

      const tripIndex = this.trips.findIndex(t => t.id === tripId && t.userId === currentUser.id)
      if (tripIndex === -1) {
        return false
      }

      this.trips.splice(tripIndex, 1)
      this.saveTrips()
      return true
    } catch (error) {
      console.error('Error deleting trip:', error)
      return false
    }
  }

  async toggleFavorite(tripId: string): Promise<boolean> {
    try {
      const currentUser = await localAuthService.getCurrentUser()
      if (!currentUser) {
        return false
      }

      const tripIndex = this.trips.findIndex(t => t.id === tripId && t.userId === currentUser.id)
      if (tripIndex === -1) {
        return false
      }

      this.trips[tripIndex].isFavorite = !this.trips[tripIndex].isFavorite
      this.trips[tripIndex].updatedAt = new Date().toISOString()
      this.saveTrips()
      return true
    } catch (error) {
      console.error('Error toggling favorite:', error)
      return false
    }
  }

  async searchTrips(query: string): Promise<SavedTrip[]> {
    try {
      const currentUser = await localAuthService.getCurrentUser()
      if (!currentUser) {
        return []
      }

      const userTrips = this.trips.filter(trip => trip.userId === currentUser.id)
      const searchTerm = query.toLowerCase()

      return userTrips.filter(trip => 
        trip.title.toLowerCase().includes(searchTerm) ||
        trip.destination.toLowerCase().includes(searchTerm) ||
        trip.prompt.toLowerCase().includes(searchTerm) ||
        trip.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    } catch (error) {
      console.error('Error searching trips:', error)
      return []
    }
  }

  async getFavoriteTrips(): Promise<SavedTrip[]> {
    try {
      const currentUser = await localAuthService.getCurrentUser()
      if (!currentUser) {
        return []
      }

      return this.trips
        .filter(trip => trip.userId === currentUser.id && trip.isFavorite)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } catch (error) {
      console.error('Error getting favorite trips:', error)
      return []
    }
  }

  async getTripsByDestination(destination: string): Promise<SavedTrip[]> {
    try {
      const currentUser = await localAuthService.getCurrentUser()
      if (!currentUser) {
        return []
      }

      return this.trips
        .filter(trip => trip.userId === currentUser.id && 
          trip.destination.toLowerCase().includes(destination.toLowerCase()))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } catch (error) {
      console.error('Error getting trips by destination:', error)
      return []
    }
  }

  async addTripNote(tripId: string, note: string): Promise<boolean> {
    try {
      const currentUser = await localAuthService.getCurrentUser()
      if (!currentUser) {
        return false
      }

      const tripIndex = this.trips.findIndex(t => t.id === tripId && t.userId === currentUser.id)
      if (tripIndex === -1) {
        return false
      }

      const currentNotes = this.trips[tripIndex].notes || ''
      const newNotes = currentNotes ? `${currentNotes}\n\n${new Date().toLocaleString()}: ${note}` : `${new Date().toLocaleString()}: ${note}`
      
      this.trips[tripIndex].notes = newNotes
      this.trips[tripIndex].updatedAt = new Date().toISOString()
      this.saveTrips()
      return true
    } catch (error) {
      console.error('Error adding trip note:', error)
      return false
    }
  }

  async addTripTag(tripId: string, tag: string): Promise<boolean> {
    try {
      const currentUser = await localAuthService.getCurrentUser()
      if (!currentUser) {
        return false
      }

      const tripIndex = this.trips.findIndex(t => t.id === tripId && t.userId === currentUser.id)
      if (tripIndex === -1) {
        return false
      }

      if (!this.trips[tripIndex].tags) {
        this.trips[tripIndex].tags = []
      }

      if (!this.trips[tripIndex].tags!.includes(tag)) {
        this.trips[tripIndex].tags!.push(tag)
        this.trips[tripIndex].updatedAt = new Date().toISOString()
        this.saveTrips()
      }

      return true
    } catch (error) {
      console.error('Error adding trip tag:', error)
      return false
    }
  }

  async removeTripTag(tripId: string, tag: string): Promise<boolean> {
    try {
      const currentUser = await localAuthService.getCurrentUser()
      if (!currentUser) {
        return false
      }

      const tripIndex = this.trips.findIndex(t => t.id === tripId && t.userId === currentUser.id)
      if (tripIndex === -1) {
        return false
      }

      if (this.trips[tripIndex].tags) {
        this.trips[tripIndex].tags = this.trips[tripIndex].tags!.filter(t => t !== tag)
        this.trips[tripIndex].updatedAt = new Date().toISOString()
        this.saveTrips()
      }

      return true
    } catch (error) {
      console.error('Error removing trip tag:', error)
      return false
    }
  }

  async getTripStats(): Promise<{
    totalTrips: number
    favoriteTrips: number
    totalDestinations: number
    averageBudget: number
    mostVisitedDestination: string
  }> {
    try {
      const currentUser = await localAuthService.getCurrentUser()
      if (!currentUser) {
        return {
          totalTrips: 0,
          favoriteTrips: 0,
          totalDestinations: 0,
          averageBudget: 0,
          mostVisitedDestination: ''
        }
      }

      const userTrips = this.trips.filter(trip => trip.userId === currentUser.id)
      const destinations = Array.from(new Set(userTrips.map(trip => trip.destination)))
      const favoriteTrips = userTrips.filter(trip => trip.isFavorite)
      
      // Calculate average budget (extract numbers from budget strings)
      const budgets = userTrips.map(trip => {
        const match = trip.budget.match(/\$?(\d+(?:,\d+)*)/)
        return match ? parseInt(match[1].replace(/,/g, '')) : 0
      }).filter(budget => budget > 0)

      const averageBudget = budgets.length > 0 ? budgets.reduce((a, b) => a + b, 0) / budgets.length : 0

      // Find most visited destination
      const destinationCounts: { [key: string]: number } = {}
      userTrips.forEach(trip => {
        destinationCounts[trip.destination] = (destinationCounts[trip.destination] || 0) + 1
      })

      const mostVisitedDestination = Object.keys(destinationCounts).reduce((a, b) => 
        destinationCounts[a] > destinationCounts[b] ? a : b, '')

      return {
        totalTrips: userTrips.length,
        favoriteTrips: favoriteTrips.length,
        totalDestinations: destinations.length,
        averageBudget: Math.round(averageBudget),
        mostVisitedDestination
      }
    } catch (error) {
      console.error('Error getting trip stats:', error)
      return {
        totalTrips: 0,
        favoriteTrips: 0,
        totalDestinations: 0,
        averageBudget: 0,
        mostVisitedDestination: ''
      }
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }
}

export const userTripsService = new UserTripsService() 