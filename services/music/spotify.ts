export interface SpotifyTrack {
  id: string
  name: string
  artist: string
  album: string
  duration: number
  previewUrl?: string
  imageUrl?: string
  spotifyUrl: string
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  imageUrl?: string
  trackCount: number
  spotifyUrl: string
  tracks: SpotifyTrack[]
}

export interface PlaylistRecommendation {
  name: string
  description: string
  tracks: SpotifyTrack[]
  mood: string
  duration: string
}

export class SpotifyService {
  private clientId: string
  private clientSecret: string
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || ''
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || ''
    
    if (!this.clientId || !this.clientSecret) {
      console.warn('Spotify API credentials not found. Using fallback data.')
    }
  }

  private async getAccessToken(): Promise<string | null> {
    if (!this.clientId || !this.clientSecret) {
      return null
    }

    // Check if token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
        },
        body: 'grant_type=client_credentials'
      })

      if (!response.ok) {
        throw new Error('Failed to get Spotify access token')
      }

      const data = await response.json()
      this.accessToken = data.access_token
      this.tokenExpiry = Date.now() + (data.expires_in * 1000)

      return this.accessToken
    } catch (error) {
      console.error('Error getting Spotify access token:', error)
      return null
    }
  }

  async searchTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
    const token = await this.getAccessToken()
    if (!token) {
      return this.getFallbackTracks(query, limit)
    }

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Spotify search failed')
      }

      const data = await response.json()
      
      return data.tracks.items.map((track: any) => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        duration: track.duration_ms,
        previewUrl: track.preview_url,
        imageUrl: track.album.images[0]?.url,
        spotifyUrl: track.external_urls.spotify
      }))
    } catch (error) {
      console.error('Error searching tracks:', error)
      return this.getFallbackTracks(query, limit)
    }
  }

  async getPlaylistRecommendations(destination: string, duration: string, mood: string): Promise<PlaylistRecommendation[]> {
    const recommendations: PlaylistRecommendation[] = []

    // Generate different playlist types based on destination and mood
    const playlistTypes = this.generatePlaylistTypes(destination, mood)

    for (const type of playlistTypes) {
      const tracks = await this.searchTracks(type.searchQuery, 15)
      
      if (tracks.length > 0) {
        recommendations.push({
          name: type.name,
          description: type.description,
          tracks,
          mood: type.mood,
          duration: duration
        })
      }
    }

    return recommendations
  }

  private generatePlaylistTypes(destination: string, mood: string): Array<{
    name: string
    description: string
    searchQuery: string
    mood: string
  }> {
    const types = []

    // Destination-based playlists
    if (destination.toLowerCase().includes('paris')) {
      types.push({
        name: 'Parisian Vibes',
        description: 'Charming French music for your Paris adventure',
        searchQuery: 'french cafe music',
        mood: 'romantic'
      })
    } else if (destination.toLowerCase().includes('tokyo')) {
      types.push({
        name: 'Tokyo Nights',
        description: 'Japanese pop and electronic music',
        searchQuery: 'japanese pop',
        mood: 'energetic'
      })
    } else if (destination.toLowerCase().includes('new york')) {
      types.push({
        name: 'NYC Energy',
        description: 'High-energy tracks for the city that never sleeps',
        searchQuery: 'new york city energy',
        mood: 'energetic'
      })
    }

    // Mood-based playlists
    if (mood === 'relaxed') {
      types.push({
        name: 'Chill Vibes',
        description: 'Relaxing music for your peaceful journey',
        searchQuery: 'chill acoustic',
        mood: 'relaxed'
      })
    } else if (mood === 'adventure') {
      types.push({
        name: 'Adventure Anthems',
        description: 'Epic tracks for your adventurous spirit',
        searchQuery: 'epic adventure music',
        mood: 'adventure'
      })
    } else if (mood === 'romantic') {
      types.push({
        name: 'Romantic Journey',
        description: 'Love songs for your romantic getaway',
        searchQuery: 'romantic love songs',
        mood: 'romantic'
      })
    }

    // Universal travel playlists
    types.push({
      name: 'Road Trip Classics',
      description: 'Timeless hits perfect for any journey',
      searchQuery: 'road trip classics',
      mood: 'nostalgic'
    })

    types.push({
      name: 'Travel Essentials',
      description: 'Essential tracks for every traveler',
      searchQuery: 'travel music',
      mood: 'upbeat'
    })

    return types
  }

  async createPlaylist(name: string, description: string, trackIds: string[]): Promise<SpotifyPlaylist | null> {
    // Note: This would require user authentication with Spotify
    // For now, we'll return a mock playlist
    console.log('Creating playlist:', { name, description, trackIds })
    
    return {
      id: 'mock-playlist-id',
      name,
      description,
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300',
      trackCount: trackIds.length,
      spotifyUrl: 'https://open.spotify.com/playlist/mock',
      tracks: []
    }
  }

  async getGenreRecommendations(genres: string[]): Promise<SpotifyTrack[]> {
    const allTracks: SpotifyTrack[] = []
    
    for (const genre of genres) {
      const tracks = await this.searchTracks(genre, 5)
      allTracks.push(...tracks)
    }

    return allTracks
  }

  async getMoodBasedRecommendations(mood: string): Promise<SpotifyTrack[]> {
    const moodQueries = {
      'happy': 'upbeat happy music',
      'sad': 'melancholic music',
      'energetic': 'high energy music',
      'relaxed': 'chill relaxing music',
      'romantic': 'romantic love songs',
      'nostalgic': 'nostalgic classics',
      'adventure': 'epic adventure music'
    }

    const query = moodQueries[mood as keyof typeof moodQueries] || 'travel music'
    return this.searchTracks(query, 20)
  }

  private getFallbackTracks(query: string, limit: number): SpotifyTrack[] {
    const fallbackTracks: SpotifyTrack[] = [
      {
        id: '1',
        name: 'Bohemian Rhapsody',
        artist: 'Queen',
        album: 'A Night at the Opera',
        duration: 354000,
        spotifyUrl: 'https://open.spotify.com/track/3z8h0TU7ReDPLIbEnYhWZb',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300'
      },
      {
        id: '2',
        name: 'Hotel California',
        artist: 'Eagles',
        album: 'Hotel California',
        duration: 391000,
        spotifyUrl: 'https://open.spotify.com/track/40riOy7x9W7GXjyGp4pjAv',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300'
      },
      {
        id: '3',
        name: 'Imagine',
        artist: 'John Lennon',
        album: 'Imagine',
        duration: 183000,
        spotifyUrl: 'https://open.spotify.com/track/7pKfPomDEeI4TPT6EOYjn9',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300'
      },
      {
        id: '4',
        name: 'Wonderwall',
        artist: 'Oasis',
        album: '(What\'s the Story) Morning Glory?',
        duration: 258000,
        spotifyUrl: 'https://open.spotify.com/track/2CT3r93YuSHtm57mjxvjhH',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300'
      },
      {
        id: '5',
        name: 'Sweet Child O\' Mine',
        artist: 'Guns N\' Roses',
        album: 'Appetite for Destruction',
        duration: 356000,
        spotifyUrl: 'https://open.spotify.com/track/7o2CTH4ctstm8TNelqjb51',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300'
      }
    ]

    return fallbackTracks.slice(0, limit)
  }

  // Helper method to format duration
  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Get popular travel playlists
  getPopularTravelPlaylists(): PlaylistRecommendation[] {
    return [
      {
        name: 'Road Trip Essentials',
        description: 'The ultimate collection for any road trip',
        tracks: this.getFallbackTracks('road trip', 10),
        mood: 'upbeat',
        duration: '2h 30m'
      },
      {
        name: 'Chill Travel Vibes',
        description: 'Relaxing music for peaceful journeys',
        tracks: this.getFallbackTracks('chill', 10),
        mood: 'relaxed',
        duration: '1h 45m'
      },
      {
        name: 'Adventure Anthems',
        description: 'Epic tracks for adventurous spirits',
        tracks: this.getFallbackTracks('adventure', 10),
        mood: 'adventure',
        duration: '2h 15m'
      }
    ]
  }
}

export const spotifyService = new SpotifyService() 