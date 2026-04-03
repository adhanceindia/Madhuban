'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

import { EditorialPageHero } from '@/components/shared/editorial-page-hero'
import { EditorialPhotoStrip } from '@/components/shared/editorial-photo-strip'
import { SectionHeading } from '@/components/shared/section-heading'
import { SiteIcon } from '@/components/shared/site-icon'
import { Button } from '@/components/ui/button'
import { poolPage } from '@/lib/page-content'
import { createEditorialMotion } from '@/lib/motion'

export function PoolPageView() {
  const reduceMotion = useReducedMotion()
  const { sectionVariants, itemVariants } = createEditorialMotion(reduceMotion)

  return (
    <div className="-mt-navbar overflow-x-clip bg-background">
      <EditorialPageHero
        hero={poolPage.hero}
        minHeightClassName="min-h-[68svh]"
        imageAlt="Swimming pool and leisure area at Madhuban Garden Resort"
      >
        <Button
          asChild
          size="lg"
          className="h-auto rounded-full bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-label text-white hover:bg-gold-dark"
        >
          <Link href="/rooms">
            Plan A Stay
            <SiteIcon icon="ArrowRight" className="size-4" />
          </Link>
        </Button>
      </EditorialPageHero>

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.18 }}
        variants={sectionVariants}
        className="bg-background py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center lg:gap-16">
            <motion.div variants={itemVariants}>
              <div className="overflow-hidden rounded-card bg-white p-3 shadow-[0_28px_80px_rgba(27,28,25,0.08)]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-card-inner sm:aspect-[16/11] lg:aspect-[4/5]">
                  <Image
                    src={poolPage.photos[0].src}
                    alt={poolPage.photos[0].alt}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <SectionHeading
                eyebrow="Pool Overview"
                title={poolPage.overviewTitle}
              />

              <div className="mt-6 grid gap-5">
                {poolPage.overviewDescription.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-base leading-8 text-foreground/70"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-8 grid gap-5 xl:grid-cols-[0.38fr_0.62fr]">
                <div className="rounded-card-md bg-primary-light p-5">
                  <p className="text-xs font-semibold uppercase tracking-label text-gold">
                    Timings
                  </p>
                  <p className="mt-4 text-3xl italic text-foreground">
                    {poolPage.timings}
                  </p>
                </div>

                <div className="grid gap-3">
                  {poolPage.rules.map((rule) => (
                    <div
                      key={rule}
                      className="flex items-start gap-3 rounded-card-inner bg-warm-gray px-4 py-4"
                    >
                      <span className="mt-1 inline-flex size-8 items-center justify-center rounded-full bg-white text-primary-deep">
                        <SiteIcon icon="CheckCircle2" className="size-4" />
                      </span>
                      <p className="text-sm leading-7 text-foreground/70">
                        {rule}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.16 }}
        variants={sectionVariants}
        className="bg-primary-light py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Pool Moments"
            title="A relaxed visual strip of the water, deck, and surrounding resort atmosphere."
            description="This section is intentionally light and image-led, matching the way the pool complements the wider resort rather than competing with the main accommodation and wedding experiences."
          />
          <div className="mt-10">
            <EditorialPhotoStrip items={poolPage.photos} />
          </div>
        </div>
      </motion.section>
    </div>
  )
}
