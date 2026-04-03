import type { Metadata } from 'next'

import { RoomsPageView } from '@/components/rooms/rooms-page-view'
import { getRooms, getSiteContent } from '@/lib/data'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent()

  return {
    title: 'Our Rooms & Suites',
    description: `${site.tagline} Explore the current room and suite collection at Madhuban Garden Resort.`,
    openGraph: {
      title: 'Our Rooms & Suites | Madhuban Garden Resort',
      description: `${site.tagline} Explore the current room and suite collection at Madhuban Garden Resort.`,
    },
  }
}

export default async function RoomsPage() {
  const rooms = await getRooms()

  return <RoomsPageView rooms={rooms} />
}
