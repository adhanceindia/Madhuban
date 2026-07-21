import { getRedis } from '@/lib/redis'

/**
 * Availability-cache invalidation.
 *
 * `GET /api/availability` caches each `{room_id, check_in, check_out}` answer
 * for 900s under `avail:{room_id}:{check_in}:{check_out}`. A single booking
 * or block invalidates EVERY overlapping cached query for that room, not just
 * the one matching its exact date range — e.g. a booking 8/10→8/12 must also
 * invalidate a cached query for 8/09→8/13.
 *
 * The correct fix is a per-room prefix wipe. We use SCAN (not KEYS) so we
 * don't block the Redis event loop on large keyspaces. All Redis calls are
 * best-effort — a failed invalidation just means the cache TTL (15 min)
 * acts as the upper bound on staleness.
 */

/** Wipe every cached availability entry for one room. */
export async function invalidateRoomAvailability(
  roomId: number,
): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  try {
    await scanAndDelete(redis, `avail:${roomId}:*`)
  } catch (err) {
    console.warn(`[ical/cache] failed to invalidate room ${roomId}:`, err)
  }
}

/** Wipe every cached availability entry for every room. Use sparingly. */
export async function invalidateAllAvailability(): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  try {
    await scanAndDelete(redis, 'avail:*')
  } catch (err) {
    console.warn('[ical/cache] failed to invalidate all availability:', err)
  }
}

async function scanAndDelete(
  redis: NonNullable<ReturnType<typeof getRedis>>,
  pattern: string,
): Promise<void> {
  let cursor = '0'
  do {
    const [next, keys] = await redis.scan(cursor, {
      match: pattern,
      count: 200,
    })
    cursor = next
    if (keys.length > 0) {
      // Upstash Redis .del accepts a spread of string keys.
      await redis.del(...keys)
    }
  } while (cursor !== '0')
}
