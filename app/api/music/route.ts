import { NextRequest, NextResponse } from 'next/server'
import { spotifyService } from '@/services/music/spotify'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'search') {
      const query = searchParams.get('query')
      const limit = parseInt(searchParams.get('limit') || '20')

      if (!query) {
        return NextResponse.json(
          { error: 'Query parameter is required' },
          { status: 400 }
        )
      }

      const tracks = await spotifyService.searchTracks(query, limit)
      return NextResponse.json(tracks)
    }

    if (action === 'recommendations') {
      const destination = searchParams.get('destination')
      const duration = searchParams.get('duration') || '7 days'
      const mood = searchParams.get('mood') || 'upbeat'

      if (!destination) {
        return NextResponse.json(
          { error: 'Destination parameter is required' },
          { status: 400 }
        )
      }

      const recommendations = await spotifyService.getPlaylistRecommendations(destination, duration, mood)
      return NextResponse.json(recommendations)
    }

    if (action === 'popular') {
      const playlists = spotifyService.getPopularTravelPlaylists()
      return NextResponse.json(playlists)
    }

    if (action === 'mood') {
      const mood = searchParams.get('mood')
      if (!mood) {
        return NextResponse.json(
          { error: 'Mood parameter is required' },
          { status: 400 }
        )
      }

      const tracks = await spotifyService.getMoodBasedRecommendations(mood)
      return NextResponse.json(tracks)
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Music API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, trackIds } = body

    if (!name || !trackIds || !Array.isArray(trackIds)) {
      return NextResponse.json(
        { error: 'Name and trackIds array are required' },
        { status: 400 }
      )
    }

    const playlist = await spotifyService.createPlaylist(name, description, trackIds)
    return NextResponse.json(playlist)
  } catch (error) {
    console.error('Music API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 