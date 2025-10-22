import { EnphaseAPI } from './enphase'

/**
 * Creates an EnphaseAPI instance with all required credentials from environment variables
 */
export function createEnphaseAPI(): EnphaseAPI {
  return new EnphaseAPI(
    process.env.ENPHASE_API_KEY!,
    process.env.ENPHASE_ACCESS_TOKEN!,
    process.env.ENPHASE_REFRESH_TOKEN!,
    process.env.ENPHASE_CLIENT_ID!,
    process.env.ENPHASE_CLIENT_SECRET!
  )
}
