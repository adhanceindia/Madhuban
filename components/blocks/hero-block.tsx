'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { HeroBookingBar } from '@/components/booking/hero-booking-bar'
import { RichTextContent } from '@/components/ui/rich-text-content'

const easing = [0.22, 1, 0.36, 1] as const

type HeroBlockProps = {
  image?: string
  heading?: string
  subtext?: string
  cta_text?: string
  cta_link?: string
}

export function HeroBlock({ image, heading, subtext, cta_text, cta_link }: HeroBlockProps) {
  const reduceMotion = useReducedMotion()

  const sectionVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 28 },
    show: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.65, ease: easing } },
  }

  return (
    <motion.section
      initial={false}
      animate="show"
      variants={sectionVariants}
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      <div className="absolute inset-0">
        <Image
          src={image || 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1920&q=80'}
          alt="Hero background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,18,10,0.58),rgba(12,18,10,0.38)_35%,rgba(12,18,10,0.65))]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-36 text-white sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <p className="text-sm font-semibold uppercase tracking-eyebrow text-white/80">Welcome</p>
          <h1 className="mt-6 max-w-5xl text-balance text-4xl italic leading-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            {heading || 'Your heading here'}
          </h1>
          {subtext ? (
            <RichTextContent html={subtext} className="mt-6 max-w-2xl text-balance text-lg leading-8 text-white/80 sm:text-xl [&_a]:text-gold [&_a]:hover:text-gold-dark" />
          ) : (
            <p className="mt-6 max-w-2xl text-balance text-lg leading-8 text-white/80 sm:text-xl">Your subtext here</p>
          )}
          
          <div className="mt-8 flex flex-col gap-4 sm:flex-row justify-center">
            {(cta_text || cta_link) && (
              <Button asChild size="lg" className="h-auto rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-label">
                <Link href={cta_link || '#'}>{cta_text || 'Click here'}</Link>
              </Button>
            )}
            <Button asChild size="lg" variant="outline" className="h-auto rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-label border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-md">
              <Link href="/wedding">Plan Your Wedding</Link>
            </Button>
          </div>

          <div className="mt-10 w-full sm:mt-12">
            <HeroBookingBar />
          </div>
        </div>
      </div>
    </motion.section>
  )
}
