'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { BedDouble, ChevronRight, Ruler, Users } from 'lucide-react'

import { RoomAmenityIcon } from '@/components/rooms/room-amenity-icon'
import { RoomBookingWidget } from '@/components/rooms/room-booking-widget'
import { RoomCard } from '@/components/rooms/room-card'
import type { RoomData } from '@/lib/types'
import { formatIndianCurrency, getRoomGalleryImages } from '@/lib/room-helpers'

const easing = [0.22, 1, 0.36, 1] as const

export function RoomDetailPageView({
  room,
  relatedRooms,
}: {
  room: RoomData
  relatedRooms: RoomData[]
}) {
  const reduceMotion = useReducedMotion()
  const galleryImages = getRoomGalleryImages(room)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const detailHighlights = [
    {
      label: 'Capacity',
      value: `Up to ${room.capacity} guests`,
      icon: Users,
    },
    {
      label: 'Bed Type',
      value: room.bed_type,
      icon: BedDouble,
    },
    {
      label: 'Room Size',
      value: room.room_size || 'Contact for details',
      icon: Ruler,
    },
  ]

  const sectionVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.6, ease: easing },
    },
  }

  const thumbnailIndices = galleryImages
    .map((_, index) => index)
    .filter((index) => index !== activeImageIndex)
    .slice(0, 3)

  return (
    <div className="-mt-navbar overflow-x-clip pb-24 lg:pb-20">
      <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(179,216,145,0.3),transparent_54%),linear-gradient(180deg,#f3f0e6_0%,#f5f9f0_100%)]" />

      <motion.section
        initial={false}
        animate="show"
        variants={sectionVariants}
        className="mx-auto max-w-7xl px-4 pb-8 pt-32 sm:px-6 lg:px-8"
      >
        <div className="text-foreground/55 flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/rooms"
            className="transition-colors hover:text-primary-deep"
          >
            Rooms
          </Link>
          <ChevronRight className="size-4" />
          <span>{room.name}</span>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_380px] lg:gap-12">
          <div className="space-y-8">
            <div className="rounded-card border border-content-border bg-warm-cream p-6 shadow-[0_24px_70px_rgba(53,102,9,0.08)] sm:p-8">
              <span className="inline-flex rounded-full bg-badge-green px-3 py-1.5 text-xs font-semibold uppercase tracking-label text-primary-deep">
                {room.type}
              </span>
              <h1 className="mt-4 text-balance text-4xl italic leading-tight text-foreground sm:text-5xl">
                {room.name}
              </h1>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <span className="text-4xl font-bold text-gold">
                  {formatIndianCurrency(room.price_per_night)}
                </span>
                <span className="text-foreground/55 pb-1 text-xs font-semibold uppercase tracking-label">
                  per night
                </span>
              </div>
              <p className="mt-5 max-w-3xl text-base leading-8 text-foreground/70">
                {room.description}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {detailHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-card-inner border border-[#e3e0d7] bg-warm-sand p-4"
                  >
                    <item.icon className="size-5 text-primary-deep" />
                    <p className="text-foreground/55 mt-3 text-xs font-semibold uppercase tracking-label">
                      {item.label}
                    </p>
                    <p className="text-foreground/70 mt-2 text-sm font-medium leading-6">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <motion.div variants={sectionVariants}>
              <div className="overflow-hidden rounded-card border border-content-border bg-white shadow-[0_28px_80px_rgba(53,102,9,0.1)]">
                <div className="relative aspect-[16/11] sm:aspect-[16/10]">
                  <Image
                    src={galleryImages[activeImageIndex]}
                    alt={`${room.name} gallery image`}
                    fill
                    priority
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {thumbnailIndices.map((index) => (
                  <button
                    key={`${room.slug}-thumb-${index}`}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className="group overflow-hidden rounded-card-sm border border-content-border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={galleryImages[index]}
                        alt={`${room.name} thumbnail ${index + 1}`}
                        fill
                        sizes="(min-width: 1024px) 18vw, 32vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.section
              variants={sectionVariants}
              className="rounded-card border border-content-border bg-warm-cream p-6 shadow-[0_18px_50px_rgba(53,102,9,0.06)] sm:p-8"
            >
              <p className="text-xs font-semibold uppercase tracking-eyebrow text-gold">
                About This Room
              </p>
              <h2 className="mt-4 text-3xl italic text-foreground sm:text-4xl">
                A stay shaped around comfort, calm, and resort warmth.
              </h2>
              {room.description ? (
                <div className="mt-6 grid gap-5">
                  <p className="text-foreground/70 text-base leading-8">
                    {room.description}
                  </p>
                </div>
              ) : null}
            </motion.section>

            <motion.section
              variants={sectionVariants}
              className="rounded-card border border-content-border bg-warm-cream p-6 shadow-[0_18px_50px_rgba(53,102,9,0.06)] sm:p-8"
            >
              <p className="text-xs font-semibold uppercase tracking-eyebrow text-gold">
                In-Room Amenities
              </p>
              <h2 className="mt-4 text-3xl italic text-foreground sm:text-4xl">
                Everything you need for an easy, polished stay.
              </h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {room.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-4 rounded-card-inner border border-[#e3e0d7] bg-warm-sand px-4 py-4"
                  >
                    <span className="inline-flex size-12 items-center justify-center rounded-full bg-white text-primary-deep shadow-sm">
                      <RoomAmenityIcon label={amenity} className="size-5" />
                    </span>
                    <span className="text-foreground/70 text-sm font-medium leading-6">
                      {amenity}
                    </span>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>

          <div className="space-y-6">
            <RoomBookingWidget room={room} />
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={sectionVariants}
        className="mt-16 bg-[#edf4e6]/70 py-20 sm:mt-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-gold">
              Related Stays
            </p>
            <h2 className="mt-4 text-4xl italic leading-tight text-foreground sm:text-5xl">
              Explore a few more rooms that pair beautifully with this stay.
            </h2>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {relatedRooms.map((relatedRoom) => (
              <motion.div
                key={relatedRoom.slug}
                variants={sectionVariants}
                className="h-full"
              >
                <RoomCard room={relatedRoom} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  )
}
