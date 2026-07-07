'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BedDouble, Users, Maximize2 } from 'lucide-react'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { formatINR } from '@/lib/format'
import type { Room } from '@/db/schema/rooms'

export function RoomCard({ room }: { room: Room }) {
  const thumbnail = (room.images as string[])?.[0]

  return (
    <Link
      href={`/admin/rooms/${room.id}`}
      className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-accent-deep/40 hover:shadow-[0_2px_8px_rgba(45,55,30,0.06)] transition-all no-underline font-admin"
    >
      <div className="w-24 h-20 rounded-lg overflow-hidden bg-sage-soft flex-shrink-0">
        {thumbnail ? (
          <Image src={thumbnail || ""} alt={room.name} className="w-full h-full object-cover" width={100} height={80} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sage-deep/40">
            <BedDouble size={28} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="min-w-0">
            <div className="text-[14px] font-semibold text-foreground truncate">{room.name}</div>
            <div className="text-[11px] text-muted-foreground capitalize mt-0.5">{room.type}</div>
          </div>
          <StatusBadge value={room.is_active ? 'available' : 'blocked'} />
        </div>
        <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users size={11} /> {room.capacity} guests
          </span>
          {room.bed_type && (
            <span className="inline-flex items-center gap-1">
              <BedDouble size={11} /> {room.bed_type}
            </span>
          )}
          {room.room_size && (
            <span className="inline-flex items-center gap-1">
              <Maximize2 size={11} /> {room.room_size}
            </span>
          )}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <div className="text-[18px] font-bold text-foreground font-admin-mono leading-none">
          {formatINR(room.price_per_night)}
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">per night</div>
      </div>
    </Link>
  )
}
