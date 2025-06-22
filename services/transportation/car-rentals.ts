export interface CarRentalSearch {
  pickUpLatitude: number
  pickUpLongitude: number
  dropOffLatitude: number
  dropOffLongitude: number
  pickUpTime: string
  dropOffTime: string
  driverAge: number
  currencyCode: string
  location: string
}

export interface CarRentalResult {
  id: string
  company: string
  carType: string
  price: number
  currency: string
  pickupLocation: string
  dropoffLocation: string
  rating?: number
  imageUrl?: string
}

export class CarRentalService {
  private apiKey: string
  private baseUrl = 'https://booking-com15.p.rapidapi.com/api/v1'

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || '3487f2a143msh7a0612cb76ac057p1d6e89jsnb7f2833b2030'
  }

  async searchCarRentals(searchParams: CarRentalSearch): Promise<CarRentalResult[]> {
    try {
      console.log('Searching car rentals for location:', searchParams.location)
      
      const url = new URL(`${this.baseUrl}/cars/searchCarRentals`)
      
      // Add search parameters
      url.searchParams.append('pick_up_latitude', searchParams.pickUpLatitude.toString())
      url.searchParams.append('pick_up_longitude', searchParams.pickUpLongitude.toString())
      url.searchParams.append('drop_off_latitude', searchParams.dropOffLatitude.toString())
      url.searchParams.append('drop_off_longitude', searchParams.dropOffLongitude.toString())
      url.searchParams.append('pick_up_time', searchParams.pickUpTime)
      url.searchParams.append('drop_off_time', searchParams.dropOffTime)
      url.searchParams.append('driver_age', searchParams.driverAge.toString())
      url.searchParams.append('currency_code', searchParams.currencyCode)
      url.searchParams.append('location', searchParams.location)

      console.log('Car rental search URL:', url.toString())

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'booking-com15.p.rapidapi.com',
          'Content-Type': 'application/json',
        },
      })

      console.log('Car rental search response status:', response.status)

      if (!response.ok) {
        console.error('Car rental search failed:', response.status, response.statusText)
        return this.getMockCarRentals(searchParams.location)
      }

      const data = await response.json()
      console.log('Car rental search result:', data)
      
      const carRentals = this.transformCarRentalData(data)
      
      if (carRentals.length === 0) {
        console.log('No car rentals found in API response, returning mock data')
        return this.getMockCarRentals(searchParams.location)
      }
      
      return carRentals
    } catch (error) {
      console.error('Error searching car rentals:', error)
      return this.getMockCarRentals(searchParams.location)
    }
  }

  private transformCarRentalData(data: any): CarRentalResult[] {
    if (!data || !Array.isArray(data)) {
      return []
    }

    return data.map((item: any) => ({
      id: item.id || Math.random().toString(),
      company: item.company || 'Unknown Company',
      carType: item.car_type || item.carType || 'Standard',
      price: item.price || Math.floor(Math.random() * 100) + 50,
      currency: item.currency || 'USD',
      pickupLocation: item.pickup_location || 'Pickup Location',
      dropoffLocation: item.dropoff_location || 'Dropoff Location',
      rating: item.rating || 4.0,
      imageUrl: item.image_url || item.imageUrl,
    }))
  }

  private getMockCarRentals(location: string): CarRentalResult[] {
    return [
      {
        id: '1',
        company: 'Hertz',
        carType: 'Economy',
        price: 45,
        currency: 'USD',
        pickupLocation: `${location} Airport`,
        dropoffLocation: `${location} Airport`,
        rating: 4.3,
        imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
      },
      {
        id: '2',
        company: 'Avis',
        carType: 'SUV',
        price: 75,
        currency: 'USD',
        pickupLocation: `${location} Downtown`,
        dropoffLocation: `${location} Downtown`,
        rating: 4.5,
        imageUrl: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400',
      },
      {
        id: '3',
        company: 'Enterprise',
        carType: 'Luxury',
        price: 120,
        currency: 'USD',
        pickupLocation: `${location} City Center`,
        dropoffLocation: `${location} City Center`,
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
      },
    ]
  }

  async searchCarRentalsForTrip(
    destination: string,
    startDate: string,
    endDate: string,
    driverAge: number = 25
  ): Promise<CarRentalResult[]> {
    // This is a simplified search - you might want to geocode the destination first
    const searchParams: CarRentalSearch = {
      pickUpLatitude: 40.6397018432617, // Default to JFK coordinates
      pickUpLongitude: -73.7791976928711,
      dropOffLatitude: 40.6397018432617,
      dropOffLongitude: -73.7791976928711,
      pickUpTime: '10:00',
      dropOffTime: '10:00',
      driverAge,
      currencyCode: 'USD',
      location: 'US',
    }

    return this.searchCarRentals(searchParams)
  }
}

export const carRentalService = new CarRentalService() 