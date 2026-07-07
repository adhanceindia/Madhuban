'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { SiteIcon } from '@/components/shared/site-icon'
import { highlights as defaultHighlights } from '@/lib/page-content'

type HighlightItem = {
  title: string
  description: string
  icon: string
}

type HighlightsBlockProps = {
  items?: HighlightItem[]
}

const easing = [0.22, 1, 0.36, 1] as const

export function HighlightsBlock({ items }: HighlightsBlockProps) {
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

  const displayItems = items && items.length > 0 ? items : defaultHighlights

  return (
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
          {displayItems.map((highlight) => (
            <motion.article
              key={highlight.title}
              variants={itemVariants}
              className="rounded-card border border-white/60 bg-white/85 p-6 shadow-[0_20px_55px_rgba(46,125,50,0.08)] backdrop-blur"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <SiteIcon icon={highlight.icon as any} className="size-7" />
              </div>
              <h2 className="mt-5 text-2xl italic text-foreground">
                {highlight.title}
              </h2>
              <p className="text-foreground/70 mt-3 text-sm leading-7">
                {highlight.description}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
