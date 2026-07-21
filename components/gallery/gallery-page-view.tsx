'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { EditorialPageHero } from '@/components/shared/editorial-page-hero'
import { SectionHeading } from '@/components/shared/section-heading'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { galleryPage, type GalleryCategory } from '@/lib/page-content'
import { createEditorialMotion } from '@/lib/motion'
import { getHeroImage, type GalleryItemData, type SiteContent } from '@/lib/types'
import { cn } from '@/lib/utils'

type GalleryFilter = 'all' | GalleryCategory

const filterOptions: { label: string; value: GalleryFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Rooms', value: 'rooms' },
  { label: 'Wedding', value: 'wedding' },
  { label: 'Events', value: 'events' },
  { label: 'Pool', value: 'pool' },
  { label: 'Restaurant', value: 'restaurant' },
]

function formatCategory(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

import { useSiteContent } from '@/components/ui/preview-provider'

export function GalleryPageView({ galleryItems, siteContent: initialSiteContent, pageData: initialPageData }: { galleryItems: GalleryItemData[]; siteContent: SiteContent; pageData?: Record<string, unknown> }) {
  const siteContent = useSiteContent(initialSiteContent) as SiteContent
  const pageData = useSiteContent(initialPageData || {}) as Record<string, unknown>
  const reduceMotion = useReducedMotion()
  const { sectionVariants, containerVariants, itemVariants } =
    createEditorialMotion(reduceMotion)
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>('all')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const filteredItems = useMemo(
    () =>
      activeFilter === 'all'
        ? galleryItems
        : galleryItems.filter((item) => item.category === activeFilter),
    [activeFilter, galleryItems],
  )

  const selectedItem =
    selectedIndex !== null ? filteredItems[selectedIndex] : null

  useEffect(() => {
    setSelectedIndex(null)
  }, [activeFilter])

  function openAt(index: number) {
    setSelectedIndex(index)
  }

  function moveSelection(direction: 'prev' | 'next') {
    if (selectedIndex === null) return
    const nextIndex =
      direction === 'prev' ? selectedIndex - 1 : selectedIndex + 1
    if (nextIndex < 0 || nextIndex >= filteredItems.length) return
    setSelectedIndex(nextIndex)
  }

  function renderItem(item: GalleryItemData, index: number, isMasonry = false) {
    return (
      <motion.button
        key={`${item.src}-${activeFilter}-${index}-${isMasonry ? 'm' : 'g'}`}
        type="button"
        variants={itemVariants}
        onClick={() => openAt(index)}
        className={cn(
          'group w-full overflow-hidden rounded-card-md bg-white p-3 text-left shadow-[0_22px_60px_rgba(27,28,25,0.08)] transition-transform duration-300 hover:-translate-y-1',
          isMasonry && 'mb-6 break-inside-avoid',
        )}
      >
        <div
          className={cn(
            'relative overflow-hidden rounded-card-sm',
            'aspect-square',
          )}
        >
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes={
              isMasonry
                ? '(min-width: 1024px) 30vw, 100vw'
                : '(min-width: 640px) 50vw, 100vw'
            }
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,22,14,0.02),rgba(17,22,14,0.2))]" />
          <span className="absolute left-4 top-4 z-10 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-label text-primary-deep backdrop-blur">
            {formatCategory(item.category)}
          </span>
        </div>
        <div className="px-2 pb-2 pt-5">
          <h3 className="text-2xl italic text-foreground">{item.caption}</h3>
        </div>
      </motion.button>
    )
  }

  return (
    <div className="-mt-navbar overflow-x-clip bg-background">
      <EditorialPageHero
        hero={{
          ...galleryPage.hero,
          title: (pageData.heading as string) || galleryPage.hero.title,
          subtitle: (pageData.description as string) || galleryPage.hero.subtitle,
        }}
        imageOverride={(pageData.hero_image as string) || getHeroImage(siteContent, 'gallery', '')}
        minHeightClassName="min-h-[66svh]"
        imageAlt="Gallery collage of Madhuban Garden Resort spaces"
      >
        <Button
          asChild
          size="lg"
          className="h-auto rounded-full bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-label text-white hover:bg-gold-dark"
        >
          <a href="#gallery-grid">Browse Gallery</a>
        </Button>
      </EditorialPageHero>

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.12 }}
        variants={sectionVariants}
        className="bg-background py-12 sm:py-16 lg:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Resort Imagery"
            title="A visual look at rooms, celebrations, leisure, and the slower rhythm of Madhuban."
            description={galleryPage.description}
            centered
          />

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {filterOptions.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  'rounded-full px-5 py-2.5 text-sm font-medium transition-colors',
                  activeFilter === filter.value
                    ? 'bg-primary text-white shadow-[0_16px_35px_rgba(56,106,14,0.18)]'
                    : 'text-foreground/70 bg-filter-idle hover:bg-filter-hover',
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <motion.div
            id="gallery-grid"
            variants={containerVariants}
            initial={false}
            animate="show"
            className="mt-12"
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:hidden">
              {filteredItems.map((item, index) => renderItem(item, index))}
            </div>

            <div className="hidden gap-6 lg:block lg:columns-3">
              {filteredItems.map((item, index) =>
                renderItem(item, index, true),
              )}
            </div>
          </motion.div>
        </div>
      </motion.section>

      <Dialog
        open={selectedIndex !== null}
        onOpenChange={(open) => !open && setSelectedIndex(null)}
      >
        {selectedItem ? (
          <DialogContent className="max-h-[92svh] overflow-y-auto border-none p-4 sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="relative aspect-[5/4] overflow-hidden rounded-card-md bg-primary-light">
                <Image
                  src={selectedItem.src}
                  alt={selectedItem.alt}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="px-2 py-2 sm:px-4">
                <span className="inline-flex rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-label text-primary-deep">
                  {formatCategory(selectedItem.category)}
                </span>
                <DialogTitle className="mt-5">{selectedItem.caption}</DialogTitle>
                <DialogDescription className="mt-4">
                  {selectedItem.caption}
                </DialogDescription>
                <p className="text-foreground/55 mt-4 text-sm leading-7">
                  Image {selectedIndex! + 1} of {filteredItems.length} in the
                  active gallery filter.
                </p>

                <div className="mt-8 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => moveSelection('prev')}
                    disabled={selectedIndex === 0}
                    className="rounded-full"
                  >
                    <ChevronLeft className="size-4" />
                    Prev
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => moveSelection('next')}
                    disabled={selectedIndex === filteredItems.length - 1}
                    className="rounded-full"
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  )
}
