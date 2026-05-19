import { getDb } from '@/db/client'
import { bookings, rooms, blockedDates, inquiries } from '@/db/schema'
import { eq, and, gte, lte, count } from 'drizzle-orm'

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export async function getDashboardData(startDate: string, endDate: string) {
  const db = getDb()
  const today = new Date().toISOString().split('T')[0]

  const allRooms = await db.select().from(rooms).where(eq(rooms.is_active, true))
  const totalRooms = allRooms.length

  const periodBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        gte(bookings.check_in, startDate),
        lte(bookings.check_in, endDate),
      )
    )

  const todayBookings = periodBookings.filter(
    (b) => b.check_in <= today && b.check_out > today && b.status !== 'cancelled'
  )

  const confirmedBookings = periodBookings.filter((b) => b.status === 'confirmed')
  const pendingBookings = periodBookings.filter((b) => b.status === 'pending')
  const cancelledBookings = periodBookings.filter((b) => b.status === 'cancelled')

  const paidBookings = periodBookings.filter((b) => b.payment_status === 'paid')
  const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
  const onlineRevenue = paidBookings
    .filter((b) => b.payment_method === 'online')
    .reduce((sum, b) => sum + (b.total_amount || 0), 0)
  const receptionRevenue = totalRevenue - onlineRevenue

  const todayCheckIns = periodBookings.filter(
    (b) => b.check_in === today && b.status !== 'cancelled'
  ).length
  const todayCheckOuts = periodBookings.filter(
    (b) => b.check_out === today && b.status !== 'cancelled'
  ).length

  const pendingInquiries = await db
    .select({ count: count() })
    .from(inquiries)
    .where(eq(inquiries.status, 'new'))

  const recentBookings = periodBookings
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
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

  const upcomingCheckIns = periodBookings
    .filter((b) => b.check_in >= today && b.check_in <= addDays(today, 7) && b.status !== 'cancelled')
    .sort((a, b) => a.check_in.localeCompare(b.check_in))
    .slice(0, 10)
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

  const weekDates = Array.from({ length: 14 }, (_, i) => addDays(today, i))
  const weekBlockedDates = await db
    .select()
    .from(blockedDates)
    .where(
      and(
        gte(blockedDates.date, today),
        lte(blockedDates.date, addDays(today, 13)),
      )
    )

  const weekOccupancy = allRooms.map((room) => {
    const days: Record<string, boolean> = {}
    for (const d of weekDates) {
      const isBooked = periodBookings.some(
        (b) => b.room_id === room.id && b.check_in <= d && b.check_out > d && b.status !== 'cancelled'
      )
      const isBlocked = weekBlockedDates.some(
        (bd) => bd.room_id === room.id && bd.date === d
      )
      days[d] = isBooked || isBlocked
    }
    return { room_id: room.id, room_name: room.name, days }
  })

  return {
    today,
    total_rooms: totalRooms,
    booked_rooms_today: todayBookings.length,
    available_rooms_today: totalRooms - todayBookings.length,
    occupancy_rate: totalRooms > 0 ? Math.round((todayBookings.length / totalRooms) * 100) : 0,
    total_revenue: totalRevenue,
    online_revenue: onlineRevenue,
    reception_revenue: receptionRevenue,
    avg_booking_value: paidBookings.length > 0 ? Math.round(totalRevenue / paidBookings.length) : 0,
    total_bookings: periodBookings.length,
    confirmed_bookings: confirmedBookings.length,
    pending_bookings: pendingBookings.length,
    cancelled_bookings: cancelledBookings.length,
    today_check_ins: todayCheckIns,
    today_check_outs: todayCheckOuts,
    pending_inquiries: pendingInquiries[0]?.count || 0,
    week_occupancy: weekOccupancy,
    upcoming_check_ins: upcomingCheckIns,
    recent_bookings: recentBookings,
  }
}
