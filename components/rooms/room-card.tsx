import Image from 'next/image'
import Link from 'next/link'
import { BedDouble, Users } from 'lucide-react'

import { RoomAmenityIcon } from '@/components/rooms/room-amenity-icon'
import { Button } from '@/components/ui/button'
import type { Room } from '@/lib/dummy-data'
import { formatIndianCurrency } from '@/lib/room-helpers'
import { cn } from '@/lib/utils'

type RoomCardProps = {
  room: Room
  priority?: boolean
  className?: string
}

export function RoomCard({ room, priority = false, className }: RoomCardProps) {
  const keyAmenities = room.amenities.slice(0, 4)

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-[1.4rem] border border-[#c0dd97]/80 bg-[#fffdf8] shadow-[0_20px_55px_rgba(53,102,9,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(53,102,9,0.12)]',
        className,
      )}
    >
      <Link href={`/rooms/${room.slug}`} className="block">
        <div className="relative aspect-[3/2] overflow-hidden">
          <Image
            src={room.images[0]}
            alt={room.name}
            fill
            priority={priority}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="from-black/28 absolute inset-0 bg-gradient-to-t via-black/0 to-black/5" />
          <span className="absolute left-5 top-5 rounded-full bg-[#fbf9f4]/95 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#356609] shadow-sm">
            {room.type}
          </span>
        </div>
      </Link>

      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl italic leading-tight text-foreground">
              {room.name}
            </h2>
            <p className="text-foreground/66 mt-3 text-sm leading-7">
              {room.description}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <span className="block text-2xl font-bold text-[#ba7517]">
              {formatIndianCurrency(room.price_per_night)}
            </span>
            <span className="text-foreground/48 text-[0.65rem] font-semibold uppercase tracking-[0.24em]">
              per night
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-foreground/70">
          <span className="inline-flex items-center gap-2">
            <Users className="size-4 text-[#356609]" />
            Sleeps {room.capacity}
          </span>
          <span className="inline-flex items-center gap-2">
            <BedDouble className="size-4 text-[#356609]" />
            {room.bed_type}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {keyAmenities.map((amenity) => (
            <span
              key={amenity}
              className="inline-flex items-center gap-2 rounded-full bg-[#eaf3de] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#356609]"
            >
              <RoomAmenityIcon label={amenity} className="size-3.5" />
              {amenity}
            </span>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <Button
            asChild
            variant="outline"
            className="h-auto rounded-xl border-[#d9e2cf] bg-transparent px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-foreground hover:bg-[#f3f0e9]"
          >
            <Link href={`/rooms/${room.slug}`}>View Details</Link>
          </Button>

          <Button
            asChild
            className="h-auto rounded-xl bg-[#386a0e] px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white hover:bg-[#2f590b]"
          >
            <Link href={`/rooms/${room.slug}#booking`}>Book Now</Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
