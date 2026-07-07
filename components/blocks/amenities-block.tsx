'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { SiteIcon } from '@/components/shared/site-icon'
import { amenities as defaultAmenities } from '@/lib/page-content'

type AmenityItem = {
  label: string
  icon: string
}

type AmenitiesBlockProps = {
  items?: AmenityItem[]
}

const easing = [0.22, 1, 0.36, 1] as const

export function AmenitiesBlock({ items }: AmenitiesBlockProps) {
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

  const displayItems = items && items.length > 0 ? items : defaultAmenities

  return (
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
          className="grid gap-4 rounded-card border border-white/50 bg-white/50 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-5"
        >
          {displayItems.map((amenity) => (
            <motion.div
              key={amenity.label}
              variants={itemVariants}
              className="flex items-center gap-4 rounded-card-inner bg-white/75 px-4 py-4"
            >
              <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary-dark">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <SiteIcon icon={amenity.icon as any} className="size-5" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {amenity.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
