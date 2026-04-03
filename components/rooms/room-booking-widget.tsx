'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Info,
  Loader2,
  Mail,
  Phone,
  User,
  Users,
  X,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { RoomData } from '@/lib/types'
import {
  addDaysToDateInput,
  calculateNights,
  formatIndianCurrency,
  getDefaultBookingDates,
} from '@/lib/room-helpers'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AvailabilityStatus = 'idle' | 'checking' | 'available' | 'unavailable' | 'invalid' | 'error'
type BookingStep = 'dates' | 'guest-details'
type BookingStatus = 'idle' | 'submitting' | 'success' | 'error'
type PaymentMethod = 'pay-now' | 'pay-at-reception'

type BookingResult = {
  booking_id: string | number
  total_amount: number
  nights: number
  room_name: string
  payment_method: PaymentMethod
}

const GST_RATE = 0.12

// ---------------------------------------------------------------------------
// Razorpay checkout script loader
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

function loadRazorpayScript(): Promise<void> {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout'))
    document.head.appendChild(script)
  })
}

// ---------------------------------------------------------------------------
// Cashfree checkout loader
// ---------------------------------------------------------------------------

async function openCashfreeCheckout(
  paymentSessionId: string,
  mode: string,
): Promise<{ error?: unknown; paymentDetails?: unknown }> {
  const { load } = await import('@cashfreepayments/cashfree-js')
  const cashfree = await load({ mode: mode as 'sandbox' | 'production' })
  return cashfree.checkout({
    paymentSessionId,
    redirectTarget: '_modal',
  })
}

// ---------------------------------------------------------------------------
// BookingCard props
// ---------------------------------------------------------------------------

type BookingCardProps = {
  room: RoomData
  checkIn: string
  checkOut: string
  guests: number
  availabilityStatus: AvailabilityStatus
  blockedDates: string[]
  bookingStep: BookingStep
  selectedPaymentMethod: PaymentMethod | null
  guestName: string
  guestPhone: string
  guestEmail: string
  bookingStatus: BookingStatus
  bookingError: string | null
  bookingResult: BookingResult | null
  onCheckInChange: (value: string) => void
  onCheckOutChange: (value: string) => void
  onGuestsChange: (value: number) => void
  onCheckAvailability: () => void
  onGuestNameChange: (value: string) => void
  onGuestPhoneChange: (value: string) => void
  onGuestEmailChange: (value: string) => void
  onProceedToDetails: (method: PaymentMethod) => void
  onBackToDates: () => void
  onSubmitBooking: () => void
  onNewBooking: () => void
  className?: string
}

// ---------------------------------------------------------------------------
// BookingCard (shared between desktop sidebar + mobile sheet)
// ---------------------------------------------------------------------------

function BookingCard({
  room,
  checkIn,
  checkOut,
  guests,
  availabilityStatus,
  blockedDates,
  bookingStep,
  selectedPaymentMethod,
  guestName,
  guestPhone,
  guestEmail,
  bookingStatus,
  bookingError,
  bookingResult,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
  onCheckAvailability,
  onGuestNameChange,
  onGuestPhoneChange,
  onGuestEmailChange,
  onProceedToDetails,
  onBackToDates,
  onSubmitBooking,
  onNewBooking,
  className,
}: BookingCardProps) {
  const nights = calculateNights(checkIn, checkOut)
  const billableNights = nights > 0 ? nights : 1
  const subtotal = room.price_per_night * billableNights
  const gst = Math.round(subtotal * GST_RATE)
  const total = subtotal + gst
  const canProceed =
    Boolean(checkIn) &&
    Boolean(checkOut) &&
    nights > 0 &&
    availabilityStatus === 'available'

  const isChecking = availabilityStatus === 'checking'
  const isSubmitting = bookingStatus === 'submitting'

  const isGuestFormValid =
    guestName.trim().length >= 2 &&
    /^[6-9]\d{9}$/.test(guestPhone) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)

  // -----------------------------------------------------------------------
  // SUCCESS STATE — Confirmation card
  // -----------------------------------------------------------------------
  if (bookingStatus === 'success' && bookingResult) {
    const isPayNow = bookingResult.payment_method === 'pay-now'
    return (
      <div
        className={cn(
          'rounded-card border border-card-accent/80 bg-warm-cream p-6 shadow-[0_24px_65px_rgba(53,102,9,0.08)] sm:p-8',
          className,
        )}
      >
        <div className="inline-flex size-12 items-center justify-center rounded-full bg-badge-green text-primary-deep">
          <CheckCircle2 className="size-6" />
        </div>

        <h3 className="mt-5 text-3xl italic text-foreground">
          Booking confirmed
        </h3>
        <p className="mt-4 text-sm leading-7 text-foreground/70">
          {isPayNow
            ? 'Your payment was successful. A confirmation email will be sent to you shortly.'
            : 'Your reservation has been noted. Please pay the full amount at the reception desk during check-in.'}
        </p>

        <div className="text-foreground/70 mt-6 rounded-card-inner bg-warm-sand p-4 text-sm">
          <div className="flex items-center justify-between">
            <span>Booking ID</span>
            <span className="font-medium text-foreground">#{bookingResult.booking_id}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span>Room</span>
            <span className="font-medium text-foreground">{bookingResult.room_name}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span>Dates</span>
            <span className="font-medium text-foreground">{checkIn} to {checkOut}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span>Duration</span>
            <span className="font-medium text-foreground">
              {bookingResult.nights} {bookingResult.nights === 1 ? 'night' : 'nights'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-divider pt-3">
            <span>{isPayNow ? 'Amount paid' : 'Total to pay at reception'}</span>
            <span className="font-semibold text-gold">
              {formatIndianCurrency(bookingResult.total_amount)}
            </span>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-foreground/55">
          We&apos;ll contact you on <strong>{guestPhone}</strong>
        </p>

        <Button
          type="button"
          onClick={onNewBooking}
          className="mt-6 h-auto w-full rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-label text-white hover:bg-primary-dark"
        >
          Book Another Room
        </Button>
      </div>
    )
  }

  // -----------------------------------------------------------------------
  // NORMAL STATE — Date selection + guest form
  // -----------------------------------------------------------------------
  return (
    <div
      className={cn(
        'rounded-card border border-card-accent/80 bg-warm-cream p-6 shadow-[0_24px_65px_rgba(53,102,9,0.08)] sm:p-8',
        className,
      )}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-label text-gold">
          Reserve
        </p>
        <h2 className="mt-3 text-3xl italic text-foreground">Book this room</h2>
        <p className="text-foreground/70 mt-3 text-sm leading-7">
          {bookingStep === 'dates'
            ? 'Select your dates and check real-time availability to proceed with booking.'
            : 'Enter your details to complete the reservation.'}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* ----------------------------------------------------------------- */}
        {/* STEP 1: Date selection                                             */}
        {/* ----------------------------------------------------------------- */}
        {bookingStep === 'dates' && (
          <motion.div
            key="dates"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
          >
            <div className="mt-7 grid gap-4">
              <label className="grid gap-2">
                <span className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
                  Check-in
                </span>
                <input
                  type="date"
                  value={checkIn}
                  min={getDefaultBookingDates().checkIn}
                  onChange={(event) => onCheckInChange(event.target.value)}
                  className="h-12 rounded-2xl border border-content-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
                  Check-out
                </span>
                <input
                  type="date"
                  value={checkOut}
                  min={addDaysToDateInput(checkIn, 1)}
                  onChange={(event) => onCheckOutChange(event.target.value)}
                  className="h-12 rounded-2xl border border-content-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
                  Guests
                </span>
                <div className="relative">
                  <Users className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-primary-deep" />
                  <select
                    value={guests}
                    onChange={(event) => onGuestsChange(Number(event.target.value))}
                    className="h-12 w-full appearance-none rounded-2xl border border-content-border bg-white pl-11 pr-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  >
                    {Array.from({ length: room.capacity || 6 }, (_, index) => index + 1).map(
                      (count) => (
                        <option key={count} value={count}>
                          {count} {count === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </label>
            </div>

            {/* Check Availability Button */}
            <Button
              type="button"
              onClick={onCheckAvailability}
              disabled={isChecking}
              className="mt-6 h-auto w-full rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-label text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {isChecking ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Checking…
                </>
              ) : (
                <>
                  <CalendarDays className="size-4" />
                  Check Availability
                </>
              )}
            </Button>

            {/* Status badges */}
            <AnimatePresence mode="wait">
              {availabilityStatus === 'available' && (
                <motion.div
                  key="available"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-4 flex items-start gap-3 rounded-2xl border border-[#b8d89d] bg-[#eef8e7] px-4 py-3 text-sm text-[#2f5d0a]"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                  Room is available for your selected dates!
                </motion.div>
              )}

              {availabilityStatus === 'unavailable' && (
                <motion.div
                  key="unavailable"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-4 flex flex-col gap-2 rounded-2xl border border-[#e8b4b4] bg-[#fef2f2] px-4 py-3 text-sm text-[#9b2c2c]"
                >
                  <div className="flex items-start gap-3">
                    <XCircle className="mt-0.5 size-4 shrink-0" />
                    <span>Not available for the selected dates. Please try different dates.</span>
                  </div>
                  {blockedDates.length > 0 && (
                    <p className="ml-7 text-xs text-[#9b2c2c]/70">
                      Blocked: {blockedDates.join(', ')}
                    </p>
                  )}
                </motion.div>
              )}

              {availabilityStatus === 'invalid' && (
                <motion.div
                  key="invalid"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-4 flex items-start gap-3 rounded-2xl border border-[#efd4c4] bg-[#fff4ee] px-4 py-3 text-sm text-[#8e4b21]"
                >
                  <Info className="mt-0.5 size-4 shrink-0" />
                  Choose a valid check-in and check-out range to continue.
                </motion.div>
              )}

              {availabilityStatus === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-4 flex items-start gap-3 rounded-2xl border border-[#efd4c4] bg-[#fff4ee] px-4 py-3 text-sm text-[#8e4b21]"
                >
                  <Info className="mt-0.5 size-4 shrink-0" />
                  Something went wrong. Please try again.
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* STEP 2: Guest details                                              */}
        {/* ----------------------------------------------------------------- */}
        {bookingStep === 'guest-details' && (
          <motion.div
            key="guest-details"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
          >
            <div className="mt-7 grid gap-4">
              <label className="grid gap-2">
                <span className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
                  Full Name
                </span>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-primary-deep" />
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => onGuestNameChange(e.target.value)}
                    placeholder="Your full name"
                    className="h-12 w-full rounded-2xl border border-content-border bg-white pl-11 pr-4 text-sm text-foreground shadow-sm outline-none transition placeholder:text-foreground/30 focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
                  Phone Number
                </span>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-primary-deep" />
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => onGuestPhoneChange(e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="h-12 w-full rounded-2xl border border-content-border bg-white pl-11 pr-4 text-sm text-foreground shadow-sm outline-none transition placeholder:text-foreground/30 focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
                  Email
                </span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-primary-deep" />
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => onGuestEmailChange(e.target.value)}
                    placeholder="your@email.com"
                    className="h-12 w-full rounded-2xl border border-content-border bg-white pl-11 pr-4 text-sm text-foreground shadow-sm outline-none transition placeholder:text-foreground/30 focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
              </label>
            </div>

            {/* Booking error */}
            {bookingError && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#e8b4b4] bg-[#fef2f2] px-4 py-3 text-sm text-[#9b2c2c]">
                <XCircle className="mt-0.5 size-4 shrink-0" />
                {bookingError}
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                onClick={onBackToDates}
                disabled={isSubmitting}
                className="h-auto rounded-xl border-content-border bg-transparent px-4 py-3 text-xs font-semibold uppercase tracking-label text-foreground hover:bg-warm-sand disabled:opacity-40"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={onSubmitBooking}
                disabled={!isGuestFormValid || isSubmitting}
                className="h-auto rounded-xl bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-label text-white hover:bg-primary-dark disabled:opacity-40"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {selectedPaymentMethod === 'pay-now' ? 'Processing…' : 'Booking…'}
                  </>
                ) : selectedPaymentMethod === 'pay-now' ? (
                  <>
                    <CreditCard className="size-4" />
                    Pay Now
                  </>
                ) : (
                  'Pay at Reception'
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Price breakdown — always visible */}
      <div className="mt-6 rounded-card-inner bg-warm-sand p-5">
        <div className="text-foreground/70 flex items-center justify-between text-sm">
          <span>
            {formatIndianCurrency(room.price_per_night)} × {billableNights}{' '}
            {billableNights === 1 ? 'night' : 'nights'}
          </span>
          <span>{formatIndianCurrency(subtotal)}</span>
        </div>
        <div className="text-foreground/70 mt-3 flex items-center justify-between text-sm">
          <span>GST (12%)</span>
          <span>{formatIndianCurrency(gst)}</span>
        </div>
        <div className="mt-4 border-t border-divider pt-4">
          <div className="flex items-center justify-between">
            <span className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
              Total
            </span>
            <span className="text-2xl font-bold text-gold">
              {formatIndianCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Proceed buttons — only on dates step when available */}
      {bookingStep === 'dates' && canProceed && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            onClick={() => onProceedToDetails('pay-now')}
            className="h-auto rounded-xl bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-label text-white hover:bg-primary-dark"
          >
            <CreditCard className="size-4" />
            Pay Now
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onProceedToDetails('pay-at-reception')}
            className="h-auto rounded-xl border-content-border bg-transparent px-4 py-3 text-xs font-semibold uppercase tracking-label text-foreground hover:bg-warm-sand"
          >
            Pay at Reception
          </Button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main widget — state management + API calls
// ---------------------------------------------------------------------------

export function RoomBookingWidget({ room }: { room: RoomData }) {
  const defaults = getDefaultBookingDates()
  const [checkIn, setCheckIn] = useState(defaults.checkIn)
  const [checkOut, setCheckOut] = useState(defaults.checkOut)
  const [guests, setGuests] = useState(Math.min(room.capacity || 4, 4))
  const [availabilityStatus, setAvailabilityStatus] =
    useState<AvailabilityStatus>('idle')
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)

  // Guest details
  const [bookingStep, setBookingStep] = useState<BookingStep>('dates')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestEmail, setGuestEmail] = useState('')

  // Booking state
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('idle')
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    document.body.style.overflow = mobileSheetOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileSheetOpen])

  function resetAvailability() {
    setAvailabilityStatus('idle')
    setBlockedDates([])
  }

  function handleCheckInChange(value: string) {
    setCheckIn(value)
    resetAvailability()
    setBookingStep('dates')
    if (calculateNights(value, checkOut) === 0) {
      setCheckOut(addDaysToDateInput(value, 1))
    }
  }

  function handleCheckOutChange(value: string) {
    setCheckOut(value)
    resetAvailability()
    setBookingStep('dates')
  }

  function handleNewBooking() {
    setBookingStep('dates')
    setSelectedPaymentMethod(null)
    setBookingStatus('idle')
    setBookingError(null)
    setBookingResult(null)
    setGuestName('')
    setGuestPhone('')
    setGuestEmail('')
    resetAvailability()
  }

  const handleCheckAvailability = useCallback(async () => {
    if (calculateNights(checkIn, checkOut) <= 0) {
      setAvailabilityStatus('invalid')
      return
    }

    if (abortRef.current) abortRef.current.abort()

    const controller = new AbortController()
    abortRef.current = controller

    setAvailabilityStatus('checking')
    setBlockedDates([])

    try {
      const params = new URLSearchParams({
        room_id: String(room.id),
        check_in: checkIn,
        check_out: checkOut,
      })

      const response = await fetch(`/api/availability?${params}`, {
        signal: controller.signal,
      })

      if (!response.ok) {
        setAvailabilityStatus('error')
        return
      }

      const data = await response.json()
      if (data.available) {
        setAvailabilityStatus('available')
      } else {
        setAvailabilityStatus('unavailable')
        setBlockedDates(data.blocked_dates || [])
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return
      setAvailabilityStatus('error')
    }
  }, [checkIn, checkOut, room.id])

  // -----------------------------------------------------------------------
  // Pay at Reception flow
  // -----------------------------------------------------------------------
  const handlePayAtReception = useCallback(async () => {
    setBookingStatus('submitting')
    setBookingError(null)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: String(room.id),
          guest_name: guestName.trim(),
          guest_phone: guestPhone.trim(),
          guest_email: guestEmail.trim(),
          check_in: checkIn,
          check_out: checkOut,
          guests_count: guests,
          payment_method: 'at_reception',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setBookingStatus('error')
        setBookingError(data.error || 'Something went wrong. Please try again.')
        return
      }

      setBookingStatus('success')
      setBookingResult({
        booking_id: data.booking_id,
        total_amount: data.total_amount,
        nights: data.nights,
        room_name: data.room_name,
        payment_method: 'pay-at-reception',
      })
      setMobileSheetOpen(false)
    } catch {
      setBookingStatus('error')
      setBookingError('Network error. Please check your connection and try again.')
    }
  }, [room.id, guestName, guestPhone, guestEmail, checkIn, checkOut, guests])

  // -----------------------------------------------------------------------
  // Pay Now flow — calls /api/payments/order then handles gateway response
  // -----------------------------------------------------------------------
  const handlePayNow = useCallback(async () => {
    setBookingStatus('submitting')
    setBookingError(null)

    try {
      const response = await fetch('/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: String(room.id),
          guest_name: guestName.trim(),
          guest_phone: guestPhone.trim(),
          guest_email: guestEmail.trim(),
          check_in: checkIn,
          check_out: checkOut,
          guests_count: guests,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setBookingStatus('error')
        setBookingError(data.error || 'Something went wrong. Please try again.')
        return
      }

      // ---- Handle gateway-specific response ----

      // Redirect gateways (PhonePe, CCAvenue, PayU)
      if (data.gateway_type === 'redirect' && data.redirect_url) {
        window.location.href = data.redirect_url
        return
      }

      // JS Checkout: Razorpay
      if (data.gateway === 'razorpay' && data.checkout_data) {
        try {
          await loadRazorpayScript()
          const rzp = new window.Razorpay({
            ...data.checkout_data,
            handler: () => {
              // Payment successful on frontend — webhook will confirm on backend
              setBookingStatus('success')
              setBookingResult({
                booking_id: data.booking_id,
                total_amount: data.total_amount,
                nights: data.nights,
                room_name: data.room_name,
                payment_method: 'pay-now',
              })
              setMobileSheetOpen(false)
            },
            modal: {
              ondismiss: () => {
                setBookingStatus('error')
                setBookingError('Payment was cancelled. You can try again.')
              },
            },
          })
          rzp.open()
          // Keep status as submitting while checkout is open
          return
        } catch {
          setBookingStatus('error')
          setBookingError('Failed to load payment checkout. Please try again.')
          return
        }
      }

      // JS Checkout: Cashfree
      if (data.gateway === 'cashfree' && data.checkout_data) {
        try {
          const result = await openCashfreeCheckout(
            data.checkout_data.payment_session_id as string,
            data.checkout_data.mode as string,
          )

          if (result.error) {
            setBookingStatus('error')
            setBookingError('Payment was cancelled or failed. Please try again.')
          } else if (result.paymentDetails) {
            setBookingStatus('success')
            setBookingResult({
              booking_id: data.booking_id,
              total_amount: data.total_amount,
              nights: data.nights,
              room_name: data.room_name,
              payment_method: 'pay-now',
            })
            setMobileSheetOpen(false)
          }
          return
        } catch {
          setBookingStatus('error')
          setBookingError('Failed to load payment checkout. Please try again.')
          return
        }
      }

      // Fallback — unknown gateway type
      setBookingStatus('error')
      setBookingError('Payment gateway configuration error. Please contact support.')
    } catch {
      setBookingStatus('error')
      setBookingError('Network error. Please check your connection and try again.')
    }
  }, [room.id, guestName, guestPhone, guestEmail, checkIn, checkOut, guests])

  // -----------------------------------------------------------------------
  // Submit handler — routes to the correct flow
  // -----------------------------------------------------------------------
  const handleSubmitBooking = useCallback(() => {
    if (selectedPaymentMethod === 'pay-now') {
      handlePayNow()
    } else {
      handlePayAtReception()
    }
  }, [selectedPaymentMethod, handlePayNow, handlePayAtReception])

  const sharedProps: BookingCardProps = {
    room,
    checkIn,
    checkOut,
    guests,
    availabilityStatus,
    blockedDates,
    bookingStep,
    selectedPaymentMethod,
    guestName,
    guestPhone,
    guestEmail,
    bookingStatus,
    bookingError,
    bookingResult,
    onCheckInChange: handleCheckInChange,
    onCheckOutChange: handleCheckOutChange,
    onGuestsChange: (value: number) => setGuests(value),
    onCheckAvailability: handleCheckAvailability,
    onGuestNameChange: setGuestName,
    onGuestPhoneChange: setGuestPhone,
    onGuestEmailChange: setGuestEmail,
    onProceedToDetails: (method: PaymentMethod) => {
      setSelectedPaymentMethod(method)
      setBookingStep('guest-details')
    },
    onBackToDates: () => {
      setBookingStep('dates')
      setBookingError(null)
    },
    onSubmitBooking: handleSubmitBooking,
    onNewBooking: handleNewBooking,
  }

  const nights = calculateNights(checkIn, checkOut)
  const billableNights = nights > 0 ? nights : 1

  return (
    <>
      <div id="booking" className="relative">
        <div className="hidden lg:sticky lg:top-28 lg:block">
          <BookingCard {...sharedProps} />
        </div>
      </div>

      {/* Mobile sticky bar */}
      {bookingStatus !== 'success' && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3 lg:hidden">
          <div className="pointer-events-auto rounded-card-inner border border-card-accent/80 bg-warm-cream/95 p-3 shadow-[0_24px_55px_rgba(53,102,9,0.14)] backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
                  From
                </p>
                <p className="mt-1 text-2xl font-bold text-gold">
                  {formatIndianCurrency(room.price_per_night)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-foreground/55 text-xs">
                  {billableNights} {billableNights === 1 ? 'night' : 'nights'}
                </p>
                <Button
                  type="button"
                  onClick={() => setMobileSheetOpen(true)}
                  className="mt-2 h-auto rounded-full bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-label text-white hover:bg-primary-dark"
                >
                  Book This Room
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile success card */}
      {bookingStatus === 'success' && bookingResult && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 lg:hidden">
          <BookingCard {...sharedProps} className="shadow-[0_24px_55px_rgba(53,102,9,0.14)]" />
        </div>
      )}

      {/* Mobile booking sheet */}
      <AnimatePresence>
        {mobileSheetOpen ? (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end bg-black/40 p-0 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close booking drawer"
              className="absolute inset-0"
              onClick={() => setMobileSheetOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-t-[2rem] bg-warm-base px-4 pb-8 pt-4"
            >
              <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-foreground/15" />
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-label text-gold">
                    Reserve
                  </p>
                  <h2 className="mt-2 text-2xl italic text-foreground">{room.name}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSheetOpen(false)}
                  className="inline-flex size-10 items-center justify-center rounded-full border border-content-border bg-white text-foreground shadow-sm"
                  aria-label="Close booking sheet"
                >
                  <X className="size-4" />
                </button>
              </div>
              <BookingCard {...sharedProps} className="mb-[4.5rem] shadow-none" />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
