'use client'

import { CalendarCheck2, ArrowDownToLine, ArrowUpFromLine, Wallet, TrendingUp, TrendingDown } from 'lucide-react'

type KPIData = {
  total_revenue: number
  total_bookings: number
  today_check_ins: number
  today_check_outs: number
  prev_total_revenue?: number
  prev_total_bookings?: number
}

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount}`
}

function calcTrend(current: number, previous: number | undefined): { pct: number; dir: 'up' | 'down' | 'flat' } {
  if (previous === undefined || previous === 0) return { pct: 0, dir: 'flat' }
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return { pct: 0, dir: 'flat' }
  return { pct: Math.abs(pct), dir: pct > 0 ? 'up' : 'down' }
}

type KPICardProps = {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: { pct: number; dir: 'up' | 'down' | 'flat' }
  trendLabel?: string
}

function KPICard({ icon, label, value, trend, trendLabel }: KPICardProps) {
  return (
    <div className="bg-card rounded-2xl p-5 font-admin shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-sage-soft flex items-center justify-center text-sage-deep">
          {icon}
        </div>
        {trend && trend.dir !== 'flat' && (
          <div className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
            trend.dir === 'up'
              ? 'bg-status-confirmed-bg text-status-confirmed'
              : 'bg-status-cancelled-bg text-status-cancelled'
          }`}>
            {trend.dir === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend.pct}%
          </div>
        )}
      </div>
      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-[28px] font-bold text-foreground leading-none font-admin-mono tracking-tight">
        {value}
      </div>
      {trendLabel && (
        <div className="text-[11px] text-muted-foreground/80 mt-2">
          {trendLabel}
        </div>
      )}
    </div>
  )
}

export function KPICards({ data }: { data: KPIData }) {
  const revenueTrend = calcTrend(data.total_revenue, data.prev_total_revenue)
  const bookingsTrend = calcTrend(data.total_bookings, data.prev_total_bookings)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <KPICard
        icon={<CalendarCheck2 size={20} />}
        label="New Bookings"
        value={data.total_bookings}
        trend={bookingsTrend}
        trendLabel={bookingsTrend.dir === 'flat' ? undefined : 'vs previous period'}
      />
      <KPICard
        icon={<ArrowDownToLine size={20} />}
        label="Check In"
        value={data.today_check_ins}
        trendLabel="Today's arrivals"
      />
      <KPICard
        icon={<ArrowUpFromLine size={20} />}
        label="Check Out"
        value={data.today_check_outs}
        trendLabel="Today's departures"
      />
      <KPICard
        icon={<Wallet size={20} />}
        label="Total Revenue"
        value={data.total_revenue > 0 ? formatCurrency(data.total_revenue) : '₹0'}
        trend={revenueTrend}
        trendLabel={revenueTrend.dir === 'flat' ? 'No data yet' : 'vs previous period'}
      />
    </div>
  )
}
