'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CalendarRange } from 'lucide-react'
import { useState } from 'react'

export function DashboardControls({ initialStart, initialEnd }: { initialStart: string, initialEnd: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [startDate, setStartDate] = useState(initialStart)
  const [endDate, setEndDate] = useState(initialEnd)

  function applyDates(start: string, end: string) {
    setStartDate(start)
    setEndDate(end)
    const params = new URLSearchParams(searchParams.toString())
    params.set('start', start)
    params.set('end', end)
    router.push(`?${params.toString()}`)
  }

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
    
    const toISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    
    applyDates(toISO(start), toISO(end))
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
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
      <div className="flex items-center gap-1.5 px-3 py-2 bg-accent rounded-lg text-[12px] font-semibold text-foreground">
        <CalendarRange size={14} />
        <input
          type="date"
          value={startDate}
          onChange={(e) => applyDates(e.target.value, endDate)}
          className="bg-transparent border-none outline-none text-foreground font-semibold text-[12px] w-[110px]"
        />
        <span className="text-foreground/60">→</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => applyDates(startDate, e.target.value)}
          className="bg-transparent border-none outline-none text-foreground font-semibold text-[12px] w-[110px]"
        />
      </div>
    </div>
  )
}
