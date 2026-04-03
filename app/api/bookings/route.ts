import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'

import { redis } from '@/lib/redis'
import { sendBookingConfirmationEmail } from '@/lib/email'

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const bookingSchema = z.object({
  room_id: z.string().min(1, 'room_id is required'),
  guest_name: z.string().min(2, 'Name must be at least 2 characters'),
  guest_phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'),
  guest_email: z.string().email('Enter a valid email address'),
  check_in: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), 'Invalid check-in date'),
  check_out: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), 'Invalid check-out date'),
  guests_count: z.number().int().min(1, 'At least 1 guest required'),
  payment_method: z.literal('at_reception'),
})

// ---------------------------------------------------------------------------
// Rate limiting helper
// ---------------------------------------------------------------------------

async function isRateLimited(ip: string): Promise<boolean> {
  if (!redis) return false

  const key = `rl:bookings:${ip}`
  try {
    const count = await redis.incr(key)
    if (count === 1) {
      await redis.expire(key, 3600) // 1 hour window
    }
    return count > 10
  } catch {
    return false // fail open — don't block bookings if Redis is down
  }
}

// ---------------------------------------------------------------------------
// POST /api/bookings
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    if (await isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' },
        { status: 429 },
      )
    }

    // Parse & validate body
    const body = await request.json()
    const parsed = bookingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || 'Invalid input',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 },
      )
    }

    const {
      room_id,
      guest_name,
      guest_phone,
      guest_email,
      check_in,
      check_out,
      guests_count,
    } = parsed.data

    const payload = await getPayload({ config })

    // -------------------------------------------------------------------
    // Re-check availability server-side (never trust client)
    // -------------------------------------------------------------------
    const overlappingBookings = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          { room: { equals: room_id } },
          { status: { in: ['confirmed', 'pending'] } },
          { check_in: { less_than: check_out } },
          { check_out: { greater_than: check_in } },
        ],
      },
      limit: 1,
    })

    const blockedDates = await payload.find({
      collection: 'blocked-dates',
      where: {
        and: [
          { room: { equals: room_id } },
          { date: { greater_than_equal: check_in } },
          { date: { less_than: check_out } },
        ],
      },
      limit: 1,
    })

    if (overlappingBookings.docs.length > 0 || blockedDates.docs.length > 0) {
      return NextResponse.json(
        { error: 'Room not available for selected dates', code: 'UNAVAILABLE' },
        { status: 409 },
      )
    }

    // -------------------------------------------------------------------
    // Fetch room to get price and name
    // -------------------------------------------------------------------
    const room = await payload.findByID({
      collection: 'rooms',
      id: room_id,
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found', code: 'NOT_FOUND' },
        { status: 404 },
      )
    }

    const roomData = room as unknown as Record<string, unknown>
    const pricePerNight = (roomData.price_per_night as number) || 0
    const roomName = (roomData.name as string) || 'Room'

    // -------------------------------------------------------------------
    // Calculate total: nights x price + 12% GST
    // -------------------------------------------------------------------
    const checkInDate = new Date(check_in)
    const checkOutDate = new Date(check_out)
    const nights = Math.max(
      1,
      Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / 86400000),
    )
    const subtotal = pricePerNight * nights
    const gst = Math.round(subtotal * 0.12)
    const totalAmount = subtotal + gst

    // -------------------------------------------------------------------
    // Create booking via Payload Local API
    // -------------------------------------------------------------------
    const booking = await payload.create({
      collection: 'bookings',
      data: {
        room: room_id,
        guest_name,
        guest_phone,
        guest_email,
        check_in,
        check_out,
        guests_count,
        payment_method: 'at_reception',
        payment_status: 'pending',
        status: 'pending',
        source: 'website',
        total_amount: totalAmount,
      },
    })

    // -------------------------------------------------------------------
    // Invalidate Redis cache for this room's availability
    // -------------------------------------------------------------------
    if (redis) {
      try {
        // Delete any cached availability keys for this room
        // Since we can't easily pattern-delete in Upstash, we invalidate
        // the specific date range that was just booked
        const cacheKey = `avail:${room_id}:${check_in}:${check_out}`
        await redis.del(cacheKey)
      } catch {
        // Non-critical — cache will expire naturally
      }
    }

    // -------------------------------------------------------------------
    // Send confirmation email
    // -------------------------------------------------------------------
    try {
      await sendBookingConfirmationEmail({
        booking_id: booking.id,
        guest_name,
        guest_email,
        guest_phone,
        room_name: roomName,
        check_in,
        check_out,
        nights,
        subtotal,
        gst,
        total_amount: totalAmount,
        payment_method: 'at_reception',
      })
    } catch (emailError) {
      // Log but don't fail the booking — email is best-effort
      console.error('[api/bookings] Email send failed:', emailError)
    }

    // -------------------------------------------------------------------
    // Response
    // -------------------------------------------------------------------
    return NextResponse.json({
      success: true,
      booking_id: booking.id,
      total_amount: totalAmount,
      nights,
      room_name: roomName,
    })
  } catch (error) {
    console.error('[api/bookings] Error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
