'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { SectionHeading } from '@/components/shared/section-heading'
import { attractions as defaultAttractions } from '@/lib/page-content'

type AttractionItem = {
  name: string
  description: string
  image: string
  distance: string
}

type AttractionsBlockProps = {
  eyebrow?: string
  title?: string
  description?: string
  items?: AttractionItem[]
}

const easing = [0.22, 1, 0.36, 1] as const

export function AttractionsBlock({ eyebrow, title, description, items }: AttractionsBlockProps) {
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

  const displayItems = items && items.length > 0 ? items : defaultAttractions

  return (
    <motion.section
      initial={false}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
      className="bg-secondary/45 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={eyebrow || 'Nearby Attractions'}
          title={title || 'Meaningful places to explore around Agar Malwa.'}
          description={description || 'Plan a peaceful resort stay with spiritual landmarks and memorable day trips nearby.'}
        />

        <motion.div
          variants={containerVariants}
          className="mt-12 grid gap-6 lg:grid-cols-2"
        >
          {displayItems.map((attraction) => (
            <motion.article
              key={attraction.name}
              variants={itemVariants}
              className="overflow-hidden rounded-card border border-white/60 bg-white shadow-[0_20px_55px_rgba(27,28,25,0.07)]"
            >
              <div className="flex flex-col md:flex-row h-full">
                <div className="relative aspect-[4/3] w-full shrink-0 md:w-2/5 md:aspect-auto md:min-h-[300px]">
                  <Image
                    src={attraction.image}
                    alt={attraction.name}
                    fill
                    sizes="(min-width: 1024px) 24vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8 md:w-3/5">
                  <h3 className="text-3xl italic text-foreground">
                    {attraction.name}
                  </h3>
                  <p className="text-foreground/70 mt-4 text-sm leading-7">
                    {attraction.description}
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-semibold uppercase tracking-label text-primary-dark">
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
  )
}
