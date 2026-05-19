import { getDb } from '@/db/client'
import { bookings, rooms } from '@/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { addDays } from '@/lib/format'

export type AnalyticsData = {
  total_revenue: number
  total_bookings: number
  confirmed_bookings: number
  cancelled_bookings: number
  cancellation_rate: number
  avg_booking_value: number
  avg_stay_nights: number

  revenue_trend: { date: string; revenue: number }[]
  occupancy_trend: { date: string; rate: number }[]
  source_breakdown: { name: string; count: number; revenue: number }[]
  revenue_by_room_type: { type: string; revenue: number; bookings: number }[]

  monthly_comparison: {
    label: string
    current: { revenue: number; bookings: number; occupancy: number }
    previous: { revenue: number; bookings: number; occupancy: number }
  }[]
}

export async function getAnalyticsData(start: string, end: string): Promise<AnalyticsData> {
  const db = getDb()

  const periodBookings = await db
    .select()
    .from(bookings)
    .where(and(gte(bookings.check_in, start), lte(bookings.check_in, end)))

  const allRooms = await db.select().from(rooms).where(eq(rooms.is_active, true))
  const totalRooms = allRooms.length

  // KPIs
  const confirmed = periodBookings.filter((b) => b.status !== 'cancelled')
  const paid = periodBookings.filter((b) => b.payment_status === 'paid')
  const total_revenue = paid.reduce((s, b) => s + (b.total_amount || 0), 0)
  const cancelled = periodBookings.filter((b) => b.status === 'cancelled').length
  const total_bookings = periodBookings.length
  const confirmed_bookings = confirmed.length
  const cancellation_rate = total_bookings > 0 ? (cancelled / total_bookings) * 100 : 0
  const avg_booking_value = paid.length > 0 ? total_revenue / paid.length : 0

  const totalNights = confirmed.reduce((s, b) => {
    const nights = Math.max(
      1,
      Math.ceil(
        (new Date(b.check_out + 'T00:00:00').getTime() - new Date(b.check_in + 'T00:00:00').getTime()) /
          86400000,
      ),
    )
    return s + nights
  }, 0)
  const avg_stay_nights = confirmed.length > 0 ? totalNights / confirmed.length : 0

  // Revenue trend (daily)
  const revenueByDate = new Map<string, number>()
  let cur = start
  while (cur <= end) {
    revenueByDate.set(cur, 0)
    cur = addDays(cur, 1)
  }
  for (const b of paid) {
    if (revenueByDate.has(b.check_in)) {
      revenueByDate.set(b.check_in, (revenueByDate.get(b.check_in) || 0) + (b.total_amount || 0))
    }
  }
  const revenue_trend = Array.from(revenueByDate.entries()).map(([date, revenue]) => ({ date, revenue }))

  // Occupancy trend (daily % occupied)
  const occupancy_trend: { date: string; rate: number }[] = []
  cur = start
  while (cur <= end) {
    const occupiedToday = confirmed.filter((b) => b.check_in <= cur && b.check_out > cur).length
    const rate = totalRooms > 0 ? Math.round((occupiedToday / totalRooms) * 100) : 0
    occupancy_trend.push({ date: cur, rate })
    cur = addDays(cur, 1)
  }

  // Source breakdown
  const sourceMap = new Map<string, { count: number; revenue: number }>()
  for (const b of confirmed) {
    const src = b.source || 'manual'
    const entry = sourceMap.get(src) || { count: 0, revenue: 0 }
    entry.count += 1
    if (b.payment_status === 'paid') entry.revenue += b.total_amount || 0
    sourceMap.set(src, entry)
  }
  const source_breakdown = Array.from(sourceMap.entries()).map(([name, v]) => ({ name, ...v }))

  // Revenue by room type
  const typeMap = new Map<string, { revenue: number; bookings: number }>()
  for (const b of confirmed) {
    const room = allRooms.find((r) => r.id === b.room_id)
    if (!room) continue
    const entry = typeMap.get(room.type) || { revenue: 0, bookings: 0 }
    entry.bookings += 1
    if (b.payment_status === 'paid') entry.revenue += b.total_amount || 0
    typeMap.set(room.type, entry)
  }
  const revenue_by_room_type = Array.from(typeMap.entries()).map(([type, v]) => ({ type, ...v }))

  return {
    total_revenue,
    total_bookings,
    confirmed_bookings,
    cancelled_bookings: cancelled,
    cancellation_rate,
    avg_booking_value,
    avg_stay_nights,
    revenue_trend,
    occupancy_trend,
    source_breakdown,
    revenue_by_room_type,
    monthly_comparison: [],
  }
}
