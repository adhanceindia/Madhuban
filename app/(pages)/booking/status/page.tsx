import { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Booking Status | Madhuban Garden Resort',
  robots: { index: false },
}

// ---------------------------------------------------------------------------
// /booking/status?gateway=...&order_id=...&status=...
// Post-redirect landing page for redirect-based gateways
// ---------------------------------------------------------------------------

type Props = {
  searchParams: Promise<{ gateway?: string; order_id?: string; status?: string }>
}

export default async function BookingStatusPage({ searchParams }: Props) {
  const params = await searchParams
  const { order_id, status: statusParam } = params

  // Try to find booking by gateway_order_id
  let booking: Record<string, unknown> | null = null
  let roomName = 'Room'

  if (order_id) {
    try {
      const payload = await getPayload({ config })
      const result = await payload.find({
        collection: 'bookings',
        where: { gateway_order_id: { equals: order_id } },
        limit: 1,
      })

      if (result.docs[0]) {
        booking = result.docs[0] as unknown as Record<string, unknown>
        if (typeof booking.room === 'object' && booking.room !== null) {
          roomName = ((booking.room as Record<string, unknown>).name as string) || 'Room'
        }
      }
    } catch {
      // fall through — show generic status
    }
  }

  // Determine status from DB or URL param
  const paymentStatus = booking?.payment_status as string || statusParam || 'pending'
  const isSuccess = paymentStatus === 'paid' || statusParam === 'success'
  const isFailed = paymentStatus === 'failed' || statusParam === 'failed'
  const isPending = !isSuccess && !isFailed

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-card border border-card-accent/80 bg-warm-cream p-8 shadow-[0_24px_65px_rgba(53,102,9,0.08)]">
          {/* Icon */}
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

          {/* Heading */}
          <h1 className="mt-5 font-display text-3xl italic text-foreground">
            {isSuccess && 'Payment Successful'}
            {isFailed && 'Payment Failed'}
            {isPending && 'Processing Payment'}
          </h1>

          {/* Message */}
          <p className="mt-4 text-sm leading-7 text-foreground/70">
            {isSuccess &&
              'Your payment has been received and your booking is confirmed. A confirmation email has been sent to your registered email address.'}
            {isFailed &&
              'Your payment could not be processed. No amount has been charged. Please try again or choose a different payment method.'}
            {isPending &&
              'Your payment is being processed. You will receive a confirmation email shortly once the payment is verified.'}
          </p>

          {/* Booking details */}
          {booking && (
            <div className="mt-6 rounded-card-inner bg-warm-sand p-4 text-sm text-foreground/70">
              <div className="flex items-center justify-between">
                <span>Booking ID</span>
                <span className="font-medium text-foreground">#{String(booking.id)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span>Room</span>
                <span className="font-medium text-foreground">{roomName}</span>
              </div>
              {booking.check_in && booking.check_out ? (
                <div className="mt-3 flex items-center justify-between">
                  <span>Dates</span>
                  <span className="font-medium text-foreground">
                    {String(booking.check_in).split('T')[0]} to{' '}
                    {String(booking.check_out).split('T')[0]}
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
                    }).format(booking.total_amount as number)}
                  </span>
                </div>
              ) : null}
            </div>
          )}

          {/* Actions */}
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
