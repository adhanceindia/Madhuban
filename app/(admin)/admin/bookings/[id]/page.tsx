import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/admin/shared/page-header'
import { BookingDetail } from '@/components/admin/bookings/BookingDetail'
import { getBookingDetail } from '@/db/queries/bookings-admin'

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const booking = await getBookingDetail(parseInt(id))
  if (!booking) notFound()

  return (
    <div>
      <PageHeader
        title={booking.guest_name}
        subtitle={`Booking #${booking.id} · ${booking.room_name}`}
        backHref="/admin/bookings"
        backLabel="Back to bookings"
      />
      <BookingDetail booking={booking} />
    </div>
  )
}
