'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { EditorialPageHero } from '@/components/shared/editorial-page-hero'
import { SectionHeading } from '@/components/shared/section-heading'
import { getHeroImage, type SiteContent } from '@/lib/types'
import { useSiteContent } from '@/components/ui/preview-provider'
import { createEditorialMotion } from '@/lib/motion'

import { InteractiveMenu } from './interactive-menu'

export function RestaurantPageView({ siteContent: initialSiteContent, pageData: initialPageData }: { siteContent: SiteContent; pageData?: Record<string, unknown> }) {
  const siteContent = useSiteContent(initialSiteContent) as SiteContent
  const pageData = useSiteContent(initialPageData || {}) as Record<string, unknown>
  const reduceMotion = useReducedMotion()
  const { sectionVariants } = createEditorialMotion(reduceMotion)

  return (
    <div className="-mt-navbar overflow-x-clip bg-background">
      <EditorialPageHero
        hero={{
          eyebrow: 'Dining',
          title: (pageData.heading as string) || 'Exquisite Dining',
          subtitle: (pageData.description as string) || 'Savor multi-cuisine delicacies at our indoor and outdoor restaurant, prepared by expert chefs.',
          image: '', // Using imageOverride below
        }}
        imageOverride={(pageData.hero_image as string) || getHeroImage(siteContent, 'restaurant', 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80')}
        minHeightClassName="min-h-[72svh]"
        imageAlt="Restaurant at Madhuban Garden Resort"
      />

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
        className="bg-primary-light py-12 sm:py-16 lg:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Dining Menu"
            title="Explore Our Selection"
            description="Browse our luxury interactive dining menu to find your perfect meal."
            centered
          />

          <div className="mt-12 flex justify-center">
            {/* 3D Interactive Menu Component */}
            <InteractiveMenu />
          </div>
        </div>
      </motion.section>
    </div>
  )
}
