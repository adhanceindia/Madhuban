import { Redis } from '@upstash/redis'

// ---------------------------------------------------------------------------
// Upstash Redis client — graceful fallback for local dev without credentials
// ---------------------------------------------------------------------------

function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    console.warn(
      '[redis] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set — caching disabled',
    )
    return null
  }

  return new Redis({ url, token })
}

export const redis = createRedisClient()
