import { PageHeader } from '@/components/admin/shared/page-header'
import { BookingForm } from '@/components/admin/bookings/BookingForm'

export default function NewBookingPage() {
  return (
    <div>
      <PageHeader
        title="New booking"
        subtitle="Create a booking manually (walk-in, phone reservation, etc.)"
        backHref="/admin/bookings"
        backLabel="Back to bookings"
      />
      <BookingForm />
    </div>
  )
}
