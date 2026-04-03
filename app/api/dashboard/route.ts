import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// ---------------------------------------------------------------------------
// GET /api/dashboard?start=YYYY-MM-DD&end=YYYY-MM-DD
// Returns aggregated metrics for the admin dashboard
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const { searchParams } = request.nextUrl
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const startDate = searchParams.get('start') || formatDate(startOfMonth)
    const endDate = searchParams.get('end') || formatDate(endOfMonth)
    const today = formatDate(now)

    // Calculate previous period of equal length for trend comparison
    const startMs = new Date(`${startDate}T00:00:00`).getTime()
    const endMs = new Date(`${endDate}T23:59:59`).getTime()
    const periodLength = endMs - startMs
    const prevEnd = new Date(startMs - 1)
    const prevStart = new Date(startMs - periodLength - 1)
    const prevStartDate = formatDate(prevStart)
    const prevEndDate = formatDate(prevEnd)

    // -------------------------------------------------------------------
    // 1. Total active rooms
    // -------------------------------------------------------------------
    const roomsResult = await payload.find({
      collection: 'rooms',
      where: { is_active: { equals: true } },
      limit: 100,
    })
    const totalRooms = roomsResult.totalDocs

    // -------------------------------------------------------------------
    // 2. All bookings in current date range
    // -------------------------------------------------------------------
    const bookingsInRange = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          { createdAt: { greater_than_equal: `${startDate}T00:00:00` } },
          { createdAt: { less_than_equal: `${endDate}T23:59:59` } },
        ],
      },
      limit: 1000,
      sort: '-createdAt',
    })

    const allBookings = bookingsInRange.docs as unknown as BookingDoc[]

    // -------------------------------------------------------------------
    // 3. Previous period bookings (for trend comparison)
    // -------------------------------------------------------------------
    const prevBookingsInRange = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          { createdAt: { greater_than_equal: `${prevStartDate}T00:00:00` } },
          { createdAt: { less_than_equal: `${prevEndDate}T23:59:59` } },
        ],
      },
      limit: 1000,
    })

    const prevBookings = prevBookingsInRange.docs as unknown as BookingDoc[]

    // Current period metrics
    const paidBookings = allBookings.filter((b) => b.payment_status === 'paid')
    const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
    const onlineRevenue = paidBookings
      .filter((b) => b.payment_method === 'online')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0)
    const receptionRevenue = paidBookings
      .filter((b) => b.payment_method === 'at_reception')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0)

    const totalBookings = allBookings.length
    const confirmedBookings = allBookings.filter((b) => b.status === 'confirmed').length
    const pendingBookings = allBookings.filter((b) => b.status === 'pending').length
    const cancelledBookings = allBookings.filter((b) => b.status === 'cancelled').length

    // Previous period metrics
    const prevPaidBookings = prevBookings.filter((b) => b.payment_status === 'paid')
    const prevTotalRevenue = prevPaidBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
    const prevTotalBookings = prevBookings.length

    // -------------------------------------------------------------------
    // 4. Today's check-ins and check-outs
    // -------------------------------------------------------------------
    const todayCheckIns = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          { check_in: { greater_than_equal: `${today}T00:00:00` } },
          { check_in: { less_than_equal: `${today}T23:59:59` } },
          { status: { in: ['confirmed', 'pending'] } },
        ],
      },
      limit: 100,
    })

    const todayCheckOuts = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          { check_out: { greater_than_equal: `${today}T00:00:00` } },
          { check_out: { less_than_equal: `${today}T23:59:59` } },
          { status: { in: ['confirmed', 'pending'] } },
        ],
      },
      limit: 100,
    })

    // -------------------------------------------------------------------
    // 5. Currently booked rooms (today)
    // -------------------------------------------------------------------
    const currentlyOccupied = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          { check_in: { less_than_equal: `${today}T23:59:59` } },
          { check_out: { greater_than: `${today}T00:00:00` } },
          { status: { in: ['confirmed', 'pending'] } },
        ],
      },
      limit: 100,
    })

    const bookedRoomIds = new Set(
      currentlyOccupied.docs.map((b) => {
        const doc = b as unknown as BookingDoc
        return typeof doc.room === 'object' && doc.room !== null
          ? (doc.room as { id: string | number }).id
          : doc.room
      }),
    )
    const bookedRoomsToday = bookedRoomIds.size
    const availableRoomsToday = Math.max(0, totalRooms - bookedRoomsToday)

    const occupancyRate =
      totalRooms > 0
        ? Math.round((bookedRoomsToday / totalRooms) * 100)
        : 0

    // Previous occupancy (yesterday for comparison)
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = formatDate(yesterday)

    const yesterdayOccupied = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          { check_in: { less_than_equal: `${yesterdayStr}T23:59:59` } },
          { check_out: { greater_than: `${yesterdayStr}T00:00:00` } },
          { status: { in: ['confirmed', 'pending'] } },
        ],
      },
      limit: 100,
    })

    const prevBookedRoomIds = new Set(
      yesterdayOccupied.docs.map((b) => {
        const doc = b as unknown as BookingDoc
        return typeof doc.room === 'object' && doc.room !== null
          ? (doc.room as { id: string | number }).id
          : doc.room
      }),
    )
    const prevOccupancyRate =
      totalRooms > 0
        ? Math.round((prevBookedRoomIds.size / totalRooms) * 100)
        : 0

    // -------------------------------------------------------------------
    // 6. Pending inquiries
    // -------------------------------------------------------------------
    const pendingInquiries = await payload.find({
      collection: 'inquiries',
      where: { status: { equals: 'new' } },
      limit: 0,
    })

    // -------------------------------------------------------------------
    // 7. Upcoming check-ins (next 7 days)
    // -------------------------------------------------------------------
    const next7Days = formatDate(
      new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    )

    const upcomingCheckIns = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          { check_in: { greater_than: `${today}T23:59:59` } },
          { check_in: { less_than_equal: `${next7Days}T23:59:59` } },
          { status: { in: ['confirmed', 'pending'] } },
        ],
      },
      limit: 20,
      sort: 'check_in',
    })

    // -------------------------------------------------------------------
    // 8. Recent bookings (last 10)
    // -------------------------------------------------------------------
    const recentBookings = await payload.find({
      collection: 'bookings',
      limit: 10,
      sort: '-createdAt',
    })

    // -------------------------------------------------------------------
    // 9. Average booking value
    // -------------------------------------------------------------------
    const avgBookingValue =
      paidBookings.length > 0
        ? Math.round(totalRevenue / paidBookings.length)
        : 0

    // -------------------------------------------------------------------
    // 10. Weekly occupancy (next 7 days per room for calendar)
    // -------------------------------------------------------------------
    const next14Days = formatDate(
      new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    )

    const weekBookings = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          { check_in: { less_than_equal: `${next14Days}T23:59:59` } },
          { check_out: { greater_than_equal: `${today}T00:00:00` } },
          { status: { in: ['confirmed', 'pending'] } },
        ],
      },
      limit: 200,
    })

    const rooms = (roomsResult.docs as unknown as RoomDoc[]).map((r) => ({
      id: r.id,
      name: r.name || `Room ${r.id}`,
    }))

    const weekOccupancy = rooms.map((room) => {
      const days: Record<string, boolean> = {}
      for (let i = 0; i < 14; i++) {
        const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
        const dateStr = formatDate(d)
        const isBooked = (weekBookings.docs as unknown as BookingDoc[]).some((b) => {
          const roomId = typeof b.room === 'object' && b.room !== null
            ? (b.room as { id: string | number }).id
            : b.room
          const checkIn = b.check_in?.split('T')[0] || ''
          const checkOut = b.check_out?.split('T')[0] || ''
          return String(roomId) === String(room.id) && checkIn <= dateStr && checkOut > dateStr
        })
        days[dateStr] = isBooked
      }
      return { room_id: room.id, room_name: room.name, days }
    })

    // -------------------------------------------------------------------
    // Build response
    // -------------------------------------------------------------------
    return NextResponse.json({
      period: { start: startDate, end: endDate },
      prev_period: { start: prevStartDate, end: prevEndDate },
      today,

      // Snapshot
      total_rooms: totalRooms,
      booked_rooms_today: bookedRoomsToday,
      available_rooms_today: availableRoomsToday,
      occupancy_rate: occupancyRate,

      // Period metrics
      total_revenue: totalRevenue,
      online_revenue: onlineRevenue,
      reception_revenue: receptionRevenue,
      avg_booking_value: avgBookingValue,

      total_bookings: totalBookings,
      confirmed_bookings: confirmedBookings,
      pending_bookings: pendingBookings,
      cancelled_bookings: cancelledBookings,

      // Today
      today_check_ins: todayCheckIns.totalDocs,
      today_check_outs: todayCheckOuts.totalDocs,

      // Counts
      pending_inquiries: pendingInquiries.totalDocs,

      // Trends (previous period comparison)
      prev_total_revenue: prevTotalRevenue,
      prev_total_bookings: prevTotalBookings,
      prev_occupancy_rate: prevOccupancyRate,

      // Calendar
      week_occupancy: weekOccupancy,

      // Lists
      upcoming_check_ins: (
        upcomingCheckIns.docs as unknown as BookingDoc[]
      ).map(formatBookingSummary),

      recent_bookings: (
        recentBookings.docs as unknown as BookingDoc[]
      ).map(formatBookingSummary),
    })
  } catch (error) {
    console.error('[api/dashboard] Error:', error)
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type BookingDoc = {
  id: string | number
  guest_name?: string
  guest_phone?: string
  room?: { id: string | number; name?: string } | string | number
  check_in?: string
  check_out?: string
  total_amount?: number
  payment_status?: string
  payment_method?: string
  status?: string
  source?: string
  createdAt?: string
}

type RoomDoc = {
  id: string | number
  name?: string
  is_active?: boolean
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatBookingSummary(b: BookingDoc) {
  const roomName =
    typeof b.room === 'object' && b.room !== null
      ? b.room.name || 'Room'
      : 'Room'

  return {
    id: b.id,
    guest_name: b.guest_name || '',
    room_name: roomName,
    check_in: b.check_in?.split('T')[0] || '',
    check_out: b.check_out?.split('T')[0] || '',
    total_amount: b.total_amount || 0,
    status: b.status || '',
    payment_status: b.payment_status || '',
    source: b.source || '',
  }
}
