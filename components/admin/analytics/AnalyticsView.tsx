'use client'

import { useCallback, useEffect, useState } from 'react'
import { CalendarRange, Download, TrendingUp, IndianRupee, Calendar, Bed, BarChart3 } from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import toast from 'react-hot-toast'

import { PageHeader } from '@/components/admin/shared/page-header'
import { formatINR, formatINRCompact, formatDateShort, todayISO, addDays } from '@/lib/format'

type AnalyticsData = {
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
}

const PRESET_LABELS = ['Today', 'Week', 'Month', 'Quarter', 'Year'] as const
type Preset = (typeof PRESET_LABELS)[number]
const SOURCE_COLORS = ['#d6ed5e', '#c8d9b0', '#ba7517', '#e5e9d8']

export function AnalyticsView() {
  const today = todayISO()
  const [startDate, setStartDate] = useState(addDays(today, -29))
  const [endDate, setEndDate] = useState(today)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics?start=${startDate}&end=${endDate}`)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function applyPreset(p: Preset) {
    const now = new Date()
    let s: Date
    const e = now
    if (p === 'Today') s = now
    else if (p === 'Week') {
      s = new Date(now)
      s.setDate(now.getDate() - now.getDay())
    } else if (p === 'Month') s = new Date(now.getFullYear(), now.getMonth(), 1)
    else if (p === 'Quarter') {
      const q = Math.floor(now.getMonth() / 3)
      s = new Date(now.getFullYear(), q * 3, 1)
    } else s = new Date(now.getFullYear(), 0, 1)

    const toISO = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    setStartDate(toISO(s))
    setEndDate(toISO(e))
  }

  function exportCsv() {
    if (!data) return
    const rows: (string | number)[][] = [['Date', 'Revenue', 'Occupancy %']]
    for (let i = 0; i < data.revenue_trend.length; i++) {
      rows.push([
        data.revenue_trend[i].date,
        data.revenue_trend[i].revenue,
        data.occupancy_trend[i]?.rate || 0,
      ])
    }
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${startDate}-to-${endDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV downloaded')
  }

  return (
    <div className="max-w-[1400px]">
      <PageHeader
        title="Analytics"
        subtitle="Revenue, occupancy, and booking trends"
        actions={
          <button
            type="button"
            onClick={exportCsv}
            disabled={!data}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold bg-card border border-border text-foreground hover:bg-sage-soft rounded-lg transition-colors disabled:opacity-50"
          >
            <Download size={14} /> Export CSV
          </button>
        }
      />

      {/* Date controls */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        <div className="flex gap-0.5 bg-card rounded-lg p-1 border border-border">
          {PRESET_LABELS.map((p) => (
            <button
              key={p}
              onClick={() => applyPreset(p)}
              className="px-3 py-1.5 text-[12px] font-medium rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 bg-accent rounded-lg text-[12px] font-semibold text-foreground">
          <CalendarRange size={14} />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent outline-none w-[110px]"
          />
          <span className="text-foreground/60">→</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent outline-none w-[110px]"
          />
        </div>
      </div>

      {!data ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[120px] bg-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <KPI icon={<IndianRupee size={18} />} label="Total Revenue" value={formatINRCompact(data.total_revenue)} />
            <KPI icon={<Calendar size={18} />} label="Bookings" value={data.total_bookings} sub={`${data.confirmed_bookings} confirmed`} />
            <KPI icon={<TrendingUp size={18} />} label="Avg Booking" value={formatINRCompact(data.avg_booking_value)} />
            <KPI
              icon={<Bed size={18} />}
              label="Avg Stay"
              value={`${data.avg_stay_nights.toFixed(1)}n`}
              sub={`${data.cancellation_rate.toFixed(1)}% cancellation`}
            />
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
            <div className="lg:col-span-2 bg-card rounded-2xl p-5 shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
              <h2 className="text-[13px] font-semibold text-foreground mb-3">Revenue trend</h2>
              <div className="h-[240px] -ml-2">
                <ResponsiveContainer>
                  <AreaChart data={data.revenue_trend}>
                    <defs>
                      <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d6ed5e" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#d6ed5e" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#eef4e1" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#6b7355' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(d) => formatDateShort(d)}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#6b7355' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={formatINRCompact}
                      width={50}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#1a1f12',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      labelStyle={{ color: '#d6ed5e' }}
                      itemStyle={{ color: '#ffffff', fontWeight: 600 }}
                      formatter={(v: number) => [formatINR(v), 'Revenue']}
                      labelFormatter={formatDateShort}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#b8d04a" strokeWidth={2} fill="url(#revFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
              <h2 className="text-[13px] font-semibold text-foreground mb-3">Booking sources</h2>
              <div className="h-[180px]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={data.source_breakdown}
                      dataKey="count"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {data.source_breakdown.map((_, i) => (
                        <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#1a1f12',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      itemStyle={{ color: '#ffffff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-3">
                {data.source_breakdown.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: SOURCE_COLORS[i % SOURCE_COLORS.length] }} />
                      <span className="text-muted-foreground capitalize">{s.name.replace('_', ' ')}</span>
                    </div>
                    <span className="font-semibold text-foreground font-admin-mono">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            <div className="bg-card rounded-2xl p-5 shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
              <h2 className="text-[13px] font-semibold text-foreground mb-3">Occupancy %</h2>
              <div className="h-[200px] -ml-2">
                <ResponsiveContainer>
                  <LineChart data={data.occupancy_trend}>
                    <CartesianGrid stroke="#eef4e1" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#6b7355' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(d) => formatDateShort(d)}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: '#6b7355' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}%`}
                      width={36}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#1a1f12',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      labelStyle={{ color: '#d6ed5e' }}
                      itemStyle={{ color: '#ffffff' }}
                      formatter={(v: number) => [`${v}%`, 'Occupancy']}
                      labelFormatter={formatDateShort}
                    />
                    <Line type="monotone" dataKey="rate" stroke="#6b8e3d" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
              <h2 className="text-[13px] font-semibold text-foreground mb-3">Revenue by room type</h2>
              {data.revenue_by_room_type.length === 0 ? (
                <div className="text-[12px] text-muted-foreground py-10 text-center">
                  <BarChart3 size={32} className="mx-auto mb-2 text-sage-deep/40" />
                  No data yet
                </div>
              ) : (
                <div className="h-[200px] -ml-2">
                  <ResponsiveContainer>
                    <BarChart data={data.revenue_by_room_type}>
                      <CartesianGrid stroke="#eef4e1" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="type"
                        tick={{ fontSize: 11, fill: '#6b7355' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#6b7355' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={formatINRCompact}
                        width={50}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#1a1f12',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        labelStyle={{ color: '#d6ed5e' }}
                        itemStyle={{ color: '#ffffff' }}
                        formatter={(v: number) => [formatINR(v), 'Revenue']}
                      />
                      <Bar dataKey="revenue" fill="#d6ed5e" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {loading && (
        <div className="text-[11px] text-muted-foreground mt-2">Refreshing...</div>
      )}
    </div>
  )
}

function KPI({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
      <div className="w-10 h-10 rounded-xl bg-sage-soft flex items-center justify-center text-sage-deep mb-3">
        {icon}
      </div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="text-[24px] font-bold text-foreground font-admin-mono leading-none">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-2">{sub}</div>}
    </div>
  )
}
