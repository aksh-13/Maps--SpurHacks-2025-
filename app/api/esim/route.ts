import { NextRequest, NextResponse } from 'next/server'
import { esimService } from '@/services/transportation/esim'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'plans') {
      const country = searchParams.get('country')
      if (!country) {
        return NextResponse.json(
          { error: 'Country parameter is required' },
          { status: 400 }
        )
      }

      const plans = await esimService.getESIMPlans(country)
      return NextResponse.json(plans)
    }

    if (action === 'recommendations') {
      const destination = searchParams.get('destination')
      const duration = parseInt(searchParams.get('duration') || '7')

      if (!destination) {
        return NextResponse.json(
          { error: 'Destination parameter is required' },
          { status: 400 }
        )
      }

      const recommendations = await esimService.getRecommendations(destination, duration)
      return NextResponse.json(recommendations)
    }

    if (action === 'global') {
      const plans = await esimService.getGlobalPlans()
      return NextResponse.json(plans)
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('eSIM API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 