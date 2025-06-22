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

    const systemInstruction = `You are an expert travel planner for the TripPlanner 3D application. Create a comprehensive, detailed, and realistic trip plan based on the user's prompt.

The user's prompt is: "${prompt}"

IMPORTANT: You MUST generate the FULL number of days specified in the user's request. If they ask for 3 days, generate exactly 3 days of itinerary. If they ask for 7 days, generate exactly 7 days. Do not skip any days.

Generate a detailed JSON response with the following structure:
{
  "destination": "City, Country",
  "duration": "X days",
  "budget": "Approximately $Y",
  "bestTimeToVisit": "Month - Month",
  "weather": "Typical weather during visit",
  "timezone": "UTC+X",
  "language": "Primary language",
  "currency": "Local currency",
  "activities": ["Activity 1", "Activity 2", "Activity 3"],
  "itinerary": [
    {
      "day": 1,
      "title": "Day Title",
      "theme": "Cultural/Adventure/Relaxation",
      "morning": {
        "time": "09:00",
        "activity": "Activity description",
        "location": { "name": "Location Name", "lat": 48.8584, "lng": 2.2945, "address": "Full address" },
        "duration": "2 hours",
        "cost": "$15",
        "tips": "Pro tip for this activity",
        "bookingUrl": "https://www.viator.com/activity-url",
        "bookingPlatform": "Viator/GetYourGuide/TripAdvisor"
      },
      "afternoon": {
        "time": "14:00",
        "activity": "Activity description",
        "location": { "name": "Location Name", "lat": 48.8606, "lng": 2.3376, "address": "Full address" },
        "duration": "3 hours",
        "cost": "$25",
        "tips": "Pro tip for this activity",
        "bookingUrl": "https://www.getyourguide.com/activity-url",
        "bookingPlatform": "Viator/GetYourGuide/TripAdvisor"
      },
      "evening": {
        "time": "19:00",
        "activity": "Activity description",
        "location": { "name": "Location Name", "lat": 48.8580, "lng": 2.3450, "address": "Full address" },
        "duration": "2 hours",
        "cost": "$40",
        "tips": "Pro tip for this activity",
        "bookingUrl": "https://www.tripadvisor.com/activity-url",
        "bookingPlatform": "Viator/GetYourGuide/TripAdvisor"
      },
      "transportation": [
        {
          "from": "Previous location",
          "to": "Next location",
          "method": "Metro/Bus/Walk/Taxi",
          "duration": "15 minutes",
          "cost": "$2.50",
          "details": "Take Line 1 to Station X",
          "bookingUrl": "https://transport-booking-url.com"
        }
      ],
      "dining": [
        {
          "meal": "Lunch",
          "restaurant": "Restaurant Name",
          "cuisine": "Local/International",
          "priceRange": "$15-25",
          "specialty": "Famous dish",
          "location": { "name": "Restaurant Name", "lat": 48.8580, "lng": 2.3450, "address": "Full address" },
          "bookingUrl": "https://www.opentable.com/restaurant-url",
          "bookingPlatform": "OpenTable/Resy/Chope"
        }
      ],
      "highlights": ["Highlight 1", "Highlight 2"],
      "totalCost": "$80"
    }
  ],
  "accommodationSuggestions": [
    {
      "name": "Hotel Name",
      "type": "Hotel/Hostel/Apartment",
      "priceRange": "$150 - $250 per night",
      "location": "City Center/Downtown",
      "amenities": ["WiFi", "Breakfast", "Gym"],
      "pros": ["Great location", "Good value"],
      "cons": ["Small rooms", "Noisy"],
      "bookingUrl": "https://www.google.com/travel/hotels"
    }
  ],
  "transportation": {
    "airport": "Airport name and code",
    "fromAirport": "Transportation method and cost",
    "localTransport": "Metro/Bus/Taxi information",
    "recommendations": ["Get a travel pass", "Use ride-sharing apps"]
  },
  "dining": {
    "localCuisine": "Famous local dishes",
    "restaurantTypes": ["Fine dining", "Street food", "Cafes"],
    "priceRanges": {
      "budget": "$10-20 per meal",
      "midRange": "$20-40 per meal",
      "luxury": "$40+ per meal"
    },
    "recommendations": ["Try local specialty", "Book popular restaurants in advance"]
  },
  "culturalInsights": {
    "customs": ["Custom 1", "Custom 2"],
    "etiquette": ["Etiquette tip 1", "Etiquette tip 2"],
    "language": {
      "hello": "Local greeting",
      "thankYou": "Local thank you",
      "goodbye": "Local goodbye"
    }
  },
  "travelTips": [
    "Tip 1 with specific details",
    "Tip 2 with specific details"
  ],
  "emergencyInfo": {
    "police": "Emergency number",
    "hospital": "Hospital information",
    "embassy": "Embassy contact if applicable"
  },
  "packingList": {
    "essentials": ["Item 1", "Item 2"],
    "seasonal": ["Seasonal item 1", "Seasonal item 2"],
    "optional": ["Optional item 1", "Optional item 2"]
  }
}

CRITICAL REQUIREMENTS:
1. Generate the EXACT number of days specified in the user's request
2. Each day MUST have morning, afternoon, and evening activities
3. Do not skip any days - if user asks for 3 days, provide days 1, 2, and 3
4. Each day should have a unique theme and focus on different areas/attractions
5. Ensure logical flow between days (don't repeat the same activities)

Important guidelines:
- Provide REALISTIC coordinates for each location (use actual landmarks)
- Include specific timing for activities (morning/afternoon/evening)
- Add transportation details between locations
- Include dining recommendations with local cuisine
- Provide cultural insights and etiquette tips
- Include emergency information and practical tips
- Make the itinerary logistically feasible (reasonable travel times)
- Include costs for activities and transportation
- Add pro tips for each activity
- Consider the destination's culture, weather, and local customs
- Ensure activities are appropriate for the destination and season
- Include both tourist attractions and local experiences
- Provide alternative options for bad weather
- Include free and paid activities for budget flexibility
- Add REALISTIC booking URLs for each activity using popular platforms:
  * Viator (https://www.viator.com) for tours and experiences
  * GetYourGuide (https://www.getyourguide.com) for activities
  * TripAdvisor (https://www.tripadvisor.com) for attractions
  * OpenTable (https://www.opentable.com) for restaurant reservations
  * Resy (https://resy.com) for fine dining
  * Official attraction websites for museums, landmarks, etc.
- For each activity, provide a bookingUrl that links to a real booking platform
- Include bookingPlatform field to indicate which service the link uses

Return ONLY the JSON object, no additional text or explanations.`;

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
      bestTimeToVisit: 'April - October',
      weather: 'Mild temperatures, occasional rain',
      timezone: 'UTC+1',
      language: 'French',
      currency: 'Euro (€)',
      activities: ['Sightseeing', 'Local Cuisine', 'Museums', 'Shopping'],
      itinerary: [
        {
          day: 1,
          title: 'Arrival & City Center',
          theme: 'Cultural',
          morning: {
            time: '09:00',
            activity: 'Arrive and check into hotel',
            location: { name: 'Hotel Check-in', lat: 48.8566, lng: 2.3522, address: 'City Center, Paris' },
            duration: '1 hour',
            cost: '$0',
            tips: 'Store luggage if room not ready',
            bookingUrl: 'https://www.booking.com/hotel/fr/paris-center.html',
            bookingPlatform: 'Booking.com'
          },
          afternoon: {
            time: '14:00',
            activity: 'Explore the city center and Eiffel Tower',
            location: { name: 'Eiffel Tower', lat: 48.8584, lng: 2.2945, address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris' },
            duration: '3 hours',
            cost: '$26',
            tips: 'Book tickets online to avoid queues',
            bookingUrl: 'https://www.viator.com/Paris-attractions/Eiffel-Tower/d479-a220',
            bookingPlatform: 'Viator'
          },
          evening: {
            time: '19:00',
            activity: 'Welcome dinner at local bistro',
            location: { name: 'Le Petit Bistrot', lat: 48.8580, lng: 2.3450, address: 'Rue de la Paix, 75001 Paris' },
            duration: '2 hours',
            cost: '$45',
            tips: 'Try the coq au vin',
            bookingUrl: 'https://www.opentable.com/r/le-petit-bistrot-paris',
            bookingPlatform: 'OpenTable'
          },
          transportation: [
            {
              from: 'Airport',
              to: 'Hotel',
              method: 'Metro',
              duration: '45 minutes',
              cost: '$12',
              details: 'Take RER B to Châtelet-Les Halles',
              bookingUrl: 'https://www.ratp.fr/en/titres-et-tarifs'
            }
          ],
          dining: [
            {
              meal: 'Dinner',
              restaurant: 'Le Petit Bistrot',
              cuisine: 'French',
              priceRange: '$35-55',
              specialty: 'Coq au Vin',
              location: { name: 'Le Petit Bistrot', lat: 48.8580, lng: 2.3450, address: 'Rue de la Paix, 75001 Paris' },
              bookingUrl: 'https://www.opentable.com/r/le-petit-bistrot-paris',
              bookingPlatform: 'OpenTable'
            }
          ],
          highlights: ['Eiffel Tower views', 'Traditional French dinner'],
          totalCost: '$83'
        },
        {
          day: 2,
          title: 'Art & Culture',
          theme: 'Cultural',
          morning: {
            time: '09:00',
            activity: 'Visit Louvre Museum',
            location: { name: 'Louvre Museum', lat: 48.8606, lng: 2.3376, address: 'Rue de Rivoli, 75001 Paris' },
            duration: '3 hours',
            cost: '$17',
            tips: 'Enter through the Pyramid entrance',
            bookingUrl: 'https://www.viator.com/Paris-attractions/Louvre-Museum/d479-a220',
            bookingPlatform: 'Viator'
          },
          afternoon: {
            time: '14:00',
            activity: 'Walk through Tuileries Garden',
            location: { name: 'Tuileries Garden', lat: 48.8636, lng: 2.3271, address: 'Place de la Concorde, 75001 Paris' },
            duration: '1 hour',
            cost: '$0',
            tips: 'Perfect for photos',
            bookingUrl: 'https://www.tripadvisor.com/Attraction_Review-g187147-d188151-Reviews-Jardin_des_Tuileries-Paris_Ile_de_France.html',
            bookingPlatform: 'TripAdvisor'
          },
          evening: {
            time: '19:00',
            activity: 'Evening at Montmartre',
            location: { name: 'Montmartre', lat: 48.8867, lng: 2.3431, address: 'Montmartre, 75018 Paris' },
            duration: '2 hours',
            cost: '$30',
            tips: 'Visit Sacré-Cœur for sunset views',
            bookingUrl: 'https://www.getyourguide.com/paris-l16/montmartre-guided-walking-tour-t38307/',
            bookingPlatform: 'GetYourGuide'
          },
          transportation: [
            {
              from: 'Hotel',
              to: 'Louvre',
              method: 'Metro',
              duration: '15 minutes',
              cost: '$2.50',
              details: 'Take Line 1 to Palais Royal-Musée du Louvre',
              bookingUrl: 'https://www.ratp.fr/en/titres-et-tarifs'
            }
          ],
          dining: [
            {
              meal: 'Lunch',
              restaurant: 'Café Marly',
              cuisine: 'French',
              priceRange: '$25-40',
              specialty: 'Croque Monsieur',
              location: { name: 'Café Marly', lat: 48.8606, lng: 2.3376, address: '93 Rue de Rivoli, 75001 Paris' },
              bookingUrl: 'https://www.opentable.com/r/cafe-marly-paris',
              bookingPlatform: 'OpenTable'
            }
          ],
          highlights: ['Mona Lisa', 'Montmartre atmosphere'],
          totalCost: '$74.50'
        },
        {
          day: 3,
          title: 'Champs-Élysées & Shopping',
          theme: 'Luxury & Shopping',
          morning: {
            time: '10:00',
            activity: 'Arc de Triomphe and Champs-Élysées',
            location: { name: 'Arc de Triomphe', lat: 48.8738, lng: 2.2950, address: 'Place Charles de Gaulle, 75008 Paris' },
            duration: '2 hours',
            cost: '$13',
            tips: 'Climb to the top for panoramic views',
            bookingUrl: 'https://www.viator.com/Paris-attractions/Arc-de-Triomphe/d479-a220',
            bookingPlatform: 'Viator'
          },
          afternoon: {
            time: '14:00',
            activity: 'Shopping on Champs-Élysées',
            location: { name: 'Champs-Élysées', lat: 48.8698, lng: 2.3077, address: 'Avenue des Champs-Élysées, 75008 Paris' },
            duration: '3 hours',
            cost: '$0',
            tips: 'Visit flagship stores and boutiques',
            bookingUrl: 'https://www.tripadvisor.com/Attraction_Review-g187147-d188151-Reviews-Champs_Elysees-Paris_Ile_de_France.html',
            bookingPlatform: 'TripAdvisor'
          },
          evening: {
            time: '19:00',
            activity: 'Farewell dinner at fine dining restaurant',
            location: { name: 'Le Jules Verne', lat: 48.8584, lng: 2.2945, address: 'Eiffel Tower, 75007 Paris' },
            duration: '2.5 hours',
            cost: '$120',
            tips: 'Reserve well in advance for this exclusive experience',
            bookingUrl: 'https://www.resy.com/cities/par/le-jules-verne',
            bookingPlatform: 'Resy'
          },
          transportation: [
            {
              from: 'Hotel',
              to: 'Arc de Triomphe',
              method: 'Metro',
              duration: '20 minutes',
              cost: '$2.50',
              details: 'Take Line 1 to Charles de Gaulle - Étoile',
              bookingUrl: 'https://www.ratp.fr/en/titres-et-tarifs'
            }
          ],
          dining: [
            {
              meal: 'Dinner',
              restaurant: 'Le Jules Verne',
              cuisine: 'French Fine Dining',
              priceRange: '$100-150',
              specialty: 'Tasting Menu',
              location: { name: 'Le Jules Verne', lat: 48.8584, lng: 2.2945, address: 'Eiffel Tower, 75007 Paris' },
              bookingUrl: 'https://www.resy.com/cities/par/le-jules-verne',
              bookingPlatform: 'Resy'
            }
          ],
          highlights: ['Arc de Triomphe views', 'Luxury shopping', 'Fine dining experience'],
          totalCost: '$135.50'
        }
      ],
      accommodationSuggestions: [
        {
          name: 'Grand Hotel Paris',
          type: 'Hotel',
          priceRange: '$200 - $300 per night',
          location: 'City Center',
          amenities: ['WiFi', 'Breakfast', 'Gym', 'Spa'],
          pros: ['Great location', 'Luxury amenities'],
          cons: ['Expensive', 'Small rooms'],
          bookingUrl: 'https://www.google.com/travel/hotels'
        },
        {
          name: 'Boutique Paris Suites',
          type: 'Hotel',
          priceRange: '$150 - $250 per night',
          location: 'Marais District',
          amenities: ['WiFi', 'Kitchen', 'Balcony'],
          pros: ['Charming atmosphere', 'Good value'],
          cons: ['No elevator', 'Limited amenities'],
          bookingUrl: 'https://www.google.com/travel/hotels'
        }
      ],
      transportation: {
        airport: 'Charles de Gaulle Airport (CDG)',
        fromAirport: 'RER B train, $12, 45 minutes',
        localTransport: 'Metro system, $2.50 per trip, 24-hour passes available',
        recommendations: ['Get a Paris Visite pass', 'Use Velib bike sharing']
      },
      dining: {
        localCuisine: 'Croissants, Coq au Vin, Escargots, French Onion Soup',
        restaurantTypes: ['Bistros', 'Brasseries', 'Fine dining', 'Street food'],
        priceRanges: {
          budget: '$15-25 per meal',
          midRange: '$25-50 per meal',
          luxury: '$50+ per meal'
        },
        recommendations: ['Try local pastries', 'Book popular restaurants in advance']
      },
      culturalInsights: {
        customs: ['Greet with "Bonjour"', 'Tipping is appreciated but not mandatory'],
        etiquette: ['Dress well when dining out', 'Learn basic French phrases'],
        language: {
          hello: 'Bonjour',
          thankYou: 'Merci',
          goodbye: 'Au revoir'
        }
      },
      travelTips: [
        'Book museum tickets online to avoid long queues',
        'Use the Metro for efficient transportation around the city',
        'Try local pastries and coffee at neighborhood cafes',
        'Learn basic French phrases for better interactions'
      ],
      emergencyInfo: {
        police: '17',
        hospital: 'Hôpital Hôtel-Dieu, +33 1 42 34 82 34',
        embassy: 'US Embassy: +33 1 43 12 22 22'
      },
      packingList: {
        essentials: ['Comfortable walking shoes', 'Travel adapter', 'Camera'],
        seasonal: ['Light jacket (spring/fall)', 'Sunglasses', 'Umbrella'],
        optional: ['Dress clothes for fine dining', 'Guidebook', 'Portable charger']
      }
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