import { PageHeader } from '@/components/admin/shared/page-header'
import { RoomForm } from '@/components/admin/rooms/RoomForm'

export default function NewRoomPage() {
  return (
    <div>
      <PageHeader
        title="New room"
        subtitle="Add a room to the resort inventory"
        backHref="/admin/rooms"
        backLabel="Back to rooms"
      />
      <RoomForm />
    </div>
  )
}
