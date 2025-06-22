'use client'

import { useState, useEffect } from 'react'
import { Plane, Clock, MapPin, DollarSign, ExternalLink, Calendar, Users, Search } from 'lucide-react'

interface FlightResult {
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

interface FlightsSectionProps {
  destination: string
  duration: string
  passengers?: number
}

export default function FlightsSection({ destination, duration, passengers = 2 }: FlightsSectionProps) {
  const [flights, setFlights] = useState<FlightResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [origin, setOrigin] = useState('JFK') // Default origin
  const [departureDate, setDepartureDate] = useState('')

  useEffect(() => {
    // Set default departure date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setDepartureDate(tomorrow.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    if (departureDate) {
      searchFlights()
    }
  }, [departureDate, origin, destination])

  const searchFlights = async () => {
    setLoading(true)
    setError(null)

    try {
      // Convert destination city name to airport code
      const destinationCode = getAirportCodeForCity(destination)
      
      console.log('Searching flights:', {
        origin,
        destination: destinationCode,
        departureDate,
        passengers
      })
      
      const response = await fetch(
        `/api/flights?action=search&origin=${origin}&destination=${destinationCode}&departureDate=${departureDate}&passengers=${passengers}&cabinClass=economy`
      )

      console.log('Flight search response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Flight search result:', data)
      
      setFlights(data.flights || data || [])
    } catch (err: any) {
      console.error('Error fetching flights:', err)
      setError(err.message || 'Unable to fetch flights at this time')
      setFlights([])
    } finally {
      setLoading(false)
    }
  }

  const getAirportCodeForCity = (cityName: string): string => {
    // Dynamic city to airport code mapping
    // This could be replaced with a real airport database API
    const cityToAirport: { [key: string]: string } = {
      // Major US Cities
      'new york': 'JFK', 'los angeles': 'LAX', 'chicago': 'ORD', 'atlanta': 'ATL',
      'dallas': 'DFW', 'san francisco': 'SFO', 'miami': 'MIA', 'boston': 'BOS',
      'denver': 'DEN', 'las vegas': 'LAS', 'orlando': 'MCO', 'charlotte': 'CLT',
      'phoenix': 'PHX', 'houston': 'IAH', 'minneapolis': 'MSP', 'seattle': 'SEA',
      'detroit': 'DTW', 'philadelphia': 'PHL', 'salt lake city': 'SLC', 'austin': 'AUS',
      
      // Major International Cities
      'paris': 'CDG', 'london': 'LHR', 'tokyo': 'NRT', 'dubai': 'DXB',
      'singapore': 'SIN', 'hong kong': 'HKG', 'sydney': 'SYD', 'melbourne': 'MEL',
      'barcelona': 'BCN', 'madrid': 'MAD', 'rome': 'FCO', 'milan': 'MXP',
      'amsterdam': 'AMS', 'frankfurt': 'FRA', 'munich': 'MUC', 'zurich': 'ZRH',
      'vienna': 'VIE', 'copenhagen': 'CPH', 'stockholm': 'ARN', 'oslo': 'OSL',
      'helsinki': 'HEL', 'reykjavik': 'KEF', 'montreal': 'YUL', 'toronto': 'YYZ',
      'vancouver': 'YVR', 'são paulo': 'GRU', 'buenos aires': 'EZE', 'mexico city': 'MEX',
      'cancún': 'CUN', 'mumbai': 'BOM', 'delhi': 'DEL', 'bangalore': 'BLR',
      'chennai': 'MAA', 'hyderabad': 'HYD', 'kolkata': 'CCU', 'bangkok': 'BKK',
      'kuala lumpur': 'KUL', 'jakarta': 'CGK', 'manila': 'MNL', 'seoul': 'ICN',
      'beijing': 'PEK', 'shanghai': 'PVG', 'guangzhou': 'CAN', 'chengdu': 'CTU',
      'johannesburg': 'JNB', 'cape town': 'CPT', 'cairo': 'CAI', 'nairobi': 'NBO',
      'lagos': 'LOS', 'riyadh': 'RUH', 'jeddah': 'JED', 'doha': 'DOH',
      'kuwait city': 'KWI', 'manama': 'BAH', 'muscat': 'MUS', 'abu dhabi': 'AUH',
      'sharjah': 'SHJ', 'istanbul': 'IST', 'moscow': 'SVO', 'st petersburg': 'LED',
      'warsaw': 'WAW', 'prague': 'PRG', 'budapest': 'BUD', 'bratislava': 'BTS',
      'belgrade': 'BEG', 'zagreb': 'ZAG', 'ljubljana': 'LJU', 'bucharest': 'OTP',
      'sofia': 'SOF', 'athens': 'ATH', 'thessaloniki': 'SKG', 'tirana': 'TIA',
      'skopje': 'SKP', 'podgorica': 'TGD', 'sarajevo': 'SJJ', 'banja luka': 'BNX',
      'tuzla': 'TZL', 'mostar': 'OMO', 'priština': 'PRN'
    }

    const normalizedCity = cityName.toLowerCase().trim()
    
    // First try exact match
    if (cityToAirport[normalizedCity]) {
      return cityToAirport[normalizedCity]
    }
    
    // Try partial matches for cities with multiple words
    for (const [city, code] of Object.entries(cityToAirport)) {
      if (city.includes(normalizedCity) || normalizedCity.includes(city)) {
        return code
      }
    }
    
    // If no match found, try to extract airport code from common patterns
    // For example, if the city name contains an airport code
    const airportCodeMatch = cityName.match(/\b[A-Z]{3}\b/)
    if (airportCodeMatch) {
      return airportCodeMatch[0]
    }
    
    // Fallback: use first 3 letters of city name as airport code
    // This is not ideal but provides a reasonable fallback
    return generateDynamicAirportCode(cityName)
  }

  const generateDynamicAirportCode = (cityName: string): string => {
    // Remove common words and clean the city name
    const cleanName = cityName
      .toLowerCase()
      .replace(/\b(city|town|village|borough|district|county|state|province|region|area)\b/g, '')
      .replace(/[^a-z\s]/g, '')
      .trim()
    
    // Split into words and take first letters
    const words = cleanName.split(/\s+/)
    
    if (words.length >= 2) {
      // For multi-word cities, use first letter of first two words
      return (words[0][0] + words[1][0] + words[0][1]).toUpperCase()
    } else if (words.length === 1 && words[0].length >= 3) {
      // For single word cities, use first 3 letters
      return words[0].substring(0, 3).toUpperCase()
    } else {
      // Fallback: use first 3 letters of original name
      return cityName.substring(0, 3).toUpperCase()
    }
  }

  const getGoogleFlightsUrl = () => {
    // Validate departure date
    if (!departureDate || departureDate === '') {
      // Return a basic Google Flights URL without specific dates
      const destinationCode = getAirportCodeForCity(destination)
      return `https://www.google.com/flights?hl=en#flt=${origin}.${destinationCode};c:USD;e:1;sd:1;t:e;tt:o`
    }

    try {
      // Parse the departure date and calculate return date
      const departureDateObj = new Date(departureDate)
      
      // Check if the date is valid
      if (isNaN(departureDateObj.getTime())) {
        throw new Error('Invalid departure date')
      }
      
      const days = parseInt(duration.split(' ')[0]) || 7
      
      // Create return date by adding days to departure date
      const returnDateObj = new Date(departureDateObj)
      returnDateObj.setDate(departureDateObj.getDate() + days)
      
      // Format dates for Google Flights URL
      const formattedDepartureDate = departureDateObj.toISOString().split('T')[0]
      const formattedReturnDate = returnDateObj.toISOString().split('T')[0]
      
      const destinationCode = getAirportCodeForCity(destination)
      
      return `https://www.google.com/flights?hl=en#flt=${origin}.${destinationCode}.${formattedDepartureDate}*${destinationCode}.${origin}.${formattedReturnDate};c:USD;e:1;sd:1;t:e;tt:o`
    } catch (error) {
      // Fallback to basic URL if date parsing fails
      console.warn('Error parsing dates for Google Flights URL:', error)
      const destinationCode = getAirportCodeForCity(destination)
      return `https://www.google.com/flights?hl=en#flt=${origin}.${destinationCode};c:USD;e:1;sd:1;t:e;tt:o`
    }
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getAirlineLogo = (airline: string) => {
    // Generate airline logos dynamically based on airline name
    // In a real app, you'd have a proper logo database or CDN
    const airlineLogos: { [key: string]: string } = {
      // Major US Airlines
      'Delta': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Delta_logo.svg/1200px-Delta_logo.svg.png',
      'American Airlines': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/American_Airlines_logo_2013.svg/1200px-American_Airlines_logo_2013.svg.png',
      'United': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/United_Airlines_Logo.svg/1200px-United_Airlines_Logo.svg.png',
      'Southwest': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Southwest_Airlines_logo_2014.svg/1200px-Southwest_Airlines_logo_2014.svg.png',
      'JetBlue': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/JetBlue_Airways_Logo.svg/1200px-JetBlue_Airways_Logo.svg.png',
      'Alaska Airlines': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Alaska_Airlines_logo_2016.svg/1200px-Alaska_Airlines_logo_2016.svg.png',
      'Spirit Airlines': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Spirit_Airlines_logo_2014.svg/1200px-Spirit_Airlines_logo_2014.svg.png',
      'Frontier Airlines': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Frontier_Airlines_logo_2014.svg/1200px-Frontier_Airlines_logo_2014.svg.png',
      'Hawaiian Airlines': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Hawaiian_Airlines_logo_2017.svg/1200px-Hawaiian_Airlines_logo_2017.svg.png',
      
      // International Airlines
      'British Airways': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/British_Airways_Logo.svg/1200px-British_Airways_Logo.svg.png',
      'Air France': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Air_France_Logo.svg/1200px-Air_France_Logo.svg.png',
      'Lufthansa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Lufthansa_Logo_2018.svg/1200px-Lufthansa_Logo_2018.svg.png',
      'Emirates': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/1200px-Emirates_logo.svg.png',
      'Qatar Airways': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Qatar_Airways_Logo.svg/1200px-Qatar_Airways_Logo.svg.png',
      'Singapore Airlines': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Singapore_Airlines_Logo_2.svg/1200px-Singapore_Airlines_Logo_2.svg.png',
      'Cathay Pacific': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cathay_Pacific_logo.svg/1200px-Cathay_Pacific_logo.svg.png',
      'Japan Airlines': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Japan_Airlines_logo.svg/1200px-Japan_Airlines_logo.svg.png',
      'ANA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/ANA_logo.svg/1200px-ANA_logo.svg.png',
      'KLM': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/KLM_logo.svg/1200px-KLM_logo.svg.png'
    }
    
    // Return the logo if available, otherwise return empty string
    // In a real app, you might want to show a generic airline icon
    return airlineLogos[airline] || ''
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Plane className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Flight Options</h3>
        </div>
        {departureDate && (
          <a
            href={getGoogleFlightsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Search Google Flights</span>
          </a>
        )}
      </div>

      {/* Search Controls */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="JFK">New York (JFK)</option>
              <option value="LAX">Los Angeles (LAX)</option>
              <option value="ORD">Chicago (ORD)</option>
              <option value="ATL">Atlanta (ATL)</option>
              <option value="DFW">Dallas (DFW)</option>
              <option value="SFO">San Francisco (SFO)</option>
              <option value="MIA">Miami (MIA)</option>
              <option value="BOS">Boston (BOS)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <div className="p-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600">
              {destination} ({getAirportCodeForCity(destination)})
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching for flights...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Plane className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
          <div className="mt-4">
            <a
              href={getGoogleFlightsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Search on Google Flights</span>
            </a>
          </div>
        </div>
      )}

      {/* No Flights Found */}
      {!loading && !error && flights.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Plane className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-yellow-800 mb-2">No Direct Flights Found</h4>
          <p className="text-yellow-700 mb-4">
            We couldn't find direct flights for your search. Try searching on Google Flights for more options.
          </p>
          <a
            href={getGoogleFlightsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <ExternalLink className="h-5 w-5" />
            <span>Search Google Flights</span>
          </a>
        </div>
      )}

      {/* Flight Results */}
      {!loading && !error && flights.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Found {flights.length} flight{flights.length !== 1 ? 's' : ''} from {origin} to {destination} ({getAirportCodeForCity(destination)})
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{passengers} passenger{passengers !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="space-y-3">
            {flights.map((flight) => (
              <div key={flight.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  {/* Flight Info */}
                  <div className="flex items-center space-x-4">
                    {getAirlineLogo(flight.airline) && (
                      <img 
                        src={getAirlineLogo(flight.airline)} 
                        alt={flight.airline}
                        className="h-8 w-8 object-contain"
                      />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">{flight.airline}</span>
                        <span className="text-sm text-gray-500">{flight.flightNumber}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{flight.origin} → {flight.destination}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{flight.duration}</span>
                        </span>
                        {flight.stops > 0 && (
                          <span className="text-orange-600">
                            {flight.stops} stop{flight.stops !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Time and Price */}
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      <div>{formatTime(flight.departureTime)} - {formatTime(flight.arrivalTime)}</div>
                      <div>{formatDate(flight.departureTime)}</div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-xl font-bold text-green-600">
                          {flight.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">per person</p>
                    </div>
                  </div>

                  {/* Booking Button */}
                  <div className="ml-4">
                    <a
                      href={flight.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Book</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Options */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900">Need More Options?</h4>
                <p className="text-sm text-blue-700">Search Google Flights for additional airlines and routes</p>
              </div>
              <a
                href={getGoogleFlightsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Search className="h-4 w-4" />
                <span>Search Google Flights</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 