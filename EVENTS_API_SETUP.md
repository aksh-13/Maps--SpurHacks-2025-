# Live Events API Setup

## Overview
The live events feature fetches real event data from the Ticketmaster Discovery API, which provides access to over 230,000+ events across multiple countries including the US, Canada, and more.

## Setup Instructions

### 1. Get a Ticketmaster API Key
1. Visit the [Ticketmaster Developer Portal](https://developer.ticketmaster.com/)
2. Create an account or sign in
3. Create a new app to get your API key
4. Copy your Consumer Key (this is your API key)

### 2. Add API Key to Environment Variables
Add the following line to your `.env.local` file:

```
TICKETMASTER_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual Ticketmaster API key.

### 3. API Rate Limits
- Default quota: 5,000 API calls per day
- Rate limitation: 5 requests per second
- Deep paging support up to 1,000 items

## Fallback Behavior
If no API key is provided, the system will automatically fall back to sample events to ensure the feature continues to work during development and testing.

## Supported Cities
The API includes mapping for major cities including:
- Toronto
- New York
- Los Angeles
- Chicago
- Philadelphia
- Dallas
- San Francisco
- Boston
- Atlanta
- Washington DC
- Houston
- Detroit
- Phoenix
- Seattle
- Miami
- Denver
- And many more...

## Event Categories
Events are automatically categorized into:
- **Music**: Concerts, festivals, live performances
- **Sports**: Games, matches, tournaments
- **Culture**: Theatre, arts, cultural events
- **Entertainment**: Comedy, family shows, miscellaneous events
- **Art**: Gallery openings, art exhibitions

## API Endpoints
- **GET /api/events**: Fetch events for a city
  - Query parameters:
    - `city`: City name (default: Toronto)
    - `category`: Event category filter (optional)

## Example Usage
```javascript
// Fetch all events in Toronto
const response = await fetch('/api/events?city=Toronto')

// Fetch only music events in New York
const response = await fetch('/api/events?city=New York&category=music')
```

## Troubleshooting
1. **No events showing**: Check if your API key is correctly set in `.env.local`
2. **API errors**: Verify your API key is valid and hasn't exceeded rate limits
3. **Fallback events only**: This indicates the API key is missing or invalid

## Development Notes
- The API automatically filters events to show only current and future events
- Event images are optimized for 16:9 aspect ratio when available
- Venue coordinates are included when available for map integration
- Price ranges are formatted for display consistency
