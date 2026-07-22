'use client'

import { motion, useReducedMotion } from 'framer-motion'

import { createEditorialMotion } from '@/lib/motion'
import { SectionHeading } from '@/components/shared/section-heading'
import { SiteIcon } from '@/components/shared/site-icon'
import { cn } from '@/lib/utils'

export interface IconFeaturesGridBlockProps {
  eyebrow?: string
  title?: string
  description?: string
  centered?: boolean
  columns?: 2 | 3 | 4
  features: { title: string; description: string; icon: string }[]
}

export function IconFeaturesGridBlock({
  eyebrow,
  title,
  description,
  centered = true,
  columns = 3,
  features,
}: IconFeaturesGridBlockProps) {
  const reduceMotion = useReducedMotion()
  const { sectionVariants, containerVariants, itemVariants } =
    createEditorialMotion(reduceMotion)

  return (
    <motion.section
      initial={false}
      whileInView="show"
      viewport={{ once: true, amount: 0.18 }}
      variants={sectionVariants}
      className="bg-warm-sand py-12 sm:py-16 lg:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(eyebrow || title) && (
          <SectionHeading
            eyebrow={eyebrow || ''}
            title={title || ''}
            description={description}
            centered={centered}
          />
        )}

        {features.length > 0 && (
          <motion.div
            variants={containerVariants}
            className={cn(
              'mt-12 grid gap-6',
              columns === 2 && 'md:grid-cols-2',
              columns === 3 && 'md:grid-cols-2 xl:grid-cols-3',
              columns === 4 && 'md:grid-cols-2 lg:grid-cols-4'
            )}
          >
            {features.map((feature, idx) => (
              <motion.article
                key={idx}
                variants={itemVariants}
                className="rounded-card border border-divider bg-white p-7 shadow-[0_18px_55px_rgba(27,28,25,0.06)]"
              >
                <div className="inline-flex size-14 items-center justify-center rounded-full bg-primary-light text-primary-deep">
                  <SiteIcon icon={feature.icon} className="size-6" />
                </div>
                <h3 className="mt-5 text-3xl italic text-foreground">
                  {feature.title}
                </h3>
                <p className="text-foreground/70 mt-4 text-sm leading-7">
                  {feature.description}
                </p>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>
    </motion.section>
  )
}
