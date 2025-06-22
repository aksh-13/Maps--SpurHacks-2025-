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

export class MockGeminiService {
  private tripTemplates = [
    {
      destination: 'Paris, France',
      duration: '5 days',
      budget: '$2,500',
      activities: ['Eiffel Tower Visit', 'Louvre Museum', 'Seine River Cruise', 'Notre-Dame Cathedral', 'Champs-Élysées Walk'],
      itinerary: [
        {
          day: 1,
          title: 'Arrival & City Center',
          activities: ['Arrive and check into hotel', 'Explore the city center', 'Welcome dinner at local bistro'],
          locations: [
            { name: 'Eiffel Tower', lat: 48.8584, lng: 2.2945 },
            { name: 'Champs-Élysées', lat: 48.8698, lng: 2.3077 },
          ],
        },
        {
          day: 2,
          title: 'Art & Culture',
          activities: ['Visit Louvre Museum', 'Walk through Tuileries Garden', 'Evening at Montmartre'],
          locations: [
            { name: 'Louvre Museum', lat: 48.8606, lng: 2.3376 },
            { name: 'Montmartre', lat: 48.8867, lng: 2.3431 },
          ],
        },
        {
          day: 3,
          title: 'Historic Paris',
          activities: ['Notre-Dame Cathedral', 'Sainte-Chapelle', 'Seine River Cruise'],
          locations: [
            { name: 'Notre-Dame Cathedral', lat: 48.8530, lng: 2.3499 },
            { name: 'Sainte-Chapelle', lat: 48.8559, lng: 2.3450 },
          ],
        },
        {
          day: 4,
          title: 'Palace & Gardens',
          activities: ['Day trip to Versailles', 'Explore Palace Gardens', 'Return to Paris for dinner'],
          locations: [
            { name: 'Palace of Versailles', lat: 48.8044, lng: 2.1232 },
            { name: 'Versailles Gardens', lat: 48.8034, lng: 2.1200 },
          ],
        },
        {
          day: 5,
          title: 'Final Day',
          activities: ['Shopping at Galeries Lafayette', 'Arc de Triomphe', 'Farewell dinner'],
          locations: [
            { name: 'Arc de Triomphe', lat: 48.8738, lng: 2.2950 },
            { name: 'Galeries Lafayette', lat: 48.8737, lng: 2.3324 },
          ],
        },
      ],
      accommodationSuggestions: [
        { name: 'Grand Hotel Paris', type: 'Hotel', priceRange: '$200 - $300 per night', bookingUrl: 'https://www.booking.com/searchresults.html?ss=Paris&selected_currency=USD' },
        { name: 'Boutique Paris Suites', type: 'Hotel', priceRange: '$150 - $250 per night', bookingUrl: 'https://www.booking.com/searchresults.html?ss=Paris&selected_currency=USD' },
      ],
      travelTips: ['Use the Metro for easy transportation', 'Try local pastries and coffee', 'Book museum tickets in advance', 'Learn basic French phrases'],
    },
    {
      destination: 'Tokyo, Japan',
      duration: '7 days',
      budget: '$3,200',
      activities: ['Senso-ji Temple', 'Shibuya Crossing', 'Tsukiji Fish Market', 'Mount Fuji Day Trip', 'Akihabara Electronics'],
      itinerary: [
        {
          day: 1,
          title: 'Arrival & Asakusa',
          activities: ['Arrive at Narita Airport', 'Check into hotel', 'Visit Senso-ji Temple', 'Evening at Tokyo Skytree'],
          locations: [
            { name: 'Senso-ji Temple', lat: 35.7148, lng: 139.7967 },
            { name: 'Tokyo Skytree', lat: 35.7100, lng: 139.8107 },
          ],
        },
        {
          day: 2,
          title: 'Modern Tokyo',
          activities: ['Shibuya Crossing', 'Harajuku shopping', 'Meiji Shrine', 'Shibuya nightlife'],
          locations: [
            { name: 'Shibuya Crossing', lat: 35.6595, lng: 139.7004 },
            { name: 'Meiji Shrine', lat: 35.6702, lng: 139.7016 },
          ],
        },
        {
          day: 3,
          title: 'Traditional & Modern',
          activities: ['Tsukiji Fish Market', 'Ginza shopping district', 'Tokyo Tower', 'Roppongi Hills'],
          locations: [
            { name: 'Tsukiji Fish Market', lat: 35.6654, lng: 139.7704 },
            { name: 'Tokyo Tower', lat: 35.6586, lng: 139.7454 },
          ],
        },
        {
          day: 4,
          title: 'Technology & Culture',
          activities: ['Akihabara Electronics District', 'Ueno Park', 'Tokyo National Museum', 'Ameya-Yokocho Market'],
          locations: [
            { name: 'Akihabara', lat: 35.7022, lng: 139.7745 },
            { name: 'Ueno Park', lat: 35.7148, lng: 139.7710 },
          ],
        },
        {
          day: 5,
          title: 'Nature & Relaxation',
          activities: ['Day trip to Mount Fuji', 'Lake Kawaguchi', 'Onsen experience', 'Return to Tokyo'],
          locations: [
            { name: 'Mount Fuji', lat: 35.3606, lng: 138.7274 },
            { name: 'Lake Kawaguchi', lat: 35.5167, lng: 138.7500 },
          ],
        },
        {
          day: 6,
          title: 'Imperial & Gardens',
          activities: ['Imperial Palace East Gardens', 'Yoyogi Park', 'Shibuya shopping', 'Evening food tour'],
          locations: [
            { name: 'Imperial Palace', lat: 35.6852, lng: 139.7528 },
            { name: 'Yoyogi Park', lat: 35.6702, lng: 139.7016 },
          ],
        },
        {
          day: 7,
          title: 'Final Day',
          activities: ['Last-minute shopping', 'Visit to Tokyo Station', 'Departure preparation'],
          locations: [
            { name: 'Tokyo Station', lat: 35.6812, lng: 139.7671 },
            { name: 'Marunouchi District', lat: 35.6812, lng: 139.7671 },
          ],
        },
      ],
      accommodationSuggestions: [
        { name: 'Tokyo Grand Hotel', type: 'Hotel', priceRange: '$180 - $280 per night', bookingUrl: 'https://www.booking.com/searchresults.html?ss=Tokyo&selected_currency=USD' },
        { name: 'Shibuya Business Hotel', type: 'Hotel', priceRange: '$120 - $200 per night', bookingUrl: 'https://www.booking.com/searchresults.html?ss=Tokyo&selected_currency=USD' },
      ],
      travelTips: ['Get a Japan Rail Pass for transportation', 'Try authentic ramen and sushi', 'Learn basic Japanese phrases', 'Respect local customs and etiquette'],
    },
    {
      destination: 'New York City, USA',
      duration: '6 days',
      budget: '$2,800',
      activities: ['Times Square', 'Central Park', 'Statue of Liberty', 'Broadway Show', 'Empire State Building'],
      itinerary: [
        {
          day: 1,
          title: 'Arrival & Times Square',
          activities: ['Arrive at JFK Airport', 'Check into hotel', 'Times Square exploration', 'Broadway show'],
          locations: [
            { name: 'Times Square', lat: 40.7580, lng: -73.9855 },
            { name: 'Broadway District', lat: 40.7589, lng: -73.9851 },
          ],
        },
        {
          day: 2,
          title: 'Manhattan Icons',
          activities: ['Empire State Building', 'Rockefeller Center', 'Fifth Avenue shopping', 'Top of the Rock'],
          locations: [
            { name: 'Empire State Building', lat: 40.7484, lng: -73.9857 },
            { name: 'Rockefeller Center', lat: 40.7587, lng: -73.9787 },
          ],
        },
        {
          day: 3,
          title: 'Central Park & Museums',
          activities: ['Central Park walk', 'Metropolitan Museum of Art', 'Natural History Museum', 'Evening in Upper West Side'],
          locations: [
            { name: 'Central Park', lat: 40.7829, lng: -73.9654 },
            { name: 'Metropolitan Museum', lat: 40.7794, lng: -73.9632 },
          ],
        },
        {
          day: 4,
          title: 'Liberty & Financial',
          activities: ['Statue of Liberty', 'Ellis Island', 'Wall Street', '9/11 Memorial'],
          locations: [
            { name: 'Statue of Liberty', lat: 40.6892, lng: -74.0445 },
            { name: 'Wall Street', lat: 40.7069, lng: -74.0110 },
          ],
        },
        {
          day: 5,
          title: 'Brooklyn & Queens',
          activities: ['Brooklyn Bridge walk', 'DUMBO neighborhood', 'Williamsburg exploration', 'Queens food tour'],
          locations: [
            { name: 'Brooklyn Bridge', lat: 40.7061, lng: -73.9969 },
            { name: 'DUMBO', lat: 40.7033, lng: -73.9872 },
          ],
        },
        {
          day: 6,
          title: 'Final Day',
          activities: ['High Line walk', 'Chelsea Market', 'Last-minute shopping', 'Farewell dinner'],
          locations: [
            { name: 'High Line', lat: 40.7480, lng: -74.0048 },
            { name: 'Chelsea Market', lat: 40.7421, lng: -74.0060 },
          ],
        },
      ],
      accommodationSuggestions: [
        { name: 'Manhattan Grand Hotel', type: 'Hotel', priceRange: '$250 - $350 per night', bookingUrl: 'https://www.booking.com/searchresults.html?ss=New+York&selected_currency=USD' },
        { name: 'Times Square Inn', type: 'Hotel', priceRange: '$180 - $280 per night', bookingUrl: 'https://www.booking.com/searchresults.html?ss=New+York&selected_currency=USD' },
      ],
      travelTips: ['Get a MetroCard for subway access', 'Try New York pizza and bagels', 'Book Broadway shows in advance', 'Walk when possible to see more'],
    }
  ]

  async sendMessage(message: string, conversationHistory: ChatMessage[] = []): Promise<ChatResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))
    
    const lowerMessage = message.toLowerCase()
    
    // Simple keyword-based responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return {
        message: "Hello! I'm your AI travel planning assistant. I can help you plan amazing trips, suggest destinations, and provide travel tips. What would you like to know?",
        suggestions: [
          "Help me plan a trip to Paris",
          "What are the best budget travel tips?",
          "Suggest some adventure destinations"
        ]
      }
    }

    if (lowerMessage.includes('budget') || lowerMessage.includes('cheap')) {
      return {
        message: "Great question! Here are some excellent budget travel tips: 1) Travel during off-peak seasons for better prices, 2) Use budget airlines and accommodation options, 3) Cook your own meals or eat at local markets, 4) Use public transportation instead of taxis, 5) Look for free activities and attractions, 6) Book flights and hotels in advance, 7) Consider alternative accommodations like hostels or vacation rentals. What's your budget range?",
        suggestions: [
          "Suggest budget destinations under $1000",
          "How to save money on flights",
          "Best budget accommodation options"
        ]
      }
    }

    if (lowerMessage.includes('destination') || lowerMessage.includes('where')) {
      return {
        message: "I'd love to help you choose the perfect destination! To give you the best recommendations, could you tell me: 1) What type of experience you're looking for (adventure, relaxation, culture, food, etc.), 2) Your budget range, 3) How long you want to travel, 4) Any specific interests or preferences, and 5) Preferred climate or season?",
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

  async generateTripPlan(prompt: string): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000))
    
    // Select a random template or match based on prompt
    const lowerPrompt = prompt.toLowerCase()
    let selectedTemplate = this.tripTemplates[0] // Default to Paris
    
    if (lowerPrompt.includes('tokyo') || lowerPrompt.includes('japan')) {
      selectedTemplate = this.tripTemplates[1]
    } else if (lowerPrompt.includes('new york') || lowerPrompt.includes('nyc') || lowerPrompt.includes('manhattan')) {
      selectedTemplate = this.tripTemplates[2]
    } else if (lowerPrompt.includes('paris') || lowerPrompt.includes('france')) {
      selectedTemplate = this.tripTemplates[0]
    } else {
      // Random selection for other destinations
      selectedTemplate = this.tripTemplates[Math.floor(Math.random() * this.tripTemplates.length)]
    }
    
    // Customize the template based on the prompt
    const customizedPlan = {
      ...selectedTemplate,
      destination: this.extractDestination(prompt) || selectedTemplate.destination,
      duration: this.extractDuration(prompt) || selectedTemplate.duration,
      budget: this.extractBudget(prompt) || selectedTemplate.budget,
    }
    
    return customizedPlan
  }

  private extractDestination(prompt: string): string | null {
    const destinations = [
      'Paris, France', 'Tokyo, Japan', 'New York City, USA', 'London, UK', 'Rome, Italy',
      'Barcelona, Spain', 'Amsterdam, Netherlands', 'Berlin, Germany', 'Prague, Czech Republic',
      'Vienna, Austria', 'Budapest, Hungary', 'Warsaw, Poland', 'Stockholm, Sweden',
      'Oslo, Norway', 'Copenhagen, Denmark', 'Helsinki, Finland', 'Reykjavik, Iceland',
      'Dublin, Ireland', 'Edinburgh, UK', 'Glasgow, UK', 'Manchester, UK', 'Birmingham, UK',
      'Leeds, UK', 'Liverpool, UK', 'Newcastle, UK', 'Cardiff, UK', 'Belfast, UK',
      'Cork, Ireland', 'Galway, Ireland', 'Limerick, Ireland', 'Waterford, Ireland',
      'Kilkenny, Ireland', 'Drogheda, Ireland', 'Wicklow, Ireland', 'Wexford, Ireland',
      'Eniscorthy, Ireland', 'Gorey, Ireland', 'Arklow, Ireland', 'Bray, Ireland',
      'Greystones, Ireland', 'Blackrock, Ireland', 'Dun Laoghaire, Ireland', 'Dalkey, Ireland',
      'Killiney, Ireland', 'Shankill, Ireland', 'Loughlinstown, Ireland', 'Cabinteely, Ireland',
      'Foxrock, Ireland', 'Deansgrange, Ireland', 'Monkstown, Ireland', 'Dun Laoghaire, Ireland',
      'Sandycove, Ireland', 'Glasthule, Ireland', 'Salthill, Ireland', 'Seapoint, Ireland',
      'Blackrock, Ireland', 'Booterstown, Ireland', 'Mount Merrion, Ireland', 'Stillorgan, Ireland',
      'Kilmacud, Ireland', 'Sandyford, Ireland', 'Leopardstown, Ireland', 'Foxrock, Ireland',
      'Cabinteely, Ireland', 'Loughlinstown, Ireland', 'Shankill, Ireland', 'Killiney, Ireland',
      'Dalkey, Ireland', 'Dun Laoghaire, Ireland', 'Blackrock, Ireland', 'Bray, Ireland',
      'Greystones, Ireland', 'Wicklow, Ireland', 'Arklow, Ireland', 'Gorey, Ireland',
      'Eniscorthy, Ireland', 'Wexford, Ireland', 'Kilkenny, Ireland', 'Waterford, Ireland',
      'Limerick, Ireland', 'Galway, Ireland', 'Cork, Ireland', 'Belfast, UK', 'Cardiff, UK',
      'Newcastle, UK', 'Liverpool, UK', 'Leeds, UK', 'Birmingham, UK', 'Manchester, UK',
      'Glasgow, UK', 'Edinburgh, UK', 'Dublin, Ireland', 'Reykjavik, Iceland', 'Helsinki, Finland',
      'Copenhagen, Denmark', 'Oslo, Norway', 'Stockholm, Sweden', 'Warsaw, Poland',
      'Budapest, Hungary', 'Vienna, Austria', 'Prague, Czech Republic', 'Berlin, Germany',
      'Amsterdam, Netherlands', 'Rome, Italy', 'Madrid, Spain', 'Istanbul, Turkey',
      'Seoul, South Korea', 'Beijing, China', 'Moscow, Russia', 'Cairo, Egypt',
      'Rio de Janeiro, Brazil', 'Mexico City, Mexico', 'Bangkok, Thailand', 'Singapore',
      'Dubai, UAE', 'Mumbai, India', 'Sydney, Australia', 'Tokyo, Japan', 'New York, USA',
      'London, UK', 'Paris, France'
    ]
    
    const lowerPrompt = prompt.toLowerCase()
    for (const destination of destinations) {
      if (lowerPrompt.includes(destination.toLowerCase().split(',')[0])) {
        return destination
      }
    }
    
    return null
  }

  private extractDuration(prompt: string): string | null {
    const durationPatterns = [
      /(\d+)\s*days?/i,
      /(\d+)\s*weeks?/i,
      /(\d+)\s*months?/i
    ]
    
    for (const pattern of durationPatterns) {
      const match = prompt.match(pattern)
      if (match) {
        const num = parseInt(match[1])
        if (pattern.source.includes('days')) {
          return `${num} days`
        } else if (pattern.source.includes('weeks')) {
          return `${num * 7} days`
        } else if (pattern.source.includes('months')) {
          return `${num * 30} days`
        }
      }
    }
    
    return null
  }

  private extractBudget(prompt: string): string | null {
    const budgetPatterns = [
      /\$(\d+(?:,\d+)?(?:\.\d+)?)/i,
      /(\d+(?:,\d+)?(?:\.\d+)?)\s*dollars?/i,
      /budget\s*of\s*\$?(\d+(?:,\d+)?(?:\.\d+)?)/i
    ]
    
    for (const pattern of budgetPatterns) {
      const match = prompt.match(pattern)
      if (match) {
        const amount = parseFloat(match[1].replace(',', ''))
        return `$${amount.toLocaleString()}`
      }
    }
    
    return null
  }

  isAvailable(): boolean {
    return true // Mock service is always available
  }
}

export const mockGeminiService = new MockGeminiService() 