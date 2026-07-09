'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/shared/section-heading'
import type { RoomData } from '@/lib/types'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

function formatIndianCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

type FeaturedRoomsBlockProps = {
  eyebrow?: string
  title?: string
  description?: string
  // Passed down by BlockRenderer context
  featuredRooms?: RoomData[]
}

const easing = [0.22, 1, 0.36, 1] as const

export function FeaturedRoomsBlock({ eyebrow, title, description, featuredRooms }: FeaturedRoomsBlockProps) {
  const reduceMotion = useReducedMotion()

  const sectionVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 28 },
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

  const defaultEyebrow = 'Featured Stay'
  const defaultTitle = 'Stay in comfort, surrounded by calm.'
  const defaultDescription = 'A handpicked preview of our room collection for couples, families, and celebration guests.'
  const rooms = featuredRooms || []

  if (rooms.length === 0) {
    return null // Don't render block if no rooms found
  }

  return (
    <motion.section
      initial={false}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
      className="bg-white py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={eyebrow || defaultEyebrow}
          title={title || defaultTitle}
          description={description || defaultDescription}
        />

        <motion.div variants={containerVariants} className="mt-12">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full relative"
          >
            <CarouselContent className="-ml-4 sm:-ml-6">
              {rooms.map((room, roomIndex) => (
                <CarouselItem key={room.slug || roomIndex} className="pl-4 sm:pl-6 basis-full md:basis-1/3">
                  <motion.article
                    variants={itemVariants}
                    className="h-full overflow-hidden rounded-card border border-primary/10 bg-[#fbfdf8] shadow-[0_22px_55px_rgba(27,28,25,0.06)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={room.images[0] || 'https://images.unsplash.com/photo-1572331165267-854da2b021b1?auto=format&fit=crop&w=800&q=80'}
                        alt={room.name}
                        fill
                        sizes="(min-width: 1024px) 30vw, 100vw"
                        className="object-cover transition-transform duration-700 hover:scale-105"
                      />
                    </div>
                    <div className="p-6 sm:p-7 flex flex-col justify-between h-[calc(100%-75%)]">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-label text-gold">
                          {room.type}
                        </p>
                        <h3 className="mt-3 text-3xl italic text-foreground">
                          {room.name}
                        </h3>
                        <p className="text-foreground/70 mt-4 text-sm leading-7 line-clamp-2">
                          {room.description}
                        </p>
                      </div>
                      <div className="mt-6 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xl font-semibold text-foreground">
                            {formatIndianCurrency(room.price_per_night)}
                          </p>
                          <p className="mt-1 text-sm text-foreground/55">
                            Sleeps {room.capacity} guests
                          </p>
                        </div>
                        <Button asChild className="rounded-full px-5 font-body">
                          <Link href={`/rooms/${room.slug}`}>Book Now</Link>
                        </Button>
                      </div>
                    </div>
                  </motion.article>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-8 flex items-center justify-end gap-3">
              <CarouselPrevious className="static translate-y-0 translate-x-0 h-11 w-11 border-primary/20 bg-transparent text-primary hover:bg-primary/5 hover:text-primary-dark" />
              <CarouselNext className="static translate-y-0 translate-x-0 h-11 w-11 border-primary/20 bg-transparent text-primary hover:bg-primary/5 hover:text-primary-dark" />
            </div>
          </Carousel>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-12 flex justify-center"
        >
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-auto rounded-full px-7 py-4 text-sm font-semibold uppercase tracking-label font-body"
          >
            <Link href="/rooms">View All Rooms</Link>
          </Button>
        </motion.div>
      </div>
    </motion.section>
  )
}
