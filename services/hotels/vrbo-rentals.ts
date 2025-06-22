interface RentalSearchParams {
  location: string
  checkIn: string
  checkOut: string
  guests: number
  bedrooms?: number
  maxPrice?: number
  amenities?: string[]
}

interface RentalResult {
  id: string
  title: string
  description: string
  address: string
  rating: number
  price: string
  images: string[]
  bedrooms: number
  bathrooms: number
  maxGuests: number
  amenities: string[]
  location: {
    lat: number
    lng: number
  }
  bookingUrl: string
  hostName: string
  cancellationPolicy: string
}

export class VRBORentalsService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.VRBO_API_KEY || ''
    if (!this.apiKey) {
      console.warn('VRBO API key not found. Using fallback data.')
    }
  }

  async searchRentals(params: RentalSearchParams): Promise<RentalResult[]> {
    if (!this.apiKey) {
      return this.getFallbackRentals(params.location)
    }

    try {
      // VRBO API endpoint (you'll need to sign up for their API)
      const searchUrl = `https://api.vrbo.com/v1/properties/search`
      
      const searchParams = {
        location: params.location,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests: params.guests,
        bedrooms: params.bedrooms || 1,
        maxPrice: params.maxPrice,
        amenities: params.amenities?.join(',')
      }

      const response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(searchParams)
      })

      if (!response.ok) {
        throw new Error(`VRBO API error: ${response.status}`)
      }

      const data = await response.json()
      
      return data.properties?.map((property: any) => ({
        id: property.id,
        title: property.title,
        description: property.description,
        address: property.address,
        rating: property.rating || 0,
        price: `$${property.pricePerNight}/night`,
        images: property.images || [],
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        maxGuests: property.maxGuests,
        amenities: property.amenities || [],
        location: {
          lat: property.latitude,
          lng: property.longitude
        },
        bookingUrl: this.generateVRBOUrl(property.id, params),
        hostName: property.hostName,
        cancellationPolicy: property.cancellationPolicy
      })) || []

    } catch (error) {
      console.error('Error searching VRBO rentals:', error)
      return this.getFallbackRentals(params.location)
    }
  }

  private generateVRBOUrl(propertyId: string, params: RentalSearchParams): string {
    const baseUrl = 'https://www.vrbo.com'
    const searchParams = new URLSearchParams({
      location: params.location,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      guests: params.guests.toString()
    })
    
    return `${baseUrl}/property/${propertyId}?${searchParams.toString()}`
  }

  private getFallbackRentals(location: string): RentalResult[] {
    // Fallback data when API is not available
    return [
      {
        id: 'vrbo-1',
        title: 'Cozy Downtown Apartment',
        description: 'Beautiful 2-bedroom apartment in the heart of the city with stunning views.',
        address: `${location}, Downtown`,
        rating: 4.8,
        price: '$150/night',
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'
        ],
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        amenities: ['Free WiFi', 'Kitchen', 'Washer/Dryer', 'Balcony', 'Parking'],
        location: { lat: 0, lng: 0 },
        bookingUrl: `https://www.vrbo.com/search?location=${encodeURIComponent(location)}`,
        hostName: 'Sarah & Mike',
        cancellationPolicy: 'Flexible - Full refund if cancelled 7 days before check-in'
      },
      {
        id: 'vrbo-2',
        title: 'Luxury Beach House',
        description: 'Stunning beachfront property with private access to the ocean.',
        address: `${location}, Beach Area`,
        rating: 4.9,
        price: '$300/night',
        images: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'
        ],
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        amenities: ['Ocean View', 'Private Beach', 'Pool', 'BBQ Grill', 'Kayaks'],
        location: { lat: 0, lng: 0 },
        bookingUrl: `https://www.vrbo.com/search?location=${encodeURIComponent(location)}`,
        hostName: 'Beach Properties Inc',
        cancellationPolicy: 'Moderate - Full refund if cancelled 14 days before check-in'
      },
      {
        id: 'vrbo-3',
        title: 'Mountain Cabin Retreat',
        description: 'Peaceful cabin surrounded by nature, perfect for a relaxing getaway.',
        address: `${location}, Mountain Area`,
        rating: 4.7,
        price: '$120/night',
        images: [
          'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
        ],
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        amenities: ['Fireplace', 'Hiking Trails', 'Mountain View', 'Pet Friendly', 'Hot Tub'],
        location: { lat: 0, lng: 0 },
        bookingUrl: `https://www.vrbo.com/search?location=${encodeURIComponent(location)}`,
        hostName: 'Mountain Retreats',
        cancellationPolicy: 'Strict - Full refund if cancelled 30 days before check-in'
      }
    ]
  }

  // Alternative: Use Airbnb affiliate links as fallback
  generateAirbnbAffiliateLink(location: string, checkIn: string, checkOut: string, guests: number): string {
    const baseUrl = 'https://www.airbnb.com/s'
    const params = new URLSearchParams({
      location: location,
      checkin: checkIn,
      checkout: checkOut,
      guests: guests.toString(),
      // Add your affiliate parameters here
      // affiliate_id: 'your_affiliate_id'
    })
    
    return `${baseUrl}/${encodeURIComponent(location)}?${params.toString()}`
  }
}

export const vrboRentalsService = new VRBORentalsService() 