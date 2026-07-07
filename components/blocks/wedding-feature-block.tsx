'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteIcon } from '@/components/shared/site-icon'
import { weddingFeature as defaultWeddingFeature } from '@/lib/page-content'

type WeddingPoint = {
  label: string
  value: string
  icon: string
}

type WeddingFeatureBlockProps = {
  badge?: string
  title?: string
  description?: string
  image?: string
  ctaLabel?: string
  points?: WeddingPoint[]
}

const easing = [0.22, 1, 0.36, 1] as const

export function WeddingFeatureBlock(props: WeddingFeatureBlockProps) {
  const reduceMotion = useReducedMotion()

  const badge = props.badge || defaultWeddingFeature.badge
  const title = props.title || defaultWeddingFeature.title
  const description = props.description || defaultWeddingFeature.description
  const image = props.image || defaultWeddingFeature.image
  const ctaLabel = props.ctaLabel || defaultWeddingFeature.ctaLabel
  const points = props.points && props.points.length > 0 ? props.points : defaultWeddingFeature.points

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
    <motion.section
      initial={false}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
      className="bg-warm-green py-20 sm:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-card shadow-[0_24px_70px_rgba(46,125,50,0.14)]"
        >
          <div className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5]">
            <Image
              src={image}
              alt={title}
              fill
              sizes="(min-width: 1024px) 44vw, 100vw"
              className="object-cover"
            />
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="rounded-card bg-white p-8 shadow-[0_24px_70px_rgba(27,28,25,0.08)] sm:p-10 lg:-ml-12 lg:p-12"
        >
          <motion.p
            variants={itemVariants}
            className="text-xs font-semibold uppercase tracking-eyebrow text-gold"
          >
            {badge}
          </motion.p>
          <motion.h2
            variants={itemVariants}
            className="mt-4 text-4xl italic leading-tight text-foreground sm:text-5xl"
          >
            {title}
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="mt-5 text-base leading-8 text-foreground/70 sm:text-lg"
          >
            {description}
          </motion.p>

          <motion.div
            variants={containerVariants}
            className="mt-8 grid gap-4 sm:grid-cols-2"
          >
            {points.map((point) => (
              <motion.div
                key={point.label}
                variants={itemVariants}
                className="rounded-card-inner border border-primary/10 bg-secondary/45 p-5"
              >
                <div className="flex items-center gap-3 text-primary-dark">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <SiteIcon icon={point.icon as any} className="size-5" />
                  <p className="text-xs font-semibold uppercase tracking-label text-gold">
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
              className="h-auto rounded-full px-7 py-4 text-sm font-semibold uppercase tracking-label"
            >
              <Link href="/wedding" className="gap-2">
                {ctaLabel}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}
