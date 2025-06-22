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

    console.log('Generating trip plan for prompt:', prompt)
    
    const tripPlan = await geminiService.generateTripPlan(prompt)
    
    console.log('Trip plan generated successfully')

    return NextResponse.json({
      success: true,
      tripPlan: tripPlan,
    })
  } catch (error) {
    console.error('Error generating trip:', error)
    
    // Ensure we always return a proper JSON response
    let errorMessage = 'Failed to generate trip plan'
    
    if (error instanceof Error) {
      errorMessage = error.message
      console.error('Error details:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        tripPlan: null
      },
      { status: 500 }
    )
  }
} 