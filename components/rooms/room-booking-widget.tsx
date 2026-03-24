'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, CheckCircle2, Info, Users, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { Room } from '@/lib/dummy-data'
import {
  addDaysToDateInput,
  calculateNights,
  formatIndianCurrency,
  getDefaultBookingDates,
} from '@/lib/room-helpers'
import { cn } from '@/lib/utils'

type AvailabilityStatus = 'idle' | 'available' | 'invalid'
type ConfirmationMode = 'pay-now' | 'pay-at-reception' | null

type BookingCardProps = {
  room: Room
  checkIn: string
  checkOut: string
  guests: number
  availabilityStatus: AvailabilityStatus
  onCheckInChange: (value: string) => void
  onCheckOutChange: (value: string) => void
  onGuestsChange: (value: number) => void
  onCheckAvailability: () => void
  onConfirm: (mode: Exclude<ConfirmationMode, null>) => void
  className?: string
}

function BookingCard({
  room,
  checkIn,
  checkOut,
  guests,
  availabilityStatus,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
  onCheckAvailability,
  onConfirm,
  className,
}: BookingCardProps) {
  const nights = calculateNights(checkIn, checkOut)
  const billableNights = nights > 0 ? nights : 1
  const total = room.price_per_night * billableNights
  const canProceed = Boolean(checkIn) && Boolean(checkOut) && nights > 0

  return (
    <div
      className={cn(
        'rounded-[2rem] border border-[#c0dd97]/80 bg-[#fffdf8] p-6 shadow-[0_24px_65px_rgba(53,102,9,0.08)] sm:p-8',
        className,
      )}
    >
      <div>
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[#356609]/80">
          Demo Booking
        </p>
        <h2 className="mt-3 text-3xl italic text-foreground">Book this room</h2>
        <p className="text-foreground/68 mt-3 text-sm leading-7">
          Availability is hardcoded for this phase. The form and confirmations
          are UI-only until backend approval.
        </p>
      </div>

      <div className="mt-7 grid gap-4">
        <label className="grid gap-2">
          <span className="text-foreground/52 text-[0.68rem] font-semibold uppercase tracking-[0.24em]">
            Check-in
          </span>
          <input
            type="date"
            value={checkIn}
            min={getDefaultBookingDates().checkIn}
            onChange={(event) => onCheckInChange(event.target.value)}
            className="h-12 rounded-2xl border border-[#d9e2cf] bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-[#386a0e] focus:ring-2 focus:ring-[#386a0e]/15"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-foreground/52 text-[0.68rem] font-semibold uppercase tracking-[0.24em]">
            Check-out
          </span>
          <input
            type="date"
            value={checkOut}
            min={addDaysToDateInput(checkIn, 1)}
            onChange={(event) => onCheckOutChange(event.target.value)}
            className="h-12 rounded-2xl border border-[#d9e2cf] bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-[#386a0e] focus:ring-2 focus:ring-[#386a0e]/15"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-foreground/52 text-[0.68rem] font-semibold uppercase tracking-[0.24em]">
            Guests
          </span>
          <div className="relative">
            <Users className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#356609]" />
            <select
              value={guests}
              onChange={(event) => onGuestsChange(Number(event.target.value))}
              className="h-12 w-full appearance-none rounded-2xl border border-[#d9e2cf] bg-white pl-11 pr-4 text-sm text-foreground shadow-sm outline-none transition focus:border-[#386a0e] focus:ring-2 focus:ring-[#386a0e]/15"
            >
              {Array.from({ length: 6 }, (_, index) => index + 1).map(
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

      <Button
        type="button"
        onClick={onCheckAvailability}
        className="mt-6 h-auto w-full rounded-full bg-[#386a0e] px-6 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white hover:bg-[#2f590b]"
      >
        <CalendarDays className="size-4" />
        Check Availability
      </Button>

      {availabilityStatus === 'available' ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#b8d89d] bg-[#eef8e7] px-4 py-3 text-sm text-[#2f5d0a]">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          Available for your selected dates. This is a front-end demo flow for
          client review.
        </div>
      ) : null}

      {availabilityStatus === 'invalid' ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#efd4c4] bg-[#fff4ee] px-4 py-3 text-sm text-[#8e4b21]">
          <Info className="mt-0.5 size-4 shrink-0" />
          Choose a valid check-in and check-out range to continue.
        </div>
      ) : null}

      <div className="mt-6 rounded-[1.5rem] bg-[#f6f3eb] p-5">
        <div className="text-foreground/68 flex items-center justify-between text-sm">
          <span>Nightly rate</span>
          <span>{formatIndianCurrency(room.price_per_night)}</span>
        </div>
        <div className="text-foreground/68 mt-3 flex items-center justify-between text-sm">
          <span>Nights</span>
          <span>{billableNights}</span>
        </div>
        <div className="mt-4 border-t border-[#ddd9cf] pt-4">
          <div className="flex items-center justify-between">
            <span className="text-foreground/54 text-[0.72rem] font-semibold uppercase tracking-[0.24em]">
              Total
            </span>
            <span className="text-2xl font-bold text-[#ba7517]">
              {formatIndianCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          onClick={() => onConfirm('pay-now')}
          disabled={!canProceed}
          className="h-auto rounded-xl bg-[#386a0e] px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white hover:bg-[#2f590b]"
        >
          Pay Now
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onConfirm('pay-at-reception')}
          disabled={!canProceed}
          className="h-auto rounded-xl border-[#d9e2cf] bg-transparent px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-foreground hover:bg-[#f3f0e9]"
        >
          Pay at Reception
        </Button>
      </div>
    </div>
  )
}

export function RoomBookingWidget({ room }: { room: Room }) {
  const defaults = getDefaultBookingDates()
  const [checkIn, setCheckIn] = useState(defaults.checkIn)
  const [checkOut, setCheckOut] = useState(defaults.checkOut)
  const [guests, setGuests] = useState(Math.min(room.capacity, 4))
  const [availabilityStatus, setAvailabilityStatus] =
    useState<AvailabilityStatus>('idle')
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [confirmationMode, setConfirmationMode] =
    useState<ConfirmationMode>(null)

  useEffect(() => {
    document.body.style.overflow =
      mobileSheetOpen || confirmationMode ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [confirmationMode, mobileSheetOpen])

  const nights = calculateNights(checkIn, checkOut)
  const billableNights = nights > 0 ? nights : 1
  const total = room.price_per_night * billableNights

  function resetAvailability() {
    setAvailabilityStatus('idle')
  }

  function handleCheckInChange(value: string) {
    setCheckIn(value)
    resetAvailability()

    if (calculateNights(value, checkOut) === 0) {
      setCheckOut(addDaysToDateInput(value, 1))
    }
  }

  function handleCheckOutChange(value: string) {
    setCheckOut(value)
    resetAvailability()
  }

  function handleGuestsChange(value: number) {
    setGuests(value)
    resetAvailability()
  }

  function handleCheckAvailability() {
    setAvailabilityStatus(
      calculateNights(checkIn, checkOut) > 0 ? 'available' : 'invalid',
    )
  }

  return (
    <>
      <div id="booking" className="relative">
        <div className="hidden lg:sticky lg:top-28 lg:block">
          <BookingCard
            room={room}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            availabilityStatus={availabilityStatus}
            onCheckInChange={handleCheckInChange}
            onCheckOutChange={handleCheckOutChange}
            onGuestsChange={handleGuestsChange}
            onCheckAvailability={handleCheckAvailability}
            onConfirm={setConfirmationMode}
          />
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3 lg:hidden">
        <div className="pointer-events-auto rounded-[1.5rem] border border-[#c0dd97]/80 bg-[#fffdf8]/95 p-3 shadow-[0_24px_55px_rgba(53,102,9,0.14)] backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-foreground/54 text-[0.62rem] font-semibold uppercase tracking-[0.24em]">
                From
              </p>
              <p className="mt-1 text-2xl font-bold text-[#ba7517]">
                {formatIndianCurrency(room.price_per_night)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-foreground/62 text-xs">
                {billableNights} {billableNights === 1 ? 'night' : 'nights'}
              </p>
              <Button
                type="button"
                onClick={() => setMobileSheetOpen(true)}
                className="mt-2 h-auto rounded-full bg-[#386a0e] px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white hover:bg-[#2f590b]"
              >
                Book This Room
              </Button>
            </div>
          </div>
        </div>
      </div>

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
              className="relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-t-[2rem] bg-[#fbf9f4] px-4 pb-8 pt-4"
            >
              <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-foreground/15" />
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#356609]/80">
                    Demo Booking
                  </p>
                  <h2 className="mt-2 text-2xl italic text-foreground">
                    {room.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSheetOpen(false)}
                  className="inline-flex size-10 items-center justify-center rounded-full border border-[#d9e2cf] bg-white text-foreground shadow-sm"
                  aria-label="Close booking sheet"
                >
                  <X className="size-4" />
                </button>
              </div>

              <BookingCard
                room={room}
                checkIn={checkIn}
                checkOut={checkOut}
                guests={guests}
                availabilityStatus={availabilityStatus}
                onCheckInChange={handleCheckInChange}
                onCheckOutChange={handleCheckOutChange}
                onGuestsChange={handleGuestsChange}
                onCheckAvailability={handleCheckAvailability}
                onConfirm={setConfirmationMode}
                className="mb-[4.5rem] shadow-none"
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {confirmationMode ? (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close confirmation"
              className="absolute inset-0"
              onClick={() => setConfirmationMode(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-md rounded-[2rem] bg-white p-6 shadow-[0_28px_90px_rgba(16,22,12,0.24)] sm:p-8"
            >
              <button
                type="button"
                onClick={() => setConfirmationMode(null)}
                className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-full bg-[#f5f1e8] text-foreground"
                aria-label="Close confirmation modal"
              >
                <X className="size-4" />
              </button>

              <div className="inline-flex size-12 items-center justify-center rounded-full bg-[#eaf3de] text-[#356609]">
                <CheckCircle2 className="size-6" />
              </div>

              <h3 className="mt-5 text-3xl italic text-foreground">
                Booking request captured
              </h3>
              <p className="mt-4 text-sm leading-7 text-foreground/70">
                {confirmationMode === 'pay-now'
                  ? 'This is a dummy payment confirmation. Razorpay and booking persistence are not connected yet, so no money has been charged.'
                  : 'This is a dummy pay-at-reception confirmation. In the final flow, the reservation would be stored as pending until reception confirmation.'}
              </p>

              <div className="text-foreground/68 mt-6 rounded-[1.5rem] bg-[#f6f3eb] p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span>Selected stay</span>
                  <span className="font-medium text-foreground">
                    {room.name}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span>Dates</span>
                  <span className="font-medium text-foreground">
                    {checkIn} to {checkOut}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span>Total</span>
                  <span className="font-semibold text-[#ba7517]">
                    {formatIndianCurrency(total)}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setConfirmationMode(null)}
                className="mt-6 h-auto w-full rounded-full bg-[#386a0e] px-6 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white hover:bg-[#2f590b]"
              >
                Continue Browsing
              </Button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
