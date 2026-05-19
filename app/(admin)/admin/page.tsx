'use client'

import { useCallback, useEffect, useState } from 'react'
import { KPICards } from '@/components/admin/dashboard/kpi-cards'
import { OccupancyCalendar } from '@/components/admin/dashboard/occupancy-calendar'
import { RecentBookings } from '@/components/admin/dashboard/recent-bookings'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

type DashboardData = {
  total_revenue: number
  total_bookings: number
  occupancy_rate: number
  booked_rooms_today: number
  total_rooms: number
  confirmed_bookings: number
  pending_bookings: number
  week_occupancy: Array<{ room_id: number; room_name: string; days: Record<string, boolean> }>
  recent_bookings: Array<{
    id: number
    guest_name: string
    room_name: string
    check_in: string
    check_out: string
    total_amount: number
    status: string
    payment_status: string
    source: string
  }>
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getDefaultRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return { start: toISO(start), end: toISO(end) }
}

export default function DashboardPage() {
  const defaults = getDefaultRange()
  const [startDate, setStartDate] = useState(defaults.start)
  const [endDate, setEndDate] = useState(defaults.end)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (start: string, end: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard?start=${start}&end=${end}`)
      if (res.ok) setData(await res.json())
    } catch {
      // Ignore — keep previous data
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData(startDate, endDate) }, [fetchData, startDate, endDate])

  if (loading && !data) {
    return (
      <div className="max-w-[1200px]">
        <Skeleton className="h-6 w-36 mb-6" />
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => <Card key={i} className="p-5 h-[140px]"><Skeleton className="h-full" /></Card>)}
        </div>
        <Card className="p-5 h-[300px]"><Skeleton className="h-full" /></Card>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="max-w-[1200px]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground font-display">Dashboard</h1>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-border rounded-lg bg-white"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-border rounded-lg bg-white"
          />
        </div>
      </div>

      <KPICards data={data} />
      <div className="mb-6">
        <OccupancyCalendar data={data.week_occupancy} />
      </div>
      <RecentBookings data={data.recent_bookings} />
    </div>
  )
}
