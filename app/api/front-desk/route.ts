import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// ---------------------------------------------------------------------------
// GET /api/front-desk?start=YYYY-MM-DD&end=YYYY-MM-DD
// Returns rooms, bookings, and blocked dates for the Gantt timeline
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const { searchParams } = request.nextUrl
    const now = new Date()
    const startDate =
      searchParams.get('start') || now.toISOString().split('T')[0]
    const endDate =
      searchParams.get('end') ||
      new Date(now.getTime() + 30 * 86400000).toISOString().split('T')[0]

    // Fetch active rooms
    const roomsResult = await payload.find({
      collection: 'rooms',
      where: { is_active: { equals: true } },
      limit: 100,
      sort: 'name',
    })

    const rooms = roomsResult.docs.map((r: Record<string, unknown>) => ({
      id: r.id,
      name: r.name || '',
      type: r.type || 'standard',
      bed_type: r.bed_type || '',
      capacity: r.capacity || 2,
    }))

    // Fetch bookings in the date range (overlapping with start-end window)
    const bookingsResult = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          { check_in: { less_than_equal: endDate } },
          { check_out: { greater_than_equal: startDate } },
          {
            status: {
              in: ['confirmed', 'pending'],
            },
          },
        ],
      },
      limit: 500,
      sort: 'check_in',
      depth: 1, // populate room relation
    })

    const bookings = bookingsResult.docs.map((b: Record<string, unknown>) => {
      const room = b.room as Record<string, unknown> | string | null
      const roomId =
        typeof room === 'object' && room !== null ? room.id : room
      return {
        id: b.id,
        guest_name: b.guest_name || '',
        room_id: roomId,
        check_in: b.check_in || '',
        check_out: b.check_out || '',
        status: b.status || 'pending',
        payment_status: b.payment_status || 'pending',
        source: b.source || 'website',
      }
    })

    // Fetch blocked dates in the range
    const blockedResult = await payload.find({
      collection: 'blocked-dates',
      where: {
        and: [
          { date: { greater_than_equal: startDate } },
          { date: { less_than_equal: endDate } },
        ],
      },
      limit: 1000,
      depth: 1,
    })

    const blocked_dates = blockedResult.docs.map(
      (bd: Record<string, unknown>) => {
        const room = bd.room as Record<string, unknown> | string | null
        const roomId =
          typeof room === 'object' && room !== null ? room.id : room
        return {
          room_id: roomId,
          date: bd.date || '',
          source: bd.source || 'manual',
        }
      }
    )

    return NextResponse.json({ rooms, bookings, blocked_dates })
  } catch (error) {
    console.error('Front desk API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch front desk data' },
      { status: 500 }
    )
  }
}
