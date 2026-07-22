'use client'

import Link from 'next/link'

import { EditorialPageHero } from '@/components/shared/editorial-page-hero'
import { Button } from '@/components/ui/button'

export interface EditorialHeroBlockProps {
  eyebrow?: string
  title: string
  subtitle?: string
  image?: string
  overlayWord?: string
  chip?: string
  ctaText?: string
  ctaLink?: string
  minHeightClassName?: string
}

export function EditorialHeroBlock({
  eyebrow,
  title,
  subtitle,
  image,
  overlayWord,
  chip,
  ctaText,
  ctaLink,
  minHeightClassName,
}: EditorialHeroBlockProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hero: any = {
    eyebrow,
    title,
    subtitle,
    image: image || '',
    overlayWord,
    chip,
  }

  return (
    <EditorialPageHero hero={hero} minHeightClassName={minHeightClassName}>
      {ctaText && ctaLink ? (
        <Button asChild size="lg" className="h-auto rounded-full bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-label text-white hover:bg-gold-dark">
          <Link href={ctaLink}>{ctaText}</Link>
        </Button>
      ) : null}
    </EditorialPageHero>
  )
}
