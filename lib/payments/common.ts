import { getPayload } from 'payload'
import config from '@payload-config'

import { getRedis } from '@/lib/redis'
import { sendBookingConfirmationEmail } from '@/lib/email'

// ---------------------------------------------------------------------------
// Shared helper used by all webhook / callback handlers after payment
// confirmation. Updates booking → invalidates cache → sends email.
// ---------------------------------------------------------------------------

export async function confirmBookingPayment(opts: {
  gateway_order_id: string
  gateway_payment_id: string
  gateway_name: string
}) {
  const payload = await getPayload({ config })

  // Find booking by gateway_order_id
  const result = await payload.find({
    collection: 'bookings',
    where: { gateway_order_id: { equals: opts.gateway_order_id } },
    limit: 1,
  })

  const booking = result.docs[0] as unknown as Record<string, unknown> | undefined
  if (!booking) {
    console.error(`[payments] No booking found for gateway_order_id=${opts.gateway_order_id}`)
    return null
  }

  // Idempotency: skip if already confirmed
  if (booking.payment_status === 'paid') {
    return booking
  }

  // Update booking
  await payload.update({
    collection: 'bookings',
    id: booking.id as number,
    data: {
      payment_status: 'paid',
      status: 'confirmed',
      gateway_payment_id: opts.gateway_payment_id,
    },
  })

  // Invalidate Redis availability cache
  const redis = getRedis()
  if (redis) {
    try {
      const roomId =
        typeof booking.room === 'object' && booking.room !== null
          ? (booking.room as Record<string, unknown>).id
          : booking.room
      const cacheKey = `avail:${roomId}:${booking.check_in}:${booking.check_out}`
      await redis.del(cacheKey)
    } catch {
      // Non-critical
    }
  }

  // Send confirmation email
  try {
    const roomId =
      typeof booking.room === 'object' && booking.room !== null
        ? (booking.room as Record<string, unknown>).id
        : booking.room

    let roomName = 'Room'
    if (typeof booking.room === 'object' && booking.room !== null) {
      roomName = ((booking.room as Record<string, unknown>).name as string) || 'Room'
    } else {
      try {
        const room = await payload.findByID({ collection: 'rooms', id: roomId as string })
        roomName = (room as unknown as Record<string, unknown>).name as string || 'Room'
      } catch {
        // fallback
      }
    }

    const checkIn = (booking.check_in as string) || ''
    const checkOut = (booking.check_out as string) || ''
    const totalAmount = (booking.total_amount as number) || 0

    const nights = Math.max(
      1,
      Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000,
      ),
    )
    const subtotal = Math.round(totalAmount / 1.12)
    const gst = totalAmount - subtotal

    await sendBookingConfirmationEmail({
      booking_id: booking.id as number,
      guest_name: booking.guest_name as string,
      guest_email: booking.guest_email as string,
      guest_phone: booking.guest_phone as string,
      room_name: roomName,
      check_in: checkIn,
      check_out: checkOut,
      nights,
      subtotal,
      gst,
      total_amount: totalAmount,
      payment_method: 'online',
    })
  } catch (emailError) {
    console.error('[payments] Email send failed:', emailError)
  }

  return booking
}

// ---------------------------------------------------------------------------
// Mark a booking as failed
// ---------------------------------------------------------------------------

export async function failBookingPayment(gateway_order_id: string) {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'bookings',
    where: { gateway_order_id: { equals: gateway_order_id } },
    limit: 1,
  })

  const booking = result.docs[0]
  if (!booking) return null

  await payload.update({
    collection: 'bookings',
    id: booking.id as number,
    data: { payment_status: 'failed' },
  })

  return booking
}
