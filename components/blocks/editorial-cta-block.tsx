'use client'

import { motion, useReducedMotion } from 'framer-motion'

import { createEditorialMotion } from '@/lib/motion'
import { EditorialCtaPanel } from '@/components/shared/editorial-cta-panel'

export interface EditorialCtaBlockProps {
  eyebrow?: string
  title: string
  description?: string
  primaryLabel?: string
  primaryHref?: string
  secondaryLabel?: string
  secondaryHref?: string
}

export function EditorialCtaBlock({
  eyebrow,
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: EditorialCtaBlockProps) {
  const reduceMotion = useReducedMotion()
  const { sectionVariants } = createEditorialMotion(reduceMotion)

  return (
    <motion.section
      initial={false}
      whileInView="show"
      viewport={{ once: true, amount: 0.12 }}
      variants={sectionVariants}
      className="bg-primary-light py-12 sm:py-16 lg:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <EditorialCtaPanel
          eyebrow={eyebrow}
          title={title}
          description={description || ''}
          primaryLabel={primaryLabel || 'Contact Us'}
          primaryHref={primaryHref || '/contact'}
          secondaryLabel={secondaryLabel}
          secondaryHref={secondaryHref}
        />
      </div>
    </motion.section>
  )
}
