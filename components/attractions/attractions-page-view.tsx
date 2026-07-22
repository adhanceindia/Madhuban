'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

import { EditorialCtaPanel } from '@/components/shared/editorial-cta-panel'
import { EditorialPageHero } from '@/components/shared/editorial-page-hero'
import { SectionHeading } from '@/components/shared/section-heading'
import { SiteIcon } from '@/components/shared/site-icon'
import { Button } from '@/components/ui/button'
import { attractions, attractionsPage } from '@/lib/page-content'
import { createEditorialMotion } from '@/lib/motion'
import { getHeroImage, type SiteContent } from '@/lib/types'
import { cn } from '@/lib/utils'

import { useSiteContent } from '@/components/ui/preview-provider'

export function AttractionsPageView({ siteContent: initialSiteContent, pageData: initialPageData }: { siteContent: SiteContent; pageData?: Record<string, unknown> }) {
  const siteContent = useSiteContent(initialSiteContent) as SiteContent
  const pageData = useSiteContent(initialPageData || {}) as Record<string, unknown>
  const reduceMotion = useReducedMotion()
  const { sectionVariants, itemVariants } = createEditorialMotion(reduceMotion)

  return (
    <div className="-mt-navbar overflow-x-clip bg-background">
      <EditorialPageHero
        hero={{
          ...attractionsPage.hero,
          title: (pageData.heading as string) || attractionsPage.hero.title,
          subtitle: (pageData.description as string) || attractionsPage.hero.subtitle,
        }}
        imageOverride={(pageData.hero_image as string) || getHeroImage(siteContent, 'attractions', '')}
        minHeightClassName="min-h-[68svh]"
        imageAlt="Nearby attractions and travel mood around Madhuban Garden Resort"
      >
        <Button
          asChild
          size="lg"
          className="h-auto rounded-full bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-label text-white hover:bg-gold-dark"
        >
          <Link href="/rooms">
            {(pageData.cta_button as string) || "Plan Your Stay"}
            <SiteIcon icon="ArrowRight" className="size-4" />
          </Link>
        </Button>
      </EditorialPageHero>

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.18 }}
        variants={sectionVariants}
        className="bg-background py-12 sm:py-16 lg:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={(pageData.trips_eyebrow as string) || "Spiritual Day Trips"}
            title={(pageData.trips_title as string) || "Temple destinations often paired with a peaceful Madhuban stay."}
            description={(pageData.trips_description as string) || "These nearby attractions give guests an easy way to combine a quiet resort base with meaningful family travel across the region."}
            centered
          />

          <div className="mt-14 space-y-10">
            {attractions.map((attraction, index) => (
              <motion.article
                key={attraction.name}
                variants={itemVariants}
                className="rounded-card bg-warm-gray px-4 py-4 shadow-[0_18px_55px_rgba(27,28,25,0.05)] sm:px-6 sm:py-6"
              >
                <div className="grid gap-8 lg:grid-cols-[0.58fr_0.42fr] lg:items-center">
                  <div className={cn(index % 2 === 1 && 'lg:order-2')}>
                    <div className="relative aspect-[16/11] overflow-hidden rounded-card-md">
                      <Image
                        src={attraction.image}
                        alt={attraction.name}
                        fill
                        sizes="(min-width: 1024px) 54vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <div
                    className={cn('px-2 py-2', index % 2 === 1 && 'lg:order-1')}
                  >
                    <p className="text-xs font-semibold uppercase tracking-eyebrow text-gold">
                      {(pageData.card_eyebrow as string) || "Nearby Attraction"}
                    </p>
                    <h2 className="mt-4 text-balance text-4xl italic leading-tight text-foreground sm:text-5xl">
                      {attraction.name}
                    </h2>
                    <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm text-primary-deep">
                      <SiteIcon icon="MapPin" className="size-4" />
                      {attraction.distance}
                    </div>
                    <p className="text-foreground/70 mt-6 text-base leading-8">
                      {attraction.description}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        className="bg-primary-light py-12 sm:py-16 lg:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <EditorialCtaPanel
            eyebrow={(pageData.plan_visit_eyebrow as string) || "Plan Your Visit"}
            title={attractionsPage.visitPlanTitle}
            description={attractionsPage.visitPlanDescription}
            primaryHref="/rooms"
            primaryLabel="Explore Rooms"
            secondaryHref="/contact"
            secondaryLabel="Contact Resort"
          />
        </div>
      </motion.section>
    </div>
  )
}
