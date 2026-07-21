import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDb } from '@/db/client'
import { bookings, blockedDates, rooms } from '@/db/schema'
import { and, eq, lt, gt, gte, inArray } from 'drizzle-orm'
import { getRedis } from '@/lib/redis'
import { invalidateRoomAvailability } from '@/lib/ical/cache'
import { resolveActiveGateway } from '@/lib/payments/resolve-gateway'

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

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    if (await isRateLimited(ip)) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          code: 'RATE_LIMITED',
        },
        { status: 429 },
      )
    }

    const body = await request.json()
    const parsed = orderSchema.safeParse(body)

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
    const roomIdNum = parseInt(room_id)
    const db = getDb()

    const overlapping = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.room_id, roomIdNum),
          inArray(bookings.status, ['confirmed', 'pending']),
          lt(bookings.check_in, check_out),
          gt(bookings.check_out, check_in),
        ),
      )
      .limit(1)

    const blocked = await db
      .select({ id: blockedDates.id })
      .from(blockedDates)
      .where(
        and(
          eq(blockedDates.room_id, roomIdNum),
          gte(blockedDates.date, check_in),
          lt(blockedDates.date, check_out),
        ),
      )
      .limit(1)

    if (overlapping.length > 0 || blocked.length > 0) {
      return NextResponse.json(
        { error: 'Room not available for selected dates', code: 'UNAVAILABLE' },
        { status: 409 },
      )
    }

    const [room] = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, roomIdNum))
      .limit(1)
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found', code: 'NOT_FOUND' },
        { status: 404 },
      )
    }

    const checkInDate = new Date(check_in)
    const checkOutDate = new Date(check_out)
    const nights = Math.max(
      1,
      Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / 86400000),
    )
    const subtotal = room.price_per_night * nights
    const gst = Math.round(subtotal * 0.12)
    const totalAmount = subtotal + gst

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

    const [booking] = await db
      .insert(bookings)
      .values({
        room_id: roomIdNum,
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
      })
      .returning()

    const siteUrl = new URL(request.url).origin

    let orderResult
    try {
      orderResult = await gateway.createOrder({
        booking_id: booking.id,
        amount_inr: totalAmount,
        room_name: room.name,
        guest_name,
        guest_email,
        guest_phone,
        site_url: siteUrl,
      })
    } catch {
      await db.delete(bookings).where(eq(bookings.id, booking.id))
      return NextResponse.json(
        {
          error: 'Failed to create payment order. Please try again.',
          code: 'GATEWAY_ERROR',
        },
        { status: 502 },
      )
    }

    await db
      .update(bookings)
      .set({ gateway_order_id: orderResult.gateway_order_id })
      .where(eq(bookings.id, booking.id))

    // Invalidate every overlapping cached availability query for this room.
    await invalidateRoomAvailability(roomIdNum)

    return NextResponse.json({
      success: true,
      booking_id: booking.id,
      total_amount: totalAmount,
      nights,
      room_name: room.name,
      gateway: gateway.name,
      gateway_type: orderResult.type,
      ...(orderResult.type === 'js-checkout'
        ? { checkout_data: orderResult.checkout_data }
        : { redirect_url: orderResult.redirect_url }),
    })
  } catch (error) {
    console.error('[api/payments/order] Error:', error)
    return NextResponse.json(
      {
        error: 'Something went wrong. Please try again.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 },
    )
  }
}
