import { apiHandler } from '@/lib/api-handler'
import { getBookingDetail, updateBooking, checkRoomAvailability } from '@/db/queries/bookings-admin'
import { bookingUpdateSchema } from '@/lib/schemas/bookings'
import { logAudit } from '@/lib/audit'

export const GET = apiHandler<unknown, { id: string }>({
  module: 'bookings',
  handler: async ({ params }) => {
    const booking = await getBookingDetail(parseInt(params.id))
    if (!booking) throw new Error('Booking not found')
    return { booking }
  },
})

export const PATCH = apiHandler({
  module: 'bookings',
  schema: bookingUpdateSchema,
  handler: async ({ params, body, session }) => {
    const bookingId = parseInt((params as Record<string, string>).id)
    const existing = await getBookingDetail(bookingId)
    if (!existing) throw new Error('Booking not found')

    // Re-validate availability only if dates changed
    if ((body.check_in && body.check_in !== existing.check_in) || (body.check_out && body.check_out !== existing.check_out)) {
      const avail = await checkRoomAvailability(
        existing.room_id,
        body.check_in || existing.check_in,
        body.check_out || existing.check_out,
        bookingId,
      )
      if (!avail.available) throw new Error(avail.reason || 'Room unavailable for new dates')
    }

    const updated = await updateBooking(bookingId, body)
    await logAudit({
      user_id: session.id,
      action: 'booking.updated',
      entity_type: 'booking',
      entity_id: bookingId,
      old_value: existing as unknown as Record<string, unknown>,
      new_value: body as Record<string, unknown>,
    })

    return { booking: updated }
  },
})
