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
      return await this.getMockTripPlan(prompt)
    }

    // First, autocorrect the user's input using AI
    const correctedPrompt = await this.autocorrectUserInput(prompt)
    console.log('Original prompt:', prompt)
    console.log('Corrected prompt:', correctedPrompt)

    const generationConfig = {
      temperature: 0.7,
      topK: 1,
      topP: 1,
      maxOutputTokens: 8192,
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

    const systemInstruction = `You are an expert travel planner for the Travana application. Create a comprehensive, detailed, and realistic trip plan based on the user's prompt.

The user's prompt is: "${correctedPrompt}"

CRITICAL REQUIREMENTS - READ CAREFULLY:
1. Generate the EXACT number of days specified in the user's request
2. Each day MUST have morning, afternoon, and evening activities
3. Do not skip any days - if user asks for 3 days, provide days 1, 2, and 3
4. MOST IMPORTANT: Each day must explore COMPLETELY DIFFERENT areas, neighborhoods, and attractions
5. Each activity must be UNIQUE and specific to that day - NO REPETITION across days
6. Each day should have a different focus: cultural, historical, modern, nature, entertainment, etc.
7. Use REAL, specific locations and attractions for the destination
8. Each day should cover different parts of the city/region

EXAMPLE OF GOOD DIVERSITY:
- Day 1: Historic downtown area with museums and landmarks
- Day 2: Modern business district with shopping and entertainment
- Day 3: Nature areas and parks
- Day 4: Cultural districts and local neighborhoods
- Day 5: Waterfront and outdoor activities

EXAMPLE OF BAD REPETITION (DO NOT DO THIS):
- Day 1: City center, main square, downtown
- Day 2: City center, main square, downtown (different activities but same area)
- Day 3: City center, main square, downtown (same area again)

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
      "title": "Day 1 - [SPECIFIC THEME] Experience",
      "theme": "Cultural/Adventure/Relaxation/Historical/Modern/Nature/Artistic/Culinary/Entertainment/Educational",
      "morning": {
        "time": "09:00",
        "activity": "SPECIFIC activity name (e.g., 'Visit the Louvre Museum' not 'Museum Visit')",
        "location": { "name": "SPECIFIC location name", "lat": 48.8584, "lng": 2.2945, "address": "Full address" },
        "duration": "2-4 hours",
        "cost": "$15",
        "tips": "Specific tip for this exact activity",
        "bookingUrl": "https://www.viator.com/activity-url",
        "bookingPlatform": "Viator/GetYourGuide/TripAdvisor"
      },
      "afternoon": {
        "time": "14:00",
        "activity": "DIFFERENT specific activity (e.g., 'Explore Montmartre District' not 'District Exploration')",
        "location": { "name": "DIFFERENT specific location", "lat": 48.8606, "lng": 2.3376, "address": "Full address" },
        "duration": "3-5 hours",
        "cost": "$25",
        "tips": "Specific tip for this exact activity",
        "bookingUrl": "https://www.getyourguide.com/activity-url",
        "bookingPlatform": "Viator/GetYourGuide/TripAdvisor"
      },
      "evening": {
        "time": "19:00",
        "activity": "DIFFERENT specific activity (e.g., 'Dinner at Le Jules Verne Restaurant' not 'Fine Dining')",
        "location": { "name": "DIFFERENT specific location", "lat": 48.8580, "lng": 2.3450, "address": "Full address" },
        "duration": "2-4 hours",
        "cost": "$40",
        "tips": "Specific tip for this exact activity",
        "bookingUrl": "https://www.tripadvisor.com/activity-url",
        "bookingPlatform": "Viator/GetYourGuide/TripAdvisor"
      },
      "transportation": [
        {
          "from": "Previous location",
          "to": "Next location",
          "method": "Metro/Bus/Walk/Taxi/Bike",
          "duration": "10-30 minutes",
          "cost": "$2.50",
          "details": "Specific transportation details",
          "bookingUrl": "https://transport-booking-url.com"
        }
      ],
      "dining": [
        {
          "meal": "Lunch/Dinner",
          "restaurant": "SPECIFIC restaurant name",
          "cuisine": "Local/International/Fusion/Traditional/Modern",
          "priceRange": "$15-25",
          "specialty": "Specific famous dish",
          "location": { "name": "Restaurant Name", "lat": 48.8580, "lng": 2.3450, "address": "Full address" },
          "bookingUrl": "https://www.opentable.com/restaurant-url",
          "bookingPlatform": "OpenTable/Resy/Chope"
        }
      ],
      "highlights": ["Specific highlight 1", "Specific highlight 2"],
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

DIVERSITY REQUIREMENTS:
- Day 1: Focus on HISTORIC/CULTURAL areas (museums, landmarks, historic districts)
- Day 2: Focus on MODERN/ENTERTAINMENT areas (shopping, modern attractions, entertainment)
- Day 3: Focus on NATURE/OUTDOOR areas (parks, gardens, outdoor activities)
- Day 4: Focus on LOCAL/NEIGHBORHOOD areas (local markets, residential areas, authentic experiences)
- Day 5: Focus on WATERFRONT/SCENIC areas (rivers, harbors, scenic viewpoints)
- Day 6: Focus on ARTISTIC/CREATIVE areas (art districts, galleries, creative spaces)
- Day 7: Focus on EDUCATIONAL/SPECIALIZED areas (universities, specialized museums, unique experiences)

ACTIVITY DIVERSITY RULES:
- Use SPECIFIC attraction names (e.g., "Visit the Eiffel Tower" not "Visit a landmark")
- Use SPECIFIC restaurant names (e.g., "Dine at Le Jules Verne" not "Fine dining experience")
- Use SPECIFIC location names (e.g., "Explore Montmartre District" not "Explore a district")
- Each day should cover different neighborhoods/districts of the city
- Each activity should be unique to that specific day
- Avoid generic terms like "exploration", "experience", "visit" - be specific

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
      return await this.getMockTripPlan(prompt)
    }
  }

  private async getMockTripPlan(prompt: string): Promise<any> {
    // First autocorrect the prompt if AI is available
    const correctedPrompt = await this.autocorrectUserInput(prompt)
    
    // Parse the prompt to extract destination and duration
    const promptLower = correctedPrompt.toLowerCase();
    
    // Extract destination from prompt
    let destination = 'Paris, France'; // default
    const destinationPatterns = [
      { pattern: /(?:in|to|visit|travel to|go to)\s+([a-zA-Z\s,]+?)(?:\s+for|\s+with|\s+interested|\s+budget|$)/i, default: 'Paris, France' },
      { pattern: /([a-zA-Z\s,]+?)(?:\s+for\s+\d+\s+days?|\s+with\s+my|\s+budget|\s+interested)/i, default: 'Paris, France' },
      { pattern: /(\d+\s+days?\s+in\s+[a-zA-Z\s,]+)/i, default: 'Paris, France' }
    ];
    
    for (const { pattern, default: defaultDest } of destinationPatterns) {
      const match = promptLower.match(pattern);
      if (match && match[1]) {
        const extracted = match[1].trim();
        if (extracted.length > 2 && !extracted.includes('days') && !extracted.includes('budget')) {
          destination = extracted.charAt(0).toUpperCase() + extracted.slice(1);
          break;
        }
      }
    }
    
    // Extract duration from prompt
    let duration = '5 days'; // default
    const durationMatch = promptLower.match(/(\d+)\s+days?/);
    if (durationMatch) {
      duration = `${durationMatch[1]} days`;
    }
    
    // Extract budget from prompt
    let budget = '$2,000'; // default
    const budgetMatch = promptLower.match(/\$?(\d+(?:,\d+)?(?:k|000)?)/i);
    if (budgetMatch) {
      const amount = budgetMatch[1].toLowerCase();
      if (amount.includes('k')) {
        budget = `$${amount.replace('k', '000')}`;
      } else if (amount.includes('000')) {
        budget = `$${amount}`;
      } else {
        budget = `$${amount}`;
      }
    }
    
    console.log(`Parsed prompt - Destination: ${destination}, Duration: ${duration}, Budget: ${budget}`);

    // Get destination coordinates dynamically using geocoding
    const destinationCoords = await this.getDestinationCoordinatesAsync(destination);
    
    // Generate itinerary based on duration
    const numDays = parseInt(duration.match(/\d+/)?.[0] || '5');
    const itinerary = this.generateItinerary(destination, numDays, destinationCoords);

    return {
      destination: destination,
      duration: duration,
      budget: budget,
      bestTimeToVisit: 'April - October',
      weather: 'Mild temperatures, occasional rain',
      timezone: 'UTC+1',
      language: 'English',
      currency: 'USD ($)',
      activities: ['Sightseeing', 'Local Cuisine', 'Museums', 'Shopping'],
      itinerary: itinerary,
      accommodationSuggestions: [
        {
          name: `${destination.split(',')[0]} Grand Hotel`,
          type: 'Hotel',
          priceRange: '$150 - $250 per night',
          location: 'City Center',
          amenities: ['WiFi', 'Breakfast', 'Gym', 'Pool'],
          pros: ['Great location', 'Good value', 'Friendly staff'],
          cons: ['Small rooms', 'Noisy at night'],
          bookingUrl: 'https://www.booking.com'
        },
        {
          name: `${destination.split(',')[0]} Boutique Hotel`,
          type: 'Hotel',
          priceRange: '$200 - $350 per night',
          location: 'Downtown',
          amenities: ['WiFi', 'Breakfast', 'Spa', 'Restaurant'],
          pros: ['Luxury experience', 'Quiet location', 'Excellent service'],
          cons: ['Higher price', 'Limited parking'],
          bookingUrl: 'https://www.booking.com'
        }
      ],
      transportation: {
        airport: `${destination.split(',')[0]} International Airport`,
        fromAirport: 'Taxi or shuttle service, $25-40',
        localTransport: 'Metro/Bus system available',
        recommendations: ['Get a travel pass', 'Use ride-sharing apps', 'Walk when possible']
      },
      dining: {
        localCuisine: 'Local specialties and international options',
        restaurantTypes: ['Fine dining', 'Street food', 'Cafes', 'Bars'],
        priceRanges: {
          budget: '$10-20 per meal',
          midRange: '$20-40 per meal',
          luxury: '$40+ per meal'
        },
        recommendations: ['Try local specialties', 'Book popular restaurants in advance', 'Explore food markets']
      },
      culturalInsights: {
        customs: ['Respect local customs', 'Learn basic phrases', 'Dress appropriately'],
        etiquette: ['Be polite and patient', 'Tip appropriately', 'Follow local dining customs'],
        language: {
          hello: 'Hello',
          thankYou: 'Thank you',
          goodbye: 'Goodbye'
        }
      },
      travelTips: [
        'Book accommodations in advance',
        'Get travel insurance',
        'Learn basic local phrases',
        'Keep important documents safe',
        'Stay hydrated and well-rested'
      ],
      emergencyInfo: {
        police: '911 (Emergency)',
        hospital: 'Local Hospital: +1-555-0123',
        embassy: 'US Embassy: +1-555-0456'
      },
      packingList: {
        essentials: ['Passport', 'Phone charger', 'Comfortable shoes', 'Weather-appropriate clothing'],
        seasonal: ['Sunscreen', 'Umbrella', 'Light jacket'],
        optional: ['Camera', 'Power bank', 'Travel adapter', 'Books']
      }
    };
  }

  private async getDestinationCoordinatesAsync(destination: string): Promise<{ lat: number; lng: number }> {
    // Default coordinates (fallback)
    const defaultCoords = { lat: 40.7128, lng: -74.0060 }; // NYC as fallback
    
    if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
      console.warn('Mapbox access token not available for geocoding');
      return defaultCoords;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&limit=1`
      );
      
      if (!response.ok) {
        console.warn('Geocoding request failed:', response.status);
        return defaultCoords;
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        console.log(`Geocoded "${destination}" to: ${lat}, ${lng}`);
        return { lat, lng };
      } else {
        console.warn(`No coordinates found for destination: ${destination}`);
        return defaultCoords;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      return defaultCoords;
    }
  }

  private generateItinerary(destination: string, numDays: number, coords: { lat: number; lng: number }): any[] {
    const itinerary = [];
    const cityName = destination.split(',')[0];
    
    // Create truly unique activities based on destination and day
    const createUniqueActivity = (day: number, timeOfDay: string, activityType: string) => {
      const activityTemplates = {
        morning: [
          `Day ${day} ${cityName} Sunrise Experience`,
          `${cityName} Day ${day} Morning Discovery`,
          `Day ${day} ${cityName} Early Bird Adventure`,
          `${cityName} Day ${day} Morning Cultural Immersion`,
          `Day ${day} ${cityName} Sunrise Photography Session`,
          `${cityName} Day ${day} Morning Market Exploration`,
          `Day ${day} ${cityName} Early Morning Walking Tour`,
          `${cityName} Day ${day} Morning Historical Journey`,
          `Day ${day} ${cityName} Sunrise Viewing Experience`,
          `${cityName} Day ${day} Morning Local Life Discovery`
        ],
        afternoon: [
          `Day ${day} ${cityName} Afternoon Cultural Experience`,
          `${cityName} Day ${day} Midday Adventure`,
          `Day ${day} ${cityName} Afternoon Local Discovery`,
          `${cityName} Day ${day} Midday Cultural Immersion`,
          `Day ${day} ${cityName} Afternoon Historical Tour`,
          `${cityName} Day ${day} Midday Art and Culture`,
          `Day ${day} ${cityName} Afternoon Local Cuisine`,
          `${cityName} Day ${day} Midday Shopping Experience`,
          `Day ${day} ${cityName} Afternoon Nature Walk`,
          `${cityName} Day ${day} Midday Entertainment`
        ],
        evening: [
          `Day ${day} ${cityName} Evening Cultural Show`,
          `${cityName} Day ${day} Night Life Experience`,
          `Day ${day} ${cityName} Evening Dining Adventure`,
          `${cityName} Day ${day} Night Entertainment`,
          `Day ${day} ${cityName} Evening Local Experience`,
          `${cityName} Day ${day} Night Cultural Performance`,
          `Day ${day} ${cityName} Evening Street Food Tour`,
          `${cityName} Day ${day} Night Local Bar Experience`,
          `Day ${day} ${cityName} Evening Walking Tour`,
          `${cityName} Day ${day} Night Photography Session`
        ]
      };
      
      // Use day and time to create unique index
      const dayOffset = day - 1;
      const timeIndex = timeOfDay === 'morning' ? 0 : timeOfDay === 'afternoon' ? 1 : 2;
      const activityIndex = (dayOffset * 3 + timeIndex) % activityTemplates[timeOfDay as keyof typeof activityTemplates].length;
      
      return activityTemplates[timeOfDay as keyof typeof activityTemplates][activityIndex];
    };

    // Create unique location names
    const createUniqueLocation = (day: number, timeOfDay: string) => {
      const locationTypes = [
        'Historic District', 'Cultural Quarter', 'Arts District', 'Old Town', 'Modern Center',
        'Waterfront Area', 'University District', 'Business District', 'Entertainment Zone',
        'Residential Quarter', 'Industrial Heritage Site', 'Government District', 'Religious Quarter',
        'Market District', 'Park District', 'Shopping District', 'Theater District', 'Museum Quarter',
        'Restaurant Row', 'Nightlife District', 'Historic Square', 'Cultural Center', 'Art Gallery District',
        'Local Market Area', 'Historic Church District', 'University Campus', 'Business Center',
        'Entertainment Complex', 'Residential Neighborhood', 'Industrial Area'
      ];
      
      const locationIndex = (day - 1 + (timeOfDay === 'morning' ? 0 : timeOfDay === 'afternoon' ? 10 : 20)) % locationTypes.length;
      return `${cityName} ${locationTypes[locationIndex]}`;
    };

    // Create diverse themes
    const getThemeForDay = (day: number) => {
      const themes = ['Cultural', 'Adventure', 'Relaxation', 'Historical', 'Modern', 'Nature', 'Artistic', 'Culinary', 'Entertainment', 'Educational'];
      return themes[(day - 1) % themes.length];
    };

    for (let day = 1; day <= numDays; day++) {
      const morningActivity = createUniqueActivity(day, 'morning', 'morning');
      const afternoonActivity = createUniqueActivity(day, 'afternoon', 'afternoon');
      const eveningActivity = createUniqueActivity(day, 'evening', 'evening');

      // Generate varied coordinates around the destination center
      const baseLat = coords.lat + (Math.random() - 0.5) * 0.02;
      const baseLng = coords.lng + (Math.random() - 0.5) * 0.02;

      itinerary.push({
        day: day,
        title: `Day ${day} - ${getThemeForDay(day)} ${cityName} Experience`,
        theme: getThemeForDay(day),
        morning: {
          time: '09:00',
          activity: morningActivity,
          location: { 
            name: createUniqueLocation(day, 'morning'), 
            lat: baseLat + (Math.random() - 0.5) * 0.005, 
            lng: baseLng + (Math.random() - 0.5) * 0.005, 
            address: `${createUniqueLocation(day, 'morning')}, ${destination}` 
          },
          duration: `${Math.floor(Math.random() * 2) + 2} hours`,
          cost: `$${Math.floor(Math.random() * 25) + 10}`,
          tips: `Best time to visit is early morning for ${morningActivity.toLowerCase()}`,
          bookingUrl: 'https://www.viator.com',
          bookingPlatform: 'Viator'
        },
        afternoon: {
          time: '14:00',
          activity: afternoonActivity,
          location: { 
            name: createUniqueLocation(day, 'afternoon'), 
            lat: baseLat + (Math.random() - 0.5) * 0.005, 
            lng: baseLng + (Math.random() - 0.5) * 0.005, 
            address: `${createUniqueLocation(day, 'afternoon')}, ${destination}` 
          },
          duration: `${Math.floor(Math.random() * 2) + 3} hours`,
          cost: `$${Math.floor(Math.random() * 35) + 15}`,
          tips: `Perfect afternoon activity for ${afternoonActivity.toLowerCase()}`,
          bookingUrl: 'https://www.getyourguide.com',
          bookingPlatform: 'GetYourGuide'
        },
        evening: {
          time: '19:00',
          activity: eveningActivity,
          location: { 
            name: createUniqueLocation(day, 'evening'), 
            lat: baseLat + (Math.random() - 0.5) * 0.005, 
            lng: baseLng + (Math.random() - 0.5) * 0.005, 
            address: `${createUniqueLocation(day, 'evening')}, ${destination}` 
          },
          duration: `${Math.floor(Math.random() * 2) + 2} hours`,
          cost: `$${Math.floor(Math.random() * 40) + 25}`,
          tips: `Great evening experience for ${eveningActivity.toLowerCase()}`,
          bookingUrl: 'https://www.tripadvisor.com',
          bookingPlatform: 'TripAdvisor'
        },
        transportation: [
          {
            from: 'Previous location',
            to: 'Next location',
            method: ['Metro', 'Bus', 'Walk', 'Taxi', 'Bike'][Math.floor(Math.random() * 5)],
            duration: `${Math.floor(Math.random() * 20) + 10} minutes`,
            cost: `$${(Math.random() * 3 + 1).toFixed(2)}`,
            details: 'Use local transportation network',
            bookingUrl: 'https://www.local-transport.com'
          }
        ],
        dining: [
          {
            meal: 'Dinner',
            restaurant: `${cityName} Day ${day} ${['Traditional', 'Modern', 'Fusion', 'Local', 'International'][Math.floor(Math.random() * 5)]} Restaurant`,
            cuisine: ['Local', 'International', 'Fusion', 'Traditional', 'Modern'][Math.floor(Math.random() * 5)],
            priceRange: `$${Math.floor(Math.random() * 20) + 20}-${Math.floor(Math.random() * 30) + 40}`,
            specialty: `${cityName} Day ${day} specialty dish`,
            location: { 
              name: `${cityName} Day ${day} Dining District`, 
              lat: baseLat + (Math.random() - 0.5) * 0.005, 
              lng: baseLng + (Math.random() - 0.5) * 0.005, 
              address: `${cityName} Day ${day} Dining District, ${destination}` 
            },
            bookingUrl: 'https://www.opentable.com',
            bookingPlatform: 'OpenTable'
          }
        ],
        highlights: [
          `${morningActivity} experience`,
          `${afternoonActivity} discovery`,
          `${eveningActivity} adventure`
        ],
        totalCost: `$${Math.floor(Math.random() * 80) + 60}`
      });
    }

    return itinerary;
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

  private async autocorrectUserInput(userInput: string): Promise<string> {
    if (!this.genAI) {
      return userInput // Return original if AI not available
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      
      const autocorrectPrompt = `You are an expert travel assistant. The user has entered a travel request that may contain typos, spelling mistakes, or unclear language. 

Your task is to correct and clarify their input while preserving their original intent. Focus on:

1. Correcting spelling mistakes in destination names, activities, and travel terms
2. Fixing grammar and punctuation errors
3. Clarifying ambiguous language while keeping the user's meaning
4. Standardizing destination names to their proper format (e.g., "paris france" → "Paris, France")
5. Maintaining all the important details like budget, duration, preferences, etc.

User input: "${userInput}"

Please return ONLY the corrected version of their input, maintaining their original intent and all important details. Do not add explanations or additional text - just the corrected travel request.`

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: autocorrectPrompt }] }],
        generationConfig: {
          temperature: 0.3, // Lower temperature for more consistent corrections
          maxOutputTokens: 500,
        },
      });
      
      const correctedInput = result.response.text().trim()
      
      // If the AI response seems to be an explanation rather than a correction, return original
      if (correctedInput.toLowerCase().includes('corrected version:') || 
          correctedInput.toLowerCase().includes('here is the corrected') ||
          correctedInput.length > userInput.length * 2) {
        return userInput
      }
      
      return correctedInput
    } catch (error) {
      console.error('Error autocorrecting user input:', error)
      return userInput // Return original if correction fails
    }
  }
}

export const geminiService = new GeminiService() 