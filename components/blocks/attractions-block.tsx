'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { SectionHeading } from '@/components/shared/section-heading'
import { attractions as defaultAttractions } from '@/lib/page-content'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

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

        <motion.div variants={containerVariants} className="mt-12">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full relative"
          >
            <CarouselContent className="-ml-4 sm:-ml-6">
              {displayItems.map((attraction) => (
                <CarouselItem key={attraction.name} className="pl-4 sm:pl-6 basis-full md:basis-1/3">
                  <motion.article
                    variants={itemVariants}
                    className="h-full overflow-hidden rounded-card border border-white/60 bg-white shadow-[0_20px_55px_rgba(27,28,25,0.07)]"
                  >
                    <div className="flex flex-col h-full">
                      <div className="relative aspect-[4/3] w-full shrink-0">
                        <Image
                          src={attraction.image}
                          alt={attraction.name}
                          fill
                          sizes="(min-width: 1024px) 24vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col flex-grow justify-between p-6 sm:p-8">
                        <div>
                          <h3 className="text-3xl italic text-foreground">
                            {attraction.name}
                          </h3>
                          <p className="text-foreground/70 mt-4 text-sm leading-7">
                            {attraction.description}
                          </p>
                        </div>
                        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-semibold uppercase tracking-label text-primary-dark self-start">
                          <MapPin className="size-3.5" />
                          {attraction.distance}
                        </div>
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
      </div>
    </motion.section>
  )
}
