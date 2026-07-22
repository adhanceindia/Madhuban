'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CalendarDays, X as XIcon } from 'lucide-react'

import { ResortAmenityIcon } from '@/components/rooms/room-amenity-icon'
import { RoomCard } from '@/components/rooms/room-card'
import { amenities } from '@/lib/page-content'
import type { RoomData } from '@/lib/types'
import { roomFilters, type RoomFilter } from '@/lib/room-helpers'
import { getHeroImage, type SiteContent } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useSiteContent } from '@/components/ui/preview-provider'

const easing = [0.22, 1, 0.36, 1] as const

type RoomsPageViewProps = {
  rooms: RoomData[]
  siteContent: SiteContent
  pageData?: Record<string, unknown>
  initialCheckIn?: string
  initialCheckOut?: string
  initialGuests?: number
}

export function RoomsPageView({
  rooms,
  siteContent: initialSiteContent,
  pageData: initialPageData,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}: RoomsPageViewProps) {
  const siteContent = useSiteContent(initialSiteContent) as SiteContent
  const pageData = useSiteContent(initialPageData || {}) as Record<string, unknown>
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

  return (
    <div className="overflow-x-clip">
      <motion.section
        initial={false}
        animate="show"
        variants={sectionVariants}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <Image
            src={(pageData.banner_image as string) || getHeroImage(siteContent, 'rooms', rooms[0]?.images?.[0] || 'https://images.unsplash.com/photo-1572331165267-854da2b021b1?auto=format&fit=crop&w=800&q=80')}
            alt="Luxury room interiors at Madhuban Garden Resort"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,22,14,0.48),rgba(17,22,14,0.28)_45%,rgba(17,22,14,0.62))]" />
        </div>

        <div className="relative mx-auto flex min-h-[34rem] max-w-7xl items-center justify-center px-4 pb-20 pt-36 text-center text-white sm:px-6 lg:px-8">
          <p className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 select-none font-display text-[clamp(5rem,18vw,12rem)] italic leading-none text-white/10 sm:block">
            {(pageData.hero_background_text as string) || 'Comfort'}
          </p>

          <div className="relative z-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-eyebrow text-white/80">
              {(pageData.hero_eyebrow as string) || 'Peaceful resort stays in Agar Malwa'}
            </p>
            <h1 className="mt-6 text-balance text-5xl italic leading-tight text-white sm:text-6xl lg:text-7xl">
              {(pageData.page_heading as string) || 'Our Rooms & Suites'}
            </h1>
            <p className="mt-6 text-balance text-lg leading-8 text-white/90 sm:text-xl">
              {(pageData.page_description as string) ||
                'Discover six thoughtfully styled rooms built around restful comfort, lush views, and the calm, premium atmosphere that defines Madhuban Garden Resort.'}
            </p>
          </div>
        </div>
      </motion.section>

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

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="bg-badge-green/80 py-12 sm:py-16 lg:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-gold">
              {(pageData.amenities_eyebrow as string) || 'Included With Every Stay'}
            </p>
            <h2 className="mt-4 text-4xl italic leading-tight text-primary-deep sm:text-5xl">
              {(pageData.amenities_heading as string) || 'Thoughtful comforts come standard across the resort.'}
            </h2>
          </div>

          <motion.div
            variants={containerVariants}
            className="mt-14 grid grid-cols-2 gap-8 text-center md:grid-cols-3 xl:grid-cols-5"
          >
            {amenities.map((amenity) => (
              <motion.div
                key={amenity.label}
                variants={itemVariants}
                className="flex flex-col items-center rounded-card-inner bg-white/55 px-4 py-6"
              >
                <span className="inline-flex size-14 items-center justify-center rounded-full bg-white text-primary-deep shadow-sm">
                  <ResortAmenityIcon icon={amenity.icon} className="size-6" />
                </span>
                <span className="text-foreground/55 mt-4 text-xs font-semibold uppercase tracking-label">
                  {amenity.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
