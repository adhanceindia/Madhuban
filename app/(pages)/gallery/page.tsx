import type { Metadata } from 'next'

import { GalleryPageView } from '@/components/gallery/gallery-page-view'
import { resort } from '@/lib/dummy-data'

export const metadata: Metadata = {
  title: 'Gallery',
  description: `Explore rooms, weddings, events, leisure spaces, and resort atmosphere in the Madhuban Garden Resort gallery. ${resort.tagline}`,
  openGraph: {
    title: 'Gallery | Madhuban Garden Resort',
    description: `Explore rooms, weddings, events, leisure spaces, and resort atmosphere in the Madhuban Garden Resort gallery. ${resort.tagline}`,
  },
}

export default function GalleryPage() {
  return <GalleryPageView />
}
