import { NextRequest, NextResponse } from 'next/server'
import { geminiService } from '@/services/ai/gemini'

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const response = await geminiService.sendMessage(message, conversationHistory || [])
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Chatbot API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const isAvailable = geminiService.isAvailable()
    
    return NextResponse.json({
      available: isAvailable,
      service: 'Gemini AI',
      features: [
        'Trip planning assistance',
        'Destination recommendations',
        'Travel tips and advice',
        'Budget planning help',
        'Itinerary suggestions'
      ]
    })
  } catch (error) {
    console.error('Chatbot status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 