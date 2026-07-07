'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Star } from 'lucide-react'
import { SectionHeading } from '@/components/shared/section-heading'
import { cn } from '@/lib/utils'
import type { ReviewData } from '@/lib/types'

function ReviewStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1 text-gold-400">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={`star-${index}`}
          className={cn(
            'size-4',
            index < rating ? 'fill-current' : 'text-gold-400/25',
          )}
        />
      ))}
    </div>
  )
}

type ReviewsBlockProps = {
  eyebrow?: string
  title?: string
  description?: string
  // Context prop
  reviews?: ReviewData[]
}

const easing = [0.22, 1, 0.36, 1] as const

export function ReviewsBlock({ eyebrow, title, description, reviews }: ReviewsBlockProps) {
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

  const reviewList = reviews || []

  if (reviewList.length === 0) {
    return null
  }

  return (
    <motion.section
      initial={false}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
      className="bg-white py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          centered
          eyebrow={eyebrow || 'Guest Reviews'}
          title={title || 'Kind words from recent stays and celebrations.'}
          description={description}
        />

        <motion.div
          variants={containerVariants}
          className="mt-12 grid gap-6 lg:grid-cols-3"
        >
          {reviewList.slice(0, 3).map((review, reviewIndex) => (
            <motion.article
              key={`${review.guest_name}-${reviewIndex}`}
              variants={itemVariants}
              className="rounded-card border border-primary/10 bg-[#fcfdf9] p-7 shadow-[0_18px_50px_rgba(27,28,25,0.06)] flex flex-col justify-between"
            >
              <div>
                <ReviewStars rating={review.rating} />
                <p className="mt-6 text-lg italic leading-8 text-foreground line-clamp-6">
                  &ldquo;{review.review_text}&rdquo;
                </p>
              </div>
              <div className="mt-6 border-t border-primary/10 pt-5">
                <p className="text-base font-semibold text-foreground">
                  {review.guest_name}
                </p>
                <p className="mt-1 text-sm text-foreground/55">
                  {new Date(review.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
