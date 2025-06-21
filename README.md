# TripPlanner 3D - AI-Powered Travel Planning App

A modern web application that uses AI to create personalized trip itineraries with interactive 3D maps and accommodation recommendations.

## Features

- 🤖 **AI-Powered Trip Planning**: Generate personalized itineraries from natural language prompts
- 🗺️ **Interactive 3D Maps**: Visualize your trip with Mapbox GL JS 3D maps
- 🏨 **Accommodation Integration**: Browse hotels and Airbnb options
- 📱 **Modern UI/UX**: Beautiful, responsive design with smooth animations
- ⚡ **Real-time Updates**: Dynamic trip planning and real-time map updates

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Maps**: Mapbox GL JS
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Mapbox account (free tier available)
- OpenAI API key (optional for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd trip-planner-3d
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Required for 3D maps
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
   
   # Optional: For AI trip planning
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Get API Keys**

   **Mapbox (Required for 3D maps):**
   - Sign up at [Mapbox](https://account.mapbox.com/)
   - Create a new access token
   - Add it to your `.env.local` file

   **OpenAI (Optional for AI features):**
   - Sign up at [OpenAI](https://platform.openai.com/)
   - Generate an API key
   - Add it to your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Describe Your Trip**: Enter a natural language description of your dream vacation
2. **Generate Plan**: Click "Generate Trip Plan" to create your personalized itinerary
3. **Explore 3D Map**: View your trip locations on an interactive 3D map
4. **Browse Accommodations**: Check out hotel and Airbnb recommendations
5. **Review Itinerary**: See your day-by-day schedule with activities and locations

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Header.tsx         # Navigation header
│   ├── TripPlanner.tsx    # Main trip planner
│   ├── TripMap.tsx        # 3D map component
│   ├── ItineraryView.tsx  # Itinerary display
│   └── AccommodationList.tsx # Accommodation options
├── public/               # Static assets
├── package.json          # Dependencies
├── tailwind.config.js    # Tailwind configuration
└── next.config.js        # Next.js configuration
```

## Customization

### Adding New Map Styles
Edit the map style in `components/TripMap.tsx`:
```typescript
style: 'mapbox://styles/mapbox/streets-v12' // Change to other styles
```

### Customizing Colors
Update the color scheme in `tailwind.config.js`:
```javascript
colors: {
  primary: {
    // Your custom colors
  }
}
```

### Adding More Accommodation APIs
Extend the accommodation integration in `components/AccommodationList.tsx` to include more booking platforms.

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Mapbox](https://mapbox.com/) for 3D mapping capabilities
- [OpenAI](https://openai.com/) for AI integration
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://framer.com/motion) for animations
- [Lucide](https://lucide.dev/) for beautiful icons

## Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/trip-planner-3d/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

Made with ❤️ for travelers and developers 