import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDb } from '@/db/client'
import { bookings, blockedDates, rooms } from '@/db/schema'
import { and, eq, lt, gt, gte, inArray } from 'drizzle-orm'
import { getRedis } from '@/lib/redis'
import { clientIp, isRateLimited } from '@/lib/rate-limit'

const querySchema = z.object({
  room_id: z.string().min(1, 'room_id is required'),
  check_in: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid check_in date'),
  check_out: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid check_out date'),
}).refine(
  (data) => new Date(data.check_in) < new Date(data.check_out),
  { message: 'check_in must be before check_out', path: ['check_in'] },
).refine(
  (data) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(data.check_in) >= today
  },
  { message: 'check_in cannot be in the past', path: ['check_in'] },
)

export async function GET(request: NextRequest) {
  try {
    if (await isRateLimited(`rl:availability:${clientIp(request)}`, 60, 3600)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { searchParams } = request.nextUrl
    const raw = {
      room_id: searchParams.get('room_id') ?? '',
      check_in: searchParams.get('check_in') ?? '',
      check_out: searchParams.get('check_out') ?? '',
    }

    const parsed = querySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid parameters' },
        { status: 400 },
      )
    }

    const { room_id, check_in, check_out } = parsed.data
    const roomIdNum = parseInt(room_id)

    const cacheKey = `avail:${room_id}:${check_in}:${check_out}`
    const redis = getRedis()

    if (redis) {
      try {
        const cached = await redis.get<string>(cacheKey)
        if (cached) {
          const parsedCache = typeof cached === 'string' ? JSON.parse(cached) : cached
          return NextResponse.json({ ...parsedCache, cached: true })
        }
      } catch {
        // Cache miss — continue
      }
    }

    const db = getDb()

    const overlapping = await db
      .select({ check_in: bookings.check_in, check_out: bookings.check_out })
      .from(bookings)
      .where(
        and(
          eq(bookings.room_id, roomIdNum),
          inArray(bookings.status, ['confirmed', 'pending']),
          lt(bookings.check_in, check_out),
          gt(bookings.check_out, check_in),
        )
      )

    const blockedRows = await db
      .select({ date: blockedDates.date })
      .from(blockedDates)
      .where(
        and(
          eq(blockedDates.room_id, roomIdNum),
          gte(blockedDates.date, check_in),
          lt(blockedDates.date, check_out),
        )
      )

    const blocked = blockedRows.map((b) => typeof b.date === 'string' ? b.date : new Date(b.date).toISOString().split('T')[0])

    const [room] = await db.select({ price_per_night: rooms.price_per_night, quantity: rooms.quantity }).from(rooms).where(eq(rooms.id, roomIdNum)).limit(1)
    const pricePerNight = room?.price_per_night || 0
    const quantity = room?.quantity || 1

    const checkInDate = new Date(check_in)
    const checkOutDate = new Date(check_out)
    const nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / 86400000))

    let available = true
    for (let i = 0; i < nights; i++) {
      const d = new Date(checkInDate)
      d.setDate(d.getDate() + i)
      const dString = d.toISOString().split('T')[0]

      const blocksCount = blocked.filter(b => b === dString).length

      let overlapsCount = 0
      for (const b of overlapping) {
        const bCheckIn = typeof b.check_in === 'string' ? b.check_in : new Date(b.check_in).toISOString().split('T')[0]
        const bCheckOut = typeof b.check_out === 'string' ? b.check_out : new Date(b.check_out).toISOString().split('T')[0]
        if (dString >= bCheckIn && dString < bCheckOut) {
          overlapsCount++
        }
      }

      if (overlapsCount + blocksCount >= quantity) {
        available = false
        break
      }
    }

    const result = {
      available,
      blocked_dates: blocked,
      nights,
      price_per_night: pricePerNight,
    }

    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(result), { ex: 900 })
      } catch {
        // Cache write failure non-critical
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[api/availability] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
