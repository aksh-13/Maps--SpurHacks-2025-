interface PlaceResult {
  place_id: string
  name: string
  formatted_address: string
  rating?: number
  price_level?: number
  types: string[]
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  photos?: Array<{
    photo_reference: string
    height: number
    width: number
  }>
  opening_hours?: {
    open_now: boolean
    weekday_text: string[]
  }
}

interface PlacesSearchResponse {
  results: PlaceResult[]
  status: string
  next_page_token?: string
}

export class GooglePlacesService {
  private apiKey: string | null = null

  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || null
  }

  async searchPlaces(
    query: string, 
    location?: { lat: number, lng: number }, 
    radius: number = 5000,
    type?: string
  ): Promise<PlaceResult[]> {
    if (!this.apiKey) {
      console.warn('Google Places API key not found')
      return []
    }

    try {
      const baseUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
      const params = new URLSearchParams({
        query,
        key: this.apiKey,
        radius: radius.toString()
      })

      if (location) {
        params.append('location', `${location.lat},${location.lng}`)
      }

      if (type) {
        params.append('type', type)
      }

      const response = await fetch(`${baseUrl}?${params}`)
      
      if (!response.ok) {
        throw new Error(`Places API error: ${response.status}`)
      }

      const data: PlacesSearchResponse = await response.json()
      
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Places API status: ${data.status}`)
      }

      return data.results || []
    } catch (error) {
      console.error('Error fetching places:', error)
      return []
    }
  }

  async getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
    if (!this.apiKey) {
      return null
    }

    try {
      const baseUrl = 'https://maps.googleapis.com/maps/api/place/details/json'
      const params = new URLSearchParams({
        place_id: placeId,
        key: this.apiKey,
        fields: 'name,formatted_address,rating,price_level,geometry,photos,opening_hours,types'
      })

      const response = await fetch(`${baseUrl}?${params}`)
      const data = await response.json()

      if (data.status === 'OK') {
        return data.result
      }

      return null
    } catch (error) {
      console.error('Error fetching place details:', error)
      return null
    }
  }

  async searchAttractions(city: string, limit: number = 10): Promise<PlaceResult[]> {
    const attractions = await this.searchPlaces(
      `tourist attractions in ${city}`,
      undefined,
      50000,
      'tourist_attraction'
    )
    return attractions.slice(0, limit)
  }

  async searchRestaurants(city: string, limit: number = 10): Promise<PlaceResult[]> {
    const restaurants = await this.searchPlaces(
      `restaurants in ${city}`,
      undefined,
      50000,
      'restaurant'
    )
    return restaurants.slice(0, limit)
  }

  async searchHotels(city: string, limit: number = 10): Promise<PlaceResult[]> {
    const hotels = await this.searchPlaces(
      `hotels in ${city}`,
      undefined,
      50000,
      'lodging'
    )
    return hotels.slice(0, limit)
  }

  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    if (!this.apiKey) return ''
    
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`
  }

  isAvailable(): boolean {
    return !!this.apiKey
  }
}

export const googlePlacesService = new GooglePlacesService()
