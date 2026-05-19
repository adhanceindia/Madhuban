import type { Metadata } from 'next'

import { GalleryPageView } from '@/components/gallery/gallery-page-view'
import { getGallery, getSiteContent } from '@/lib/data'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent()

  return {
    title: 'Gallery',
    description: `Explore rooms, weddings, events, leisure spaces, and resort atmosphere in the Madhuban Garden Resort gallery. ${site.tagline}`,
    openGraph: {
      title: 'Gallery | Madhuban Garden Resort',
      description: `Explore rooms, weddings, events, leisure spaces, and resort atmosphere in the Madhuban Garden Resort gallery. ${site.tagline}`,
    },
  }
}

export default async function GalleryPage() {
  const [galleryItems, siteContent] = await Promise.all([getGallery(), getSiteContent()])

  return <GalleryPageView galleryItems={galleryItems} siteContent={siteContent} />
}
