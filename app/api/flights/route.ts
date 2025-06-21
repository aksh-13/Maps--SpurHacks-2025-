import { NextRequest, NextResponse } from 'next/server'
import { flightService } from '@/services/transportation/flights'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'search') {
      const origin = searchParams.get('origin')
      const destination = searchParams.get('destination')
      const departureDate = searchParams.get('departureDate')
      const returnDate = searchParams.get('returnDate') || undefined
      const passengers = parseInt(searchParams.get('passengers') || '1')
      const cabinClass = searchParams.get('cabinClass') as 'economy' | 'premium_economy' | 'business' | 'first' || 'economy'
      const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined

      if (!origin || !destination || !departureDate) {
        return NextResponse.json(
          { error: 'Origin, destination, and departureDate are required' },
          { status: 400 }
        )
      }

      const flights = await flightService.searchFlights({
        origin,
        destination,
        departureDate,
        returnDate,
        passengers,
        cabinClass,
        maxPrice
      })

      return NextResponse.json(flights)
    }

    if (action === 'airports') {
      const query = searchParams.get('query')
      if (!query) {
        return NextResponse.json(
          { error: 'Query parameter is required' },
          { status: 400 }
        )
      }

      const airports = await flightService.searchAirports(query)
      return NextResponse.json(airports)
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Flights API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 