import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Test API: Starting test...')
    
    // Test 1: Basic import
    let flightService
    try {
      const { flightService: fs } = await import('@/services/transportation/flights')
      flightService = fs
      console.log('Test API: Flight service import successful')
    } catch (importError) {
      console.error('Test API: Flight service import failed:', importError)
      return NextResponse.json({ 
        error: 'Import failed', 
        details: importError instanceof Error ? importError.message : 'Unknown error' 
      }, { status: 500 })
    }
    
    // Test 2: Basic method call
    try {
      const testParams = {
        origin: 'JFK',
        destination: 'DXB',
        departureDate: '2024-12-25',
        passengers: 2
      }
      
      console.log('Test API: Calling flight service with params:', testParams)
      const flights = await flightService.searchFlights(testParams)
      console.log('Test API: Flight service returned', flights.length, 'flights')
      
      return NextResponse.json({
        success: true,
        flightsCount: flights.length,
        sampleFlight: flights[0] || null
      })
    } catch (methodError) {
      console.error('Test API: Flight service method failed:', methodError)
      return NextResponse.json({ 
        error: 'Method failed', 
        details: methodError instanceof Error ? methodError.message : 'Unknown error' 
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Test API: General error:', error)
    return NextResponse.json({ 
      error: 'General error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 