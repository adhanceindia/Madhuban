'use client'

import { useCallback, useEffect, useState } from 'react'
import { CalendarRange } from 'lucide-react'

import { KPICards } from '@/components/admin/dashboard/kpi-cards'
import { OccupancyDonut } from '@/components/admin/dashboard/occupancy-donut'
import { RevenueChart } from '@/components/admin/dashboard/revenue-chart'
import { BookingsBySource } from '@/components/admin/dashboard/bookings-by-source'
import { RecentBookings } from '@/components/admin/dashboard/recent-bookings'

type SourceCount = { label: string; count: number; color: string }
type RevenuePoint = { date: string; revenue: number }
type BookingRow = {
  id: number
  guest_name: string
  room_name: string
  check_in: string
  check_out: string
  total_amount: number
  status: string
  payment_status: string
  source: string
}

type DashboardData = {
  total_revenue: number
  prev_total_revenue: number
  revenue_series: RevenuePoint[]
  total_bookings: number
  prev_total_bookings: number
  today_check_ins: number
  today_check_outs: number
  total_rooms: number
  occupied_today: number
  blocked_today: number
  available_today: number
  occupancy_rate: number
  confirmed_bookings: number
  pending_bookings: number
  cancelled_bookings: number
  pending_inquiries: number
  sources: SourceCount[]
  sources_total: number
  recent_bookings: BookingRow[]
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
      // ignore — keep prior data
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(startDate, endDate)
  }, [fetchData, startDate, endDate])

  function setPreset(preset: 'today' | 'week' | 'month' | 'quarter') {
    const now = new Date()
    let start: Date, end: Date
    if (preset === 'today') {
      start = end = now
    } else if (preset === 'week') {
      const day = now.getDay()
      start = new Date(now)
      start.setDate(now.getDate() - day)
      end = now
    } else if (preset === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    } else {
      const q = Math.floor(now.getMonth() / 3)
      start = new Date(now.getFullYear(), q * 3, 1)
      end = new Date(now.getFullYear(), q * 3 + 3, 0)
    }
    setStartDate(toISO(start))
    setEndDate(toISO(end))
  }

  return (
    <div className="font-admin max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {loading && !data ? 'Loading...' : 'Overview of resort operations'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Preset chips */}
          <div className="flex gap-0.5 bg-card rounded-lg p-1 border border-border">
            {(['today', 'week', 'month', 'quarter'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPreset(p)}
                className="px-3 py-1.5 text-[12px] font-medium rounded-md text-muted-foreground hover:text-foreground transition-colors capitalize"
              >
                {p}
              </button>
            ))}
          </div>
          {/* Date range chip */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-accent rounded-lg text-[12px] font-semibold text-foreground">
            <CalendarRange size={14} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none outline-none text-foreground font-semibold text-[12px] w-[110px]"
            />
            <span className="text-foreground/60">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none outline-none text-foreground font-semibold text-[12px] w-[110px]"
            />
          </div>
        </div>
      </div>

      {/* Loading state */}
      {!data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-2xl p-5 h-[140px] animate-pulse" />
          ))}
        </div>
      )}

      {data && (
        <>
          <KPICards
            data={{
              total_revenue: data.total_revenue,
              total_bookings: data.total_bookings,
              today_check_ins: data.today_check_ins,
              today_check_outs: data.today_check_outs,
              prev_total_revenue: data.prev_total_revenue,
              prev_total_bookings: data.prev_total_bookings,
            }}
          />

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2">
              <RevenueChart data={data.revenue_series} total={data.total_revenue} />
            </div>
            <OccupancyDonut
              occupied={data.occupied_today}
              available={data.available_today}
              blocked={data.blocked_today}
              total={data.total_rooms}
            />
          </div>

          {/* Source breakdown + Booking status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <BookingsBySource total={data.sources_total} sources={data.sources} />

            <div className="bg-card rounded-2xl p-5 font-admin shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
              <div className="text-[13px] font-semibold text-foreground mb-4">Booking Status</div>
              <div className="space-y-3">
                {[
                  { label: 'Confirmed', count: data.confirmed_bookings, color: '#5a8a2e', bg: '#e0eccc' },
                  { label: 'Pending', count: data.pending_bookings, color: '#d4a017', bg: '#f7ebbc' },
                  { label: 'Cancelled', count: data.cancelled_bookings, color: '#e85d5d', bg: '#fce5e5' },
                ].map((row) => {
                  const pct = data.total_bookings > 0 ? (row.count / data.total_bookings) * 100 : 0
                  return (
                    <div key={row.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12px] font-medium text-muted-foreground">{row.label}</span>
                        <span className="text-[12px] font-semibold text-foreground font-admin-mono">
                          {row.count}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: row.bg }}>
                        <div className="h-full" style={{ width: `${pct}%`, background: row.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="h-px bg-border my-4" />

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-medium text-muted-foreground">Pending inquiries</div>
                  <div className="text-[22px] font-bold text-foreground font-admin-mono mt-0.5">
                    {data.pending_inquiries}
                  </div>
                </div>
                <a
                  href="/admin/inquiries"
                  className="text-[12px] font-semibold text-foreground bg-accent hover:bg-accent-deep px-3 py-1.5 rounded-md no-underline transition-colors"
                >
                  Review
                </a>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <RecentBookings data={data.recent_bookings} />
        </>
      )}
    </div>
  )
}
