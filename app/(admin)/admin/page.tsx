import { Suspense } from 'react'
import Link from 'next/link'
import { getDashboardData } from '@/db/queries/dashboard'
import { KPICards } from '@/components/admin/dashboard/kpi-cards'
import { OccupancyDonut } from '@/components/admin/dashboard/occupancy-donut'
import { RevenueChart } from '@/components/admin/dashboard/revenue-chart'
import { BookingsBySource } from '@/components/admin/dashboard/bookings-by-source'
import { RecentBookings } from '@/components/admin/dashboard/recent-bookings'
import { DashboardControls } from '@/components/admin/dashboard/dashboard-controls'

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ start?: string, end?: string }> }) {
  const params = await searchParams

  const now = new Date()
  const defaultStart = toISO(new Date(now.getFullYear(), now.getMonth(), 1))
  const defaultEnd = toISO(new Date(now.getFullYear(), now.getMonth() + 1, 0))

  const start = params.start || defaultStart
  const end = params.end || defaultEnd

  const data = await getDashboardData(start, end)

  return (
    <div className="font-admin max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Overview of resort operations
          </p>
        </div>
        <Suspense fallback={null}>
          <DashboardControls initialStart={start} initialEnd={end} />
        </Suspense>
      </div>

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
            <Link
              href="/admin/inquiries"
              className="text-[12px] font-semibold text-foreground bg-accent hover:bg-accent-deep px-3 py-1.5 rounded-md no-underline transition-colors"
            >
              Review
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <RecentBookings data={data.recent_bookings} />
    </div>
  )
}
