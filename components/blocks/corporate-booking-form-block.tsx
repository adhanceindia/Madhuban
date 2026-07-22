'use client'

import { motion, useReducedMotion } from 'framer-motion'

import { createEditorialMotion } from '@/lib/motion'
import { CorporateBookingForm } from '@/components/events/corporate-booking-form'

export interface CorporateBookingFormBlockProps {
  eyebrow?: string
  title?: string
  description?: string
}

export function CorporateBookingFormBlock({
  eyebrow,
  title,
  description,
}: CorporateBookingFormBlockProps) {
  const reduceMotion = useReducedMotion()
  const { sectionVariants } = createEditorialMotion(reduceMotion)

  return (
    <motion.section
      initial={false}
      whileInView="show"
      viewport={{ once: true, amount: 0.12 }}
      variants={sectionVariants}
      className="bg-warm-base py-12 sm:py-16 lg:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <CorporateBookingForm
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
      </div>
    </motion.section>
  )
}
