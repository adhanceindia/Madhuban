'use client'

type SourceCount = {
  label: string
  count: number
  color: string
}

type BookingsBySourceProps = {
  total: number
  sources: SourceCount[]
}

export function BookingsBySource({ total, sources }: BookingsBySourceProps) {
  const items = sources.length > 0 ? sources : [
    { label: 'Website', count: 0, color: '#d6ed5e' },
    { label: 'Booking.com', count: 0, color: '#c8d9b0' },
    { label: 'MakeMyTrip', count: 0, color: '#ba7517' },
    { label: 'Manual', count: 0, color: '#e5e9d8' },
  ]

  return (
    <div className="bg-card rounded-2xl p-5 font-admin shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
      <div className="text-[13px] font-semibold text-foreground mb-4">Booking by Source</div>

      {/* Stacked bar */}
      <div className="flex h-2 rounded-full overflow-hidden bg-sage-soft mb-4">
        {items.map((s, i) => (
          <div
            key={i}
            style={{
              width: `${total > 0 ? (s.count / total) * 100 : 0}%`,
              background: s.color,
            }}
          />
        ))}
      </div>

      <div className="space-y-2.5">
        {items.map((s) => {
          const pct = total > 0 ? Math.round((s.count / total) * 100) : 0
          return (
            <div key={s.label} className="flex items-center justify-between text-[12px]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
                <span className="text-muted-foreground">{s.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground font-admin-mono">{s.count}</span>
                <span className="text-[10px] text-muted-foreground/70 w-8 text-right">{pct}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
