export interface FlightSearchParams {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  passengers: number
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first'
  maxPrice?: number
}

export interface FlightResult {
  id: string
  airline: string
  flightNumber: string
  origin: string
  destination: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  currency: string
  stops: number
  cabinClass: string
  bookingUrl: string
  airlineLogo?: string
}

export interface AirportInfo {
  code: string
  name: string
  city: string
  country: string
  latitude: number
  longitude: number
}

export class FlightService {
  private skyscannerKey: string
  private amadeusKey: string
  private kiwiKey: string

  constructor() {
    this.skyscannerKey = process.env.SKYSCANNER_API_KEY || ''
    this.amadeusKey = process.env.AMADEUS_API_KEY || ''
    this.kiwiKey = process.env.KIWI_API_KEY || ''
    
    if (!this.skyscannerKey && !this.amadeusKey && !this.kiwiKey) {
      console.warn('No flight API keys found. Using fallback data.')
    }
  }

  async searchFlights(params: FlightSearchParams): Promise<FlightResult[]> {
    console.log('FlightService: Starting flight search with params:', params)
    const results: FlightResult[] = []

    // Try Skyscanner first
    if (this.skyscannerKey) {
      try {
        console.log('FlightService: Trying Skyscanner API...')
        const skyscannerResults = await this.searchSkyscanner(params)
        results.push(...skyscannerResults)
        console.log('FlightService: Skyscanner returned', skyscannerResults.length, 'results')
      } catch (error) {
        console.error('FlightService: Skyscanner search failed:', error)
      }
    } else {
      console.log('FlightService: No Skyscanner API key available')
    }

    // Try Amadeus if Skyscanner didn't return enough results
    if (results.length < 5 && this.amadeusKey) {
      try {
        console.log('FlightService: Trying Amadeus API...')
        const amadeusResults = await this.searchAmadeus(params)
        results.push(...amadeusResults)
        console.log('FlightService: Amadeus returned', amadeusResults.length, 'results')
      } catch (error) {
        console.error('FlightService: Amadeus search failed:', error)
      }
    } else {
      console.log('FlightService: No Amadeus API key available or enough results already')
    }

    // Try Kiwi as fallback
    if (results.length < 5 && this.kiwiKey) {
      try {
        console.log('FlightService: Trying Kiwi API...')
        const kiwiResults = await this.searchKiwi(params)
        results.push(...kiwiResults)
        console.log('FlightService: Kiwi returned', kiwiResults.length, 'results')
      } catch (error) {
        console.error('FlightService: Kiwi search failed:', error)
      }
    } else {
      console.log('FlightService: No Kiwi API key available or enough results already')
    }

    // If no API results, use fallback
    if (results.length === 0) {
      console.log('FlightService: No API results, using fallback data')
      const fallbackResults = this.getFallbackFlights(params)
      console.log('FlightService: Fallback returned', fallbackResults.length, 'results')
      return fallbackResults
    }

    // Remove duplicates and sort by price
    const uniqueResults = this.removeDuplicateFlights(results)
    const sortedResults = uniqueResults.sort((a, b) => a.price - b.price)
    console.log('FlightService: Returning', sortedResults.length, 'final results')
    return sortedResults
  }

  private async searchSkyscanner(params: FlightSearchParams): Promise<FlightResult[]> {
    const response = await fetch(
      `https://skyscanner-api.p.rapidapi.com/v3/flights/live/search/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': this.skyscannerKey,
          'X-RapidAPI-Host': 'skyscanner-api.p.rapidapi.com'
        },
        body: JSON.stringify({
          query: {
            market: 'US',
            locale: 'en-US',
            currency: 'USD',
            queryLegs: [{
              originPlaceId: params.origin,
              destinationPlaceId: params.destination,
              date: params.departureDate
            }],
            adults: params.passengers,
            cabinClass: params.cabinClass || 'economy'
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error('Skyscanner API request failed')
    }

    const data = await response.json()
    
    // Process the response and extract flight results
    // This is a simplified version - actual implementation would be more complex
    return []
  }

  private async searchAmadeus(params: FlightSearchParams): Promise<FlightResult[]> {
    // First get access token
    const tokenResponse = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=client_credentials&client_id=${this.amadeusKey}&client_secret=${process.env.AMADEUS_CLIENT_SECRET}`
    })

    if (!tokenResponse.ok) {
      throw new Error('Amadeus authentication failed')
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Search flights
    const searchResponse = await fetch(
      `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${params.origin}&destinationLocationCode=${params.destination}&departureDate=${params.departureDate}&adults=${params.passengers}&currencyCode=USD&max=20`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    if (!searchResponse.ok) {
      throw new Error('Amadeus flight search failed')
    }

    const data = await searchResponse.json()
    
    return data.data?.map((flight: any) => ({
      id: flight.id,
      airline: flight.validatingAirlineCodes[0],
      flightNumber: flight.itineraries[0].segments[0].carrierCode + flight.itineraries[0].segments[0].number,
      origin: flight.itineraries[0].segments[0].departure.iataCode,
      destination: flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode,
      departureTime: flight.itineraries[0].segments[0].departure.at,
      arrivalTime: flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.at,
      duration: flight.itineraries[0].duration,
      price: parseFloat(flight.price.total),
      currency: flight.price.currency,
      stops: flight.itineraries[0].segments.length - 1,
      cabinClass: flight.travelerPricings[0].fareDetailsBySegment[0].cabin,
      bookingUrl: `https://www.amadeus.com/flights/${params.origin}-${params.destination}/${params.departureDate}`
    })) || []
  }

  private async searchKiwi(params: FlightSearchParams): Promise<FlightResult[]> {
    const response = await fetch(
      `https://tequila-api.kiwi.com/v2/search?fly_from=${params.origin}&fly_to=${params.destination}&date_from=${params.departureDate}&date_to=${params.departureDate}&adults=${params.passengers}&curr=USD&limit=20`,
      {
        headers: {
          'apikey': this.kiwiKey
        }
      }
    )

    if (!response.ok) {
      throw new Error('Kiwi API request failed')
    }

    const data = await response.json()
    
    return data.data?.map((flight: any) => ({
      id: flight.id,
      airline: flight.airlines[0],
      flightNumber: flight.route[0].flight_no,
      origin: flight.route[0].flyFrom,
      destination: flight.route[flight.route.length - 1].flyTo,
      departureTime: flight.route[0].local_departure,
      arrivalTime: flight.route[flight.route.length - 1].local_arrival,
      duration: flight.duration.total,
      price: flight.price,
      currency: 'USD',
      stops: flight.route.length - 1,
      cabinClass: 'economy',
      bookingUrl: flight.deep_link
    })) || []
  }

  async searchAirports(query: string): Promise<AirportInfo[]> {
    if (!this.amadeusKey) {
      return this.getFallbackAirports(query)
    }

    try {
      // Get access token
      const tokenResponse = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=client_credentials&client_id=${this.amadeusKey}&client_secret=${process.env.AMADEUS_CLIENT_SECRET}`
      })

      if (!tokenResponse.ok) {
        throw new Error('Amadeus authentication failed')
      }

      const tokenData = await tokenResponse.json()
      const accessToken = tokenData.access_token

      // Search airports
      const searchResponse = await fetch(
        `https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY,AIRPORT&keyword=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (!searchResponse.ok) {
        throw new Error('Airport search failed')
      }

      const data = await searchResponse.json()
      
      return data.data?.map((location: any) => ({
        code: location.iataCode,
        name: location.name,
        city: location.address.cityName,
        country: location.address.countryName,
        latitude: location.geoCode.latitude,
        longitude: location.geoCode.longitude
      })) || []
    } catch (error) {
      console.error('Error searching airports:', error)
      return this.getFallbackAirports(query)
    }
  }

  private removeDuplicateFlights(flights: FlightResult[]): FlightResult[] {
    const seen = new Set()
    return flights.filter(flight => {
      const key = `${flight.airline}-${flight.flightNumber}-${flight.departureTime}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  private getFallbackFlights(params: FlightSearchParams): FlightResult[] {
    console.log('FlightService: Generating fallback flights for:', params)
    
    const flights: FlightResult[] = []
    const airlines = [
      'Delta', 'American Airlines', 'United', 'Southwest', 'JetBlue',
      'British Airways', 'Air France', 'Lufthansa', 'Emirates', 'Qatar Airways'
    ]
    
    const isInternational = this.isInternationalRoute(params.origin, params.destination)
    const basePrice = this.getBasePrice(params.origin, params.destination, isInternational)
    
    console.log('FlightService: Route is international:', isInternational)
    console.log('FlightService: Base price calculated:', basePrice)
    
    for (let i = 0; i < 8; i++) {
      const airline = airlines[i % airlines.length]
      const departureHour = Math.floor(6 + (i * 2.5)) // Ensure integer hour
      const duration = this.getFlightDuration(params.origin, params.destination, isInternational)
      const priceVariation = 0.7 + (Math.random() * 0.6) // ±30% price variation
      const price = Math.round(basePrice * priceVariation)
      
      // Validate and parse departure date more robustly
      let departureTime: Date
      try {
        // First try to parse the date as is
        departureTime = new Date(params.departureDate)
        
        // If that fails, try with time component
        if (isNaN(departureTime.getTime())) {
          departureTime = new Date(`${params.departureDate}T${departureHour.toString().padStart(2, '0')}:00:00`)
        }
        
        // If still invalid, try parsing as YYYY-MM-DD format
        if (isNaN(departureTime.getTime())) {
          const [year, month, day] = params.departureDate.split('-').map(Number)
          if (year && month && day) {
            departureTime = new Date(year, month - 1, day, departureHour, 0, 0)
          } else {
            throw new Error('Invalid date format')
          }
        }
        
        // Final validation
        if (isNaN(departureTime.getTime())) {
          throw new Error('Invalid departure date')
        }
      } catch (error) {
        console.error('FlightService: Invalid departure date, using fallback:', params.departureDate, error)
        // Use a fallback date if the provided date is invalid
        const fallbackDate = new Date()
        fallbackDate.setDate(fallbackDate.getDate() + 1)
        fallbackDate.setHours(departureHour, 0, 0, 0)
        departureTime = fallbackDate
      }
      
      // Ensure arrival time is valid
      let arrivalTime: Date
      try {
        arrivalTime = new Date(departureTime.getTime() + duration * 60 * 1000)
        if (isNaN(arrivalTime.getTime())) {
          throw new Error('Invalid arrival time')
        }
      } catch (error) {
        console.error('FlightService: Invalid arrival time, using fallback')
        arrivalTime = new Date(departureTime.getTime() + 6 * 60 * 60 * 1000) // 6 hours fallback
      }
      
      flights.push({
        id: `flight-${i + 1}`,
        airline,
        flightNumber: `${airline.substring(0, 2).toUpperCase()}${1000 + i}`,
        origin: params.origin,
        destination: params.destination,
        departureTime: departureTime.toISOString(),
        arrivalTime: arrivalTime.toISOString(),
        duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
        price,
        currency: 'USD',
        stops: this.getStopsForRoute(params.origin, params.destination, isInternational),
        cabinClass: params.cabinClass || 'economy',
        bookingUrl: this.generateBookingUrl(params.origin, params.destination, params.departureDate, airline)
      })
    }

    const sortedFlights = flights.sort((a, b) => a.price - b.price)
    console.log('FlightService: Generated', sortedFlights.length, 'fallback flights')
    return sortedFlights
  }

  private isInternationalRoute(origin: string, destination: string): boolean {
    // US airport codes are typically 3 letters, but some international ones are too
    // This is a simplified check - in a real app you'd have a proper airport database
    const usAirports = ['JFK', 'LAX', 'ORD', 'ATL', 'DFW', 'SFO', 'MIA', 'BOS', 'DEN', 'LAS', 'MCO', 'CLT', 'PHX', 'IAH', 'MSP']
    const isOriginUS = usAirports.includes(origin.toUpperCase())
    const isDestinationUS = usAirports.includes(destination.toUpperCase())
    
    return isOriginUS !== isDestinationUS
  }

  private getBasePrice(origin: string, destination: string, isInternational: boolean): number {
    if (isInternational) {
      // International flight base prices - more generic approach
      const baseInternationalPrice = 1000
      const routeMultiplier = this.getRouteMultiplier(origin, destination)
      return Math.round(baseInternationalPrice * routeMultiplier)
    } else {
      // Domestic flight base prices - more generic approach
      const baseDomesticPrice = 300
      const routeMultiplier = this.getRouteMultiplier(origin, destination)
      return Math.round(baseDomesticPrice * routeMultiplier)
    }
  }

  private getRouteMultiplier(origin: string, destination: string): number {
    // Calculate route multiplier based on distance approximation
    // This is a simplified approach - in a real app you'd use actual coordinates
    const route = `${origin.toUpperCase()}-${destination.toUpperCase()}`
    
    // Known route multipliers for common routes
    const routeMultipliers: { [key: string]: number } = {
      // International routes
      'JFK-LHR': 0.8, 'JFK-CDG': 0.9, 'JFK-NRT': 1.2, 'JFK-DXB': 1.0,
      'LAX-NRT': 1.1, 'LAX-SYD': 1.3, 'LAX-SIN': 1.2, 'LAX-HKG': 1.1,
      'ORD-LHR': 0.85, 'ORD-CDG': 0.95, 'ORD-FRA': 0.9, 'ORD-AMS': 0.85,
      'ATL-LHR': 0.9, 'ATL-CDG': 1.0, 'ATL-FRA': 0.95, 'ATL-AMS': 0.9,
      'DFW-LHR': 0.95, 'DFW-CDG': 1.05, 'DFW-FRA': 1.0, 'DFW-AMS': 0.95,
      
      // Domestic routes
      'JFK-LAX': 1.33, 'JFK-ORD': 0.83, 'JFK-ATL': 0.67, 'JFK-DFW': 1.0,
      'LAX-ORD': 1.17, 'LAX-ATL': 1.33, 'LAX-DFW': 1.0, 'LAX-SFO': 0.5,
      'ORD-ATL': 0.67, 'ORD-DFW': 0.83, 'ORD-SFO': 1.17, 'ORD-LAS': 1.0,
      'ATL-DFW': 0.67, 'ATL-SFO': 1.33, 'ATL-LAS': 1.17, 'ATL-MIA': 0.5
    }
    
    return routeMultipliers[route] || 1.0 // Default multiplier
  }

  private getFlightDuration(origin: string, destination: string, isInternational: boolean): number {
    if (isInternational) {
      // International flight durations - more generic approach
      const baseInternationalDuration = 600 // 10 hours
      const routeMultiplier = this.getRouteMultiplier(origin, destination)
      return Math.round(baseInternationalDuration * routeMultiplier)
    } else {
      // Domestic flight durations - more generic approach
      const baseDomesticDuration = 180 // 3 hours
      const routeMultiplier = this.getRouteMultiplier(origin, destination)
      return Math.round(baseDomesticDuration * routeMultiplier)
    }
  }

  private getStopsForRoute(origin: string, destination: string, isInternational: boolean): number {
    if (isInternational) {
      // International flights often have stops
      const directRoutes = [
        'JFK-LHR', 'JFK-CDG', 'LAX-NRT', 'LAX-SYD', 'ORD-LHR', 'ORD-CDG',
        'ATL-LHR', 'ATL-CDG', 'DFW-LHR', 'DFW-CDG'
      ]
      const route = `${origin.toUpperCase()}-${destination.toUpperCase()}`
      return directRoutes.includes(route) ? 0 : 1
    } else {
      // Domestic flights are usually direct
      return 0
    }
  }

  private generateBookingUrl(origin: string, destination: string, departureDate: string, airline: string): string {
    // Generate booking URLs for different airlines
    const airlineUrls: { [key: string]: string } = {
      'Delta': `https://www.delta.com/flight-search?from=${origin}&to=${destination}&date=${departureDate}`,
      'American Airlines': `https://www.aa.com/flights?from=${origin}&to=${destination}&date=${departureDate}`,
      'United': `https://www.united.com/flights?from=${origin}&to=${destination}&date=${departureDate}`,
      'Southwest': `https://www.southwest.com/flight/search-flight.html?from=${origin}&to=${destination}&date=${departureDate}`,
      'JetBlue': `https://www.jetblue.com/flights?from=${origin}&to=${destination}&date=${departureDate}`,
      'British Airways': `https://www.britishairways.com/flights?from=${origin}&to=${destination}&date=${departureDate}`,
      'Air France': `https://www.airfrance.com/flights?from=${origin}&to=${destination}&date=${departureDate}`,
      'Lufthansa': `https://www.lufthansa.com/flights?from=${origin}&to=${destination}&date=${departureDate}`,
      'Emirates': `https://www.emirates.com/flights?from=${origin}&to=${destination}&date=${departureDate}`,
      'Qatar Airways': `https://www.qatarairways.com/flights?from=${origin}&to=${destination}&date=${departureDate}`
    }
    
    return airlineUrls[airline] || `https://www.google.com/flights?hl=en#flt=${origin}.${destination}.${departureDate}`
  }

  private getFallbackAirports(query: string): AirportInfo[] {
    const airports = [
      { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', latitude: 40.6413, longitude: -73.7781 },
      { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', latitude: 33.9416, longitude: -118.4085 },
      { code: 'ORD', name: 'O\'Hare International Airport', city: 'Chicago', country: 'United States', latitude: 41.9786, longitude: -87.9048 },
      { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'United States', latitude: 33.6407, longitude: -84.4277 },
      { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'United States', latitude: 32.8968, longitude: -97.0380 },
      { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States', latitude: 37.6213, longitude: -122.3790 },
      { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'United States', latitude: 25.7932, longitude: -80.2906 },
      { code: 'BOS', name: 'Boston Logan International Airport', city: 'Boston', country: 'United States', latitude: 42.3656, longitude: -71.0096 },
      { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', latitude: 49.0097, longitude: 2.5479 },
      { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', latitude: 51.4700, longitude: -0.4543 },
      { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
      { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', latitude: 25.2532, longitude: 55.3657 },
      { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', latitude: 1.3644, longitude: 103.9915 },
      { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'China', latitude: 22.3080, longitude: 113.9185 },
      { code: 'SYD', name: 'Sydney Airport', city: 'Sydney', country: 'Australia', latitude: -33.9399, longitude: 151.1753 },
      { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', latitude: -37.8136, longitude: 144.9631 },
      { code: 'BCN', name: 'Barcelona-El Prat Airport', city: 'Barcelona', country: 'Spain', latitude: 41.2974, longitude: 2.0833 },
      { code: 'MAD', name: 'Madrid Barajas Airport', city: 'Madrid', country: 'Spain', latitude: 40.4983, longitude: -3.5676 },
      { code: 'FCO', name: 'Rome Fiumicino Airport', city: 'Rome', country: 'Italy', latitude: 41.8045, longitude: 12.2508 },
      { code: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy', latitude: 45.6306, longitude: 8.7281 },
      { code: 'AMS', name: 'Amsterdam Schiphol Airport', city: 'Amsterdam', country: 'Netherlands', latitude: 52.3105, longitude: 4.7683 },
      { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', latitude: 50.0379, longitude: 8.5622 },
      { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', latitude: 48.3538, longitude: 11.7861 },
      { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', latitude: 47.4588, longitude: 8.5559 },
      { code: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria', latitude: 48.1102, longitude: 16.5697 },
      { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark', latitude: 55.6180, longitude: 12.6508 },
      { code: 'ARN', name: 'Stockholm Arlanda Airport', city: 'Stockholm', country: 'Sweden', latitude: 59.6498, longitude: 17.9238 },
      { code: 'OSL', name: 'Oslo Airport', city: 'Oslo', country: 'Norway', latitude: 60.1975, longitude: 11.1004 },
      { code: 'HEL', name: 'Helsinki Airport', city: 'Helsinki', country: 'Finland', latitude: 60.3172, longitude: 24.9633 },
      { code: 'KEF', name: 'Keflavik International Airport', city: 'Reykjavik', country: 'Iceland', latitude: 63.9850, longitude: -22.6056 },
      { code: 'YUL', name: 'Montreal-Trudeau Airport', city: 'Montreal', country: 'Canada', latitude: 45.4706, longitude: -73.7408 },
      { code: 'YYZ', name: 'Toronto Pearson Airport', city: 'Toronto', country: 'Canada', latitude: 43.6777, longitude: -79.6248 },
      { code: 'YVR', name: 'Vancouver Airport', city: 'Vancouver', country: 'Canada', latitude: 49.1967, longitude: -123.1815 },
      { code: 'GRU', name: 'São Paulo-Guarulhos Airport', city: 'São Paulo', country: 'Brazil', latitude: -23.4356, longitude: -46.4731 },
      { code: 'EZE', name: 'Buenos Aires Ezeiza Airport', city: 'Buenos Aires', country: 'Argentina', latitude: -34.8222, longitude: -58.5358 },
      { code: 'MEX', name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico', latitude: 19.4363, longitude: -99.0721 },
      { code: 'CUN', name: 'Cancún International Airport', city: 'Cancún', country: 'Mexico', latitude: 21.0365, longitude: -86.8771 },
      { code: 'BOM', name: 'Mumbai Chhatrapati Shivaji Airport', city: 'Mumbai', country: 'India', latitude: 19.0896, longitude: 72.8656 },
      { code: 'DEL', name: 'Delhi Indira Gandhi Airport', city: 'Delhi', country: 'India', latitude: 28.5562, longitude: 77.1000 },
      { code: 'BKK', name: 'Bangkok Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', latitude: 13.6900, longitude: 100.7501 },
      { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', latitude: 2.7456, longitude: 101.7072 },
      { code: 'CGK', name: 'Jakarta Soekarno-Hatta Airport', city: 'Jakarta', country: 'Indonesia', latitude: -6.1256, longitude: 106.6559 },
      { code: 'MNL', name: 'Manila Ninoy Aquino Airport', city: 'Manila', country: 'Philippines', latitude: 14.5086, longitude: 121.0198 },
      { code: 'ICN', name: 'Seoul Incheon Airport', city: 'Seoul', country: 'South Korea', latitude: 37.4602, longitude: 126.4407 },
      { code: 'PEK', name: 'Beijing Capital Airport', city: 'Beijing', country: 'China', latitude: 40.0799, longitude: 116.6031 },
      { code: 'PVG', name: 'Shanghai Pudong Airport', city: 'Shanghai', country: 'China', latitude: 31.1443, longitude: 121.8083 },
      { code: 'CAN', name: 'Guangzhou Baiyun Airport', city: 'Guangzhou', country: 'China', latitude: 23.3924, longitude: 113.2988 },
      { code: 'CTU', name: 'Chengdu Shuangliu Airport', city: 'Chengdu', country: 'China', latitude: 30.5785, longitude: 103.9471 },
      { code: 'BOM', name: 'Mumbai Chhatrapati Shivaji Airport', city: 'Mumbai', country: 'India', latitude: 19.0896, longitude: 72.8656 },
      { code: 'DEL', name: 'Delhi Indira Gandhi Airport', city: 'Delhi', country: 'India', latitude: 28.5562, longitude: 77.1000 },
      { code: 'BLR', name: 'Bangalore Kempegowda Airport', city: 'Bangalore', country: 'India', latitude: 13.1986, longitude: 77.7066 },
      { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India', latitude: 12.9941, longitude: 80.1709 },
      { code: 'HYD', name: 'Hyderabad Rajiv Gandhi Airport', city: 'Hyderabad', country: 'India', latitude: 17.2403, longitude: 78.4294 },
      { code: 'CCU', name: 'Kolkata Netaji Subhas Airport', city: 'Kolkata', country: 'India', latitude: 22.6547, longitude: 88.4467 },
      { code: 'JNB', name: 'Johannesburg O.R. Tambo Airport', city: 'Johannesburg', country: 'South Africa', latitude: -26.1392, longitude: 28.2460 },
      { code: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa', latitude: -33.9715, longitude: 18.6021 },
      { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', latitude: 30.1219, longitude: 31.4056 },
      { code: 'NBO', name: 'Nairobi Jomo Kenyatta Airport', city: 'Nairobi', country: 'Kenya', latitude: -1.3192, longitude: 36.9278 },
      { code: 'LOS', name: 'Lagos Murtala Muhammed Airport', city: 'Lagos', country: 'Nigeria', latitude: 6.5774, longitude: 3.3210 },
      { code: 'RUH', name: 'Riyadh King Khalid Airport', city: 'Riyadh', country: 'Saudi Arabia', latitude: 24.9578, longitude: 46.6989 },
      { code: 'JED', name: 'Jeddah King Abdulaziz Airport', city: 'Jeddah', country: 'Saudi Arabia', latitude: 21.6805, longitude: 39.1505 },
      { code: 'DOH', name: 'Doha Hamad International Airport', city: 'Doha', country: 'Qatar', latitude: 25.2730, longitude: 51.6081 },
      { code: 'KWI', name: 'Kuwait International Airport', city: 'Kuwait City', country: 'Kuwait', latitude: 29.2266, longitude: 47.9689 },
      { code: 'BAH', name: 'Bahrain International Airport', city: 'Manama', country: 'Bahrain', latitude: 26.2708, longitude: 50.6336 },
      { code: 'MUS', name: 'Muscat International Airport', city: 'Muscat', country: 'Oman', latitude: 23.5932, longitude: 58.2844 },
      { code: 'AUH', name: 'Abu Dhabi International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates', latitude: 24.4330, longitude: 54.6511 },
      { code: 'SHJ', name: 'Sharjah International Airport', city: 'Sharjah', country: 'United Arab Emirates', latitude: 25.3286, longitude: 55.5173 }
    ]

    return airports.filter(airport => 
      airport.code.toLowerCase().includes(query.toLowerCase()) ||
      airport.city.toLowerCase().includes(query.toLowerCase()) ||
      airport.name.toLowerCase().includes(query.toLowerCase())
    )
  }

  // Helper method to convert city name to airport code
  private getAirportCodeForCity(cityName: string): string {
    // This method is now handled in the FlightsSection component
    // Return the city name as uppercase to use as airport code
    return cityName.toUpperCase()
  }
}

export const flightService = new FlightService() 