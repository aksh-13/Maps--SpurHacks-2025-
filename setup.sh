#!/bin/bash

echo "🚀 Setting up TripPlanner 3D..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "🔧 Creating .env.local file..."
    cat > .env.local << EOF
# Mapbox Access Token (get from https://account.mapbox.com/)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here

# OpenAI API Key (for AI trip planning)
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Airbnb API (if you have access)
AIRBNB_API_KEY=your_airbnb_api_key_here

# Optional: Hotel API (e.g., Booking.com, Hotels.com)
HOTEL_API_KEY=your_hotel_api_key_here
EOF
    echo "✅ Created .env.local file"
    echo "⚠️  Please update .env.local with your API keys"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Get a Mapbox access token from https://account.mapbox.com/"
echo "2. Update .env.local with your API keys"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Check README.md for more detailed instructions" 