'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { SectionHeading } from '@/components/shared/section-heading'
import { SiteIcon } from '@/components/shared/site-icon'
import { services as defaultServices } from '@/lib/page-content'

type ServiceItem = {
  title: string
  description: string
  icon: string
}

type CoreServicesBlockProps = {
  eyebrow?: string
  title?: string
  description?: string
  items?: ServiceItem[]
}

const easing = [0.22, 1, 0.36, 1] as const

export function CoreServicesBlock({ eyebrow, title, description, items }: CoreServicesBlockProps) {
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

  const displayItems = items && items.length > 0 ? items : defaultServices

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
          eyebrow={eyebrow || 'Core Services'}
          title={title || 'Everything your resort stay or celebration needs.'}
          description={description || 'Our spaces are designed to feel welcoming, flexible, and distinctly nature-led.'}
        />

        <motion.div
          variants={containerVariants}
          className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
        >
          {displayItems.map((service) => (
            <motion.article
              key={service.title}
              variants={itemVariants}
              className="rounded-card border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(46,125,50,0.08)]"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <SiteIcon icon={service.icon as any} className="size-6" />
              </div>
              <h3 className="mt-5 text-2xl italic text-foreground">
                {service.title}
              </h3>
              <p className="text-foreground/70 mt-3 text-sm leading-7">
                {service.description}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
