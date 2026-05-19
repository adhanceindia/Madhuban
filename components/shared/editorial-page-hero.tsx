'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

import type { RouteHero } from '@/lib/page-content'
import { createEditorialMotion } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function EditorialPageHero({
  hero,
  imageAlt,
  imageOverride,
  children,
  className,
  minHeightClassName,
}: {
  hero: RouteHero
  imageAlt?: string
  imageOverride?: string
  children?: ReactNode
  className?: string
  minHeightClassName?: string
}) {
  const reduceMotion = useReducedMotion()
  const { sectionVariants } = createEditorialMotion(reduceMotion)

  return (
    <motion.section
      initial={false}
      animate="show"
      variants={sectionVariants}
      className={cn(
        'relative flex items-center overflow-hidden',
        minHeightClassName ?? 'min-h-[76svh]',
        className,
      )}
    >
      <div className="absolute inset-0">
        <Image
          src={imageOverride || hero.image}
          alt={imageAlt ?? hero.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,20,14,0.58),rgba(16,20,14,0.34)_42%,rgba(16,20,14,0.74))]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl px-4 pb-16 pt-36 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <p className="text-white/78 text-sm font-semibold uppercase tracking-eyebrow">
            {hero.eyebrow}
          </p>
          {hero.overlayWord ? (
            <p className="pointer-events-none mt-2 hidden select-none font-display text-[clamp(4.5rem,14vw,9rem)] italic leading-none text-white/10 lg:block">
              {hero.overlayWord}
            </p>
          ) : null}
          <h1 className="mt-4 text-balance text-5xl italic leading-tight text-white sm:text-6xl lg:text-7xl xl:text-[5.35rem]">
            {hero.title}
          </h1>
          <p className="text-white/88 mt-6 max-w-3xl text-lg leading-8 sm:text-xl">
            {hero.subtitle}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            {children}
            {hero.chip ? (
              <div className="border-white/18 text-white/82 rounded-full border bg-white/10 px-5 py-3 text-sm backdrop-blur">
                {hero.chip}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
