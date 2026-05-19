import { z } from 'zod'
import { apiHandler } from '@/lib/api-handler'
import { getBookingDetail, updateBooking } from '@/db/queries/bookings-admin'
import { logAudit } from '@/lib/audit'

const schema = z.object({
  booking_id: z.number().int().positive(),
})

export const POST = apiHandler({
  module: 'front-desk',
  schema,
  handler: async ({ body, session }) => {
    const booking = await getBookingDetail(body.booking_id)
    if (!booking) throw new Error('Booking not found')
    if (booking.status === 'cancelled') throw new Error('Booking is cancelled')
    if (booking.status === 'confirmed') {
      // Already confirmed — idempotent
      return { booking, message: 'Already checked in' }
    }

    const updated = await updateBooking(body.booking_id, { status: 'confirmed' })

    await logAudit({
      user_id: session.id,
      action: 'booking.checked_in',
      entity_type: 'booking',
      entity_id: body.booking_id,
      old_value: { status: booking.status },
      new_value: { status: 'confirmed' },
    })

    return { booking: updated, message: 'Checked in' }
  },
})
