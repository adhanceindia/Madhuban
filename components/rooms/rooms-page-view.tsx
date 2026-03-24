'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { ResortAmenityIcon } from '@/components/rooms/room-amenity-icon'
import { RoomCard } from '@/components/rooms/room-card'
import { amenities, rooms } from '@/lib/dummy-data'
import { roomFilters, type RoomFilter } from '@/lib/room-helpers'
import { cn } from '@/lib/utils'

const easing = [0.22, 1, 0.36, 1] as const

export function RoomsPageView() {
  const reduceMotion = useReducedMotion()
  const [activeFilter, setActiveFilter] = useState<RoomFilter>('All')

  const filteredRooms =
    activeFilter === 'All'
      ? rooms
      : rooms.filter((room) => room.type === activeFilter)

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
        staggerChildren: reduceMotion ? 0 : 0.12,
        delayChildren: reduceMotion ? 0 : 0.06,
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
    <div className="-mt-[92px] overflow-x-clip">
      <motion.section
        initial={false}
        animate="show"
        variants={sectionVariants}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <Image
            src={rooms[3].images[0]}
            alt="Luxury room interiors at Madhuban Garden Resort"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,22,14,0.48),rgba(17,22,14,0.28)_45%,rgba(17,22,14,0.62))]" />
        </div>

        <div className="relative mx-auto flex min-h-[34rem] max-w-7xl items-center justify-center px-4 pb-20 pt-36 text-center sm:px-6 lg:px-8">
          <p className="text-white/12 pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 select-none font-display text-[clamp(5rem,18vw,12rem)] italic leading-none sm:block">
            Comfort
          </p>

          <div className="relative max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.38em] text-white/80">
              Peaceful resort stays in Agar Malwa
            </p>
            <h1 className="mt-6 text-balance text-5xl italic leading-tight text-white sm:text-6xl lg:text-7xl">
              Our Rooms &amp; Suites
            </h1>
            <p className="text-white/88 mt-6 text-balance text-lg leading-8 sm:text-xl">
              Discover six thoughtfully styled rooms built around restful
              comfort, lush views, and the calm, premium atmosphere that defines
              Madhuban Garden Resort.
            </p>
          </div>
        </div>
      </motion.section>

      <section className="sticky top-[82px] z-40 border-y border-[#d8dfce] bg-[#fbf9f4]/95 backdrop-blur-xl">
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
                    ? 'bg-[#386a0e] text-white shadow-[0_16px_35px_rgba(56,106,14,0.18)]'
                    : 'bg-[#efede7] text-foreground/70 hover:bg-[#e5e3dd]',
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          <p className="text-foreground/48 text-[0.72rem] font-semibold uppercase tracking-[0.28em]">
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
              <motion.div key={room.slug} layout variants={itemVariants}>
                <RoomCard room={room} priority={index < 2} />
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
        className="bg-[#eaf3de]/80 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#356609]/80">
              Included With Every Stay
            </p>
            <h2 className="mt-4 text-4xl italic leading-tight text-[#356609] sm:text-5xl">
              Thoughtful comforts come standard across the resort.
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
                className="flex flex-col items-center rounded-[1.5rem] bg-white/55 px-4 py-6"
              >
                <span className="inline-flex size-14 items-center justify-center rounded-full bg-white text-[#356609] shadow-sm">
                  <ResortAmenityIcon icon={amenity.icon} className="size-6" />
                </span>
                <span className="text-foreground/62 mt-4 text-[0.72rem] font-semibold uppercase tracking-[0.24em]">
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
