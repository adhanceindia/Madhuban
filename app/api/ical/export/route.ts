import { NextRequest } from 'next/server'
import { getDb } from '@/db/client'
import { bookings } from '@/db/schema'
import { and, eq, inArray } from 'drizzle-orm'
import ical, { ICalCalendarMethod } from 'ical-generator'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (
    !process.env.ICAL_EXPORT_TOKEN ||
    token !== process.env.ICAL_EXPORT_TOKEN
  ) {
    return new Response('Not found', { status: 404 })
  }

  try {
    const db = getDb()
    const { searchParams } = request.nextUrl
    const roomId = searchParams.get('room_id')

    // Both confirmed and pending bookings occupy inventory (matches the
    // conflict-detection logic), so both are pushed to the OTAs.
    const conditions = [inArray(bookings.status, ['confirmed', 'pending'])]
    if (roomId) {
      conditions.push(eq(bookings.room_id, parseInt(roomId)))
    }

    const rows = await db
      .select()
      .from(bookings)
      .where(and(...conditions))
      .limit(1000)

    const calendar = ical({
      name: 'Madhuban Garden Resort',
      method: ICalCalendarMethod.PUBLISH,
      prodId: { company: 'Madhuban Garden Resort', product: 'Bookings' },
    })

    for (const booking of rows) {
      if (!booking.check_in || !booking.check_out) continue

      calendar.createEvent({
        start: new Date(booking.check_in),
        end: new Date(booking.check_out),
        summary: 'Booked',
        id: `${booking.id}@madhubangarden.com`,
        stamp: new Date(booking.created_at),
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
