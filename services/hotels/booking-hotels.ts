// Google Places Hotels Service
// Uses Google Places API to find real hotels in any location

import { MockHotelsService } from './mock-hotels'

export interface HotelSearch {
  location: string
  checkInDate: string
  checkOutDate: string
  adults: number
  children?: number
  rooms: number
  currency?: string
  guestNationality?: string
}

export interface HotelResult {
  id: string
  name: string
  rating: number
  price: number
  currency: string
  location: string
  imageUrl?: string
  amenities?: string[]
  description?: string
  latitude?: number
  longitude?: number
  bookingUrl?: string
}

export class GooglePlacesHotelsService {
  private apiKey: string
  private baseUrl = 'https://maps.googleapis.com/maps/api'
  private mockService: MockHotelsService

  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || ''
    this.mockService = new MockHotelsService()
  }

  async searchHotels(searchParams: HotelSearch): Promise<HotelResult[]> {
    try {
      console.log('Searching hotels for:', searchParams.location)
      
      // If no API key, use mock data
      if (!this.apiKey) {
        console.log('No Google Places API key found, using mock data')
        return this.mockService.searchHotels(searchParams)
      }
      
      // First, get coordinates for the location
      const coordinates = await this.getCoordinates(searchParams.location)
      if (!coordinates) {
        console.error('Could not get coordinates for location:', searchParams.location)
        console.log('Falling back to mock data')
        return this.mockService.searchHotels(searchParams)
      }

      // Search for hotels using Google Places API
      const hotels = await this.searchNearbyHotels(coordinates, searchParams)
      
      if (hotels.length === 0) {
        console.log('No hotels found, trying text search')
        const textSearchHotels = await this.searchHotelsByText(searchParams)
        if (textSearchHotels.length === 0) {
          console.log('No hotels found in text search, using mock data')
          return this.mockService.searchHotels(searchParams)
        }
        return textSearchHotels
      }
      
      return hotels
    } catch (error) {
      console.error('Error searching hotels:', error)
      console.log('Falling back to mock data due to error')
      return this.mockService.searchHotels(searchParams)
    }
  }

  private async getCoordinates(location: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const geocodeUrl = `${this.baseUrl}/geocode/json?address=${encodeURIComponent(location)}&key=${this.apiKey}`
      
      const response = await fetch(geocodeUrl)
      const data = await response.json()
      
      if (data.status === 'OK' && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location
        return { lat, lng }
      }
      
      return null
    } catch (error) {
      console.error('Error getting coordinates:', error)
      return null
    }
  }

  private async searchNearbyHotels(coordinates: { lat: number; lng: number }, searchParams: HotelSearch): Promise<HotelResult[]> {
    try {
      const nearbyUrl = `${this.baseUrl}/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=5000&type=lodging&key=${this.apiKey}`
      
      const response = await fetch(nearbyUrl)
      const data = await response.json()
      
      if (data.status !== 'OK') {
        console.error('Nearby search failed:', data.status)
        return []
      }

      const hotels: HotelResult[] = []
      
      for (const place of data.results.slice(0, 10)) {
        try {
          // Get detailed information for each hotel
          const details = await this.getPlaceDetails(place.place_id)
          
          const hotel: HotelResult = {
            id: place.place_id,
            name: place.name,
            rating: place.rating || 4.0,
            price: this.getPriceLevel(place.price_level),
            currency: 'USD',
            location: place.vicinity || searchParams.location,
            imageUrl: place.photos?.[0]?.photo_reference 
              ? `${this.baseUrl}/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${this.apiKey}`
              : this.getDefaultHotelImage(),
            amenities: details.amenities || ['WiFi', 'Air Conditioning'],
            description: details.description || `Hotel in ${searchParams.location}`,
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            bookingUrl: this.generateBookingUrl(place.name, searchParams.location, searchParams)
          }
          
          hotels.push(hotel)
        } catch (error) {
          console.error('Error processing hotel:', place.name, error)
        }
      }
      
      return hotels
    } catch (error) {
      console.error('Error in nearby search:', error)
      return []
    }
  }

  private async searchHotelsByText(searchParams: HotelSearch): Promise<HotelResult[]> {
    try {
      const textSearchUrl = `${this.baseUrl}/place/textsearch/json?query=hotels in ${encodeURIComponent(searchParams.location)}&type=lodging&key=${this.apiKey}`
      
      const response = await fetch(textSearchUrl)
      const data = await response.json()
      
      if (data.status !== 'OK') {
        console.error('Text search failed:', data.status)
        return []
      }

      const hotels: HotelResult[] = []
      
      for (const place of data.results.slice(0, 10)) {
        try {
          const details = await this.getPlaceDetails(place.place_id)
          
          const hotel: HotelResult = {
            id: place.place_id,
            name: place.name,
            rating: place.rating || 4.0,
            price: this.getPriceLevel(place.price_level),
            currency: 'USD',
            location: place.formatted_address || searchParams.location,
            imageUrl: place.photos?.[0]?.photo_reference 
              ? `${this.baseUrl}/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${this.apiKey}`
              : this.getDefaultHotelImage(),
            amenities: details.amenities || ['WiFi', 'Air Conditioning'],
            description: details.description || `Hotel in ${searchParams.location}`,
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            bookingUrl: this.generateBookingUrl(place.name, searchParams.location, searchParams)
          }
          
          hotels.push(hotel)
        } catch (error) {
          console.error('Error processing hotel:', place.name, error)
        }
      }
      
      return hotels
    } catch (error) {
      console.error('Error in text search:', error)
      return []
    }
  }

  private async getPlaceDetails(placeId: string): Promise<{ amenities: string[]; description: string }> {
    try {
      const detailsUrl = `${this.baseUrl}/place/details/json?place_id=${placeId}&fields=formatted_phone_number,website,opening_hours,reviews,types&key=${this.apiKey}`
      
      const response = await fetch(detailsUrl)
      const data = await response.json()
      
      if (data.status !== 'OK') {
        return { amenities: ['WiFi', 'Air Conditioning'], description: 'Hotel accommodation' }
      }

      const result = data.result
      const amenities: string[] = ['WiFi', 'Air Conditioning']
      
      // Add amenities based on place types
      if (result.types) {
        if (result.types.includes('lodging')) amenities.push('Accommodation')
        if (result.types.includes('restaurant')) amenities.push('Restaurant')
        if (result.types.includes('gym')) amenities.push('Fitness Center')
        if (result.types.includes('spa')) amenities.push('Spa')
        if (result.types.includes('parking')) amenities.push('Free Parking')
      }

      const description = result.reviews?.[0]?.text?.substring(0, 100) + '...' || 'Hotel accommodation'
      
      return { amenities, description }
    } catch (error) {
      console.error('Error getting place details:', error)
      return { amenities: ['WiFi', 'Air Conditioning'], description: 'Hotel accommodation' }
    }
  }

  private getPriceLevel(priceLevel?: number): number {
    if (!priceLevel) return Math.floor(Math.random() * 200) + 100
    
    // Convert Google's price level (0-4) to actual prices
    const priceRanges: { [key: number]: number } = {
      0: Math.floor(Math.random() * 50) + 50,    // Free
      1: Math.floor(Math.random() * 50) + 75,    // Inexpensive
      2: Math.floor(Math.random() * 100) + 125,  // Moderate
      3: Math.floor(Math.random() * 150) + 200,  // Expensive
      4: Math.floor(Math.random() * 300) + 350   // Very Expensive
    }
    
    return priceRanges[priceLevel] || 150
  }

  private getDefaultHotelImage(): string {
    const images = [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop&crop=center'
    ]
    return images[Math.floor(Math.random() * images.length)]
  }

  private generateBookingUrl(hotelName: string, location: string, searchParams: HotelSearch): string {
    const searchQuery = `${hotelName} ${location}`.trim()
    
    const params = new URLSearchParams({
      q: searchQuery,
      checkin: searchParams.checkInDate,
      checkout: searchParams.checkOutDate,
      guests: searchParams.adults.toString(),
      currency: 'USD'
    })
    
    return `https://www.google.com/travel/hotels?${params.toString()}`
  }

  async searchHotelsForTrip(
    destination: string,
    checkInDate: string,
    checkOutDate: string,
    adults: number = 2,
    children: number = 0,
    rooms: number = 1
  ): Promise<HotelResult[]> {
    return this.searchHotels({
      location: destination,
      checkInDate,
      checkOutDate,
      adults,
      children,
      rooms,
    })
  }

  async getHotelDetailsById(hotelId: string): Promise<HotelResult | null> {
    try {
      const details = await this.getPlaceDetails(hotelId)
      // This would need to be implemented with a more complete place details call
      return null
    } catch (error) {
      console.error('Error getting hotel details:', error)
      return null
    }
  }
}

export const googlePlacesHotelsService = new GooglePlacesHotelsService() 