import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import config from '@payload-config'
import ical, { ICalCalendarMethod } from 'ical-generator'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = request.nextUrl
    const roomId = searchParams.get('room_id')

    // Build query for confirmed bookings
    const where: Where = {
      status: { equals: 'confirmed' },
    }

    if (roomId) {
      where.room = { equals: roomId }
    }

    const bookings = await payload.find({
      collection: 'bookings',
      where,
      limit: 1000,
      depth: 0,
    })

    // Generate iCal feed
    const calendar = ical({
      name: 'Madhuban Garden Resort',
      method: ICalCalendarMethod.PUBLISH,
      prodId: { company: 'Madhuban Garden Resort', product: 'Bookings' },
    })

    for (const booking of bookings.docs) {
      if (!booking.check_in || !booking.check_out) continue

      calendar.createEvent({
        start: new Date(booking.check_in),
        end: new Date(booking.check_out),
        summary: 'Booked',
        id: `${booking.id}@madhubangarden.com`,
        stamp: new Date(booking.createdAt),
      })
    }

    return new Response(calendar.toString(), {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="madhuban-bookings.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('[ical/export] Error generating iCal feed:', error)
    return Response.json(
      { error: 'Failed to generate calendar feed', code: 'ICAL_EXPORT_ERROR' },
      { status: 500 },
    )
  }
}
