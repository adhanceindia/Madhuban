'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

type RevenuePoint = {
  date: string
  revenue: number
}

type RevenueChartProps = {
  data: RevenuePoint[]
  total: number
}

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
  return `₹${amount}`
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function RevenueChart({ data, total }: RevenueChartProps) {
  return (
    <div className="bg-card rounded-2xl p-5 font-admin shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[13px] font-semibold text-foreground">Revenue</div>
          <div className="text-[22px] font-bold text-foreground font-admin-mono mt-1 leading-none">
            {formatCurrency(total)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">Across selected period</div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent rounded-md text-[11px] font-semibold text-foreground">
          Selected period
        </div>
      </div>

      <div className="h-[200px] -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
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
              tickFormatter={formatDateLabel}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#6b7355' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: '#1a1f12',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                padding: '8px 12px',
              }}
              labelStyle={{ color: '#d6ed5e', fontSize: '10px', marginBottom: '2px' }}
              itemStyle={{ color: '#ffffff', fontWeight: 600 }}
              formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              labelFormatter={formatDateLabel}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#b8d04a"
              strokeWidth={2}
              fill="url(#revenueFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
