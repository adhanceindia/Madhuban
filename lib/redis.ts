import { Redis } from '@upstash/redis'

// ---------------------------------------------------------------------------
// Upstash Redis client — lazy singleton, only instantiated at request time
// ---------------------------------------------------------------------------

let _redis: Redis | null | undefined

export function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    console.warn(
      '[redis] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set — caching disabled',
    )
    _redis = null
    return null
  }

  _redis = new Redis({ url, token })
  return _redis
}
