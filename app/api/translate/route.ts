import { NextRequest, NextResponse } from 'next/server'
import { translationService } from '@/services/translation/translate'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, targetLanguage, sourceLanguage = 'auto' } = body

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and targetLanguage are required' },
        { status: 400 }
      )
    }

    const translation = await translationService.translateText(text, targetLanguage, sourceLanguage)

    if (!translation) {
      return NextResponse.json(
        { error: 'Translation failed' },
        { status: 500 }
      )
    }

    return NextResponse.json(translation)
  } catch (error) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'languages') {
      const languages = translationService.getSupportedLanguages()
      return NextResponse.json(languages)
    }

    if (action === 'phrasebook') {
      const language = searchParams.get('language')
      if (!language) {
        return NextResponse.json(
          { error: 'Language parameter is required' },
          { status: 400 }
        )
      }

      const phraseBook = await translationService.getPhraseBook(language)
      return NextResponse.json(phraseBook)
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 