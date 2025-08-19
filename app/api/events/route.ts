import { NextRequest, NextResponse } from 'next/server'

interface Event {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  venue: {
    name: string
    address: string
    latitude?: number
    longitude?: number
  }
  category: string
  price: string
  url?: string
  image?: string
}

interface TicketmasterEvent {
  id: string
  name: string
  info?: string
  dates: {
    start: {
      localDate: string
      localTime?: string
      dateTime?: string
    }
    end?: {
      localDate: string
      localTime?: string
      dateTime?: string
    }
  }
  _embedded?: {
    venues: Array<{
      name: string
      address?: {
        line1?: string
        line2?: string
        line3?: string
      }
      city?: {
        name: string
      }
      state?: {
        name: string
        stateCode: string
      }
      country?: {
        name: string
        countryCode: string
      }
      postalCode?: string
      location?: {
        latitude: string
        longitude: string
      }
    }>
  }
  classifications?: Array<{
    segment?: {
      name: string
    }
    genre?: {
      name: string
    }
    subGenre?: {
      name: string
    }
  }>
  priceRanges?: Array<{
    type: string
    currency: string
    min: number
    max: number
  }>
  url?: string
  images?: Array<{
    ratio: string
    url: string
    width: number
    height: number
    fallback: boolean
  }>
}

interface TicketmasterResponse {
  _embedded?: {
    events: TicketmasterEvent[]
  }
  page: {
    size: number
    totalElements: number
    totalPages: number
    number: number
  }
}

// City to DMA ID mapping for Ticketmaster API
const cityToDmaId: { [key: string]: string } = {
  'toronto': '539', // Toronto DMA
  'new york': '345',
  'los angeles': '324',
  'chicago': '602',
  'philadelphia': '504',
  'dallas': '623',
  'san francisco': '807',
  'boston': '506',
  'atlanta': '524',
  'washington': '511',
  'houston': '618',
  'detroit': '505',
  'phoenix': '753',
  'tampa': '539',
  'seattle': '819',
  'miami': '528',
  'denver': '751',
  'cleveland': '510',
  'orlando': '534',
  'sacramento': '862'
}

// Category mapping from Ticketmaster classifications to our categories
const mapCategory = (classifications?: TicketmasterEvent['classifications']): string => {
  if (!classifications || classifications.length === 0) return 'Entertainment'
  
  const segment = classifications[0]?.segment?.name?.toLowerCase() || ''
  const genre = classifications[0]?.genre?.name?.toLowerCase() || ''
  
  if (segment.includes('music')) return 'Music'
  if (segment.includes('sports')) return 'Sports'
  if (segment.includes('arts') || segment.includes('theatre')) return 'Culture'
  if (genre.includes('comedy')) return 'Entertainment'
  if (genre.includes('family')) return 'Entertainment'
  
  return 'Entertainment'
}

const transformTicketmasterEvent = (tmEvent: TicketmasterEvent): Event => {
  const venue = tmEvent._embedded?.venues?.[0]
  const address = venue ? [
    venue.address?.line1,
    venue.address?.line2,
    venue.city?.name,
    venue.state?.stateCode,
    venue.postalCode
  ].filter(Boolean).join(', ') : 'Address not available'

  const startDateTime = tmEvent.dates.start.dateTime || 
    `${tmEvent.dates.start.localDate}T${tmEvent.dates.start.localTime || '19:00:00'}`
  
  const endDateTime = tmEvent.dates.end?.dateTime || 
    tmEvent.dates.end?.localDate ? 
    `${tmEvent.dates.end.localDate}T${tmEvent.dates.end.localTime || '22:00:00'}` :
    startDateTime

  const priceRange = tmEvent.priceRanges?.[0]
  const price = priceRange ? 
    `From $${priceRange.min}${priceRange.max !== priceRange.min ? ` - $${priceRange.max}` : ''}` :
    'Price TBA'

  // Get the best image (prefer 16:9 ratio, fallback to first available)
  const image = tmEvent.images?.find(img => img.ratio === '16_9')?.url || 
    tmEvent.images?.[0]?.url

  return {
    id: tmEvent.id,
    name: tmEvent.name,
    description: tmEvent.info || 'Event details will be available soon.',
    startDate: startDateTime,
    endDate: endDateTime,
    venue: {
      name: venue?.name || 'Venue TBA',
      address,
      latitude: venue?.location?.latitude ? parseFloat(venue.location.latitude) : undefined,
      longitude: venue?.location?.longitude ? parseFloat(venue.location.longitude) : undefined
    },
    category: mapCategory(tmEvent.classifications),
    price,
    url: tmEvent.url,
    image
  }
}

async function fetchTicketmasterEvents(city: string, category?: string): Promise<Event[]> {
  const apiKey = process.env.TICKETMASTER_API_KEY
  
  if (!apiKey) {
    console.warn('Ticketmaster API key not found, using fallback events')
    return getFallbackEvents()
  }

  try {
    const baseUrl = 'https://app.ticketmaster.com/discovery/v2/events.json'
    const params = new URLSearchParams({
      apikey: apiKey,
      size: '20',
      sort: 'date,asc'
    })

    // Add city-specific parameters
    const cityLower = city.toLowerCase()
    if (cityToDmaId[cityLower]) {
      params.append('dmaId', cityToDmaId[cityLower])
    } else {
      params.append('city', city)
    }

    // Add category filter if specified
    if (category && category !== 'all') {
      const categoryMap: { [key: string]: string } = {
        'music': 'music',
        'sports': 'sports',
        'culture': 'arts',
        'entertainment': 'miscellaneous',
        'art': 'arts'
      }
      
      if (categoryMap[category.toLowerCase()]) {
        params.append('classificationName', categoryMap[category.toLowerCase()])
      }
    }

    // Only get events from today onwards
    const today = new Date().toISOString().split('T')[0]
    params.append('startDateTime', `${today}T00:00:00Z`)

    const response = await fetch(`${baseUrl}?${params}`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Ticketmaster API error: ${response.status}`)
    }

    const data: TicketmasterResponse = await response.json()
    
    if (!data._embedded?.events) {
      return getFallbackEvents()
    }

    return data._embedded.events.map(transformTicketmasterEvent)
  } catch (error) {
    console.error('Error fetching from Ticketmaster:', error)
    return getFallbackEvents()
  }
}

function getFallbackEvents(): Event[] {
  return [
    {
      id: 'fallback-1',
      name: 'Local Music Night',
      description: 'Join us for an evening of live local music featuring talented artists from the area.',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
      venue: {
        name: 'Local Venue',
        address: 'Downtown Area'
      },
      category: 'Music',
      price: 'From $15',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'
    },
    {
      id: 'fallback-2',
      name: 'Art Gallery Opening',
      description: 'Discover new contemporary art at this exclusive gallery opening event.',
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
      venue: {
        name: 'City Art Gallery',
        address: 'Arts District'
      },
      category: 'Culture',
      price: 'Free',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
    }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city') || 'Toronto'
    const category = searchParams.get('category')

    const events = await fetchTicketmasterEvents(city, category || undefined)

    return NextResponse.json({
      success: true,
      events,
      city,
      total: events.length,
      source: process.env.TICKETMASTER_API_KEY ? 'ticketmaster' : 'fallback'
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
