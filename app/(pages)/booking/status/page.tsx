import { Metadata } from 'next'
import Link from 'next/link'
import { getDb } from '@/db/client'
import { bookings, rooms } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Booking Status | Madhuban Garden Resort',
  robots: { index: false },
}

type Props = {
  searchParams: Promise<{ gateway?: string; order_id?: string; status?: string }>
}

export default async function BookingStatusPage({ searchParams }: Props) {
  const params = await searchParams
  const { order_id, status: statusParam } = params

  let booking: typeof bookings.$inferSelect | null = null
  let roomName = 'Room'

  if (order_id) {
    try {
      const db = getDb()
      const [row] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.gateway_order_id, order_id))
        .limit(1)

      if (row) {
        booking = row
        const [room] = await db.select().from(rooms).where(eq(rooms.id, row.room_id)).limit(1)
        if (room) roomName = room.name
      }
    } catch {
      // fall through — show generic status
    }
  }

  const paymentStatus = booking?.payment_status || statusParam || 'pending'
  const isSuccess = paymentStatus === 'paid' || statusParam === 'success'
  const isFailed = paymentStatus === 'failed' || statusParam === 'failed'
  const isPending = !isSuccess && !isFailed

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-card border border-card-accent/80 bg-warm-cream p-8 shadow-[0_24px_65px_rgba(53,102,9,0.08)]">
          <div
            className={`inline-flex size-14 items-center justify-center rounded-full ${
              isSuccess
                ? 'bg-primary-light text-primary-deep'
                : isFailed
                  ? 'bg-red-50 text-red-600'
                  : 'bg-amber-50 text-amber-600'
            }`}
          >
            {isSuccess && <CheckCircle2 className="size-7" />}
            {isFailed && <XCircle className="size-7" />}
            {isPending && <Clock className="size-7" />}
          </div>

          <h1 className="mt-5 font-display text-3xl italic text-foreground">
            {isSuccess && 'Payment Successful'}
            {isFailed && 'Payment Failed'}
            {isPending && 'Processing Payment'}
          </h1>

          <p className="mt-4 text-sm leading-7 text-foreground/70">
            {isSuccess &&
              'Your payment has been received and your booking is confirmed. A confirmation email has been sent to your registered email address.'}
            {isFailed &&
              'Your payment could not be processed. No amount has been charged. Please try again or choose a different payment method.'}
            {isPending &&
              'Your payment is being processed. You will receive a confirmation email shortly once the payment is verified.'}
          </p>

          {booking && (
            <div className="mt-6 rounded-card-inner bg-warm-sand p-4 text-sm text-foreground/70">
              <div className="flex items-center justify-between">
                <span>Booking ID</span>
                <span className="font-medium text-foreground">#{booking.id}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span>Room</span>
                <span className="font-medium text-foreground">{roomName}</span>
              </div>
              {booking.check_in && booking.check_out ? (
                <div className="mt-3 flex items-center justify-between">
                  <span>Dates</span>
                  <span className="font-medium text-foreground">
                    {booking.check_in} to {booking.check_out}
                  </span>
                </div>
              ) : null}
              {booking.total_amount ? (
                <div className="mt-3 flex items-center justify-between border-t border-divider pt-3">
                  <span>Total</span>
                  <span className="font-semibold text-gold">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    }).format(booking.total_amount)}
                  </span>
                </div>
              ) : null}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Link
              href="/rooms"
              className="inline-flex h-auto flex-1 items-center justify-center rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-label text-white hover:bg-primary-600"
            >
              {isFailed ? 'Try Again' : 'Continue Browsing'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
