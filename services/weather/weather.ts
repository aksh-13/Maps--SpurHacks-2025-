interface WeatherData {
  location: string
  current: {
    temperature: number
    feelsLike: number
    humidity: number
    windSpeed: number
    description: string
    icon: string
  }
  forecast: {
    date: string
    high: number
    low: number
    description: string
    icon: string
    precipitation: number
  }[]
  recommendations: {
    clothing: string[]
    activities: string[]
    packing: string[]
  }
}

export class WeatherService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || ''
    if (!this.apiKey) {
      console.warn('OpenWeather API key not found. Using fallback data.')
    }
  }

  async getWeatherForecast(location: string, days: number = 7): Promise<WeatherData | null> {
    if (!this.apiKey) {
      return this.getFallbackWeather(location, days)
    }

    try {
      // Get coordinates for the location
      const coords = await this.getCoordinates(location)
      if (!coords) {
        return this.getFallbackWeather(location, days)
      }

      // Get current weather
      const currentWeather = await this.getCurrentWeather(coords.lat, coords.lon)
      
      // Get forecast
      const forecast = await this.getWeatherForecastData(coords.lat, coords.lon, days)

      // Generate recommendations
      const recommendations = this.generateRecommendations(currentWeather, forecast)

      return {
        location,
        current: currentWeather,
        forecast,
        recommendations
      }
    } catch (error) {
      console.error('Error fetching weather data:', error)
      return this.getFallbackWeather(location, days)
    }
  }

  private async getCoordinates(location: string): Promise<{ lat: number; lon: number } | null> {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${this.apiKey}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to get coordinates')
      }

      const data = await response.json()
      if (data.length === 0) {
        return null
      }

      return {
        lat: data[0].lat,
        lon: data[0].lon
      }
    } catch (error) {
      console.error('Error getting coordinates:', error)
      return null
    }
  }

  private async getCurrentWeather(lat: number, lon: number) {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`
    )
    
    if (!response.ok) {
      throw new Error('Failed to get current weather')
    }

    const data = await response.json()
    
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      description: data.weather[0].description,
      icon: data.weather[0].icon
    }
  }

  private async getWeatherForecastData(lat: number, lon: number, days: number) {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`
    )
    
    if (!response.ok) {
      throw new Error('Failed to get forecast')
    }

    const data = await response.json()
    
    // Group by day and get daily forecast
    const dailyForecasts = data.list.filter((item: any, index: number) => index % 8 === 0).slice(0, days)
    
    return dailyForecasts.map((day: any) => ({
      date: new Date(day.dt * 1000).toISOString().split('T')[0],
      high: Math.round(day.main.temp_max),
      low: Math.round(day.main.temp_min),
      description: day.weather[0].description,
      icon: day.weather[0].icon,
      precipitation: day.pop * 100 // Probability of precipitation
    }))
  }

  private generateRecommendations(current: any, forecast: any[]): WeatherData['recommendations'] {
    const avgTemp = (current.temperature + forecast.reduce((sum, day) => sum + day.high, 0) / forecast.length) / 2
    const hasRain = forecast.some(day => day.precipitation > 30)

    const clothing = []
    const activities = []
    const packing = []

    // Clothing recommendations
    if (avgTemp < 10) {
      clothing.push('Warm jacket', 'Scarf', 'Gloves', 'Thermal underwear')
    } else if (avgTemp < 20) {
      clothing.push('Light jacket', 'Long sleeves', 'Comfortable pants')
    } else {
      clothing.push('T-shirts', 'Shorts', 'Light clothing')
    }

    if (hasRain) {
      clothing.push('Rain jacket', 'Umbrella', 'Waterproof shoes')
    }

    // Activity recommendations
    if (avgTemp > 20 && !hasRain) {
      activities.push('Outdoor dining', 'Walking tours', 'Beach activities', 'Hiking')
    } else if (avgTemp > 15) {
      activities.push('Museum visits', 'Indoor attractions', 'Shopping', 'Café hopping')
    } else {
      activities.push('Indoor activities', 'Spa visits', 'Shopping malls', 'Restaurants')
    }

    // Packing recommendations
    packing.push('Phone charger', 'Camera', 'Travel documents', 'Medications')
    
    if (hasRain) {
      packing.push('Waterproof bag', 'Extra socks')
    }
    
    if (avgTemp > 25) {
      packing.push('Sunscreen', 'Hat', 'Sunglasses')
    }

    return { clothing, activities, packing }
  }

  private getFallbackWeather(location: string, days: number): WeatherData {
    const forecast = []
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      forecast.push({
        date: date.toISOString().split('T')[0],
        high: 22 + Math.floor(Math.random() * 10),
        low: 15 + Math.floor(Math.random() * 8),
        description: 'Partly cloudy',
        icon: '02d',
        precipitation: Math.random() * 30
      })
    }

    return {
      location,
      current: {
        temperature: 24,
        feelsLike: 26,
        humidity: 65,
        windSpeed: 12,
        description: 'Partly cloudy',
        icon: '02d'
      },
      forecast,
      recommendations: {
        clothing: ['Light jacket', 'Comfortable shoes', 'T-shirts'],
        activities: ['Walking tours', 'Museum visits', 'Outdoor dining'],
        packing: ['Phone charger', 'Camera', 'Travel documents']
      }
    }
  }
}

export const weatherService = new WeatherService() 