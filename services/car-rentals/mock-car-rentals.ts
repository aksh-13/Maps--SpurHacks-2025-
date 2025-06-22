export interface CarRentalSearch {
  location: string
  startDate: string
  endDate: string
  driverAge: number
  currency?: string
}

export interface CarRentalResult {
  id: string
  company: string
  carModel: string
  carType: string
  price: number
  currency: string
  location: string
  imageUrl?: string
  features?: string[]
  description?: string
  rating?: number
  bookingUrl?: string
}

export class MockCarRentalsService {
  private carTemplates = [
    {
      company: 'Hertz',
      carModel: 'Toyota Camry',
      carType: 'Economy',
      price: 45,
      features: ['Automatic', 'Air Conditioning', 'Bluetooth', 'Backup Camera'],
      description: 'Reliable economy car perfect for city driving and short trips.',
      imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
      rating: 4.3,
    },
    {
      company: 'Enterprise',
      carModel: 'Honda Civic',
      carType: 'Compact',
      price: 52,
      features: ['Automatic', 'Air Conditioning', 'USB Ports', 'Fuel Efficient'],
      description: 'Compact car with excellent fuel economy and easy parking.',
      imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
      rating: 4.5,
    },
    {
      company: 'Avis',
      carModel: 'Ford Escape',
      carType: 'SUV',
      price: 78,
      features: ['AWD', 'Spacious Interior', 'Cargo Space', 'Family Friendly'],
      description: 'Comfortable SUV with plenty of space for passengers and luggage.',
      imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400',
      rating: 4.2,
    },
    {
      company: 'Budget',
      carModel: 'Chevrolet Malibu',
      carType: 'Midsize',
      price: 65,
      features: ['Automatic', 'Comfortable Seats', 'Good MPG', 'Safety Features'],
      description: 'Midsize sedan with a smooth ride and modern features.',
      imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400',
      rating: 4.0,
    },
    {
      company: 'National',
      carModel: 'BMW 3 Series',
      carType: 'Luxury',
      price: 120,
      features: ['Premium Audio', 'Leather Seats', 'Navigation', 'Sport Mode'],
      description: 'Luxury sedan with premium features and excellent performance.',
      imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400',
      rating: 4.7,
    },
    {
      company: 'Alamo',
      carModel: 'Jeep Wrangler',
      carType: 'Adventure',
      price: 95,
      features: ['4x4', 'Convertible Top', 'Off-road Capable', 'Adventure Ready'],
      description: 'Iconic off-road vehicle perfect for adventure and exploration.',
      imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400',
      rating: 4.4,
    },
    {
      company: 'Thrifty',
      carModel: 'Nissan Versa',
      carType: 'Economy',
      price: 38,
      features: ['Automatic', 'Fuel Efficient', 'Easy to Park', 'Budget Friendly'],
      description: 'Affordable economy car with great value for money.',
      imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
      rating: 3.8,
    },
    {
      company: 'Dollar',
      carModel: 'Hyundai Tucson',
      carType: 'Compact SUV',
      price: 72,
      features: ['Crossover', 'Good Visibility', 'Easy Handling', 'Modern Design'],
      description: 'Versatile compact SUV with modern styling and good fuel economy.',
      imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400',
      rating: 4.1,
    }
  ]

  async searchCarRentals(searchParams: CarRentalSearch): Promise<CarRentalResult[]> {
    console.log('Mock car rental search for:', searchParams.location)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700))
    
    return this.generateMockCarRentals(searchParams.location, searchParams)
  }

  private generateMockCarRentals(location: string, searchParams: CarRentalSearch): CarRentalResult[] {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0]
    }
    
    const startDate = formatDate(tomorrow)
    const endDate = formatDate(nextWeek)
    
    // Generate 5-7 random car rentals
    const numCars = 5 + Math.floor(Math.random() * 3)
    const cars: CarRentalResult[] = []
    
    for (let i = 0; i < numCars; i++) {
      const template = this.carTemplates[i % this.carTemplates.length]
      const priceVariation = 0.8 + Math.random() * 0.4 // ±20% price variation
      const ratingVariation = -0.2 + Math.random() * 0.4 // ±0.2 rating variation
      
      cars.push({
        id: `mock-car-${i + 1}`,
        company: template.company,
        carModel: template.carModel,
        carType: template.carType,
        price: Math.round(template.price * priceVariation),
        currency: 'USD',
        location: `${location} Airport`,
        imageUrl: template.imageUrl,
        features: template.features,
        description: template.description,
        rating: Math.max(3.5, Math.min(5.0, template.rating + ratingVariation)),
        bookingUrl: `https://www.rentalcars.com/search?location=${encodeURIComponent(location)}&pickupDate=${startDate}&returnDate=${endDate}&driverAge=${searchParams.driverAge}`,
      })
    }
    
    // Shuffle the results for variety
    return cars.sort(() => Math.random() - 0.5)
  }

  async getCarRentalDetailsById(carId: string): Promise<CarRentalResult | null> {
    // Return a mock car rental detail
    const mockCar: CarRentalResult = {
      id: carId,
      company: 'Hertz',
      carModel: 'Toyota Camry',
      carType: 'Economy',
      price: 45,
      currency: 'USD',
      location: 'Airport Location',
      imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
      features: ['Automatic', 'Air Conditioning', 'Bluetooth', 'Backup Camera'],
      description: 'Reliable economy car perfect for city driving and short trips.',
      rating: 4.3,
      bookingUrl: 'https://www.rentalcars.com/search?selected_currency=USD',
    }
    
    return mockCar
  }
}

export const mockCarRentalsService = new MockCarRentalsService() 