import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  error?: string
}

export interface ChatResponse {
  message: string
  suggestions?: string[]
  tripRecommendations?: any
  error?: string
}

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey)
    }
  }

  async sendMessage(message: string, conversationHistory: ChatMessage[] = []): Promise<ChatResponse> {
    if (!this.genAI) {
      return this.getFallbackResponse(message)
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const chat = model.startChat({
        history: conversationHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(message)
      const response = result.response
      const text = response.text()

      const suggestions = this.extractSuggestions(text)
      const tripRecommendations = this.extractTripRecommendations(text)

      return {
        message: text,
        suggestions,
        tripRecommendations,
      }
    } catch (error) {
      console.error('Gemini API error:', error)
      return this.getFallbackResponse(message)
    }
  }

  async generateTripPlan(prompt: string): Promise<any> {
    if (!this.genAI) {
      console.warn('Gemini model not available. Returning mock trip plan.')
      return this.getMockTripPlan(prompt)
    }

    const generationConfig = {
      temperature: 0.7,
      topK: 1,
      topP: 1,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const systemInstruction = `You are a travel planning expert for the TripPlanner 3D application. Your task is to generate a detailed, structured trip plan in JSON format based on a user's prompt.

The user's prompt is: "${prompt}"

Your response MUST be a valid JSON object with the following structure:
{
  "destination": "City, Country",
  "duration": "X days",
  "budget": "Approximately $Y",
  "activities": ["Activity 1", "Activity 2", "Activity 3"],
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival and Exploration",
      "activities": ["Activity A", "Activity B", "Activity C"],
      "locations": [
        { "name": "Location Name 1", "lat": 48.8584, "lng": 2.2945 },
        { "name": "Location Name 2", "lat": 48.8606, "lng": 2.3376 }
      ]
    }
  ],
  "accommodationSuggestions": [
    {
      "name": "Hotel Name",
      "type": "Hotel",
      "priceRange": "$150 - $250 per night",
      "bookingUrl": "http://example.com/hotel"
    }
  ],
  "travelTips": ["Tip 1", "Tip 2"]
}

Important instructions:
- Do NOT include any text, notes, or explanations outside of the JSON object. Your entire response must be only the JSON.
- Provide realistic latitude and longitude for each location.
- The 'itinerary' array should cover the number of days mentioned in the 'duration'.
- If the prompt is vague, make reasonable assumptions (e.g., a popular area in the requested city).
- Ensure the JSON is well-formed and can be parsed directly.`;

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: systemInstruction }] }],
        generationConfig,
        safetySettings,
      });
      
      const response = result.response;
      const tripPlan = JSON.parse(response.text());
      
      return tripPlan;
    } catch (error) {
      console.error('Error generating trip plan with Gemini:', error)
      return this.getMockTripPlan(prompt)
    }
  }

  private getMockTripPlan(prompt: string): any {
    const destinations = ['Paris, France', 'Tokyo, Japan', 'Rome, Italy', 'New York, USA']
    const randomDestination = destinations[Math.floor(Math.random() * destinations.length)]

    return {
      destination: randomDestination,
      duration: '5 days',
      budget: '$2,000',
      activities: ['Sightseeing', 'Local Cuisine', 'Museums', 'Shopping'],
      itinerary: [
        {
          day: 1,
          title: 'Arrival & City Center',
          activities: ['Arrive and check into hotel', 'Explore the city center', 'Welcome dinner'],
          locations: [
            { name: 'City Center', lat: 48.8566, lng: 2.3522 },
            { name: 'Restaurant', lat: 48.8580, lng: 2.3450 },
          ],
        },
        {
          day: 2,
          title: 'Historical Landmarks',
          activities: ['Visit famous landmarks', 'Guided historical tour'],
          locations: [
            { name: 'Landmark 1', lat: 48.8584, lng: 2.2945 },
            { name: 'Landmark 2', lat: 48.8606, lng: 2.3376 },
          ],
        },
      ],
      accommodationSuggestions: [
        { name: 'Grand Hotel', type: 'Hotel', priceRange: '$200 - $300', bookingUrl: '#' },
        { name: 'City Apartments', type: 'Apartment', priceRange: '$120 - $180', bookingUrl: '#' },
      ],
      travelTips: ['Use public transport to save money.', 'Try the local street food.'],
    }
  }

  private extractSuggestions(text: string): string[] {
    // Simple extraction of suggestions from AI response
    const suggestions: string[] = []
    
    // Look for common suggestion patterns
    const suggestionPatterns = [
      /you could (.*?)(?=\.|$)/gi,
      /consider (.*?)(?=\.|$)/gi,
      /try (.*?)(?=\.|$)/gi,
      /I recommend (.*?)(?=\.|$)/gi
    ]

    suggestionPatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        suggestions.push(...matches.map(match => match.trim()))
      }
    })

    return suggestions.slice(0, 3) // Limit to 3 suggestions
  }

  private extractTripRecommendations(text: string): any {
    // Extract structured trip recommendations if present
    const recommendations: any = {
      destinations: [],
      activities: [],
      tips: []
    }

    // Simple keyword extraction
    const destinationKeywords = ['visit', 'go to', 'travel to', 'explore']
    const activityKeywords = ['try', 'experience', 'enjoy', 'see', 'visit']
    const tipKeywords = ['remember', 'tip', 'advice', 'suggestion']

    const sentences = text.split('.')
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase()
      
      if (destinationKeywords.some(keyword => lowerSentence.includes(keyword))) {
        recommendations.destinations.push(sentence.trim())
      }
      if (activityKeywords.some(keyword => lowerSentence.includes(keyword))) {
        recommendations.activities.push(sentence.trim())
      }
      if (tipKeywords.some(keyword => lowerSentence.includes(keyword))) {
        recommendations.tips.push(sentence.trim())
      }
    })

    return recommendations
  }

  private getFallbackResponse(message: string): ChatResponse {
    const lowerMessage = message.toLowerCase()
    
    // Simple keyword-based responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return {
        message: "Hello! I'm your travel planning assistant. I can help you plan trips, suggest destinations, and provide travel tips. What would you like to know?",
        suggestions: [
          "Tell me about your dream destination",
          "Help me plan a budget trip",
          "What are the best travel tips?"
        ]
      }
    }

    if (lowerMessage.includes('budget') || lowerMessage.includes('cheap')) {
      return {
        message: "Great question! Here are some budget travel tips: 1) Travel during off-peak seasons, 2) Use budget airlines and accommodation, 3) Cook your own meals, 4) Use public transportation, 5) Look for free activities and attractions. What's your budget range?",
        suggestions: [
          "Suggest budget destinations",
          "How to save money on flights",
          "Best budget accommodation options"
        ]
      }
    }

    if (lowerMessage.includes('destination') || lowerMessage.includes('where')) {
      return {
        message: "I'd love to help you choose a destination! To give you the best recommendations, could you tell me: 1) What type of experience you're looking for (adventure, relaxation, culture, etc.), 2) Your budget, 3) How long you want to travel, and 4) Any specific interests or preferences?",
        suggestions: [
          "I want adventure and nature",
          "Looking for cultural experiences",
          "Need a relaxing beach vacation"
        ]
      }
    }

    if (lowerMessage.includes('weather') || lowerMessage.includes('climate')) {
      return {
        message: "Weather is crucial for trip planning! You can check the weather for any destination using our weather service. Just search for your destination and we'll show you current conditions and forecasts. What destination are you interested in?",
        suggestions: [
          "Check weather for Paris",
          "Best time to visit Japan",
          "Weather in tropical destinations"
        ]
      }
    }

    return {
      message: "I'm here to help with your travel planning! I can assist with destination recommendations, budget planning, travel tips, and more. What specific aspect of travel would you like to discuss?",
      suggestions: [
        "Help me choose a destination",
        "Travel planning tips",
        "Budget travel advice"
      ]
    }
  }

  isAvailable(): boolean {
    return !!this.genAI
  }
}

export const geminiService = new GeminiService() 