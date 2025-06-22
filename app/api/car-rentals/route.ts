import { NextRequest, NextResponse } from 'next/server'
import { carRentalService } from '@/services/transportation/car-rentals'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const destination = searchParams.get('destination')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const driverAge = parseInt(searchParams.get('driverAge') || '25')

    if (!destination || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: destination, startDate, endDate' },
        { status: 400 }
      )
    }

    const carRentals = await carRentalService.searchCarRentalsForTrip(
      destination,
      startDate,
      endDate,
      driverAge
    )

    return NextResponse.json({
      success: true,
      carRentals,
    })
  } catch (error) {
    console.error('Error searching car rentals:', error)
    return NextResponse.json(
      { error: 'Failed to search car rentals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      pickUpLatitude,
      pickUpLongitude,
      dropOffLatitude,
      dropOffLongitude,
      pickUpTime,
      dropOffTime,
      driverAge,
      currencyCode,
      location
    } = body

    if (!pickUpLatitude || !pickUpLongitude || !dropOffLatitude || !dropOffLongitude) {
      return NextResponse.json(
        { error: 'Missing required coordinates' },
        { status: 400 }
      )
    }

    const carRentals = await carRentalService.searchCarRentals({
      pickUpLatitude,
      pickUpLongitude,
      dropOffLatitude,
      dropOffLongitude,
      pickUpTime: pickUpTime || '10:00',
      dropOffTime: dropOffTime || '10:00',
      driverAge: driverAge || 25,
      currencyCode: currencyCode || 'USD',
      location: location || 'US'
    })

    return NextResponse.json({
      success: true,
      carRentals,
    })
  } catch (error) {
    console.error('Error searching car rentals:', error)
    return NextResponse.json(
      { error: 'Failed to search car rentals' },
      { status: 500 }
    )
  }
} 