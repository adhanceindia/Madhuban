// lib/rate-limit.ts
import { getRedis } from '@/lib/redis'

export function clientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

/** Fixed-window/Sliding-window limiter. Returns true when the caller is OVER the limit. */
export async function isRateLimited(key: string, max: number, windowSec: number): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return false
  try {
    const p = redis.pipeline()
    p.incr(key)
    p.expire(key, windowSec) // Sliding window
    const [count] = await p.exec() as [number, number]
    return count > max
  } catch {
    return false
  }
}

/** Login lockout: returns true while locked. Call recordFailure on bad password. */
export async function isLockedOut(email: string): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return false
  try {
    const fails = await redis.get<number>(`login:fail:${email.toLowerCase()}`)
    return (fails ?? 0) >= 5
  } catch {
    return false
  }
}

export async function recordLoginFailure(email: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  try {
    const key = `login:fail:${email.toLowerCase()}`
    const p = redis.pipeline()
    p.incr(key)
    p.expire(key, 900) // 15-minute sliding window
    await p.exec()
  } catch {
    // Ignore
  }
}

export async function clearLoginFailures(email: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  try {
    await redis.del(`login:fail:${email.toLowerCase()}`)
  } catch {
    // Ignore
  }
}
