import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

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

export class SupabaseAuthService {
  async signUp(email: string, password: string, name: string): Promise<{ user: User | null; error: any }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          preferredCurrency: 'USD',
          preferredLanguage: 'en',
          travelStyle: 'adventure',
          dietaryRestrictions: []
        }
      }
    })

    return { user: data.user, error }
  }

  async signIn(email: string, password: string): Promise<{ user: User | null; error: any }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    return { user: data.user, error }
  }

  async signInWithGoogle(): Promise<{ error: any }> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    return { error }
  }

  async signOut(): Promise<{ error: any }> {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  async getUserProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return null
    }

    // Get user metadata from Supabase
    const userData = user.user_metadata || {}
    
    return {
      id: user.id,
      email: user.email || '',
      name: userData.name || user.email?.split('@')[0] || 'User',
      picture: userData.avatar_url || userData.picture,
      preferences: {
        preferredCurrency: userData.preferredCurrency || 'USD',
        preferredLanguage: userData.preferredLanguage || 'en',
        travelStyle: userData.travelStyle || 'adventure',
        dietaryRestrictions: userData.dietaryRestrictions || []
      }
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserProfile['preferences']>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return false
      }

      const currentMetadata = user.user_metadata || {}
      const updatedMetadata = {
        ...currentMetadata,
        ...preferences
      }

      const { error } = await supabase.auth.updateUser({
        data: updatedMetadata
      })

      return !error
    } catch (error) {
      console.error('Error updating user preferences:', error)
      return false
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    return !!user
  }

  async resetPassword(email: string): Promise<{ error: any }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    return { error }
  }

  async updatePassword(newPassword: string): Promise<{ error: any }> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    return { error }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export const supabaseAuthService = new SupabaseAuthService() 