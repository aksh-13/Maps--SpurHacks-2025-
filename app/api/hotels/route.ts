import { NextRequest, NextResponse } from 'next/server'
import { googlePlacesHotelsService } from '@/services/hotels/booking-hotels'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    let destination = searchParams.get('destination')
    let checkInDate = searchParams.get('checkInDate')
    let checkOutDate = searchParams.get('checkOutDate')
    const adults = parseInt(searchParams.get('adults') || '2')
    const children = parseInt(searchParams.get('children') || '0')
    const rooms = parseInt(searchParams.get('rooms') || '1')

    if (!destination || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: destination, checkInDate, checkOutDate' },
        { status: 400 }
      )
    }

    // Validate and adjust dates to prevent past date issues
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let checkIn = new Date(checkInDate)
    
    if (checkIn < today) {
      checkIn = new Date(today)
      checkIn.setDate(checkIn.getDate() + 1)
    }
    
    let checkOut = new Date(checkOutDate)
    
    if (checkOut <= checkIn) {
      checkOut = new Date(checkIn)
      checkOut.setDate(checkOut.getDate() + 7)
    }

    const finalCheckInDate = checkIn.toISOString().split('T')[0]
    const finalCheckOutDate = checkOut.toISOString().split('T')[0]

    console.log('Hotel search request:', {
      destination,
      checkInDate: finalCheckInDate,
      checkOutDate: finalCheckOutDate,
      adults,
      children,
      rooms
    })

    const hotels = await googlePlacesHotelsService.searchHotelsForTrip(
      destination,
      finalCheckInDate,
      finalCheckOutDate,
      adults,
      children,
      rooms
    )

    return NextResponse.json({
      hotels,
      searchParams: {
        destination,
        checkInDate: finalCheckInDate,
        checkOutDate: finalCheckOutDate,
        adults,
        children,
        rooms
      }
    })
  } catch (error) {
    console.error('Error in hotels API:', error)
    return NextResponse.json(
      { error: 'Failed to search hotels' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      location,
      checkInDate,
      checkOutDate,
      adults,
      children,
      rooms,
      currency,
      guestNationality
    } = body

    if (!location || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: location, checkInDate, checkOutDate' },
        { status: 400 }
      )
    }

    const hotels = await googlePlacesHotelsService.searchHotels({
      location,
      checkInDate,
      checkOutDate,
      adults: adults || 2,
      children: children || 0,
      rooms: rooms || 1,
      currency: currency || 'USD',
      guestNationality: guestNationality || 'US'
    })

    return NextResponse.json({
      success: true,
      hotels,
    })
  } catch (error) {
    console.error('Error searching hotels:', error)
    return NextResponse.json(
      { error: 'Failed to search hotels' },
      { status: 500 }
    )
  }
} 