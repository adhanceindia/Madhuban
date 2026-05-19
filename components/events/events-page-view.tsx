'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

import { EditorialCtaPanel } from '@/components/shared/editorial-cta-panel'
import { EditorialPageHero } from '@/components/shared/editorial-page-hero'
import { SectionHeading } from '@/components/shared/section-heading'
import { SiteIcon } from '@/components/shared/site-icon'
import { Button } from '@/components/ui/button'
import { eventsPage } from '@/lib/page-content'
import { createEditorialMotion } from '@/lib/motion'
import { getHeroImage, type SiteContent } from '@/lib/types'

export function EventsPageView({ siteContent }: { siteContent: SiteContent }) {
  const reduceMotion = useReducedMotion()
  const { sectionVariants, containerVariants, itemVariants } =
    createEditorialMotion(reduceMotion)

  return (
    <div className="-mt-navbar overflow-x-clip bg-background">
      <EditorialPageHero
        hero={eventsPage.hero}
        imageOverride={getHeroImage(siteContent, 'events', '')}
        minHeightClassName="min-h-[70svh]"
        imageAlt="Event celebration setup at Madhuban Garden Resort"
      >
        <Button
          asChild
          size="lg"
          className="h-auto rounded-full bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-label text-white hover:bg-gold-dark"
        >
          <Link href="/contact#query-form">
            Plan Your Event
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
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16">
            <motion.div variants={itemVariants}>
              <SectionHeading
                eyebrow="Event Services"
                title={eventsPage.introTitle}
                description={eventsPage.introDescription}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="overflow-hidden rounded-card bg-white p-3 shadow-[0_28px_80px_rgba(27,28,25,0.08)]">
                <div className="relative aspect-[16/11] overflow-hidden rounded-card-inner">
                  <Image
                    src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"
                    alt="Corporate and social event setup at Madhuban Garden Resort"
                    fill
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={containerVariants}
            className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {eventsPage.services.map((service) => (
              <motion.article
                key={service.title}
                variants={itemVariants}
                className="rounded-card bg-warm-gray p-7 shadow-[0_16px_50px_rgba(27,28,25,0.05)]"
              >
                <span className="inline-flex size-14 items-center justify-center rounded-full bg-white text-primary-deep">
                  <SiteIcon icon={service.icon} className="size-6" />
                </span>
                <h3 className="mt-5 text-3xl italic text-foreground">
                  {service.title}
                </h3>
                <p className="text-foreground/70 mt-4 text-sm leading-7">
                  {service.description}
                </p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        className="bg-primary-light py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <EditorialCtaPanel
            eyebrow="Event Enquiry"
            title={eventsPage.ctaTitle}
            description={eventsPage.ctaDescription}
            primaryHref="/contact#query-form"
            primaryLabel="Send Enquiry"
          />
        </div>
      </motion.section>
    </div>
  )
}
