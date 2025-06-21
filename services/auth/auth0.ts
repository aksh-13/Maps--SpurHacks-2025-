export interface UserProfile {
  id: string
  email: string
  name: string
  picture?: string
  preferences?: {
    preferredCurrency: string
    preferredLanguage: string
    travelStyle: 'budget' | 'luxury' | 'adventure' | 'relaxation'
    dietaryRestrictions: string[]
  }
}

export class Auth0Service {
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      // This would integrate with Auth0 session management
      // For now, return a mock profile
      return {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John Doe',
        picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        preferences: {
          preferredCurrency: 'USD',
          preferredLanguage: 'en',
          travelStyle: 'adventure',
          dietaryRestrictions: [],
        },
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      // This would get the actual Auth0 access token
      // For now, return null
      return null
    } catch (error) {
      console.error('Error getting access token:', error)
      return null
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserProfile['preferences']>): Promise<boolean> {
    try {
      // This would typically update a database
      // For now, we'll just return success
      console.log('Updating preferences for user:', userId, preferences)
      return true
    } catch (error) {
      console.error('Error updating user preferences:', error)
      return false
    }
  }

  async isAuthenticated(): Promise<boolean> {
    // This would check if user is authenticated
    // For now, return true for development
    return true
  }
}

export const auth0Service = new Auth0Service() 