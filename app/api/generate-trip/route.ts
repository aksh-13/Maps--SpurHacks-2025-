import { NextRequest, NextResponse } from 'next/server'
import { geminiService } from '@/services/ai/gemini'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const tripPlan = await geminiService.generateTripPlan(prompt)

    return NextResponse.json({
      success: true,
      tripPlan: tripPlan,
    })
  } catch (error) {
    console.error('Error generating trip:', error)
    // Always return a JSON response
    return NextResponse.json(
      { success: false, error: 'Failed to generate trip plan' },
      { status: 500 }
    )
  }
} 