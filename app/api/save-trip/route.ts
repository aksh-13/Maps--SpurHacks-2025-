import { NextRequest, NextResponse } from 'next/server'
import { userTripsService } from '@/services/trips/user-trips'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, destination, duration, budget, prompt, tripPlan, tags, notes } = body

    const savedTrip = await userTripsService.saveTrip({
      title,
      destination,
      duration,
      budget,
      prompt,
      tripPlan,
      tags,
      notes
    })

    if (savedTrip) {
      return NextResponse.json({ 
        success: true, 
        trip: savedTrip 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save trip' 
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error saving trip:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const trips = await userTripsService.getUserTrips()
    return NextResponse.json({ 
      success: true, 
      trips 
    })
  } catch (error) {
    console.error('Error getting trips:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 