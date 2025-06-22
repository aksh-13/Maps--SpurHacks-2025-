# TripPlanner 3D 🌍✈️

An AI-powered trip planning application built with Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, and Mapbox GL JS.

## 🚀 Features

- **Interactive 3D Maps**: Explore destinations with immersive 3D map visualization
- **AI Travel Assistant**: Chat with Gemini AI for personalized travel planning and recommendations
- **Smart Trip Planning**: Create personalized itineraries with intelligent recommendations
- **Accommodation Search**: Find hotels and vacation rentals with real-time availability
- **Weather Integration**: Get weather forecasts and packing recommendations
- **Translation Services**: Real-time translation and phrase books for international travel
- **Flight Search**: Search and compare flights from multiple providers
- **Music Recommendations**: AI-powered music playlists for your journey
- **eSIM Services**: Get connectivity solutions for international travel
- **Secure Payments**: Process payments securely with Stripe integration
- **User Authentication**: Secure user accounts with Supabase Auth
- **Responsive Design**: Beautiful UI that works on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Maps**: Mapbox GL JS
- **AI**: Google Gemini AI
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Weather**: OpenWeatherMap API
- **Translation**: Google Translate API
- **Flights**: Skyscanner, Amadeus, Kiwi APIs
- **Music**: Spotify API
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Mapbox access token
- Supabase project
- Various API keys (see Environment Variables section)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trip-planner-3d
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Maps
   MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
   
   # Authentication (Supabase)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # AI Assistant
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Weather
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   
   # Translation
   GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key_here
   
   # Flights
   SKYSCANNER_API_KEY=your_skyscanner_api_key_here
   AMADEUS_API_KEY=your_amadeus_api_key_here
   AMADEUS_CLIENT_SECRET=your_amadeus_client_secret_here
   KIWI_API_KEY=your_kiwi_api_key_here
   
   # Music
   SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
   
   # Payments
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   
   # Accommodation
   GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
   
   # Affiliate Links
   AIRALO_AFFILIATE_LINK=your_airalo_affiliate_link_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 API Keys Setup

### **Essential APIs (Free Tiers Available):**

**Mapbox (Maps):**
- Sign up at [Mapbox](https://www.mapbox.com/)
- Free tier: 50,000 map loads/month

**Supabase (Authentication & Database):**
- Sign up at [Supabase](https://supabase.com/)
- Free tier: 50,000 monthly active users, 500MB database

**Google Gemini AI (AI Assistant):**
- Sign up at [Google AI Studio](https://ai.google.dev/)
- Free tier: 15 requests per minute, 1,500 requests per day

**OpenWeatherMap (Weather):**
- Sign up at [OpenWeatherMap](https://openweathermap.org/)
- Free tier: 1,000 calls/day

**Google Cloud Translate (Translation):**
- Enable Google Cloud Translate API
- Free tier: 500,000 characters/month

**Stripe (Payments):**
- Sign up at [Stripe](https://stripe.com/)
- 2.9% + 30¢ per transaction

**Spotify (Music):**
- Create app at [Spotify Developer](https://developer.spotify.com/)
- Free for basic usage

### **Optional APIs:**

**Flight Search APIs:**
- [Skyscanner](https://rapidapi.com/skyscanner) - Free tier: 1,000 requests/month
- [Amadeus](https://developers.amadeus.com/) - Free tier: 1,000 API calls/month
- [Kiwi](https://tequila.kiwi.com/) - Free tier: 1,000 requests/month

**Google Places (Accommodation):**
- Enable Google Places API
- Free tier: 1,000 requests/day

## 🏗️ Project Structure

```
trip-planner-3d/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication routes
│   ├── globals.css        # Global styles
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Header.tsx         # Navigation header
│   ├── Auth.tsx           # Authentication component
│   ├── TripPlanner.tsx    # Main trip planning component
│   ├── Map3D.tsx          # 3D map component
│   ├── AccommodationList.tsx # Accommodation search
│   ├── Chatbot.tsx        # AI travel assistant
│   └── ServicesIntegration.tsx # Services dashboard
├── services/              # Service integrations
│   ├── auth/              # Authentication services
│   ├── ai/                # AI services (Gemini)
│   ├── hotels/            # Accommodation services
│   ├── weather/           # Weather services
│   ├── translation/       # Translation services
│   ├── transportation/    # Flight and eSIM services
│   ├── music/             # Music services
│   └── payments/          # Payment services
├── lib/                   # Utility libraries
│   └── supabase.ts        # Supabase client configuration
├── public/                # Static assets
└── package.json           # Dependencies
```

## 🎨 Key Components

### **Auth**
Handles user authentication with Supabase, including sign up, sign in, and social login.

### **TripPlanner**
The main component that handles trip planning logic, user input, and coordinates between different services.

### **Map3D**
Interactive 3D map component using Mapbox GL JS with custom controls and trip visualization.

### **AccommodationList**
Displays accommodation options with filtering, sorting, and booking capabilities.

### **Chatbot**
AI travel assistant component using Google Gemini AI.

### **ServicesIntegration**
Dashboard for monitoring and testing all integrated services.

## 🚀 Deployment

### **Vercel (Recommended)**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically

### **Environment Variables in Production**

Add all your environment variables in the Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add each variable from your `.env.local` file

## 🔧 Development

### **Available Scripts**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### **Code Style**

This project uses:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Tailwind CSS** for styling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for authentication and database
- [Mapbox](https://www.mapbox.com/) for 3D mapping capabilities
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Stripe](https://stripe.com/) for payment processing
- [OpenWeatherMap](https://openweathermap.org/) for weather data
- [Google Cloud](https://cloud.google.com/) for translation services
- [Spotify](https://developer.spotify.com/) for music integration

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the development team.

---

**Happy Traveling! ✈️🌍** 