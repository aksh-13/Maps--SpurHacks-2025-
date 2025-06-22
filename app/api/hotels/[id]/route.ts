import { NextRequest, NextResponse } from 'next/server'
import { googlePlacesHotelsService } from '@/services/hotels/booking-hotels'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hotelId } = await params

    if (!hotelId) {
      return NextResponse.json(
        { error: 'Hotel ID is required' },
        { status: 400 }
      )
    }

    const hotel = await googlePlacesHotelsService.getHotelDetailsById(hotelId)

    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      hotel,
    })
  } catch (error) {
    console.error('Error getting hotel details:', error)
    return NextResponse.json(
      { error: 'Failed to get hotel details' },
      { status: 500 }
    )
  }
} 