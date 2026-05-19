'use client'

import { Card } from '@/components/ui/card'
import { LayoutGrid } from 'lucide-react'
import { EmptyState } from '@/components/admin/shared/empty-state'

type WeekOccupancy = {
  room_id: number
  room_name: string
  days: Record<string, boolean>
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tmrw'
  return d.toLocaleDateString('en-IN', { weekday: 'short' })
}

function getDayNum(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').getDate().toString()
}

export function OccupancyCalendar({ data }: { data: WeekOccupancy[] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-5 shadow-sm">
        <EmptyState
          icon={<LayoutGrid size={24} />}
          title="No rooms configured"
          description="Add rooms to see the occupancy calendar"
          action={{ label: 'Add Room', href: '/admin/rooms' }}
        />
      </Card>
    )
  }

  const allDates = Object.keys(data[0].days).sort()

  return (
    <Card className="p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <LayoutGrid size={18} className="text-violet-600" />
        <span className="text-sm font-semibold text-foreground">Room Availability</span>
        <span className="text-[11px] text-muted-foreground">Next 14 days</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white text-left px-3 py-2 border-b border-border font-semibold text-muted-foreground min-w-[120px]">
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
              <tr key={room.room_id}>
                <td className="sticky left-0 z-10 bg-white font-medium text-foreground px-3 py-1.5 border-b border-gray-50 text-[12px]">
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
      </div>

      <div className="flex gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-500" /> Available
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-red-500" /> Booked/Blocked
        </div>
      </div>
    </Card>
  )
}
