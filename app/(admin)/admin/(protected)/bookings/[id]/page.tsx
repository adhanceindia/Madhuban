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
        actions={
          <a
            href={`/admin/bookings/${booking.id}/invoice`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold bg-white border border-border hover:bg-sage-soft text-foreground rounded-lg transition-colors no-underline"
          >
            Print Invoice
          </a>
        }
      />
      <BookingDetail booking={booking} />
    </div>
  )
}
