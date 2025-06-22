'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, LogOut, LogIn, UserPlus, Settings } from 'lucide-react'
import { localAuthService, type UserProfile } from '@/services/auth/local-auth'

export default function Auth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    // Check current user on mount
    checkUser()
    
    // Listen for auth state changes
    const { data: { subscription } } = localAuthService.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      const profile = await localAuthService.getUserProfile()
      setUser(profile)
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    
    const { user, error } = await localAuthService.signIn(email, password)
    if (error) {
      setAuthError(error.message)
    } else {
      setShowAuthModal(false)
      setEmail('')
      setPassword('')
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    
    const { user, error } = await localAuthService.signUp(email, password, name)
    if (error) {
      setAuthError(error.message)
    } else {
      setShowAuthModal(false)
      setEmail('')
      setPassword('')
      setName('')
    }
  }

  const handleGoogleSignIn = async () => {
    const { error } = await localAuthService.signInWithGoogle()
    if (error) {
      setAuthError(error.message)
    } else {
      setShowAuthModal(false)
    }
  }

  const handleSignOut = async () => {
    await localAuthService.signOut()
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 border-2 border-accent-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-primary-600">Loading...</span>
      </div>
    )
  }

  return (
    <div className="relative">
      {user ? (
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {user.picture ? (
              <img 
                src={user.picture} 
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-accent-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="hidden md:block">
              <p className="text-sm font-medium text-primary-900">{user.name}</p>
              <p className="text-xs text-primary-600">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAuthModal(true)}
              className="p-2 text-primary-600 hover:text-accent-600 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 text-primary-600 hover:text-error-600 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setAuthMode('signin')
              setShowAuthModal(true)
            }}
            className="btn-secondary"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => {
              setAuthMode('signup')
              setShowAuthModal(true)
            }}
            className="btn-primary"
          >
            <UserPlus className="w-4 h-4" />
            <span>Sign Up</span>
          </button>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-20"
          onClick={() => setShowAuthModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            className="card w-full max-w-md mx-4 mt-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-primary-900">
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </h2>
              <p className="text-primary-600 mt-2">
                {authMode === 'signin' 
                  ? 'Welcome back! Sign in to your account.' 
                  : 'Join us and start planning your next adventure!'
                }
              </p>
              
              {/* Demo Instructions */}
              <div className="mt-4 p-3 bg-accent-50 rounded-xl border border-accent-200">
                <p className="text-sm text-accent-800 font-medium mb-2">Demo Accounts:</p>
                <div className="text-xs text-accent-700 space-y-1">
                  <p>• <strong>john@example.com</strong> / password123</p>
                  <p>• <strong>jane@example.com</strong> / password123</p>
                </div>
              </div>
            </div>

            <form onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {authError && (
                <div className="text-error-700 text-sm bg-error-50 p-3 rounded-xl border border-error-200">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full"
              >
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-primary-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-surface-200 rounded-xl hover:bg-surface-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-primary-700">Continue with Google</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-sm text-accent-600 hover:text-accent-700 transition-colors"
                >
                  {authMode === 'signin' 
                    ? "Don't have an account? Sign up" 
                    : 'Already have an account? Sign in'
                  }
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
} 