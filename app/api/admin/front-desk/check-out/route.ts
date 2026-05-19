import { z } from 'zod'
import { apiHandler } from '@/lib/api-handler'
import { getBookingDetail, updateBooking } from '@/db/queries/bookings-admin'
import { logAudit } from '@/lib/audit'

const schema = z.object({
  booking_id: z.number().int().positive(),
  mark_paid: z.boolean().default(false),
})

export const POST = apiHandler({
  module: 'front-desk',
  schema,
  handler: async ({ body, session }) => {
    const booking = await getBookingDetail(body.booking_id)
    if (!booking) throw new Error('Booking not found')

    const updates: { status: 'confirmed' | 'pending' | 'cancelled'; payment_status?: 'paid' | 'pending' | 'failed' | 'refunded' } = {
      status: 'confirmed',
    }
    if (body.mark_paid && booking.payment_status !== 'paid') {
      updates.payment_status = 'paid'
    }

    const updated = await updateBooking(body.booking_id, updates)

    await logAudit({
      user_id: session.id,
      action: 'booking.checked_out',
      entity_type: 'booking',
      entity_id: body.booking_id,
      old_value: { payment_status: booking.payment_status },
      new_value: { checked_out: true, payment_status: updates.payment_status || booking.payment_status },
    })

    return { booking: updated, message: 'Checked out' }
  },
})
