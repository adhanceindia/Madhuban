import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/admin/shared/page-header'
import { RoomForm } from '@/components/admin/rooms/RoomForm'
import { getRoomById } from '@/db/queries/rooms-admin'

export default async function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = await getRoomById(parseInt(id))
  if (!room) notFound()

  return (
    <div>
      <PageHeader
        title={`Edit ${room.name}`}
        subtitle="Update room details, photos, and amenities"
        backHref="/admin/rooms"
        backLabel="Back to rooms"
      />
      <RoomForm room={room} />
    </div>
  )
}
