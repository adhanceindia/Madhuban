'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

import { EditorialCtaPanel } from '@/components/shared/editorial-cta-panel'
import { EditorialPageHero } from '@/components/shared/editorial-page-hero'
import { EditorialPhotoStrip } from '@/components/shared/editorial-photo-strip'
import { SectionHeading } from '@/components/shared/section-heading'
import { SiteIcon } from '@/components/shared/site-icon'
import { Button } from '@/components/ui/button'
import { banquetPage } from '@/lib/page-content'
import { createEditorialMotion } from '@/lib/motion'

export function BanquetPageView() {
  const reduceMotion = useReducedMotion()
  const { sectionVariants, containerVariants, itemVariants } =
    createEditorialMotion(reduceMotion)

  return (
    <div className="-mt-navbar overflow-x-clip bg-background">
      <EditorialPageHero
        hero={banquetPage.hero}
        minHeightClassName="min-h-[72svh]"
        imageAlt="Banquet hall at Madhuban Garden Resort"
      >
        <Button
          asChild
          size="lg"
          className="h-auto rounded-full bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-label text-white hover:bg-gold-dark"
        >
          <Link href="/contact#query-form">
            Enquire Now
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
                    src={banquetPage.overviewImage}
                    alt="Banquet hall overview at Madhuban Garden Resort"
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <SectionHeading
                eyebrow="Hall Overview"
                title={banquetPage.overviewTitle}
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {banquetPage.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-card-inner bg-warm-gray px-4 py-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-label text-gold">
                      {stat.label}
                    </p>
                    <p className="text-foreground/70 mt-3 text-sm leading-6">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-5">
                {banquetPage.overviewDescription.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-base leading-8 text-foreground/70"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {banquetPage.facilities.map((facility) => (
                  <div
                    key={facility.label}
                    className="flex items-center gap-4 rounded-card-inner bg-primary-light px-4 py-4"
                  >
                    <span className="inline-flex size-10 items-center justify-center rounded-full bg-white text-primary-deep">
                      <SiteIcon icon={facility.icon} className="size-5" />
                    </span>
                    <span className="text-foreground/70 text-sm leading-6">
                      {facility.label}
                    </span>
                  </div>
                ))}
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
            eyebrow="Use Cases"
            title="A versatile indoor venue for celebrations, formal gatherings, and hosted social events."
            description="The hall adapts well to wedding functions, business formats, and milestone celebrations without losing the calm resort hospitality that surrounds it."
            centered
          />

          <motion.div
            variants={containerVariants}
            className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {banquetPage.useCases.map((useCase) => (
              <motion.article
                key={useCase.title}
                variants={itemVariants}
                className="rounded-card bg-white/85 p-7 shadow-[0_20px_55px_rgba(56,106,14,0.08)] backdrop-blur"
              >
                <span className="inline-flex size-14 items-center justify-center rounded-full bg-primary-light text-primary-deep">
                  <SiteIcon icon={useCase.icon} className="size-6" />
                </span>
                <h3 className="mt-5 text-3xl italic text-foreground">
                  {useCase.title}
                </h3>
                <p className="text-foreground/70 mt-4 text-sm leading-7">
                  {useCase.description}
                </p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.16 }}
        variants={sectionVariants}
        className="bg-background py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Photo Strip"
            title="A quick visual sense of the banquet atmosphere."
            description="Elegantly appointed interiors that set the tone for every celebration."
          />
          <div className="mt-10">
            <EditorialPhotoStrip items={banquetPage.photos} />
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        className="bg-warm-gray py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <EditorialCtaPanel
            eyebrow="Banquet Enquiry"
            title={banquetPage.ctaTitle}
            description={banquetPage.ctaDescription}
            primaryHref="/contact#query-form"
            primaryLabel="Send Enquiry"
          />
        </div>
      </motion.section>
    </div>
  )
}
