import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RoomDetailPageView } from '@/components/rooms/room-detail-page-view'
import { resort, rooms } from '@/lib/dummy-data'
import { getRelatedRooms, getRoomBySlug } from '@/lib/room-helpers'

type RoomDetailPageProps = {
  params: {
    slug: string
  }
}

export function generateStaticParams() {
  return rooms.map((room) => ({
    slug: room.slug,
  }))
}

export function generateMetadata({ params }: RoomDetailPageProps): Metadata {
  const room = getRoomBySlug(params.slug)

  if (!room) {
    return {
      title: 'Room Not Found',
    }
  }

  return {
    title: room.name,
    description: `${room.description} ${resort.tagline}`,
    openGraph: {
      title: `${room.name} | Madhuban Garden Resort`,
      description: `${room.description} ${resort.tagline}`,
    },
  }
}

export default function RoomDetailPage({ params }: RoomDetailPageProps) {
  const room = getRoomBySlug(params.slug)

  if (!room) {
    notFound()
  }

  return (
    <RoomDetailPageView room={room} relatedRooms={getRelatedRooms(room.slug)} />
  )
}
