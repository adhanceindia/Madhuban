import { getDb } from '@/db/client'
import { bookings, rooms } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getRedis } from '@/lib/redis'
import { sendBookingConfirmationEmail } from '@/lib/email'

export async function confirmBookingPayment(opts: {
  gateway_order_id: string
  gateway_payment_id: string
  gateway_name: string
}) {
  const db = getDb()

  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.gateway_order_id, opts.gateway_order_id))
    .limit(1)

  if (!booking) {
    console.error(`[payments] No booking found for gateway_order_id=${opts.gateway_order_id}`)
    return null
  }

  if (booking.payment_status === 'paid') {
    return booking
  }

  await db
    .update(bookings)
    .set({
      payment_status: 'paid',
      status: 'confirmed',
      gateway_payment_id: opts.gateway_payment_id,
    })
    .where(eq(bookings.id, booking.id))

  const redis = getRedis()
  if (redis) {
    try {
      const cacheKey = `avail:${booking.room_id}:${booking.check_in}:${booking.check_out}`
      await redis.del(cacheKey)
    } catch {
      // Non-critical
    }
  }

  try {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, booking.room_id)).limit(1)
    const roomName = room?.name || 'Room'

    const checkIn = booking.check_in
    const checkOut = booking.check_out
    const totalAmount = booking.total_amount || 0

    const nights = Math.max(
      1,
      Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000,
      ),
    )
    const subtotal = Math.round(totalAmount / 1.12)
    const gst = totalAmount - subtotal

    await sendBookingConfirmationEmail({
      booking_id: booking.id,
      guest_name: booking.guest_name,
      guest_email: booking.guest_email,
      guest_phone: booking.guest_phone,
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

export async function failBookingPayment(gateway_order_id: string) {
  const db = getDb()

  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.gateway_order_id, gateway_order_id))
    .limit(1)

  if (!booking) return null

  await db
    .update(bookings)
    .set({ payment_status: 'failed' })
    .where(eq(bookings.id, booking.id))

  return booking
}
