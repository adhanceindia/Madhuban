import Image from 'next/image'
import Link from 'next/link'
import { BedDouble, Users } from 'lucide-react'

import { RoomAmenityIcon } from '@/components/rooms/room-amenity-icon'
import { Button } from '@/components/ui/button'
import type { RoomData } from '@/lib/types'
import { formatIndianCurrency } from '@/lib/room-helpers'
import { cn } from '@/lib/utils'

type RoomCardProps = {
  room: RoomData
  priority?: boolean
  className?: string
}

export function RoomCard({ room, priority = false, className }: RoomCardProps) {
  const keyAmenities = room.amenities.slice(0, 4)

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-card-inner border border-card-accent/80 bg-warm-cream shadow-[0_20px_55px_rgba(53,102,9,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(53,102,9,0.12)]',
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
          <span className="absolute left-5 top-5 z-10 rounded-full bg-warm-base/95 px-3 py-1 text-xs font-semibold uppercase tracking-label text-primary-deep shadow-sm">
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
            <p className="text-foreground/70 mt-3 text-sm leading-7">
              {room.description}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <span className="block text-2xl font-bold text-gold">
              {formatIndianCurrency(room.price_per_night)}
            </span>
            <span className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
              per night
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-foreground/70">
          <span className="inline-flex items-center gap-2">
            <Users className="size-4 text-primary-deep" />
            Sleeps {room.capacity}
          </span>
          <span className="inline-flex items-center gap-2">
            <BedDouble className="size-4 text-primary-deep" />
            {room.bed_type}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {keyAmenities.map((amenity) => (
            <span
              key={amenity}
              className="inline-flex items-center gap-2 rounded-full bg-badge-green px-3 py-1.5 text-xs font-semibold uppercase tracking-tag text-primary-deep"
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
            className="h-auto rounded-xl border-content-border bg-transparent px-4 py-3 text-xs font-semibold uppercase tracking-label text-foreground hover:bg-warm-sand"
          >
            <Link href={`/rooms/${room.slug}`}>View Details</Link>
          </Button>

          <Button
            asChild
            className="h-auto rounded-xl bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-label text-white hover:bg-primary-dark"
          >
            <Link href={`/rooms/${room.slug}#booking`}>Book Now</Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
