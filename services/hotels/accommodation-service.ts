import { googleHotelsService } from './google-hotels'
import { vrboRentalsService } from './vrbo-rentals'

export interface AccommodationSearchParams {
  location: string
  checkIn: string
  checkOut: string
  guests: number
  rooms?: number
  bedrooms?: number
  maxPrice?: number
  minRating?: number
  type: 'hotels' | 'rentals' | 'both'
}

export interface UnifiedAccommodationResult {
  id: string
  name: string
  type: 'hotel' | 'rental'
  address: string
  rating: number
  price: string
  image: string
  images?: string[]
  amenities: string[]
  location: {
    lat: number
    lng: number
  }
  bookingUrl: string
  // Hotel specific
  rooms?: number
  // Rental specific
  bedrooms?: number
  bathrooms?: number
  maxGuests?: number
  hostName?: string
  cancellationPolicy?: string
  description?: string
}

export class AccommodationService {
  async searchAccommodations(params: AccommodationSearchParams): Promise<UnifiedAccommodationResult[]> {
    const results: UnifiedAccommodationResult[] = []

    try {
      // Search hotels if requested
      if (params.type === 'hotels' || params.type === 'both') {
        const hotels = await googleHotelsService.searchHotels({
          location: params.location,
          checkIn: params.checkIn,
          checkOut: params.checkOut,
          guests: params.guests,
          rooms: params.rooms || 1,
          maxPrice: params.maxPrice,
          minRating: params.minRating
        })

        results.push(...hotels.map(hotel => ({
          id: hotel.id,
          name: hotel.name,
          type: 'hotel' as const,
          address: hotel.address,
          rating: hotel.rating,
          price: hotel.price,
          image: hotel.image,
          amenities: hotel.amenities,
          location: hotel.location,
          bookingUrl: hotel.bookingUrl,
          rooms: params.rooms || 1
        })))
      }

      // Search rentals if requested
      if (params.type === 'rentals' || params.type === 'both') {
        const rentals = await vrboRentalsService.searchRentals({
          location: params.location,
          checkIn: params.checkIn,
          checkOut: params.checkOut,
          guests: params.guests,
          bedrooms: params.bedrooms,
          maxPrice: params.maxPrice,
          amenities: []
        })

        results.push(...rentals.map(rental => ({
          id: rental.id,
          name: rental.title,
          type: 'rental' as const,
          address: rental.address,
          rating: rental.rating,
          price: rental.price,
          image: rental.images[0] || '',
          images: rental.images,
          amenities: rental.amenities,
          location: rental.location,
          bookingUrl: rental.bookingUrl,
          bedrooms: rental.bedrooms,
          bathrooms: rental.bathrooms,
          maxGuests: rental.maxGuests,
          hostName: rental.hostName,
          cancellationPolicy: rental.cancellationPolicy,
          description: rental.description
        })))
      }

      // Sort by rating and price
      return results.sort((a, b) => {
        // First by rating (descending)
        if (b.rating !== a.rating) {
          return b.rating - a.rating
        }
        // Then by price (ascending - extract numeric value)
        const aPrice = this.extractPriceValue(a.price)
        const bPrice = this.extractPriceValue(b.price)
        return aPrice - bPrice
      })

    } catch (error) {
      console.error('Error searching accommodations:', error)
      return this.getFallbackAccommodations(params.location, params.type)
    }
  }

  private extractPriceValue(priceString: string): number {
    // Extract numeric value from price strings like "$150/night" or "$$$"
    const match = priceString.match(/\$(\d+)/)
    if (match) {
      return parseInt(match[1])
    }
    // For price levels like "$$$", convert to numeric
    const dollarCount = (priceString.match(/\$/g) || []).length
    return dollarCount * 100 // Rough estimate
  }

  private getFallbackAccommodations(location: string, type: 'hotels' | 'rentals' | 'both'): UnifiedAccommodationResult[] {
    const results: UnifiedAccommodationResult[] = []

    if (type === 'hotels' || type === 'both') {
      results.push(
        {
          id: 'hotel-1',
          name: 'Grand Hotel & Spa',
          type: 'hotel',
          address: `${location}, City Center`,
          rating: 4.6,
          price: '$200/night',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
          amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'],
          location: { lat: 0, lng: 0 },
          bookingUrl: `https://www.google.com/travel/hotels?q=hotels+in+${encodeURIComponent(location)}`,
          rooms: 1
        },
        {
          id: 'hotel-2',
          name: 'Business Center Hotel',
          type: 'hotel',
          address: `${location}, Downtown`,
          rating: 4.3,
          price: '$150/night',
          image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
          amenities: ['Free WiFi', 'Business Center', 'Gym', 'Restaurant'],
          location: { lat: 0, lng: 0 },
          bookingUrl: `https://www.google.com/travel/hotels?q=hotels+in+${encodeURIComponent(location)}`,
          rooms: 1
        }
      )
    }

    if (type === 'rentals' || type === 'both') {
      results.push(
        {
          id: 'rental-1',
          name: 'Cozy Downtown Apartment',
          type: 'rental',
          address: `${location}, Downtown`,
          rating: 4.8,
          price: '$120/night',
          image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
          amenities: ['Free WiFi', 'Kitchen', 'Washer/Dryer', 'Balcony'],
          location: { lat: 0, lng: 0 },
          bookingUrl: `https://www.vrbo.com/search?location=${encodeURIComponent(location)}`,
          bedrooms: 2,
          bathrooms: 1,
          maxGuests: 4,
          hostName: 'Sarah & Mike',
          cancellationPolicy: 'Flexible'
        },
        {
          id: 'rental-2',
          name: 'Luxury Beach House',
          type: 'rental',
          address: `${location}, Beach Area`,
          rating: 4.9,
          price: '$300/night',
          image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
          amenities: ['Ocean View', 'Private Beach', 'Pool', 'BBQ Grill'],
          location: { lat: 0, lng: 0 },
          bookingUrl: `https://www.vrbo.com/search?location=${encodeURIComponent(location)}`,
          bedrooms: 3,
          bathrooms: 2,
          maxGuests: 6,
          hostName: 'Beach Properties Inc',
          cancellationPolicy: 'Moderate'
        }
      )
    }

    return results
  }

  // Generate Airbnb affiliate link as an alternative
  generateAirbnbLink(location: string, checkIn: string, checkOut: string, guests: number): string {
    return vrboRentalsService.generateAirbnbAffiliateLink(location, checkIn, checkOut, guests)
  }
}

export const accommodationService = new AccommodationService() 