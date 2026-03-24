import type { Metadata } from 'next'

import { RoomsPageView } from '@/components/rooms/rooms-page-view'
import { resort } from '@/lib/dummy-data'

export const metadata: Metadata = {
  title: 'Our Rooms & Suites',
  description: `${resort.tagline} Explore the current room and suite collection at Madhuban Garden Resort.`,
}

export default function RoomsPage() {
  return <RoomsPageView />
}
