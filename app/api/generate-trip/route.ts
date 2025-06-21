import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // TODO: Integrate with OpenAI API for actual AI trip planning
    // For now, return a mock response
    const mockTripPlan = {
      destination: 'Paris, France',
      duration: '7 days',
      budget: '$2,500',
      activities: ['Visit Eiffel Tower', 'Louvre Museum', 'Seine River Cruise', 'Notre-Dame Cathedral'],
      itinerary: [
        {
          day: 1,
          activities: ['Arrive in Paris', 'Check into hotel', 'Eiffel Tower visit', 'Dinner at local bistro'],
          locations: [
            { name: 'Eiffel Tower', lat: 48.8584, lng: 2.2945 },
            { name: 'Hotel', lat: 48.8566, lng: 2.3522 }
          ]
        },
        {
          day: 2,
          activities: ['Louvre Museum', 'Walk along Champs-Élysées', 'Arc de Triomphe'],
          locations: [
            { name: 'Louvre Museum', lat: 48.8606, lng: 2.3376 },
            { name: 'Arc de Triomphe', lat: 48.8738, lng: 2.2950 }
          ]
        }
      ],
      accommodations: [
        {
          id: 1,
          name: 'Hotel Le Meurice',
          type: 'Hotel',
          price: '$350/night',
          rating: 4.8,
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
          location: { lat: 48.8663, lng: 2.3295 }
        },
        {
          id: 2,
          name: 'Charming Paris Apartment',
          type: 'Airbnb',
          price: '$180/night',
          rating: 4.9,
          image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
          location: { lat: 48.8566, lng: 2.3522 }
        }
      ]
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    return NextResponse.json({
      success: true,
      tripPlan: mockTripPlan
    })

  } catch (error) {
    console.error('Error generating trip:', error)
    return NextResponse.json(
      { error: 'Failed to generate trip plan' },
      { status: 500 }
    )
  }
} 