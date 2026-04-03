import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'

import { redis } from '@/lib/redis'

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// GET /api/availability?room_id=&check_in=&check_out=
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const raw = {
      room_id: searchParams.get('room_id') ?? '',
      check_in: searchParams.get('check_in') ?? '',
      check_out: searchParams.get('check_out') ?? '',
    }

    // Validate
    const parsed = querySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid parameters' },
        { status: 400 },
      )
    }

    const { room_id, check_in, check_out } = parsed.data

    // -----------------------------------------------------------------------
    // Check Redis cache first
    // -----------------------------------------------------------------------
    const cacheKey = `avail:${room_id}:${check_in}:${check_out}`

    if (redis) {
      try {
        const cached = await redis.get<string>(cacheKey)
        if (cached) {
          const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached
          return NextResponse.json({ ...parsed, cached: true })
        }
      } catch {
        // Cache miss or error — continue to DB query
      }
    }

    // -----------------------------------------------------------------------
    // Query Payload — overlapping bookings
    // -----------------------------------------------------------------------
    const payload = await getPayload({ config })

    // Find bookings where:
    //   room = room_id
    //   AND status IN [confirmed, pending]
    //   AND check_in < requested check_out
    //   AND check_out > requested check_in
    const overlappingBookings = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          { room: { equals: room_id } },
          {
            status: {
              in: ['confirmed', 'pending'],
            },
          },
          { check_in: { less_than: check_out } },
          { check_out: { greater_than: check_in } },
        ],
      },
      limit: 1,
    })

    // -----------------------------------------------------------------------
    // Query Payload — blocked dates in range
    // -----------------------------------------------------------------------
    const blockedDatesResult = await payload.find({
      collection: 'blocked-dates',
      where: {
        and: [
          { room: { equals: room_id } },
          { date: { greater_than_equal: check_in } },
          { date: { less_than: check_out } },
        ],
      },
      limit: 100,
    })

    const blockedDates = blockedDatesResult.docs.map((doc) => {
      const d = doc as unknown as Record<string, unknown>
      const dateVal = d.date as string
      // Normalize to YYYY-MM-DD
      return dateVal ? dateVal.split('T')[0] : ''
    }).filter(Boolean)

    // -----------------------------------------------------------------------
    // Fetch room price
    // -----------------------------------------------------------------------
    let pricePerNight = 0
    try {
      const room = await payload.findByID({
        collection: 'rooms',
        id: room_id,
      })
      pricePerNight = (room as unknown as Record<string, unknown>).price_per_night as number || 0
    } catch {
      // Room not found — price stays 0
    }

    // -----------------------------------------------------------------------
    // Calculate nights
    // -----------------------------------------------------------------------
    const checkInDate = new Date(check_in)
    const checkOutDate = new Date(check_out)
    const nights = Math.max(1, Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / 86400000,
    ))

    // -----------------------------------------------------------------------
    // Build response
    // -----------------------------------------------------------------------
    const hasOverlapping = overlappingBookings.docs.length > 0
    const hasBlocked = blockedDates.length > 0
    const available = !hasOverlapping && !hasBlocked

    const result = {
      available,
      blocked_dates: blockedDates,
      nights,
      price_per_night: pricePerNight,
    }

    // -----------------------------------------------------------------------
    // Cache the result (15 min TTL)
    // -----------------------------------------------------------------------
    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(result), { ex: 900 })
      } catch {
        // Cache write failure is non-critical
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[api/availability] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
