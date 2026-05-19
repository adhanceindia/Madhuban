import { getDb } from '@/db/client'
import { bookings, rooms, blockedDates, inquiries } from '@/db/schema'
import { eq, and, gte, lte, count } from 'drizzle-orm'

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function daysBetween(start: string, end: string): number {
  const s = new Date(start + 'T00:00:00').getTime()
  const e = new Date(end + 'T00:00:00').getTime()
  return Math.max(0, Math.round((e - s) / 86400000))
}

export async function getDashboardData(startDate: string, endDate: string) {
  const db = getDb()
  const today = new Date().toISOString().split('T')[0]

  const allRooms = await db.select().from(rooms).where(eq(rooms.is_active, true))
  const totalRooms = allRooms.length

  // Bookings in selected period (by creation OR by check-in falling in range)
  const periodBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        gte(bookings.check_in, startDate),
        lte(bookings.check_in, endDate),
      )
    )

  // Previous period (same length window before startDate)
  const periodDays = daysBetween(startDate, endDate) + 1
  const prevEnd = addDays(startDate, -1)
  const prevStart = addDays(prevEnd, -periodDays + 1)

  const prevPeriodBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        gte(bookings.check_in, prevStart),
        lte(bookings.check_in, prevEnd),
      )
    )

  // Today's bookings/check-in/out
  const activeToday = periodBookings.filter(
    (b) => b.check_in <= today && b.check_out > today && b.status !== 'cancelled'
  )

  const todayCheckIns = periodBookings.filter(
    (b) => b.check_in === today && b.status !== 'cancelled'
  ).length

  const todayCheckOuts = periodBookings.filter(
    (b) => b.check_out === today && b.status !== 'cancelled'
  ).length

  // Today's blocked rooms (manual / iCal)
  const todayBlocked = await db
    .select({ room_id: blockedDates.room_id })
    .from(blockedDates)
    .where(eq(blockedDates.date, today))

  const occupiedToday = activeToday.length
  const blockedToday = new Set(todayBlocked.map((b) => b.room_id)).size
  const availableToday = Math.max(0, totalRooms - occupiedToday - blockedToday)

  // Status counts
  const confirmed = periodBookings.filter((b) => b.status === 'confirmed').length
  const pending = periodBookings.filter((b) => b.status === 'pending').length
  const cancelled = periodBookings.filter((b) => b.status === 'cancelled').length

  // Revenue
  const paid = periodBookings.filter((b) => b.payment_status === 'paid')
  const totalRevenue = paid.reduce((sum, b) => sum + (b.total_amount || 0), 0)
  const prevPaid = prevPeriodBookings.filter((b) => b.payment_status === 'paid')
  const prevTotalRevenue = prevPaid.reduce((sum, b) => sum + (b.total_amount || 0), 0)

  // Revenue series (daily, grouped by check_in date)
  const revenueByDate = new Map<string, number>()
  for (let i = 0; i < periodDays; i++) {
    revenueByDate.set(addDays(startDate, i), 0)
  }
  for (const b of paid) {
    const date = b.check_in
    if (revenueByDate.has(date)) {
      revenueByDate.set(date, (revenueByDate.get(date) || 0) + (b.total_amount || 0))
    }
  }
  const revenueSeries = Array.from(revenueByDate.entries()).map(([date, revenue]) => ({
    date,
    revenue,
  }))

  // Bookings by source
  const sourceCounts: Record<string, number> = { website: 0, booking_com: 0, mmt: 0, manual: 0 }
  for (const b of periodBookings) {
    if (b.status === 'cancelled') continue
    const src = b.source || 'website'
    if (src in sourceCounts) sourceCounts[src] += 1
  }
  const sources = [
    { label: 'Website', count: sourceCounts.website, color: '#d6ed5e' },
    { label: 'Booking.com', count: sourceCounts.booking_com, color: '#c8d9b0' },
    { label: 'MakeMyTrip', count: sourceCounts.mmt, color: '#ba7517' },
    { label: 'Manual', count: sourceCounts.manual, color: '#e5e9d8' },
  ]
  const totalSourced = sources.reduce((s, x) => s + x.count, 0)

  // Pending inquiries
  const pendingInquiriesRow = await db
    .select({ count: count() })
    .from(inquiries)
    .where(eq(inquiries.status, 'new'))

  // Recent bookings (last 8)
  const recentBookings = [...periodBookings]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)
    .map((b) => {
      const room = allRooms.find((r) => r.id === b.room_id)
      return {
        id: b.id,
        guest_name: b.guest_name,
        room_name: room?.name || 'Unknown',
        check_in: b.check_in,
        check_out: b.check_out,
        total_amount: b.total_amount || 0,
        status: b.status,
        payment_status: b.payment_status,
        source: b.source,
      }
    })

  // Upcoming check-ins (next 7 days)
  const upcomingCheckIns = [...periodBookings]
    .filter((b) => b.check_in >= today && b.check_in <= addDays(today, 7) && b.status !== 'cancelled')
    .sort((a, b) => a.check_in.localeCompare(b.check_in))
    .slice(0, 8)
    .map((b) => {
      const room = allRooms.find((r) => r.id === b.room_id)
      return {
        id: b.id,
        guest_name: b.guest_name,
        room_name: room?.name || 'Unknown',
        check_in: b.check_in,
        check_out: b.check_out,
        total_amount: b.total_amount || 0,
        status: b.status,
        payment_status: b.payment_status,
        source: b.source,
      }
    })

  return {
    today,
    total_rooms: totalRooms,
    occupied_today: occupiedToday,
    blocked_today: blockedToday,
    available_today: availableToday,
    occupancy_rate: totalRooms > 0 ? Math.round((occupiedToday / totalRooms) * 100) : 0,

    total_revenue: totalRevenue,
    prev_total_revenue: prevTotalRevenue,
    revenue_series: revenueSeries,

    total_bookings: periodBookings.length,
    prev_total_bookings: prevPeriodBookings.length,
    confirmed_bookings: confirmed,
    pending_bookings: pending,
    cancelled_bookings: cancelled,

    today_check_ins: todayCheckIns,
    today_check_outs: todayCheckOuts,
    pending_inquiries: pendingInquiriesRow[0]?.count || 0,

    sources,
    sources_total: totalSourced,

    recent_bookings: recentBookings,
    upcoming_check_ins: upcomingCheckIns,
  }
}
