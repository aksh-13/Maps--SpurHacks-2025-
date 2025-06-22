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

interface AuthUser {
  id: string
  email: string
  password: string // In a real app, this would be hashed
  name: string
  picture?: string
  preferences?: UserProfile['preferences']
  createdAt: string
}

class LocalAuthService {
  private users: AuthUser[] = []
  private currentUser: UserProfile | null = null
  private listeners: ((user: UserProfile | null) => void)[] = []

  constructor() {
    this.loadUsers()
    this.loadCurrentUser()
  }

  private loadUsers() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('trip_planner_users')
      if (stored) {
        this.users = JSON.parse(stored)
      }
    }
  }

  private saveUsers() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('trip_planner_users', JSON.stringify(this.users))
    }
  }

  private loadCurrentUser() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('trip_planner_current_user')
      if (stored) {
        this.currentUser = JSON.parse(stored)
      }
    }
  }

  private saveCurrentUser(user: UserProfile | null) {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('trip_planner_current_user', JSON.stringify(user))
      } else {
        localStorage.removeItem('trip_planner_current_user')
      }
    }
    this.currentUser = user
    this.notifyListeners()
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser))
  }

  async signUp(email: string, password: string, name: string): Promise<{ user: UserProfile | null; error: any }> {
    try {
      // Check if user already exists
      const existingUser = this.users.find(u => u.email.toLowerCase() === email.toLowerCase())
      if (existingUser) {
        return { user: null, error: { message: 'User with this email already exists' } }
      }

      // Validate input
      if (!email || !password || !name) {
        return { user: null, error: { message: 'All fields are required' } }
      }

      if (password.length < 6) {
        return { user: null, error: { message: 'Password must be at least 6 characters long' } }
      }

      if (!email.includes('@')) {
        return { user: null, error: { message: 'Please enter a valid email address' } }
      }

      // Create new user
      const newUser: AuthUser = {
        id: this.generateId(),
        email: email.toLowerCase(),
        password, // In a real app, this would be hashed
        name,
        preferences: {
          preferredCurrency: 'USD',
          preferredLanguage: 'en',
          travelStyle: 'adventure',
          dietaryRestrictions: []
        },
        createdAt: new Date().toISOString()
      }

      this.users.push(newUser)
      this.saveUsers()

      // Create user profile
      const userProfile: UserProfile = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        preferences: newUser.preferences
      }

      // Auto sign in
      this.saveCurrentUser(userProfile)

      return { user: userProfile, error: null }
    } catch (error) {
      return { user: null, error: { message: 'Failed to create account' } }
    }
  }

  async signIn(email: string, password: string): Promise<{ user: UserProfile | null; error: any }> {
    try {
      // Find user
      const user = this.users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
      )

      if (!user) {
        return { user: null, error: { message: 'Invalid email or password' } }
      }

      // Create user profile
      const userProfile: UserProfile = {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        preferences: user.preferences
      }

      this.saveCurrentUser(userProfile)
      return { user: userProfile, error: null }
    } catch (error) {
      return { user: null, error: { message: 'Failed to sign in' } }
    }
  }

  async signInWithGoogle(): Promise<{ error: any }> {
    try {
      // Simulate Google sign in with a demo account
      const demoUser: UserProfile = {
        id: 'google-demo-user',
        email: 'demo@example.com',
        name: 'Demo User',
        picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        preferences: {
          preferredCurrency: 'USD',
          preferredLanguage: 'en',
          travelStyle: 'adventure',
          dietaryRestrictions: []
        }
      }

      this.saveCurrentUser(demoUser)
      return { error: null }
    } catch (error) {
      return { error: { message: 'Failed to sign in with Google' } }
    }
  }

  async signOut(): Promise<{ error: any }> {
    try {
      this.saveCurrentUser(null)
      return { error: null }
    } catch (error) {
      return { error: { message: 'Failed to sign out' } }
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    return this.currentUser
  }

  async getUserProfile(): Promise<UserProfile | null> {
    return this.currentUser
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserProfile['preferences']>): Promise<boolean> {
    try {
      if (!this.currentUser) return false

      // Update current user preferences with proper defaults
      this.currentUser.preferences = {
        preferredCurrency: 'USD',
        preferredLanguage: 'en',
        travelStyle: 'adventure',
        dietaryRestrictions: [],
        ...this.currentUser.preferences,
        ...preferences
      }

      // Update stored user data
      const userIndex = this.users.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        this.users[userIndex].preferences = this.currentUser.preferences
        this.saveUsers()
      }

      this.saveCurrentUser(this.currentUser)
      return true
    } catch (error) {
      console.error('Error updating user preferences:', error)
      return false
    }
  }

  async isAuthenticated(): Promise<boolean> {
    return !!this.currentUser
  }

  async resetPassword(email: string): Promise<{ error: any }> {
    try {
      const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase())
      if (!user) {
        return { error: { message: 'No account found with this email address' } }
      }

      // In a real app, this would send an email
      // For demo purposes, we'll just return success
      return { error: null }
    } catch (error) {
      return { error: { message: 'Failed to send reset email' } }
    }
  }

  async updatePassword(newPassword: string): Promise<{ error: any }> {
    try {
      if (!this.currentUser) {
        return { error: { message: 'No user logged in' } }
      }

      const userIndex = this.users.findIndex(u => u.id === this.currentUser!.id)
      if (userIndex !== -1) {
        this.users[userIndex].password = newPassword
        this.saveUsers()
      }

      return { error: null }
    } catch (error) {
      return { error: { message: 'Failed to update password' } }
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    const listener = (user: UserProfile | null) => {
      const event = user ? 'SIGNED_IN' : 'SIGNED_OUT'
      callback(event, { user })
    }

    this.listeners.push(listener)
    
    // Return subscription object
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.listeners.indexOf(listener)
            if (index > -1) {
              this.listeners.splice(index, 1)
            }
          }
        }
      }
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  // Demo data for testing
  async createDemoData() {
    if (this.users.length === 0) {
      const demoUsers: AuthUser[] = [
        {
          id: 'demo-1',
          email: 'john@example.com',
          password: 'password123',
          name: 'John Doe',
          picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          preferences: {
            preferredCurrency: 'USD',
            preferredLanguage: 'en',
            travelStyle: 'adventure',
            dietaryRestrictions: []
          },
          createdAt: new Date().toISOString()
        },
        {
          id: 'demo-2',
          email: 'jane@example.com',
          password: 'password123',
          name: 'Jane Smith',
          picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          preferences: {
            preferredCurrency: 'EUR',
            preferredLanguage: 'en',
            travelStyle: 'luxury',
            dietaryRestrictions: ['vegetarian']
          },
          createdAt: new Date().toISOString()
        }
      ]

      this.users = demoUsers
      this.saveUsers()
    }
  }
}

export const localAuthService = new LocalAuthService()

// Initialize demo data
if (typeof window !== 'undefined') {
  localAuthService.createDemoData()
} 