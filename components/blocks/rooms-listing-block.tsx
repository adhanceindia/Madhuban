'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CalendarDays, X as XIcon } from 'lucide-react'

import { RoomCard } from '@/components/rooms/room-card'
import type { RoomData } from '@/lib/types'
import { roomFilters, type RoomFilter } from '@/lib/room-helpers'
import { cn } from '@/lib/utils'

const easing = [0.22, 1, 0.36, 1] as const

type RoomsListingBlockProps = {
  rooms?: RoomData[]
  initialCheckIn?: string
  initialCheckOut?: string
  initialGuests?: number
}

export function RoomsListingBlock({
  rooms = [],
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}: RoomsListingBlockProps) {
  const reduceMotion = useReducedMotion()
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState<RoomFilter>('All')

  const hasSearchParams = Boolean(initialCheckIn || initialCheckOut || initialGuests)

  // Build the search params object to pass down to room cards
  const searchParams = hasSearchParams
    ? {
        check_in: initialCheckIn,
        check_out: initialCheckOut,
        guests: initialGuests ? String(initialGuests) : undefined,
      }
    : undefined

  // Filter by room type
  let filteredRooms =
    activeFilter === 'All'
      ? rooms
      : rooms.filter((room) => room.type === activeFilter)

  // If guests search param is provided, filter by capacity
  if (initialGuests && initialGuests > 0) {
    filteredRooms = filteredRooms.filter(
      (room) => (room.capacity || 2) >= initialGuests,
    )
  }

  function formatDisplayDate(dateStr?: string) {
    if (!dateStr) return ''
    const d = new Date(`${dateStr}T00:00:00`)
    if (Number.isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    })
  }

  function clearSearch() {
    router.push('/rooms')
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 26 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.65, ease: easing },
    },
  }

  const containerVariants = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.08,
        delayChildren: reduceMotion ? 0 : 0.04,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.5, ease: easing },
    },
  }

  if (rooms.length === 0) return null;

  return (
    <>
      {/* Search params banner */}
      <AnimatePresence>
        {hasSearchParams && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-primary-100 bg-primary-50/60"
          >
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center gap-3 text-sm text-primary-deep">
                <CalendarDays className="size-4 shrink-0" />
                <span className="font-medium">
                  {initialCheckIn && initialCheckOut
                    ? `${formatDisplayDate(initialCheckIn)} — ${formatDisplayDate(initialCheckOut)}`
                    : initialCheckIn
                      ? `From ${formatDisplayDate(initialCheckIn)}`
                      : initialCheckOut
                        ? `Until ${formatDisplayDate(initialCheckOut)}`
                        : ''}
                </span>
                {initialGuests && (
                  <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-label">
                    {initialGuests} {initialGuests === 1 ? 'guest' : 'guests'}
                  </span>
                )}
                <span className="text-foreground/50">
                  · {filteredRooms.length} {filteredRooms.length === 1 ? 'room' : 'rooms'} found
                </span>
              </div>
              <button
                type="button"
                onClick={clearSearch}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-label text-primary-deep transition-colors hover:bg-primary-50"
              >
                <XIcon className="size-3" />
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="sticky top-navbar z-40 border-y border-content-border bg-warm-base/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {roomFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  'whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-colors',
                  activeFilter === filter
                    ? 'bg-primary text-white shadow-[0_16px_35px_rgba(56,106,14,0.18)]'
                    : 'bg-filter-idle text-foreground/70 hover:bg-filter-hover',
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          <p className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
            Showing {filteredRooms.length} of {rooms.length} rooms
          </p>
        </div>
      </section>

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.12 }}
        variants={sectionVariants}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            variants={containerVariants}
            initial={false}
            animate="show"
            exit={{
              opacity: 0,
              transition: { duration: reduceMotion ? 0 : 0.18 },
            }}
            className="grid gap-8 md:grid-cols-2 md:gap-10 xl:gap-12"
          >
            {filteredRooms.map((room, index) => (
              <motion.div
                key={room.slug}
                layout
                variants={itemVariants}
                className="min-w-0"
              >
                <RoomCard
                  room={room}
                  priority={index < 2}
                  searchParams={searchParams}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.section>
    </>
  )
}
