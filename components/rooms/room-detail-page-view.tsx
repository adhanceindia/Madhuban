'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { BedDouble, ChevronRight, Ruler, Users, Star, Trees, Phone, ChevronLeft, MessageCircle } from 'lucide-react'

import { RoomAmenityIcon } from '@/components/rooms/room-amenity-icon'
import { RoomBookingWidget } from '@/components/rooms/room-booking-widget'
import { RoomCard } from '@/components/rooms/room-card'
import type { RoomData } from '@/lib/types'
import { formatIndianCurrency, getRoomGalleryImages } from '@/lib/room-helpers'

const easing = [0.22, 1, 0.36, 1] as const

export function RoomDetailPageView({
  room,
  relatedRooms,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}: {
  room: RoomData
  relatedRooms: RoomData[]
  initialCheckIn?: string
  initialCheckOut?: string
  initialGuests?: number
}) {
  const reduceMotion = useReducedMotion()
  const galleryImages = getRoomGalleryImages(room, 5) // Ensure we have enough for main + 4 thumbs
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
    {
      label: 'View',
      value: 'Garden View',
      icon: Trees,
    }
  ]
  
  const quickBenefits = [
    { label: 'Free WiFi', icon: 'Wi-Fi' },
    { label: 'Breakfast Included', icon: 'Complimentary Breakfast' },
    { label: 'Free Parking', icon: 'CarFront' },
    { label: 'Instant Confirmation', icon: 'Sparkles' },
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
    .slice(0, 4)

  return (
    <div className="-mt-navbar overflow-x-clip pb-12 lg:pb-0">
      <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(179,216,145,0.3),transparent_54%),linear-gradient(180deg,#f3f0e6_0%,#f5f9f0_100%)]" />

      <motion.section
        initial={false}
        animate="show"
        variants={sectionVariants}
        className="mx-auto max-w-7xl px-4 pb-12 pt-32 sm:px-6 lg:px-8"
      >
        {/* Breadcrumbs */}
        <div className="text-foreground/55 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wider">
          <Link href="/rooms" className="transition-colors hover:text-primary-deep">
            Rooms
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">{room.name}</span>
        </div>

        {/* Hero Section */}
        <div className="mt-6 flex flex-col items-start gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-badge-green px-3 py-1.5 text-xs font-semibold uppercase tracking-label text-primary-deep">
              {room.type}
            </span>
            <h1 className="mt-4 text-balance text-4xl italic leading-tight text-foreground sm:text-5xl lg:text-6xl">
              {room.name}
            </h1>
            
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1 font-bold text-foreground">
                <Star className="size-4 fill-gold text-gold" />
                4.8
              </div>
              <Link href="#reviews" className="text-foreground/55 hover:text-primary-deep transition-colors">
                (312 reviews)
              </Link>
              <span className="text-foreground/30">•</span>
              <span className="text-foreground/70 font-medium">Loved by guests for comfort & cleanliness</span>
            </div>
          </div>
          
          <div className="shrink-0 lg:text-right">
            <div className="flex items-end gap-2 lg:justify-end">
              <span className="text-4xl font-bold text-gold sm:text-5xl">
                {formatIndianCurrency(room.price_per_night)}
              </span>
              <span className="text-foreground/55 pb-1.5 text-xs font-semibold uppercase tracking-label">
                per night
              </span>
            </div>
          </div>
        </div>

        {/* Quick Benefits */}
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-content-border py-4">
          {quickBenefits.map((benefit) => (
            <div key={benefit.label} className="flex items-center gap-2 text-sm font-medium text-foreground/80">
              <RoomAmenityIcon label={benefit.icon} className="size-4 text-primary-deep" />
              <span>{benefit.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
            <RoomAmenityIcon label="Sparkles" className="size-4 text-primary-deep" />
            <span>No Hidden Charges</span>
          </div>
        </div>

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_380px] lg:gap-12">
          {/* Left Column */}
          <div className="space-y-10">
            {/* Gallery First Experience */}
            <motion.div variants={sectionVariants}>
              <div className="group relative overflow-hidden rounded-card border border-content-border bg-white shadow-[0_28px_80px_rgba(53,102,9,0.1)]">
                <div className="relative aspect-[16/11] sm:aspect-[16/10]">
                  <Image
                    src={galleryImages[activeImageIndex]}
                    alt={`${room.name} gallery image`}
                    fill
                    priority
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <button 
                  type="button" 
                  className="absolute bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-foreground shadow-md backdrop-blur transition hover:bg-white"
                >
                  View all photos ({room.images.length})
                </button>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-3">
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
                        sizes="(min-width: 1024px) 15vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
            
            {/* Room Highlights */}
            <motion.div variants={sectionVariants} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {detailHighlights.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center justify-center rounded-card-inner border border-content-border bg-warm-cream p-4 text-center shadow-sm"
                >
                  <item.icon className="size-6 text-primary-deep" />
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-label text-foreground/55">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {item.value}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* About This Room */}
            <motion.section
              variants={sectionVariants}
              className="rounded-card border border-content-border bg-warm-cream p-6 shadow-[0_18px_50px_rgba(53,102,9,0.06)] sm:p-8"
            >
              <p className="text-xs font-semibold uppercase tracking-eyebrow text-gold">
                About This Room
              </p>
              <h2 className="mt-4 text-3xl italic text-foreground">
                A stay shaped around comfort, calm, and resort warmth.
              </h2>
              {room.description ? (
                <div className="mt-6">
                  <p className="text-base leading-8 text-foreground/70">
                    {room.description}
                  </p>
                </div>
              ) : null}
            </motion.section>

            {/* In-Room Amenities */}
            <motion.section
              variants={sectionVariants}
              className="rounded-card border border-content-border bg-warm-cream p-6 shadow-[0_18px_50px_rgba(53,102,9,0.06)] sm:p-8"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-eyebrow text-gold">
                  In-Room Amenities
                </p>
                <button className="text-xs font-semibold uppercase tracking-label text-primary-deep hover:underline">
                  View all amenities &gt;
                </button>
              </div>
              <h2 className="mt-4 text-3xl italic text-foreground">
                Everything you need for an easy, polished stay.
              </h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {room.amenities.slice(0, 6).map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-4 rounded-card-inner border border-[#e3e0d7] bg-warm-sand px-4 py-4"
                  >
                    <span className="inline-flex size-12 items-center justify-center rounded-full bg-white text-primary-deep shadow-sm">
                      <RoomAmenityIcon label={amenity} className="size-5" />
                    </span>
                    <span className="text-sm font-medium text-foreground/80">
                      {amenity}
                    </span>
                  </div>
                ))}
              </div>
            </motion.section>
            
            {/* Policies Section */}
            <motion.section
              variants={sectionVariants}
              className="rounded-card border border-content-border bg-warm-cream p-6 shadow-[0_18px_50px_rgba(53,102,9,0.06)] sm:p-8"
            >
              <div className="flex items-center justify-between border-b border-divider pb-4">
                <p className="text-xs font-semibold uppercase tracking-eyebrow text-gold">
                  Policies
                </p>
                <button className="text-xs font-semibold uppercase tracking-label text-primary-deep hover:underline">
                  View all policies &gt;
                </button>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-foreground/70">Check-in</span>
                  <span className="text-sm font-medium text-foreground">2:00 PM</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-foreground/70">Check-out</span>
                  <span className="text-sm font-medium text-foreground">11:00 AM</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-foreground/70">Cancellation</span>
                  <span className="text-sm font-medium text-foreground">Free up to 48 hrs</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-foreground/70">Children</span>
                  <span className="text-sm font-medium text-foreground">Children of all ages welcome</span>
                </div>
              </div>
            </motion.section>
            
            {/* Guest Reviews Section */}
            <motion.section
              id="reviews"
              variants={sectionVariants}
              className="rounded-card border border-content-border bg-warm-cream p-6 shadow-[0_18px_50px_rgba(53,102,9,0.06)] sm:p-8"
            >
               <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-semibold uppercase tracking-eyebrow text-gold">
                  Guest Reviews
                </p>
                <button className="text-xs font-semibold uppercase tracking-label text-primary-deep hover:underline">
                  View all reviews &gt;
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                 <div className="flex items-center gap-1 font-bold text-2xl text-foreground">
                    <Star className="size-6 fill-gold text-gold" />
                    4.8/5
                  </div>
                  <span className="text-foreground/55 text-sm font-medium">(312 reviews)</span>
              </div>
              
              <div className="relative rounded-card-inner bg-warm-sand p-6 sm:p-8 sm:px-12">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary-deep text-white font-bold">
                       PS
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Priya S.</p>
                      <p className="text-xs text-foreground/55">2 days ago</p>
                    </div>
                 </div>
                 <p className="text-sm italic leading-6 text-foreground/80">
                   &quot;Beautiful property, amazing hospitality and peaceful ambience. The rooms were clean and comfortable. Highly recommended!&quot;
                 </p>
                 
                 {/* Carousel Controls */}
                 <div className="absolute -left-4 top-1/2 flex -translate-y-1/2 items-center justify-between w-[calc(100%+2rem)] px-1 sm:-left-6 sm:w-[calc(100%+3rem)]">
                    <button className="flex size-8 items-center justify-center rounded-full bg-white shadow hover:bg-gray-50 border border-content-border transition">
                       <ChevronLeft className="size-4 text-foreground/70" />
                    </button>
                    <button className="flex size-8 items-center justify-center rounded-full bg-white shadow hover:bg-gray-50 border border-content-border transition">
                       <ChevronRight className="size-4 text-foreground/70" />
                    </button>
                 </div>
                 <div className="mt-8 flex justify-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-foreground/80"></div>
                    <div className="size-1.5 rounded-full bg-foreground/20"></div>
                    <div className="size-1.5 rounded-full bg-foreground/20"></div>
                    <div className="size-1.5 rounded-full bg-foreground/20"></div>
                 </div>
              </div>
            </motion.section>
            
          </div>

          {/* Right Column - Sticky Widget */}
          <div className="lg:sticky lg:top-32 space-y-6">
            <RoomBookingWidget
              room={room}
              initialCheckIn={initialCheckIn}
              initialCheckOut={initialCheckOut}
              initialGuests={initialGuests}
            />
          </div>
        </div>
      </motion.section>

      {/* Related Rooms */}
      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={sectionVariants}
        className="mt-16 bg-[#edf4e6]/70 py-20 sm:mt-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-eyebrow text-gold">
                Explore More
              </p>
              <h2 className="mt-4 text-4xl italic leading-tight text-foreground sm:text-5xl">
                Other rooms you might like
              </h2>
            </div>
            
            <div className="hidden md:flex items-center gap-3">
                <button className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 border border-content-border transition">
                    <ChevronLeft className="size-5 text-foreground/70" />
                </button>
                <button className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 border border-content-border transition">
                    <ChevronRight className="size-5 text-foreground/70" />
                </button>
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {relatedRooms.slice(0, 3).map((relatedRoom) => (
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
      
      {/* Bottom Conversion Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
        <div className="rounded-card border border-content-border bg-[#edf4e6] p-8 sm:p-12 shadow-[0_18px_50px_rgba(53,102,9,0.06)]">
           <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
              <div className="flex items-center gap-6">
                 <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                    <Phone className="size-6 text-primary-deep" />
                 </div>
                 <div>
                    <h3 className="text-2xl italic text-foreground sm:text-3xl">Need help with your booking?</h3>
                    <p className="mt-2 text-sm text-foreground/70">Our team is available 24/7 to assist you.</p>
                 </div>
              </div>
              
              <div className="flex flex-col w-full sm:flex-row items-center gap-4 md:w-auto">
                 <button className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-xs font-semibold uppercase tracking-label text-foreground shadow-sm hover:bg-gray-50 transition border border-content-border">
                    <MessageCircle className="size-4 text-green-600" />
                    WhatsApp Us
                 </button>
                 <button className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-transparent border border-content-border px-6 py-3.5 text-xs font-semibold uppercase tracking-label text-foreground hover:bg-white transition">
                    <Phone className="size-4" />
                    +91 73890 09885
                 </button>
              </div>
           </div>
        </div>
      </section>
    </div>
  )
}

