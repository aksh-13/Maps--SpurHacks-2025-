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

export class MockHotelsService {
  private hotelTemplates = [
    {
      name: 'Luxury {location} Hotel & Spa',
      rating: 4.8,
      price: 280,
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Room Service', 'Concierge'],
      description: 'Luxury 5-star hotel in the heart of the city with stunning views and world-class amenities.',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    },
    {
      name: 'Central {location} Inn',
      rating: 4.3,
      price: 165,
      amenities: ['WiFi', 'Breakfast', 'Gym', 'Business Center', 'Restaurant'],
      description: 'Comfortable 4-star hotel with excellent location and modern amenities.',
      imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
    },
    {
      name: 'Boutique {location} Suites',
      rating: 4.6,
      price: 220,
      amenities: ['WiFi', 'Spa', 'Restaurant', 'Bar', 'Concierge', 'Terrace'],
      description: 'Elegant boutique hotel with personalized service and unique character.',
      imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
    },
    {
      name: 'Modern {location} Plaza',
      rating: 4.4,
      price: 195,
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Meeting Rooms', 'Fitness Center', 'Rooftop Pool'],
      description: 'Contemporary hotel perfect for business and leisure travelers.',
      imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
    },
    {
      name: 'Cozy {location} Lodge',
      rating: 4.1,
      price: 120,
      amenities: ['WiFi', 'Kitchen', 'Laundry', 'Free Parking', 'Garden'],
      description: 'Charming budget-friendly accommodation with home-like comfort.',
      imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
    },
    {
      name: 'Grand {location} Resort',
      rating: 4.7,
      price: 350,
      amenities: ['WiFi', 'Multiple Pools', 'Spa', 'Golf Course', 'Tennis Courts', 'Kids Club'],
      description: 'Exclusive resort with extensive facilities and beautiful surroundings.',
      imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400',
    },
    {
      name: 'Historic {location} Manor',
      rating: 4.5,
      price: 180,
      amenities: ['WiFi', 'Historic Tours', 'Garden', 'Library', 'Traditional Restaurant'],
      description: 'Beautifully restored historic property with authentic charm.',
      imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
    },
    {
      name: 'Urban {location} Lofts',
      rating: 4.2,
      price: 140,
      amenities: ['WiFi', 'Kitchen', 'Workspace', 'Bike Storage', 'Rooftop Terrace'],
      description: 'Modern urban accommodation perfect for digital nomads and young professionals.',
      imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    }
  ]

  async searchHotels(searchParams: HotelSearch): Promise<HotelResult[]> {
    console.log('Mock hotel search for:', searchParams.location)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
    
    return this.generateMockHotels(searchParams.location, searchParams)
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
      rooms
    })
  }

  private generateMockHotels(location: string, searchParams: HotelSearch): HotelResult[] {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0]
    }
    
    const checkIn = formatDate(tomorrow)
    const checkOut = formatDate(nextWeek)
    
    // Generate 6-8 random hotels
    const numHotels = 6 + Math.floor(Math.random() * 3)
    const hotels: HotelResult[] = []
    
    for (let i = 0; i < numHotels; i++) {
      const template = this.hotelTemplates[i % this.hotelTemplates.length]
      const priceVariation = 0.8 + Math.random() * 0.4 // ±20% price variation
      const ratingVariation = -0.2 + Math.random() * 0.4 // ±0.2 rating variation
      
      hotels.push({
        id: `mock-hotel-${i + 1}`,
        name: template.name.replace('{location}', location),
        rating: Math.max(3.5, Math.min(5.0, template.rating + ratingVariation)),
        price: Math.round(template.price * priceVariation),
        currency: 'USD',
        location: `${location}, ${this.getRandomArea()}`,
        imageUrl: template.imageUrl,
        amenities: template.amenities,
        description: template.description,
        latitude: this.getRandomLatitude(location),
        longitude: this.getRandomLongitude(location),
        bookingUrl: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(location)}&checkin=${checkIn}&checkout=${checkOut}&group_adults=${searchParams.adults}&selected_currency=USD`,
      })
    }
    
    // Shuffle the results for variety
    return hotels.sort(() => Math.random() - 0.5)
  }

  private getRandomArea(): string {
    const areas = [
      'City Center', 'Downtown', 'Historic District', 'Business District', 
      'Residential Area', 'Tourist Quarter', 'Arts District', 'University Area',
      'Shopping District', 'Entertainment District', 'Waterfront', 'Mountain View'
    ]
    return areas[Math.floor(Math.random() * areas.length)]
  }

  private getRandomLatitude(location: string): number {
    // Generate realistic latitude based on location
    const baseLatitudes: { [key: string]: number } = {
      'paris': 48.8566,
      'london': 51.5074,
      'new york': 40.7128,
      'tokyo': 35.6762,
      'sydney': -33.8688,
      'mumbai': 19.0760,
      'dubai': 25.2048,
      'singapore': 1.3521,
      'bangkok': 13.7563,
      'mexico city': 19.4326,
      'rio de janeiro': -22.9068,
      'cairo': 30.0444,
      'moscow': 55.7558,
      'beijing': 39.9042,
      'seoul': 37.5665,
      'istanbul': 41.0082,
      'madrid': 40.4168,
      'rome': 41.9028,
      'amsterdam': 52.3676,
      'berlin': 52.5200,
      'prague': 50.0755,
      'vienna': 48.2082,
      'budapest': 47.4979,
      'warsaw': 52.2297,
      'stockholm': 59.3293,
      'oslo': 59.9139,
      'copenhagen': 55.6761,
      'helsinki': 60.1699,
      'reykjavik': 64.1466,
      'dublin': 53.3498,
      'edinburgh': 55.9533,
      'glasgow': 55.8642,
      'manchester': 53.4808,
      'birmingham': 52.4862,
      'leeds': 53.8008,
      'liverpool': 53.4084,
      'newcastle': 54.9783,
      'cardiff': 51.4816,
      'belfast': 54.5973,
      'cork': 51.8969,
      'galway': 53.2707,
      'limerick': 52.6638,
      'waterford': 52.2593,
      'kilkenny': 52.6541,
      'drogheda': 53.7179,
      'wicklow': 52.9759,
      'wexford': 52.3342,
      'eniscorthy': 52.5008,
      'gorey': 52.6747,
      'arklow': 52.7939,
      'bray': 53.2027,
      'greystones': 53.1439,
      'blackrock': 53.3019,
      'dun laoghaire': 53.2948,
      'dalkey': 53.2778,
      'killiney': 53.2558,
      'shankill': 53.2269,
      'loughlinstown': 53.2489,
      'cabinteely': 53.2698,
      'foxrock': 53.2789,
      'deansgrange': 53.2879,
      'monkstown': 53.2969,
      'dun laoghaire': 53.2948,
      'sandycove': 53.2859,
      'glasthule': 53.2769,
      'salthill': 53.2679,
      'seapoint': 53.2589,
      'blackrock': 53.3019,
      'booterstown': 53.3129,
      'mount merrion': 53.3239,
      'stillorgan': 53.3349,
      'kilmacud': 53.3459,
      'sandyford': 53.3569,
      'leopardstown': 53.3679,
      'foxrock': 53.2789,
      'cabinteely': 53.2698,
      'loughlinstown': 53.2489,
      'shankill': 53.2269,
      'killiney': 53.2558,
      'dalkey': 53.2778,
      'dun laoghaire': 53.2948,
      'blackrock': 53.3019,
      'bray': 53.2027,
      'greystones': 53.1439,
      'wicklow': 52.9759,
      'arklow': 52.7939,
      'gorey': 52.6747,
      'eniscorthy': 52.5008,
      'wexford': 52.3342,
      'kilkenny': 52.6541,
      'waterford': 52.2593,
      'limerick': 52.6638,
      'galway': 53.2707,
      'cork': 51.8969,
      'belfast': 54.5973,
      'cardiff': 51.4816,
      'newcastle': 54.9783,
      'liverpool': 53.4084,
      'leeds': 53.8008,
      'birmingham': 52.4862,
      'manchester': 53.4808,
      'glasgow': 55.8642,
      'edinburgh': 55.9533,
      'dublin': 53.3498,
      'reykjavik': 64.1466,
      'helsinki': 60.1699,
      'copenhagen': 55.6761,
      'oslo': 59.9139,
      'stockholm': 59.3293,
      'warsaw': 52.2297,
      'budapest': 47.4979,
      'vienna': 48.2082,
      'prague': 50.0755,
      'berlin': 52.5200,
      'amsterdam': 52.3676,
      'rome': 41.9028,
      'madrid': 40.4168,
      'istanbul': 41.0082,
      'seoul': 37.5665,
      'beijing': 39.9042,
      'moscow': 55.7558,
      'cairo': 30.0444,
      'rio de janeiro': -22.9068,
      'mexico city': 19.4326,
      'bangkok': 13.7563,
      'singapore': 1.3521,
      'dubai': 25.2048,
      'mumbai': 19.0760,
      'sydney': -33.8688,
      'tokyo': 35.6762,
      'new york': 40.7128,
      'london': 51.5074,
      'paris': 48.8566
    }
    
    const lowerLocation = location.toLowerCase()
    const baseLat = baseLatitudes[lowerLocation] || 40.7128 // Default to NYC
    return baseLat + (Math.random() - 0.5) * 0.1 // ±0.05 degrees variation
  }

  private getRandomLongitude(location: string): number {
    // Generate realistic longitude based on location
    const baseLongitudes: { [key: string]: number } = {
      'paris': 2.3522,
      'london': -0.1278,
      'new york': -74.0060,
      'tokyo': 139.6503,
      'sydney': 151.2093,
      'mumbai': 72.8777,
      'dubai': 55.2708,
      'singapore': 103.8198,
      'bangkok': 100.5018,
      'mexico city': -99.1332,
      'rio de janeiro': -43.1729,
      'cairo': 31.2357,
      'moscow': 37.6176,
      'beijing': 116.4074,
      'seoul': 126.9780,
      'istanbul': 28.9784,
      'madrid': -3.7038,
      'rome': 12.4964,
      'amsterdam': 4.9041,
      'berlin': 13.4050,
      'prague': 14.4378,
      'vienna': 16.3738,
      'budapest': 19.0402,
      'warsaw': 21.0122,
      'stockholm': 18.0686,
      'oslo': 10.7522,
      'copenhagen': 12.5683,
      'helsinki': 24.9384,
      'reykjavik': -21.9426,
      'dublin': -6.2603,
      'edinburgh': -3.1883,
      'glasgow': -4.2518,
      'manchester': -2.2426,
      'birmingham': -1.8904,
      'leeds': -1.5491,
      'liverpool': -2.5879,
      'newcastle': -1.6178,
      'cardiff': -3.1791,
      'belfast': -5.9301,
      'cork': -8.4706,
      'galway': -9.0627,
      'limerick': -8.6239,
      'waterford': -7.1100,
      'kilkenny': -7.2570,
      'drogheda': -6.3478,
      'wicklow': -6.0494,
      'wexford': -6.4576,
      'eniscorthy': -6.5667,
      'gorey': -6.2925,
      'arklow': -6.1594,
      'bray': -6.0983,
      'greystones': -6.0633,
      'blackrock': -6.1778,
      'dun laoghaire': -6.1333,
      'dalkey': -6.1000,
      'killiney': -6.1167,
      'shankill': -6.1167,
      'loughlinstown': -6.1333,
      'cabinteely': -6.1500,
      'foxrock': -6.1667,
      'deansgrange': -6.1833,
      'monkstown': -6.2000,
      'dun laoghaire': -6.1333,
      'sandycove': -6.1167,
      'glasthule': -6.1000,
      'salthill': -6.0833,
      'seapoint': -6.0667,
      'blackrock': -6.1778,
      'booterstown': -6.1944,
      'mount merrion': -6.2111,
      'stillorgan': -6.2278,
      'kilmacud': -6.2444,
      'sandyford': -6.2611,
      'leopardstown': -6.2778,
      'foxrock': -6.1667,
      'cabinteely': -6.1500,
      'loughlinstown': -6.1333,
      'shankill': -6.1167,
      'killiney': -6.1167,
      'dalkey': -6.1000,
      'dun laoghaire': -6.1333,
      'blackrock': -6.1778,
      'bray': -6.0983,
      'greystones': -6.0633,
      'wicklow': -6.0494,
      'arklow': -6.1594,
      'gorey': -6.2925,
      'eniscorthy': -6.5667,
      'wexford': -6.4576,
      'kilkenny': -7.2570,
      'waterford': -7.1100,
      'limerick': -8.6239,
      'galway': -9.0627,
      'cork': -8.4706,
      'belfast': -5.9301,
      'cardiff': -3.1791,
      'newcastle': -1.6178,
      'liverpool': -2.5879,
      'leeds': -1.5491,
      'birmingham': -1.8904,
      'manchester': -2.2426,
      'glasgow': -4.2518,
      'edinburgh': -3.1883,
      'dublin': -6.2603,
      'reykjavik': -21.9426,
      'helsinki': 24.9384,
      'copenhagen': 12.5683,
      'oslo': 10.7522,
      'stockholm': 18.0686,
      'warsaw': 21.0122,
      'budapest': 19.0402,
      'vienna': 16.3738,
      'prague': 14.4378,
      'berlin': 13.4050,
      'amsterdam': 4.9041,
      'rome': 12.4964,
      'madrid': -3.7038,
      'istanbul': 28.9784,
      'seoul': 126.9780,
      'beijing': 116.4074,
      'moscow': 37.6176,
      'cairo': 31.2357,
      'rio de janeiro': -43.1729,
      'mexico city': -99.1332,
      'bangkok': 100.5018,
      'singapore': 103.8198,
      'dubai': 55.2708,
      'mumbai': 72.8777,
      'sydney': 151.2093,
      'tokyo': 139.6503,
      'new york': -74.0060,
      'london': -0.1278,
      'paris': 2.3522
    }
    
    const lowerLocation = location.toLowerCase()
    const baseLng = baseLongitudes[lowerLocation] || -74.0060 // Default to NYC
    return baseLng + (Math.random() - 0.5) * 0.1 // ±0.05 degrees variation
  }

  async getHotelDetailsById(hotelId: string): Promise<HotelResult | null> {
    // Return a mock hotel detail
    const mockHotel: HotelResult = {
      id: hotelId,
      name: 'Luxury Hotel & Spa',
      rating: 4.8,
      price: 280,
      currency: 'USD',
      location: 'City Center',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Room Service'],
      description: 'Luxury 5-star hotel with stunning views and world-class amenities.',
      latitude: 48.8566,
      longitude: 2.3522,
      bookingUrl: 'https://www.booking.com/searchresults.html?ss=hotel&selected_currency=USD',
    }
    
    return mockHotel
  }
}

export const mockHotelsService = new MockHotelsService() 