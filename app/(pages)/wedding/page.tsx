import type { Metadata } from 'next'

import { WeddingPageView } from '@/components/wedding/wedding-page-view'
import { resort } from '@/lib/dummy-data'

export const metadata: Metadata = {
  title: 'Wedding Venue',
  description: `Begin your forever at Madhuban Garden Resort. ${resort.tagline}`,
}

export default function WeddingPage() {
  return <WeddingPageView />
}
