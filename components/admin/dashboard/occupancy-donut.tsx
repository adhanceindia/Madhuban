'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

type OccupancyDonutProps = {
  occupied: number
  available: number
  blocked: number
  total: number
}

export function OccupancyDonut({ occupied, available, blocked, total }: OccupancyDonutProps) {
  const data = [
    { name: 'Occupied', value: occupied, color: '#d6ed5e' },
    { name: 'Available', value: available, color: '#c8d9b0' },
    { name: 'Blocked', value: blocked, color: '#e5e9d8' },
  ].filter((d) => d.value > 0)

  const safeData = data.length > 0 ? data : [{ name: 'No data', value: 1, color: '#eef4e1' }]

  return (
    <div className="bg-card rounded-2xl p-5 font-admin shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[13px] font-semibold text-foreground">Room Availability</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Today</div>
        </div>
      </div>

      <div className="relative h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={safeData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {safeData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-[28px] font-bold text-foreground font-admin-mono leading-none">{total}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Total Rooms</div>
        </div>
      </div>

      <div className="space-y-1.5 mt-3">
        {[
          { label: 'Occupied', value: occupied, color: '#d6ed5e' },
          { label: 'Available', value: available, color: '#c8d9b0' },
          { label: 'Blocked', value: blocked, color: '#e5e9d8' },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: row.color }} />
              <span className="text-muted-foreground">{row.label}</span>
            </div>
            <span className="font-semibold text-foreground font-admin-mono">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
