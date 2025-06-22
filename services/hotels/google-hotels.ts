import { google } from 'googleapis'

interface HotelSearchParams {
  location: string
  checkIn: string
  checkOut: string
  guests: number
  rooms: number
  maxPrice?: number
  minRating?: number
}

interface HotelResult {
  id: string
  name: string
  address: string
  rating: number
  price: string
  image: string
  amenities: string[]
  location: {
    lat: number
    lng: number
  }
  bookingUrl: string
}

export class GoogleHotelsService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.GOOGLE_HOTELS_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Google Hotels API key not found. Using fallback data.')
    }
  }

  async searchHotels(params: HotelSearchParams): Promise<HotelResult[]> {
    if (!this.apiKey) {
      return this.getFallbackHotels(params.location)
    }

    try {
      // Google Places API for hotel search
      const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json`
      const searchQuery = `hotels in ${params.location}`
      
      const response = await fetch(
        `${placesUrl}?query=${encodeURIComponent(searchQuery)}&type=lodging&key=${this.apiKey}`
      )
      
      const data = await response.json()
      
      if (data.status !== 'OK') {
        console.error('Google Places API error:', data.status)
        return this.getFallbackHotels(params.location)
      }

      const hotels: HotelResult[] = await Promise.all(
        data.results.slice(0, 10).map(async (place: any) => {
          // Get detailed information for each hotel
          const details = await this.getHotelDetails(place.place_id)
          
          return {
            id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            rating: place.rating || 0,
            price: this.getPriceLevel(place.price_level),
            image: place.photos?.[0]?.photo_reference 
              ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${this.apiKey}`
              : '',
            amenities: details.amenities || [],
            location: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng
            },
            bookingUrl: this.generateBookingUrl(place.name, params.location, params.checkIn, params.checkOut, params.guests)
          }
        })
      )

      return hotels
    } catch (error) {
      console.error('Error searching hotels:', error)
      return this.getFallbackHotels(params.location)
    }
  }

  private async getHotelDetails(placeId: string): Promise<any> {
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json`
      const response = await fetch(
        `${detailsUrl}?place_id=${placeId}&fields=name,formatted_address,rating,price_level,website,formatted_phone_number,opening_hours&key=${this.apiKey}`
      )
      
      const data = await response.json()
      return data.result || {}
    } catch (error) {
      console.error('Error getting hotel details:', error)
      return {}
    }
  }

  private getPriceLevel(level: number): string {
    switch (level) {
      case 1: return '$'
      case 2: return '$$'
      case 3: return '$$$'
      case 4: return '$$$$'
      default: return '$$'
    }
  }

  private generateBookingUrl(
    hotelName: string, 
    location: string, 
    checkIn: string, 
    checkOut: string, 
    guests: number
  ): string {
    const baseUrl = 'https://www.google.com/travel/hotels'
    const params = new URLSearchParams({
      q: `${hotelName} ${location}`,
      checkin: checkIn,
      checkout: checkOut,
      guests: guests.toString()
    })
    
    return `${baseUrl}?${params.toString()}`
  }

  private getFallbackHotels(location: string): HotelResult[] {
    // Fallback data when API is not available
    return [
      {
        id: '1',
        name: 'Luxury Hotel & Spa',
        address: `${location}, City Center`,
        rating: 4.5,
        price: '$$$',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant'],
        location: { lat: 0, lng: 0 },
        bookingUrl: `https://www.google.com/travel/hotels?q=hotels+in+${encodeURIComponent(location)}`
      },
      {
        id: '2',
        name: 'Business Center Hotel',
        address: `${location}, Downtown`,
        rating: 4.2,
        price: '$$',
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
        amenities: ['Free WiFi', 'Business Center', 'Gym'],
        location: { lat: 0, lng: 0 },
        bookingUrl: `https://www.google.com/travel/hotels?q=hotels+in+${encodeURIComponent(location)}`
      },
      {
        id: '3',
        name: 'Boutique Hotel',
        address: `${location}, Historic District`,
        rating: 4.7,
        price: '$$$',
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
        amenities: ['Free WiFi', 'Bar', 'Terrace', 'Concierge'],
        location: { lat: 0, lng: 0 },
        bookingUrl: `https://www.google.com/travel/hotels?q=hotels+in+${encodeURIComponent(location)}`
      }
    ]
  }
}

export const googleHotelsService = new GoogleHotelsService() 