interface TranslationResult {
  originalText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  confidence: number
}

interface PhraseBook {
  category: string
  phrases: {
    english: string
    translated: string
    pronunciation?: string
  }[]
}

export class TranslationService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Google Translate API key not found. Using fallback data.')
    }
  }

  async translateText(text: string, targetLanguage: string, sourceLanguage: string = 'auto'): Promise<TranslationResult | null> {
    if (!this.apiKey) {
      return this.getFallbackTranslation(text, targetLanguage, sourceLanguage)
    }

    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            target: targetLanguage,
            source: sourceLanguage,
            format: 'text'
          })
        }
      )

      if (!response.ok) {
        throw new Error('Translation API request failed')
      }

      const data = await response.json()
      const translation = data.data.translations[0]

      return {
        originalText: text,
        translatedText: translation.translatedText,
        sourceLanguage: translation.detectedSourceLanguage || sourceLanguage,
        targetLanguage,
        confidence: 0.95 // Google doesn't provide confidence scores
      }
    } catch (error) {
      console.error('Error translating text:', error)
      return this.getFallbackTranslation(text, targetLanguage, sourceLanguage)
    }
  }

  async getPhraseBook(language: string): Promise<PhraseBook[]> {
    const commonPhrases = {
      'es': [ // Spanish
        { category: 'Greetings', phrases: [
          { english: 'Hello', translated: 'Hola', pronunciation: 'OH-lah' },
          { english: 'Good morning', translated: 'Buenos días', pronunciation: 'BWEH-nohs DEE-ahs' },
          { english: 'Good evening', translated: 'Buenas noches', pronunciation: 'BWEH-nahs NOH-chehs' },
          { english: 'Thank you', translated: 'Gracias', pronunciation: 'GRAH-see-ahs' },
          { english: 'You\'re welcome', translated: 'De nada', pronunciation: 'deh NAH-dah' }
        ]},
        { category: 'Directions', phrases: [
          { english: 'Where is...?', translated: '¿Dónde está...?', pronunciation: 'DOHN-deh ehs-TAH' },
          { english: 'How do I get to...?', translated: '¿Cómo llego a...?', pronunciation: 'KOH-moh YEH-goh ah' },
          { english: 'Left', translated: 'Izquierda', pronunciation: 'ees-kee-EHR-dah' },
          { english: 'Right', translated: 'Derecha', pronunciation: 'deh-REH-chah' },
          { english: 'Straight ahead', translated: 'Derecho', pronunciation: 'deh-REH-choh' }
        ]},
        { category: 'Food & Dining', phrases: [
          { english: 'I would like...', translated: 'Me gustaría...', pronunciation: 'meh goos-tah-REE-ah' },
          { english: 'The bill, please', translated: 'La cuenta, por favor', pronunciation: 'lah KWEHN-tah pohr fah-VOHR' },
          { english: 'Delicious', translated: 'Delicioso', pronunciation: 'deh-lee-see-OH-soh' },
          { english: 'Water', translated: 'Agua', pronunciation: 'AH-gwah' },
          { english: 'Coffee', translated: 'Café', pronunciation: 'kah-FEH' }
        ]}
      ],
      'fr': [ // French
        { category: 'Greetings', phrases: [
          { english: 'Hello', translated: 'Bonjour', pronunciation: 'bohn-ZHOOR' },
          { english: 'Good morning', translated: 'Bonjour', pronunciation: 'bohn-ZHOOR' },
          { english: 'Good evening', translated: 'Bonsoir', pronunciation: 'bohn-SWAHR' },
          { english: 'Thank you', translated: 'Merci', pronunciation: 'mehr-SEE' },
          { english: 'You\'re welcome', translated: 'De rien', pronunciation: 'duh RYEHN' }
        ]},
        { category: 'Directions', phrases: [
          { english: 'Where is...?', translated: 'Où est...?', pronunciation: 'oo eh' },
          { english: 'How do I get to...?', translated: 'Comment aller à...?', pronunciation: 'koh-MAHN ah-LAY ah' },
          { english: 'Left', translated: 'Gauche', pronunciation: 'gohsh' },
          { english: 'Right', translated: 'Droite', pronunciation: 'drwaht' },
          { english: 'Straight ahead', translated: 'Tout droit', pronunciation: 'too drwah' }
        ]},
        { category: 'Food & Dining', phrases: [
          { english: 'I would like...', translated: 'Je voudrais...', pronunciation: 'zhuh voo-DREH' },
          { english: 'The bill, please', translated: 'L\'addition, s\'il vous plaît', pronunciation: 'lah-dee-SYOHN seel voo pleh' },
          { english: 'Delicious', translated: 'Délicieux', pronunciation: 'day-lee-SYUH' },
          { english: 'Water', translated: 'Eau', pronunciation: 'oh' },
          { english: 'Coffee', translated: 'Café', pronunciation: 'kah-FAY' }
        ]}
      ],
      'de': [ // German
        { category: 'Greetings', phrases: [
          { english: 'Hello', translated: 'Hallo', pronunciation: 'HAH-loh' },
          { english: 'Good morning', translated: 'Guten Morgen', pronunciation: 'GOO-ten MOR-gen' },
          { english: 'Good evening', translated: 'Guten Abend', pronunciation: 'GOO-ten AH-bent' },
          { english: 'Thank you', translated: 'Danke', pronunciation: 'DAHN-kuh' },
          { english: 'You\'re welcome', translated: 'Bitte', pronunciation: 'BIT-tuh' }
        ]},
        { category: 'Directions', phrases: [
          { english: 'Where is...?', translated: 'Wo ist...?', pronunciation: 'voh ist' },
          { english: 'How do I get to...?', translated: 'Wie komme ich zu...?', pronunciation: 'vee KOM-muh ikh tsoo' },
          { english: 'Left', translated: 'Links', pronunciation: 'links' },
          { english: 'Right', translated: 'Rechts', pronunciation: 'rekhts' },
          { english: 'Straight ahead', translated: 'Geradeaus', pronunciation: 'geh-RAH-duh-ows' }
        ]},
        { category: 'Food & Dining', phrases: [
          { english: 'I would like...', translated: 'Ich möchte...', pronunciation: 'ikh MURKH-tuh' },
          { english: 'The bill, please', translated: 'Die Rechnung, bitte', pronunciation: 'dee REKH-nung BIT-tuh' },
          { english: 'Delicious', translated: 'Lecker', pronunciation: 'LEK-ker' },
          { english: 'Water', translated: 'Wasser', pronunciation: 'VAH-ser' },
          { english: 'Coffee', translated: 'Kaffee', pronunciation: 'KAH-fay' }
        ]}
      ]
    }

    return commonPhrases[language as keyof typeof commonPhrases] || commonPhrases['es']
  }

  async detectLanguage(text: string): Promise<string | null> {
    if (!this.apiKey) {
      return 'en' // Default to English
    }

    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2/detect?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text
          })
        }
      )

      if (!response.ok) {
        throw new Error('Language detection failed')
      }

      const data = await response.json()
      return data.data.detections[0][0].language
    } catch (error) {
      console.error('Error detecting language:', error)
      return 'en'
    }
  }

  private getFallbackTranslation(text: string, targetLanguage: string, sourceLanguage: string): TranslationResult {
    // Simple fallback translations for common phrases
    const fallbackTranslations: { [key: string]: { [key: string]: string } } = {
      'es': {
        'hello': 'hola',
        'thank you': 'gracias',
        'goodbye': 'adiós',
        'please': 'por favor',
        'yes': 'sí',
        'no': 'no'
      },
      'fr': {
        'hello': 'bonjour',
        'thank you': 'merci',
        'goodbye': 'au revoir',
        'please': 's\'il vous plaît',
        'yes': 'oui',
        'no': 'non'
      },
      'de': {
        'hello': 'hallo',
        'thank you': 'danke',
        'goodbye': 'auf wiedersehen',
        'please': 'bitte',
        'yes': 'ja',
        'no': 'nein'
      }
    }

    const lowerText = text.toLowerCase()
    const translation = fallbackTranslations[targetLanguage]?.[lowerText] || text

    return {
      originalText: text,
      translatedText: translation,
      sourceLanguage: sourceLanguage === 'auto' ? 'en' : sourceLanguage,
      targetLanguage,
      confidence: 0.8
    }
  }

  // Get supported languages
  getSupportedLanguages(): { code: string; name: string }[] {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' }
    ]
  }
}

export const translationService = new TranslationService() 