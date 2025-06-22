# Vercel Deployment Guide

## Required Environment Variables

Add these environment variables in your Vercel project settings:

### Essential (Required for basic functionality):
```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Optional (For full functionality):
```
GOOGLE_PLACES_API_KEY=your_google_places_key_here
GOOGLE_HOTELS_API_KEY=your_google_hotels_key_here
OPENWEATHER_API_KEY=your_openweather_key_here
GOOGLE_TRANSLATE_API_KEY=your_google_translate_key_here
SKYSCANNER_API_KEY=your_skyscanner_key_here
AMADEUS_API_KEY=your_amadeus_key_here
AMADEUS_CLIENT_SECRET=your_amadeus_secret_here
KIWI_API_KEY=your_kiwi_key_here
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
GEMINI_API_KEY=your_gemini_key_here
VRBO_API_KEY=your_vrbo_key_here
RAPIDAPI_KEY=your_rapidapi_key_here
```

## Steps to Deploy:

1. **Push your code to GitHub** (if not already done)
2. **Connect your repository to Vercel**
3. **Add Environment Variables** in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add each variable listed above
4. **Deploy** - Vercel will automatically deploy when you push to main branch

## Quick Test Deployment:

For immediate deployment without all API keys, the app will work with fallback data. Just add the essential variables:

```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Troubleshooting:

- **Build fails**: Check that all required environment variables are set
- **Module download issues**: Ensure `package.json` is in the root directory
- **API errors**: The app will use fallback data if API keys are missing
- **Timeout issues**: API routes have 30-second timeout configured

## Local Testing:

Create a `.env.local` file with the same variables for local development. 