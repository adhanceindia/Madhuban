'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, BedDouble } from 'lucide-react'
import { PageHeader } from '@/components/admin/shared/page-header'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { RoomCard } from './RoomCard'
import type { Room } from '@/db/schema/rooms'

export function RoomsList() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    fetch('/api/admin/rooms')
      .then((r) => r.json())
      .then((d) => {
        setRooms(d.rooms || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = rooms.filter((r) => {
    if (filter === 'active') return r.is_active
    if (filter === 'inactive') return !r.is_active
    return true
  })

  const activeCount = rooms.filter((r) => r.is_active).length

  return (
    <div className="max-w-[1200px]">
      <PageHeader
        title="Rooms"
        subtitle={`${rooms.length} total · ${activeCount} active`}
        actions={
          <Link
            href="/admin/rooms/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg no-underline transition-colors"
          >
            <Plus size={16} /> Add Room
          </Link>
        }
      />

      <div className="flex gap-1 mb-4 bg-card rounded-lg p-1 border border-border w-fit">
        {(['all', 'active', 'inactive'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 text-[12px] font-semibold rounded-md transition-colors capitalize ${
              filter === f
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[100px] bg-card rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl py-12">
          <EmptyState
            icon={<BedDouble size={36} />}
            title={filter === 'all' ? 'No rooms yet' : `No ${filter} rooms`}
            description={
              filter === 'all'
                ? 'Add your first room to start accepting bookings.'
                : `Switch to "all" to see other rooms, or add a new one.`
            }
            action={filter === 'all' ? { label: 'Add Room', href: '/admin/rooms/new' } : undefined}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <RoomCard key={r.id} room={r} />
          ))}
        </div>
      )}
    </div>
  )
}
