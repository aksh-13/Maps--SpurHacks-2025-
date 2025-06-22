import { NextRequest, NextResponse } from 'next/server'
import { geminiService } from '@/services/ai/gemini'

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const response = await geminiService.sendMessage(message, conversationHistory)

    return NextResponse.json({
      success: true,
      response,
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
} 