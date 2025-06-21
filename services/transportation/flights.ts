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
    const results: FlightResult[] = []

    // Try Skyscanner first
    if (this.skyscannerKey) {
      try {
        const skyscannerResults = await this.searchSkyscanner(params)
        results.push(...skyscannerResults)
      } catch (error) {
        console.error('Skyscanner search failed:', error)
      }
    }

    // Try Amadeus if Skyscanner didn't return enough results
    if (results.length < 5 && this.amadeusKey) {
      try {
        const amadeusResults = await this.searchAmadeus(params)
        results.push(...amadeusResults)
      } catch (error) {
        console.error('Amadeus search failed:', error)
      }
    }

    // Try Kiwi as fallback
    if (results.length < 5 && this.kiwiKey) {
      try {
        const kiwiResults = await this.searchKiwi(params)
        results.push(...kiwiResults)
      } catch (error) {
        console.error('Kiwi search failed:', error)
      }
    }

    // If no API results, use fallback
    if (results.length === 0) {
      return this.getFallbackFlights(params)
    }

    // Remove duplicates and sort by price
    const uniqueResults = this.removeDuplicateFlights(results)
    return uniqueResults.sort((a, b) => a.price - b.price)
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
    const airlines = ['Delta', 'American Airlines', 'United', 'Southwest', 'JetBlue']
    const flights: FlightResult[] = []

    for (let i = 0; i < 5; i++) {
      const airline = airlines[i % airlines.length]
      const departureHour = 6 + (i * 3) // Spread flights throughout the day
      const duration = 120 + Math.floor(Math.random() * 180) // 2-5 hours
      
      flights.push({
        id: `flight-${i + 1}`,
        airline,
        flightNumber: `${airline.substring(0, 2).toUpperCase()}${1000 + i}`,
        origin: params.origin,
        destination: params.destination,
        departureTime: `${params.departureDate}T${departureHour.toString().padStart(2, '0')}:00:00Z`,
        arrivalTime: `${params.departureDate}T${(departureHour + Math.floor(duration / 60)).toString().padStart(2, '0')}:${(duration % 60).toString().padStart(2, '0')}:00Z`,
        duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
        price: 200 + Math.floor(Math.random() * 800),
        currency: 'USD',
        stops: Math.floor(Math.random() * 2),
        cabinClass: params.cabinClass || 'economy',
        bookingUrl: `https://www.google.com/flights?hl=en#flt=${params.origin}.${params.destination}.${params.departureDate}`
      })
    }

    return flights.sort((a, b) => a.price - b.price)
  }

  private getFallbackAirports(query: string): AirportInfo[] {
    const airports = [
      { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', latitude: 40.6413, longitude: -73.7781 },
      { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', latitude: 33.9416, longitude: -118.4085 },
      { code: 'ORD', name: 'O\'Hare International Airport', city: 'Chicago', country: 'United States', latitude: 41.9786, longitude: -87.9048 },
      { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'United States', latitude: 33.6407, longitude: -84.4277 },
      { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'United States', latitude: 32.8968, longitude: -97.0380 },
      { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', latitude: 49.0097, longitude: 2.5479 },
      { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', latitude: 51.4700, longitude: -0.4543 },
      { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 }
    ]

    return airports.filter(airport => 
      airport.code.toLowerCase().includes(query.toLowerCase()) ||
      airport.city.toLowerCase().includes(query.toLowerCase()) ||
      airport.name.toLowerCase().includes(query.toLowerCase())
    )
  }
}

export const flightService = new FlightService() 