import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { RoomDetailPageView } from '@/components/rooms/room-detail-page-view'
import { getRoomBySlug, getRelatedRooms, getRooms, getSiteContent } from '@/lib/data'

type RoomDetailPageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const rooms = await getRooms()

  return rooms.map((room) => ({
    slug: room.slug,
  }))
}

export async function generateMetadata({
  params,
}: RoomDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const room = await getRoomBySlug(slug)

  if (!room) {
    return {
      title: 'Room Not Found',
    }
  }

  const site = await getSiteContent()

  return {
    title: room.name,
    description: `${room.description} ${site.tagline}`,
    openGraph: {
      title: `${room.name} | Madhuban Garden Resort`,
      description: `${room.description} ${site.tagline}`,
    },
  }
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { slug } = await params
  const room = await getRoomBySlug(slug)

  if (!room) {
    notFound()
  }

  const relatedRooms = await getRelatedRooms(room.slug)

  return <RoomDetailPageView room={room} relatedRooms={relatedRooms} />
}
