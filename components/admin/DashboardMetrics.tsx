'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  Calendar,
  Gauge,
  ArrowDownToLine,
  ArrowUpFromLine,
  DoorOpen,
  Inbox,
  Wallet,
  ClipboardList,
  Users,
  ChevronRight,
  Plus,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  BedDouble,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BookingSummary = {
  id: string | number
  guest_name: string
  room_name: string
  check_in: string
  check_out: string
  total_amount: number
  status: string
  payment_status: string
  source: string
}

type WeekOccupancy = {
  room_id: string | number
  room_name: string
  days: Record<string, boolean>
}

type DashboardData = {
  period: { start: string; end: string }
  prev_period: { start: string; end: string }
  today: string
  total_rooms: number
  booked_rooms_today: number
  available_rooms_today: number
  occupancy_rate: number
  total_revenue: number
  online_revenue: number
  reception_revenue: number
  avg_booking_value: number
  total_bookings: number
  confirmed_bookings: number
  pending_bookings: number
  cancelled_bookings: number
  today_check_ins: number
  today_check_outs: number
  pending_inquiries: number
  prev_total_revenue: number
  prev_total_bookings: number
  prev_occupancy_rate: number
  week_occupancy: WeekOccupancy[]
  upcoming_check_ins: BookingSummary[]
  recent_bookings: BookingSummary[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function formatCurrencyFull(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatDateFull(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getDefaultRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return { start: toISO(start), end: toISO(end) }
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function calcTrend(current: number, previous: number): { pct: number; direction: 'up' | 'down' | 'flat' } {
  if (previous === 0 && current === 0) return { pct: 0, direction: 'flat' }
  if (previous === 0) return { pct: 100, direction: 'up' }
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return { pct: 0, direction: 'flat' }
  return { pct: Math.abs(pct), direction: pct > 0 ? 'up' : 'down' }
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tmrw'
  return d.toLocaleDateString('en-IN', { weekday: 'short' })
}

function getDayNum(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').getDate().toString()
}

// ---------------------------------------------------------------------------
// Status Badge
// ---------------------------------------------------------------------------

const badgeColors: Record<string, string> = {
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  default: 'bg-gray-100 text-gray-600 border-gray-200',
}

function StatusBadge({ value, variant = 'default' }: { value: string; variant?: string }) {
  const cls = badgeColors[variant] || badgeColors.default
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border capitalize tracking-tight ${cls}`}>
      {value.replace(/_/g, ' ')}
    </span>
  )
}

function statusVariant(status: string): string {
  if (status === 'confirmed' || status === 'paid') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'cancelled' || status === 'failed') return 'danger'
  if (status === 'website' || status === 'booking_com' || status === 'mmt') return 'info'
  return 'default'
}

// ---------------------------------------------------------------------------
// Hero KPI Card
// ---------------------------------------------------------------------------

function HeroKPI({
  icon,
  label,
  value,
  trend,
  trendLabel,
  accentClass,
  borderClass,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: { pct: number; direction: 'up' | 'down' | 'flat' }
  trendLabel?: string
  accentClass: string
  borderClass: string
}) {
  return (
    <Card className={`p-6 border-t-4 ${borderClass} shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-11 h-11 rounded-[10px] flex items-center justify-center ${accentClass}`}>
          {icon}
        </div>
        {trend && trend.direction !== 'flat' && (
          <div className={`flex items-center gap-1 text-xs font-semibold font-admin-mono px-2 py-0.5 rounded-md ${
            trend.direction === 'up'
              ? 'text-green-700 bg-green-50'
              : 'text-red-700 bg-red-50'
          }`}>
            {trend.direction === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend.pct}%
          </div>
        )}
      </div>
      <div className="text-[32px] font-bold text-foreground leading-none tracking-tight font-admin-mono">
        {value}
      </div>
      <div className="text-[13px] font-medium text-muted-foreground mt-1 uppercase tracking-wider">
        {label}
      </div>
      {trendLabel && (
        <div className="text-[11px] text-muted-foreground/70 mt-1.5">{trendLabel}</div>
      )}
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Stat Card (small, secondary)
// ---------------------------------------------------------------------------

function StatCard({
  icon,
  label,
  value,
  iconClass = 'text-gray-500',
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  iconClass?: string
}) {
  return (
    <Card className="flex items-center gap-3.5 p-4 shadow-sm">
      <div className={`w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 ${iconClass}`}>
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold text-foreground leading-tight font-admin-mono">{value}</div>
        <div className="text-xs font-medium text-muted-foreground mt-0.5">{label}</div>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode
  title: string
  description: string
  action?: { label: string; href: string }
}) {
  return (
    <div className="text-center py-8 px-4">
      <div className="text-gray-300 mb-3 flex justify-center">{icon}</div>
      <div className="text-sm font-semibold text-foreground mb-1">{title}</div>
      <div className="text-xs text-muted-foreground mb-4">{description}</div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-md no-underline"
        >
          <Plus size={14} /> {action.label}
        </Link>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Occupancy Calendar
// ---------------------------------------------------------------------------

function OccupancyCalendar({ data }: { data: WeekOccupancy[] }) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<LayoutGrid size={24} />}
        title="No rooms configured"
        description="Add rooms to see occupancy calendar"
        action={{ label: 'Add Room', href: '/admin/collections/rooms/create' }}
      />
    )
  }

  const allDates = Object.keys(data[0].days).sort()

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 z-20 bg-white text-left px-3 py-2 border-b border-border font-semibold text-muted-foreground min-w-[120px]">
              Room
            </th>
            {allDates.map((d) => (
              <th key={d} className="text-center px-1 py-2 border-b border-border">
                <div className="text-[10px] text-muted-foreground/70 font-medium">{getDayLabel(d)}</div>
                <div className="font-semibold text-foreground">{getDayNum(d)}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((room) => (
            <tr key={String(room.room_id)}>
              <td className="sticky left-0 z-10 bg-white font-medium text-foreground px-3 py-1.5 border-b border-gray-50">
                {room.room_name}
              </td>
              {allDates.map((d) => (
                <td key={d} className="text-center px-1 py-1.5 border-b border-gray-50">
                  <div className={`w-7 h-7 rounded-md mx-auto flex items-center justify-center ${
                    room.days[d]
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      room.days[d] ? 'bg-red-500' : 'bg-green-500'
                    }`} />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-4 mt-3 pl-1">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-500" /> Available
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-red-500" /> Booked
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="px-6 pb-10 max-w-[1240px]">
      <div className="flex justify-between items-start mb-2 pb-4">
        <div>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-3.5 w-52 mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 border-t-4 border-gray-200">
            <Skeleton className="h-10 w-10 rounded-[10px]" />
            <Skeleton className="h-8 w-[60%] mt-4" />
            <Skeleton className="h-3.5 w-[40%] mt-2" />
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="flex items-center gap-3.5 p-4">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-5 w-[50%]" />
              <Skeleton className="h-3 w-[70%] mt-1" />
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-5 mb-4">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-[200px] w-full mt-4" />
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function DashboardMetrics() {
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
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData(startDate, endDate) }, [fetchData, startDate, endDate])

  function setPreset(preset: string) {
    const now = new Date()
    let start: Date, end: Date
    switch (preset) {
      case 'today': start = end = now; break
      case 'week': { const d = now.getDay(); start = new Date(now); start.setDate(now.getDate() - d); end = now; break }
      case 'month': start = new Date(now.getFullYear(), now.getMonth(), 1); end = new Date(now.getFullYear(), now.getMonth() + 1, 0); break
      case 'quarter': { const q = Math.floor(now.getMonth() / 3); start = new Date(now.getFullYear(), q * 3, 1); end = new Date(now.getFullYear(), q * 3 + 3, 0); break }
      default: return
    }
    setStartDate(toISO(start)); setEndDate(toISO(end))
  }

  const activePreset = (() => {
    const now = new Date()
    const todayStr = toISO(now)
    const ms = toISO(new Date(now.getFullYear(), now.getMonth(), 1))
    const me = toISO(new Date(now.getFullYear(), now.getMonth() + 1, 0))
    const ws = (() => { const d = now.getDay(); const s = new Date(now); s.setDate(now.getDate() - d); return toISO(s) })()
    const q = Math.floor(now.getMonth() / 3)
    const qs = toISO(new Date(now.getFullYear(), q * 3, 1))
    const qe = toISO(new Date(now.getFullYear(), q * 3 + 3, 0))
    if (startDate === todayStr && endDate === todayStr) return 'today'
    if (startDate === ws && endDate === todayStr) return 'week'
    if (startDate === ms && endDate === me) return 'month'
    if (startDate === qs && endDate === qe) return 'quarter'
    return ''
  })()

  if (loading && !data) return <DashboardSkeleton />
  if (!data) return null

  const revenueTrend = calcTrend(data.total_revenue, data.prev_total_revenue)
  const bookingsTrend = calcTrend(data.total_bookings, data.prev_total_bookings)
  const occupancyTrend = calcTrend(data.occupancy_rate, data.prev_occupancy_rate)

  return (
    <div className="px-6 pb-10 max-w-[1240px] font-body">

      {/* ── Header with Actions ──────────────────────────── */}
      <div className="flex justify-between items-start flex-wrap gap-4 mb-2 pb-4 border-b border-border">
        <div>
          <h1 className="text-[22px] font-bold text-foreground tracking-tight font-display">Dashboard</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {formatDateFull(data.period.start)} — {formatDateFull(data.period.end)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/collections/bookings/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-[7px] text-[13px] font-semibold bg-primary text-white rounded-lg no-underline hover:bg-primary-600 transition-colors"
          >
            <Plus size={16} /> New Booking
          </Link>
          <Link
            href="/admin/collections/rooms/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-[7px] text-[13px] font-semibold bg-white text-foreground border border-border rounded-lg no-underline hover:bg-muted transition-colors"
          >
            <Plus size={16} /> Add Room
          </Link>
        </div>
      </div>

      {/* ── Date Controls ────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap mb-6 pt-3">
        <div className="flex gap-0.5 bg-muted rounded-lg p-0.5 border border-border">
          {['today', 'week', 'month', 'quarter'].map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md border-none cursor-pointer transition-all ${
                activePreset === p
                  ? 'bg-foreground text-white shadow-sm'
                  : 'bg-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-border rounded-md bg-white text-foreground"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-border rounded-md bg-white text-foreground"
          />
        </div>
        {loading && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <div className="w-3 h-3 border-2 border-border border-t-primary rounded-full animate-spin" />
            Updating...
          </div>
        )}
      </div>

      {/* ── Hero KPIs ────────────────────────────────────── */}
      <div className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-3">
        Business Overview
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
        <HeroKPI
          icon={<DollarSign size={22} />}
          label="Total Revenue"
          value={data.total_revenue > 0 ? formatCurrency(data.total_revenue) : '₹0'}
          trend={revenueTrend}
          trendLabel={
            data.total_revenue > 0
              ? `${revenueTrend.direction === 'up' ? '+' : revenueTrend.direction === 'down' ? '-' : ''}${revenueTrend.pct}% vs previous period`
              : 'Revenue will appear once bookings are paid'
          }
          accentClass="bg-primary-light text-primary"
          borderClass="border-t-primary"
        />
        <HeroKPI
          icon={<Calendar size={22} />}
          label="Total Bookings"
          value={data.total_bookings}
          trend={bookingsTrend}
          trendLabel={
            data.total_bookings > 0
              ? `${data.confirmed_bookings} confirmed, ${data.pending_bookings} pending`
              : 'No bookings in this period yet'
          }
          accentClass="bg-gold-light text-gold"
          borderClass="border-t-gold"
        />
        <HeroKPI
          icon={<Gauge size={22} />}
          label="Occupancy Rate"
          value={`${data.occupancy_rate}%`}
          trend={occupancyTrend}
          trendLabel={
            data.total_rooms > 0
              ? `${data.booked_rooms_today} of ${data.total_rooms} rooms occupied today`
              : 'Add rooms to track occupancy'
          }
          accentClass="bg-primary-light text-primary"
          borderClass="border-t-primary"
        />
      </div>

      {/* ── Today's Activity ─────────────────────────────── */}
      <div className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-3">
        Today&apos;s Activity
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
        <StatCard icon={<ArrowDownToLine size={18} />} label="Check-ins" value={data.today_check_ins} iconClass="text-blue-600" />
        <StatCard icon={<ArrowUpFromLine size={18} />} label="Check-outs" value={data.today_check_outs} iconClass="text-amber-600" />
        <StatCard icon={<DoorOpen size={18} />} label="Available Rooms" value={data.available_rooms_today} iconClass="text-green-600" />
        <StatCard icon={<Inbox size={18} />} label="Pending Inquiries" value={data.pending_inquiries} iconClass={data.pending_inquiries > 0 ? 'text-red-600' : 'text-green-600'} />
      </div>

      {/* ── Revenue & Booking Status ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Revenue Breakdown */}
        <Card className="p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-emerald-600" />
              <span className="text-sm font-semibold text-foreground">Revenue Breakdown</span>
            </div>
          </div>
          <div className="h-px bg-muted my-3.5" />
          {data.total_revenue === 0 ? (
            <EmptyState
              icon={<DollarSign size={24} />}
              title="No revenue yet"
              description="Revenue data will appear once bookings are paid"
            />
          ) : (
            <>
              <div className="flex justify-between items-center py-[7px]">
                <span className="text-[13px] text-muted-foreground">Online Payments</span>
                <span className="text-[13px] font-semibold text-emerald-600 font-admin-mono">{formatCurrencyFull(data.online_revenue)}</span>
              </div>
              <div className="flex justify-between items-center py-[7px]">
                <span className="text-[13px] text-muted-foreground">Pay at Reception</span>
                <span className="text-[13px] font-semibold text-amber-600 font-admin-mono">{formatCurrencyFull(data.reception_revenue)}</span>
              </div>
              <div className="h-px bg-muted my-2" />
              <div className="flex justify-between items-center py-[7px]">
                <span className="text-[13px] font-semibold text-foreground">Total</span>
                <span className="text-[13px] font-bold text-foreground font-admin-mono">{formatCurrencyFull(data.total_revenue)}</span>
              </div>
              <div className="flex h-2 rounded overflow-hidden bg-muted mt-3.5">
                <div className="h-full bg-emerald-500 rounded-l transition-all duration-500" style={{ width: `${(data.online_revenue / data.total_revenue) * 100}%` }} />
                <div className="h-full bg-amber-500 rounded-r transition-all duration-500" style={{ width: `${(data.reception_revenue / data.total_revenue) * 100}%` }} />
              </div>
              <div className="flex gap-4 mt-2.5">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <div className="w-2 h-2 rounded-sm bg-emerald-500" /> Online
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <div className="w-2 h-2 rounded-sm bg-amber-500" /> Reception
                </div>
              </div>
              <div className="mt-3 px-3 py-2 bg-muted rounded-md text-xs text-muted-foreground">
                Avg. booking value: <strong className="text-foreground font-admin-mono">{formatCurrencyFull(data.avg_booking_value)}</strong>
              </div>
            </>
          )}
        </Card>

        {/* Booking Status */}
        <Card className="p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList size={18} className="text-blue-600" />
              <span className="text-sm font-semibold text-foreground">Booking Status</span>
            </div>
            <Link href="/admin/collections/bookings" className="flex items-center gap-0.5 text-xs font-medium text-blue-600 no-underline hover:underline">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="h-px bg-muted my-3.5" />
          {data.total_bookings === 0 ? (
            <EmptyState
              icon={<Calendar size={24} />}
              title="No bookings yet"
              description="Bookings will appear here once guests start booking"
              action={{ label: 'Create Booking', href: '/admin/collections/bookings/create' }}
            />
          ) : (
            <div className="flex flex-col gap-3.5 py-1">
              {[
                { label: 'Confirmed', count: data.confirmed_bookings, colorDot: 'bg-green-500', colorText: 'text-green-600' },
                { label: 'Pending', count: data.pending_bookings, colorDot: 'bg-amber-500', colorText: 'text-amber-600' },
                { label: 'Cancelled', count: data.cancelled_bookings, colorDot: 'bg-red-500', colorText: 'text-red-600' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${s.colorDot} flex-shrink-0`} />
                    <span className="text-[13px] text-muted-foreground font-medium">{s.label}</span>
                  </div>
                  <span className={`text-lg font-bold font-admin-mono min-w-[28px] text-right ${s.count > 0 ? s.colorText : 'text-gray-400'}`}>
                    {s.count}
                  </span>
                  {data.total_bookings > 0 && (
                    <div className="w-[60px] h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${s.colorDot}`}
                        style={{ width: `${(s.count / data.total_bookings) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Inquiries inline */}
          <div className="h-px bg-muted my-4" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox size={18} className={data.pending_inquiries > 0 ? 'text-amber-600' : 'text-green-600'} />
              <span className="text-[13px] font-medium text-foreground">
                {data.pending_inquiries > 0
                  ? `${data.pending_inquiries} pending ${data.pending_inquiries === 1 ? 'inquiry' : 'inquiries'}`
                  : 'No pending inquiries'
                }
              </span>
            </div>
            <Link href="/admin/collections/inquiries" className="flex items-center gap-0.5 text-xs font-medium text-blue-600 no-underline hover:underline">
              View <ChevronRight size={14} />
            </Link>
          </div>
        </Card>
      </div>

      {/* ── Occupancy Calendar ────────────────────────────── */}
      <Card className="p-5 mb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid size={18} className="text-violet-600" />
            <span className="text-sm font-semibold text-foreground">Room Availability</span>
            <span className="text-[11px] text-muted-foreground/70">Next 14 days</span>
          </div>
        </div>
        <div className="h-px bg-muted my-3.5" />
        <OccupancyCalendar data={data.week_occupancy} />
      </Card>

      {/* ── Recent Bookings ───────────────────────────────── */}
      <Card className="p-5 mb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            <span className="text-sm font-semibold text-foreground">Recent Bookings</span>
          </div>
          <Link href="/admin/collections/bookings" className="flex items-center gap-0.5 text-xs font-medium text-blue-600 no-underline hover:underline">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="h-px bg-muted my-3.5" />
        {data.recent_bookings.length === 0 ? (
          <EmptyState
            icon={<Calendar size={24} />}
            title="No bookings yet"
            description="Your recent bookings will appear here"
            action={{ label: 'Create Booking', href: '/admin/collections/bookings/create' }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {['Guest', 'Room', 'Check-in', 'Check-out', 'Amount', 'Status', 'Payment'].map((h) => (
                    <th key={h} className="text-left px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recent_bookings.map((b) => (
                  <tr key={String(b.id)} className="hover:bg-muted/30 transition-colors">
                    <td className="px-3.5 py-3 border-b border-muted whitespace-nowrap">
                      <Link href={`/admin/collections/bookings/${b.id}`} className="text-primary font-medium no-underline hover:underline">
                        {b.guest_name || '—'}
                      </Link>
                    </td>
                    <td className="px-3.5 py-3 border-b border-muted text-foreground whitespace-nowrap">{b.room_name}</td>
                    <td className="px-3.5 py-3 border-b border-muted text-foreground whitespace-nowrap">{formatDateDisplay(b.check_in)}</td>
                    <td className="px-3.5 py-3 border-b border-muted text-foreground whitespace-nowrap">{formatDateDisplay(b.check_out)}</td>
                    <td className="px-3.5 py-3 border-b border-muted text-foreground font-medium font-admin-mono whitespace-nowrap">{formatCurrencyFull(b.total_amount)}</td>
                    <td className="px-3.5 py-3 border-b border-muted whitespace-nowrap"><StatusBadge value={b.status} variant={statusVariant(b.status)} /></td>
                    <td className="px-3.5 py-3 border-b border-muted whitespace-nowrap"><StatusBadge value={b.payment_status} variant={statusVariant(b.payment_status)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Upcoming Check-ins ────────────────────────────── */}
      <Card className="p-5 mb-2 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowDownToLine size={18} className="text-cyan-600" />
            <span className="text-sm font-semibold text-foreground">Upcoming Check-ins</span>
            <span className="text-[11px] text-muted-foreground/70">Next 7 days</span>
          </div>
        </div>
        <div className="h-px bg-muted my-3.5" />
        {data.upcoming_check_ins.length === 0 ? (
          <EmptyState
            icon={<BedDouble size={24} />}
            title="No upcoming check-ins"
            description="Check-ins for the next 7 days will appear here"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {['Guest', 'Room', 'Check-in', 'Check-out', 'Amount', 'Source'].map((h) => (
                    <th key={h} className="text-left px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.upcoming_check_ins.map((b) => (
                  <tr key={String(b.id)} className="hover:bg-muted/30 transition-colors">
                    <td className="px-3.5 py-3 border-b border-muted whitespace-nowrap">
                      <Link href={`/admin/collections/bookings/${b.id}`} className="text-primary font-medium no-underline hover:underline">
                        {b.guest_name || '—'}
                      </Link>
                    </td>
                    <td className="px-3.5 py-3 border-b border-muted text-foreground whitespace-nowrap">{b.room_name}</td>
                    <td className="px-3.5 py-3 border-b border-muted text-foreground whitespace-nowrap">{formatDateDisplay(b.check_in)}</td>
                    <td className="px-3.5 py-3 border-b border-muted text-foreground whitespace-nowrap">{formatDateDisplay(b.check_out)}</td>
                    <td className="px-3.5 py-3 border-b border-muted text-foreground font-medium font-admin-mono whitespace-nowrap">{formatCurrencyFull(b.total_amount)}</td>
                    <td className="px-3.5 py-3 border-b border-muted whitespace-nowrap"><StatusBadge value={b.source} variant={statusVariant(b.source)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
