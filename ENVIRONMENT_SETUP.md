# 🔧 Environment Variables Setup Guide

## Required API Keys for TripPlanner 3D

### 1. **Google Services**
```env
# Google Places API (for hotels)
GOOGLE_HOTELS_API_KEY=your_google_places_api_key_here

# Google Maps API (for 3D maps)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

### 2. **AI Services**
```env
# OpenAI (for AI trip planning)
OPENAI_API_KEY=your_openai_api_key_here

# Google Gemini (alternative AI)
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. **Accommodation Services**
```env
# VRBO API (for vacation rentals)
VRBO_API_KEY=your_vrbo_api_key_here

# Airbnb Affiliate (optional)
AIRBNB_AFFILIATE_ID=your_airbnb_affiliate_id_here
```

### 4. **Transportation Services**
```env
# Flight APIs
SKYSCANNER_API_KEY=your_skyscanner_api_key_here
AMADEUS_API_KEY=your_amadeus_api_key_here
KIWI_API_KEY=your_kiwi_api_key_here
```

### 5. **Weather & Translation**
```env
# Weather APIs
OPENWEATHER_API_KEY=your_openweather_api_key_here
WEATHERAPI_KEY=your_weatherapi_key_here

# Translation
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key_here
```

### 6. **Music & Entertainment**
```env
# Spotify
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
```

### 7. **Authentication & Payments**
```env
# Auth0
AUTH0_SECRET=your_auth0_secret_here
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_CLIENT_ID=your_auth0_client_id_here
AUTH0_CLIENT_SECRET=your_auth0_client_secret_here

# Payments
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

### 8. **External Services**
```env
# E-SIM Services
AIRALO_AFFILIATE_LINK=your_airalo_affiliate_link_here
```

## 🚀 How to Get API Keys

### **Google Services**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable APIs:
   - Places API
   - Maps JavaScript API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the key to your domain

### **OpenAI**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up/Login
3. Go to API Keys section
4. Create new secret key

### **Google Gemini**
1. Go to [Google AI Studio](https://ai.google.dev/)
2. Sign in with Google account
3. Get API key from the dashboard

### **VRBO**
1. Contact VRBO for API access
2. Or use their affiliate program
3. Apply for developer access

### **Flight APIs**
1. **Skyscanner**: Sign up at [RapidAPI](https://rapidapi.com/skyscanner/api/skyscanner-api/)
2. **Amadeus**: Register at [Amadeus for Developers](https://developers.amadeus.com/)
3. **Kiwi**: Apply at [Kiwi.com for Developers](https://docs.kiwi.com/)

### **Weather APIs**
1. **OpenWeatherMap**: Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. **WeatherAPI**: Register at [WeatherAPI.com](https://www.weatherapi.com/)

### **Spotify**
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Create a new app
3. Get Client ID and Client Secret

### **Auth0**
1. Go to [Auth0](https://auth0.com/)
2. Create a new tenant
3. Create a new application
4. Configure callback URLs

### **Stripe**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get API keys from Developers section
3. Use test keys for development

## 📋 Setup Checklist

- [ ] Google Places API key
- [ ] Mapbox access token
- [ ] OpenAI API key
- [ ] VRBO API key (or affiliate link)
- [ ] Weather API key
- [ ] Google Translate API key
- [ ] Spotify Client ID & Secret
- [ ] Auth0 configuration
- [ ] Stripe API keys

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Restrict API keys** to specific domains/IPs
4. **Rotate keys regularly** for production
5. **Use different keys** for development and production

## 🚀 Deployment (Vercel)

After setting up your `.env.local` file:

1. **Push to GitHub**
2. **Deploy to Vercel**
3. **Add environment variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add each variable from your `.env.local`
4. **Redeploy** the application

## 💡 Tips

- Start with **Google Places API** for hotels (easiest to set up)
- Use **fallback data** during development
- Test with **free tier limits** first
- Monitor **API usage** to avoid unexpected charges

---

**Your app is ready to connect to real services! 🎉** 