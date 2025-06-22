# Authentication System

## Overview

The TripPlanner 3D application now includes a fully functional authentication system that works locally without external dependencies. This system provides real sign-in/sign-up functionality with user data persistence.

## Features

- **User Registration**: Create new accounts with email, password, and name
- **User Login**: Sign in with existing credentials
- **Google Sign-In**: Demo Google authentication (creates a demo account)
- **User Profiles**: Store user preferences and profile information
- **Session Persistence**: Users stay logged in across browser sessions
- **Demo Accounts**: Pre-created accounts for testing

## Demo Accounts

For testing purposes, the following demo accounts are automatically created:

| Email | Password | Name |
|-------|----------|------|
| john@example.com | password123 | John Doe |
| jane@example.com | password123 | Jane Smith |

## How to Use

### Sign Up
1. Click "Sign Up" in the header
2. Enter your full name, email, and password (minimum 6 characters)
3. Click "Create Account"
4. You'll be automatically signed in

### Sign In
1. Click "Sign In" in the header
2. Enter your email and password
3. Click "Sign In"

### Google Sign-In
1. Click "Sign In" or "Sign Up"
2. Click "Continue with Google"
3. A demo account will be created and you'll be signed in

### Sign Out
1. Click the settings icon (gear) next to your profile
2. Click the logout icon

## Technical Implementation

### Local Storage
- User data is stored in `localStorage` under `trip_planner_users`
- Current session is stored under `trip_planner_current_user`
- Data persists across browser sessions

### Security Notes
- This is a demo implementation for development/testing
- Passwords are stored in plain text (not recommended for production)
- In a production environment, use proper authentication services like:
  - Supabase Auth
  - Firebase Auth
  - Auth0
  - NextAuth.js

### User Profile Structure
```typescript
interface UserProfile {
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
```

## Integration with Trip Planning

The authentication system integrates with the trip planning features:

- **Personalized Recommendations**: User preferences influence trip suggestions
- **Saved Trips**: (Future feature) Users can save and manage their trip plans
- **Booking History**: (Future feature) Track past bookings and preferences

## Future Enhancements

- Password hashing and encryption
- Email verification
- Password reset functionality
- Social login integration (real OAuth)
- User profile management
- Trip history and favorites
- Booking integration with user accounts

## Files

- `services/auth/local-auth.ts` - Main authentication service
- `components/Auth.tsx` - Authentication UI component
- `components/Header.tsx` - Header with auth integration 