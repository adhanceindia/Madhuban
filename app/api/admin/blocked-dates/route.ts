import { z } from 'zod'
import { apiHandler } from '@/lib/api-handler'
import { createManualBlock } from '@/db/queries/calendar'
import { checkRoomAvailability } from '@/db/queries/bookings-admin'

const schema = z.object({
  room_id: z.number().int().positive(),
  date: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date'),
})

export const POST = apiHandler({
  module: 'calendar',
  schema,
  audit: { action: 'blocked_date.created', entityType: 'blocked_date' },
  handler: async ({ body }) => {
    // Sanity: don't block a date that already has a booking
    const tomorrow = new Date(body.date + 'T00:00:00')
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    const avail = await checkRoomAvailability(body.room_id, body.date, tomorrowStr)
    if (!avail.available) {
      throw new Error(avail.reason || 'Date is not available to block')
    }

    const blocked = await createManualBlock(body.room_id, body.date)
    return { blocked }
  },
})
