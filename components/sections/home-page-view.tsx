'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  CarFront,
  Coffee,
  ConciergeBell,
  Leaf,
  MapPin,
  PartyPopper,
  Sparkles,
  Star,
  Trees,
  type LucideIcon,
  Users,
  UtensilsCrossed,
  Waves,
  Wifi,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  amenities,
  attractions,
  highlights,
  homeHero,
  resort,
  reviews,
  rooms,
  services,
  weddingFeature,
} from '@/lib/dummy-data'
import { cn } from '@/lib/utils'

const featuredRooms = rooms.slice(0, 3)
const instagramPlaceholders = Array.from({ length: 6 }, (_, index) => index + 1)
const easing = [0.22, 1, 0.36, 1] as const

const iconRegistry: Record<string, LucideIcon> = {
  BedDouble,
  CalendarDays,
  CarFront,
  Coffee,
  ConciergeBell,
  PartyPopper,
  Sparkles,
  Trees,
  Users,
  UtensilsCrossed,
  Waves,
  Wifi,
}

function formatIndianCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow?: string
  title: string
  description?: string
  centered?: boolean
}) {
  return (
    <div className={cn('max-w-3xl', centered && 'mx-auto text-center')}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-dark/80">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 text-4xl italic leading-tight text-foreground sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-base leading-8 text-foreground/70 sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  )
}

function IconBadge({ icon, className }: { icon: string; className?: string }) {
  const Icon = iconRegistry[icon] ?? Leaf

  return <Icon className={className} />
}

function ReviewStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1 text-[#c2872d]">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={`star-${index}`}
          className={cn(
            'size-4',
            index < rating ? 'fill-current' : 'text-[#c2872d]/25',
          )}
        />
      ))}
    </div>
  )
}

export function HomePageView() {
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

  return (
    <div className="-mt-[92px] overflow-x-clip">
      <motion.section
        initial={false}
        animate="show"
        variants={sectionVariants}
        className="relative flex min-h-[100svh] items-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <Image
            src={homeHero.image}
            alt="Lush garden resort landscape at Madhuban Garden Resort"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,18,10,0.55),rgba(12,18,10,0.42)_40%,rgba(12,18,10,0.68))]" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl px-4 pb-16 pt-36 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/80">
              {homeHero.eyebrow}
            </p>
            <h1 className="mt-6 text-balance text-5xl italic leading-tight text-white sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              {resort.tagline}
            </h1>
            <p className="text-white/82 mt-6 max-w-2xl text-lg leading-8 sm:text-xl">
              {homeHero.subtitle}
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-auto rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-[0.24em]"
              >
                <Link href="/rooms">Book Now</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/8 hover:bg-white/14 h-auto rounded-full border-white/35 px-8 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-sm hover:text-white"
              >
                <Link href="#quick-highlights">Explore Resort</Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        id="quick-highlights"
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="bg-secondary/75 py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {highlights.map((highlight) => (
              <motion.article
                key={highlight.title}
                variants={itemVariants}
                className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-[0_20px_55px_rgba(46,125,50,0.08)] backdrop-blur"
              >
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
                  <IconBadge icon={highlight.icon} className="size-7" />
                </div>
                <h2 className="mt-5 text-2xl italic text-foreground">
                  {highlight.title}
                </h2>
                <p className="text-foreground/68 mt-3 text-sm leading-7">
                  {highlight.description}
                </p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="bg-[#f8fbf4] py-20 sm:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-[2rem] shadow-[0_24px_70px_rgba(46,125,50,0.14)]"
          >
            <div className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5]">
              <Image
                src={weddingFeature.image}
                alt="Wedding venue placeholder at Madhuban Garden Resort"
                fill
                sizes="(min-width: 1024px) 44vw, 100vw"
                className="object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="rounded-[2rem] bg-white p-8 shadow-[0_24px_70px_rgba(27,28,25,0.08)] sm:p-10 lg:-ml-12 lg:p-12"
          >
            <motion.p
              variants={itemVariants}
              className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-dark/80"
            >
              {weddingFeature.badge}
            </motion.p>
            <motion.h2
              variants={itemVariants}
              className="mt-4 text-4xl italic leading-tight text-foreground sm:text-5xl"
            >
              {weddingFeature.title}
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="mt-5 text-base leading-8 text-foreground/70 sm:text-lg"
            >
              {weddingFeature.description}
            </motion.p>

            <motion.div
              variants={containerVariants}
              className="mt-8 grid gap-4 sm:grid-cols-2"
            >
              {weddingFeature.points.map((point) => (
                <motion.div
                  key={point.label}
                  variants={itemVariants}
                  className="rounded-[1.5rem] border border-primary/10 bg-secondary/45 p-5"
                >
                  <div className="flex items-center gap-3 text-primary-dark">
                    <IconBadge icon={point.icon} className="size-5" />
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-dark/80">
                      {point.label}
                    </p>
                  </div>
                  <p className="mt-4 text-base leading-7 text-foreground">
                    {point.value}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="mt-8">
              <Button
                asChild
                size="lg"
                className="h-auto rounded-full px-7 py-4 text-sm font-semibold uppercase tracking-[0.24em]"
              >
                <Link href="/wedding" className="gap-2">
                  {weddingFeature.ctaLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="bg-white py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Featured Stay"
            title="Stay in comfort, surrounded by calm."
            description="A handpicked preview of our room collection for couples, families, and celebration guests."
          />

          <motion.div
            variants={containerVariants}
            className="mt-12 grid gap-6 lg:grid-cols-3"
          >
            {featuredRooms.map((room) => (
              <motion.article
                key={room.id}
                variants={itemVariants}
                className="overflow-hidden rounded-[2rem] border border-primary/10 bg-[#fbfdf8] shadow-[0_22px_55px_rgba(27,28,25,0.06)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={room.images[0]}
                    alt={room.name}
                    fill
                    sizes="(min-width: 1024px) 30vw, 100vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <div className="p-6 sm:p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-dark/75">
                    {room.type}
                  </p>
                  <h3 className="mt-3 text-3xl italic text-foreground">
                    {room.name}
                  </h3>
                  <p className="text-foreground/68 mt-4 text-sm leading-7">
                    {room.description}
                  </p>
                  <div className="mt-6 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xl font-semibold text-foreground">
                        {formatIndianCurrency(room.price_per_night)}
                      </p>
                      <p className="mt-1 text-sm text-foreground/60">
                        Sleeps {room.capacity} guests
                      </p>
                    </div>
                    <Button asChild className="rounded-full px-5">
                      <Link href={`/rooms/${room.slug}`}>Book Now</Link>
                    </Button>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-12 flex justify-center"
          >
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-auto rounded-full px-7 py-4 text-sm font-semibold uppercase tracking-[0.24em]"
            >
              <Link href="/rooms">View All Rooms</Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="bg-secondary/45 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Core Services"
            title="Everything your resort stay or celebration needs."
            description="Our spaces are designed to feel welcoming, flexible, and distinctly nature-led."
          />

          <motion.div
            variants={containerVariants}
            className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            {services.map((service) => (
              <motion.article
                key={service.title}
                variants={itemVariants}
                className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(46,125,50,0.08)]"
              >
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
                  <IconBadge icon={service.icon} className="size-6" />
                </div>
                <h3 className="mt-5 text-2xl italic text-foreground">
                  {service.title}
                </h3>
                <p className="text-foreground/68 mt-3 text-sm leading-7">
                  {service.description}
                </p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="bg-[#e3f0de] py-10"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            className="grid gap-4 rounded-[2rem] border border-white/50 bg-white/50 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-5"
          >
            {amenities.map((amenity) => (
              <motion.div
                key={amenity.label}
                variants={itemVariants}
                className="flex items-center gap-4 rounded-[1.5rem] bg-white/75 px-4 py-4"
              >
                <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary-dark">
                  <IconBadge icon={amenity.icon} className="size-5" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {amenity.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="bg-[#f8fbf4] py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            centered
            eyebrow="Instagram"
            title="Follow Our Journey @madhubangarden"
            description="Fresh event moments, peaceful resort corners, and celebrations worth remembering."
          />

          <motion.div
            variants={containerVariants}
            className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3"
          >
            {instagramPlaceholders.map((placeholder) => (
              <motion.div
                key={placeholder}
                variants={itemVariants}
                className="flex aspect-square items-center justify-center rounded-[1.75rem] border border-dashed border-primary/25 bg-white/70 p-6 text-center shadow-[0_16px_40px_rgba(46,125,50,0.05)]"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-dark/70">
                    Placeholder {placeholder}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-foreground/60">
                    Behold.so embed goes here
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="mt-10 text-center">
            <Button
              asChild
              size="lg"
              className="h-auto rounded-full px-7 py-4 text-sm font-semibold uppercase tracking-[0.24em]"
            >
              <Link href={resort.instagram} target="_blank" rel="noreferrer">
                Follow on Instagram
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="bg-white py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            centered
            eyebrow="Guest Reviews"
            title="Kind words from recent stays and celebrations."
          />

          <motion.div
            variants={containerVariants}
            className="mt-12 grid gap-6 lg:grid-cols-3"
          >
            {reviews.map((review) => (
              <motion.article
                key={`${review.guest_name}-${review.date}`}
                variants={itemVariants}
                className="rounded-[2rem] border border-primary/10 bg-[#fcfdf9] p-7 shadow-[0_18px_50px_rgba(27,28,25,0.06)]"
              >
                <ReviewStars rating={review.rating} />
                <p className="mt-6 text-lg italic leading-8 text-foreground">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="mt-6 border-t border-primary/10 pt-5">
                  <p className="text-base font-semibold text-foreground">
                    {review.guest_name}
                  </p>
                  <p className="mt-1 text-sm text-foreground/55">
                    {new Date(review.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="bg-secondary/45 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Nearby Attractions"
            title="Meaningful places to explore around Agar Malwa."
            description="Plan a peaceful resort stay with spiritual landmarks and memorable day trips nearby."
          />

          <motion.div
            variants={containerVariants}
            className="mt-12 grid gap-6 lg:grid-cols-2"
          >
            {attractions.map((attraction) => (
              <motion.article
                key={attraction.name}
                variants={itemVariants}
                className="overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_20px_55px_rgba(27,28,25,0.07)]"
              >
                <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="relative aspect-[4/3] md:h-full md:min-h-[300px]">
                    <Image
                      src={attraction.image}
                      alt={attraction.name}
                      fill
                      sizes="(min-width: 1024px) 24vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 sm:p-8">
                    <h3 className="text-3xl italic text-foreground">
                      {attraction.name}
                    </h3>
                    <p className="text-foreground/68 mt-4 text-sm leading-7">
                      {attraction.description}
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary-dark">
                      <MapPin className="size-3.5" />
                      {attraction.distance}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
