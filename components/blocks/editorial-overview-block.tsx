'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

import { createEditorialMotion } from '@/lib/motion'
import { SectionHeading } from '@/components/shared/section-heading'
import { cn } from '@/lib/utils'

export interface EditorialOverviewBlockProps {
  eyebrow?: string
  title: string
  image?: string
  description1?: string
  description2?: string
  stats?: { label: string; value: string }[]
  points?: string[]
  layout?: 'image-left' | 'image-right'
}

export function EditorialOverviewBlock({
  eyebrow,
  title,
  image,
  description1,
  description2,
  stats = [],
  points = [],
  layout = 'image-left',
}: EditorialOverviewBlockProps) {
  const reduceMotion = useReducedMotion()
  const { sectionVariants, itemVariants } = createEditorialMotion(reduceMotion)

  return (
    <motion.section
      initial={false}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
      className="bg-warm-base py-12 sm:py-16 lg:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            'grid gap-10 lg:items-center lg:gap-16',
            image ? 'lg:grid-cols-[0.95fr_1.05fr]' : 'lg:grid-cols-1'
          )}
        >
          {image && (
            <motion.div
              variants={itemVariants}
              className={layout === 'image-right' ? 'lg:order-2' : 'lg:order-1'}
            >
              <div className="overflow-hidden rounded-card border border-[#d8dfce] bg-white shadow-[0_28px_80px_rgba(56,106,14,0.12)]">
                <div className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5]">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            variants={itemVariants}
            className={layout === 'image-right' ? 'lg:order-1' : 'lg:order-2'}
          >
            <SectionHeading eyebrow={eyebrow || ''} title={title} />

            {stats.length > 0 && (
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-card-inner border border-[#dfddd5] bg-warm-sand px-4 py-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-label text-gold">
                      {stat.label}
                    </p>
                    <p className="text-foreground/70 mt-3 text-sm font-medium leading-6">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {(description1 || description2) && (
              <div className="mt-6 grid gap-5">
                {description1 && (
                  <p className="text-base leading-8 text-foreground/70">
                    {description1}
                  </p>
                )}
                {description2 && (
                  <p className="text-base leading-8 text-foreground/70">
                    {description2}
                  </p>
                )}
              </div>
            )}

            {points.length > 0 && (
              <div className="mt-8 grid gap-4">
                {points.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-4 rounded-card-inner border border-[#e1e8d9] bg-[#f7fbf3] px-5 py-4"
                  >
                    <span className="mt-1 inline-flex size-9 items-center justify-center rounded-full bg-badge-green text-primary-deep">
                      <CheckCircle2 className="size-4" />
                    </span>
                    <p className="text-foreground/70 text-sm leading-7">{point}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
