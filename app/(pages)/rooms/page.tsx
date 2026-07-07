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

type RoomsPageProps = {
  searchParams: Promise<{
    check_in?: string
    check_out?: string
    guests?: string
  }>
}

export default async function RoomsPage({ searchParams }: RoomsPageProps) {
  const rooms = await getRooms()
  const params = await searchParams

  return (
    <RoomsPageView
      rooms={rooms}
      initialCheckIn={params.check_in}
      initialCheckOut={params.check_out}
      initialGuests={params.guests ? parseInt(params.guests, 10) : undefined}
    />
  )
}
