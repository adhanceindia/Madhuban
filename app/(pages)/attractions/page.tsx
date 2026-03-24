import type { Metadata } from 'next'

import { AttractionsPageView } from '@/components/attractions/attractions-page-view'
import { resort } from '@/lib/dummy-data'

export const metadata: Metadata = {
  title: 'Nearby Attractions',
  description: `Explore temple visits and nearby destinations while staying at Madhuban Garden Resort. ${resort.tagline}`,
  openGraph: {
    title: 'Nearby Attractions | Madhuban Garden Resort',
    description: `Explore temple visits and nearby destinations while staying at Madhuban Garden Resort. ${resort.tagline}`,
  },
}

export default function AttractionsPage() {
  return <AttractionsPageView />
}
