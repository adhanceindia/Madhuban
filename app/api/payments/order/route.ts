import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'

import { getRedis } from '@/lib/redis'
import { resolveActiveGateway } from '@/lib/payments/resolve-gateway'

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const orderSchema = z.object({
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
})

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

async function isRateLimited(ip: string): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return false
  const key = `rl:payments:${ip}`
  try {
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, 3600)
    return count > 10
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// POST /api/payments/order
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // Rate limit
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

    // Parse & validate
    const body = await request.json()
    const parsed = orderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input', code: 'VALIDATION_ERROR' },
        { status: 400 },
      )
    }

    const { room_id, guest_name, guest_phone, guest_email, check_in, check_out, guests_count } =
      parsed.data

    const payload = await getPayload({ config })

    // -------------------------------------------------------------------
    // Re-check availability server-side
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
    // Fetch room
    // -------------------------------------------------------------------
    const room = await payload.findByID({ collection: 'rooms', id: room_id })
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
    // Calculate total
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
    // Resolve active payment gateway
    // -------------------------------------------------------------------
    let gateway
    try {
      gateway = await resolveActiveGateway()
    } catch (err) {
      return NextResponse.json(
        {
          error: (err as Error).message || 'Payment gateway is not configured',
          code: 'GATEWAY_ERROR',
        },
        { status: 503 },
      )
    }

    // -------------------------------------------------------------------
    // Create booking (pending)
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
        payment_method: 'online',
        payment_status: 'pending',
        status: 'pending',
        source: 'website',
        total_amount: totalAmount,
        gateway_used: gateway.name,
      },
    })

    // -------------------------------------------------------------------
    // Create gateway order
    // -------------------------------------------------------------------
    const siteUrl = new URL(request.url).origin

    let orderResult
    try {
      orderResult = await gateway.createOrder({
        booking_id: booking.id,
        amount_inr: totalAmount,
        room_name: roomName,
        guest_name,
        guest_email,
        guest_phone,
        site_url: siteUrl,
      })
    } catch {
      // Clean up the booking on gateway failure
      await payload.delete({ collection: 'bookings', id: booking.id as number })
      return NextResponse.json(
        {
          error: 'Failed to create payment order. Please try again.',
          code: 'GATEWAY_ERROR',
        },
        { status: 502 },
      )
    }

    // Update booking with gateway order ID
    await payload.update({
      collection: 'bookings',
      id: booking.id as number,
      data: { gateway_order_id: orderResult.gateway_order_id },
    })

    // Invalidate availability cache
    const redisClient = getRedis()
    if (redisClient) {
      try {
        await redisClient.del(`avail:${room_id}:${check_in}:${check_out}`)
      } catch { /* non-critical */ }
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
      gateway: gateway.name,
      gateway_type: orderResult.type,
      ...(orderResult.type === 'js-checkout'
        ? { checkout_data: orderResult.checkout_data }
        : { redirect_url: orderResult.redirect_url }),
    })
  } catch (error) {
    console.error('[api/payments/order] Error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
