// Authentication Services
export { auth0Service, type UserProfile } from './auth/auth0'

// Accommodation Services
export { accommodationService, type AccommodationSearchParams, type UnifiedAccommodationResult } from './hotels/accommodation-service'
export { googleHotelsService } from './hotels/google-hotels'
export { vrboRentalsService } from './hotels/vrbo-rentals'

// Weather Services
export { weatherService } from './weather/weather'

// Translation Services
export { translationService } from './translation/translate'

// Transportation Services
export { flightService } from './transportation/flights'
export { esimService } from './transportation/esim'

// Music Services
export { spotifyService } from './music/spotify'

// Payment Services
export { stripeService } from './payments/stripe'

// Service Types
export type {
  FlightSearchParams,
  FlightResult,
  AirportInfo
} from './transportation/flights'

export type {
  ESIMPlan,
  ESIMRecommendation
} from './transportation/esim'

export type {
  SpotifyTrack,
  SpotifyPlaylist,
  PlaylistRecommendation
} from './music/spotify'

export type {
  PaymentIntent,
  BookingPayment,
  RefundRequest
} from './payments/stripe' 