import { apiHandler } from '@/lib/api-handler'
import {
  listBookings,
  createBookingAdmin,
  checkRoomAvailability,
} from '@/db/queries/bookings-admin'
import { bookingCreateSchema } from '@/lib/schemas/bookings'
import { nightsBetween } from '@/lib/format'
import { getDb } from '@/db/client'
import { rooms } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const GET = apiHandler({
  module: 'bookings',
  handler: async ({ searchParams }) => {
    const filters = {
      status: searchParams.get('status') || undefined,
      payment_status: searchParams.get('payment_status') || undefined,
      source: searchParams.get('source') || undefined,
      room_id: searchParams.get('room_id') ? parseInt(searchParams.get('room_id')!) : undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      search: searchParams.get('search') || undefined,
    }
    return { bookings: await listBookings(filters) }
  },
})

export const POST = apiHandler({
  module: 'bookings',
  schema: bookingCreateSchema,
  audit: { action: 'booking.created', entityType: 'booking' },
  handler: async ({ body }) => {
    // Server-side availability check
    const avail = await checkRoomAvailability(body.room_id, body.check_in, body.check_out)
    if (!avail.available) {
      throw new Error(avail.reason || 'Room is not available')
    }

    // Auto-calculate total if not provided
    let totalAmount = body.total_amount
    if (totalAmount === undefined) {
      const db = getDb()
      const [room] = await db
        .select({ price: rooms.price_per_night })
        .from(rooms)
        .where(eq(rooms.id, body.room_id))
        .limit(1)
      if (!room) throw new Error('Room not found')
      const nights = nightsBetween(body.check_in, body.check_out)
      const subtotal = room.price * nights
      const gst = Math.round(subtotal * 0.12)
      totalAmount = subtotal + gst
    }

    const booking = await createBookingAdmin({
      room_id: body.room_id,
      guest_name: body.guest_name,
      guest_phone: body.guest_phone,
      guest_email: body.guest_email,
      check_in: body.check_in,
      check_out: body.check_out,
      guests_count: body.guests_count,
      payment_method: body.payment_method,
      payment_status: body.payment_status,
      status: body.status,
      source: body.source,
      total_amount: totalAmount,
    })

    return { booking }
  },
})
