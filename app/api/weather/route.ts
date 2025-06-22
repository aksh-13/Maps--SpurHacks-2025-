import { NextRequest, NextResponse } from 'next/server'
import { weatherService } from '@/services/weather/weather'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const days = parseInt(searchParams.get('days') || '7')

    if (!location) {
      return NextResponse.json(
        { error: 'Location parameter is required' },
        { status: 400 }
      )
    }

    const weatherData = await weatherService.getWeatherForecast(location, days)

    if (!weatherData) {
      return NextResponse.json(
        { error: 'Unable to fetch weather data' },
        { status: 500 }
      )
    }

    return NextResponse.json(weatherData)
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 