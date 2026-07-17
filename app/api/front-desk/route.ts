import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/db/client'
import { rooms, bookings, blockedDates } from '@/db/schema'
import { and, eq, lte, gte, asc, inArray } from 'drizzle-orm'
import { getSession } from '@/lib/auth'
import { canAccess } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  const session = await getSession('admin')
  if (!session || !canAccess(session.role, 'front-desk')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const db = getDb()
    const { searchParams } = request.nextUrl
    const now = new Date()
    const startDate = searchParams.get('start') || now.toISOString().split('T')[0]
    const endDate = searchParams.get('end') || new Date(now.getTime() + 30 * 86400000).toISOString().split('T')[0]

    const allRooms = await db
      .select()
      .from(rooms)
      .where(eq(rooms.is_active, true))
      .orderBy(asc(rooms.name))
      .limit(100)

    const roomsOut = allRooms.map((r) => ({
      id: r.id,
      name: r.name || '',
      type: r.type || 'standard',
      bed_type: r.bed_type || '',
      capacity: r.capacity || 2,
    }))

    const bookingsRows = await db
      .select()
      .from(bookings)
      .where(and(
        lte(bookings.check_in, endDate),
        gte(bookings.check_out, startDate),
        inArray(bookings.status, ['confirmed', 'pending']),
      ))
      .orderBy(asc(bookings.check_in))
      .limit(500)

    const bookingsOut = bookingsRows.map((b) => ({
      id: b.id,
      guest_name: b.guest_name || '',
      room_id: b.room_id,
      check_in: b.check_in || '',
      check_out: b.check_out || '',
      status: b.status || 'pending',
      payment_status: b.payment_status || 'pending',
      source: b.source || 'website',
    }))

    const blockedRows = await db
      .select()
      .from(blockedDates)
      .where(and(
        gte(blockedDates.date, startDate),
        lte(blockedDates.date, endDate),
      ))
      .limit(1000)

    const blocked_dates = blockedRows.map((bd) => ({
      room_id: bd.room_id,
      date: bd.date || '',
      source: bd.source || 'manual',
    }))

    return NextResponse.json({ rooms: roomsOut, bookings: bookingsOut, blocked_dates })
  } catch (error) {
    console.error('Front desk API error:', error)
    return NextResponse.json({ error: 'Failed to fetch front desk data' }, { status: 500 })
  }
}
