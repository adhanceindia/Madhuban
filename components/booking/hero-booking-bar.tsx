'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CalendarDays, Search, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatDateInput } from '@/lib/room-helpers'

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function getDefaults() {
  const today = new Date()
  return {
    checkIn: formatDateInput(addDays(today, 1)),
    checkOut: formatDateInput(addDays(today, 2)),
  }
}

export function HeroBookingBar() {
  const router = useRouter()
  const defaults = getDefaults()

  const [checkIn, setCheckIn] = useState(defaults.checkIn)
  const [checkOut, setCheckOut] = useState(defaults.checkOut)
  const [guests, setGuests] = useState(2)

  const todayStr = formatDateInput(new Date())

  function handleCheckInChange(value: string) {
    setCheckIn(value)
    // Auto-bump check-out to at least checkIn + 1 day
    if (value && value >= checkOut) {
      const parsed = new Date(`${value}T00:00:00`)
      if (!Number.isNaN(parsed.getTime())) {
        setCheckOut(formatDateInput(addDays(parsed, 1)))
      }
    }
  }

  function handleSubmit() {
    const params = new URLSearchParams()
    if (checkIn) params.set('check_in', checkIn)
    if (checkOut) params.set('check_out', checkOut)
    if (guests) params.set('guests', String(guests))
    router.push(`/rooms?${params.toString()}`)
  }

  // Format a date string as "Wed 01 Jul" style
  function formatDisplayDate(dateStr: string) {
    if (!dateStr) return ''
    const d = new Date(`${dateStr}T00:00:00`)
    if (Number.isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 mx-auto w-full max-w-3xl"
    >
      <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/95 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:rounded-full">
        {/* Desktop: Horizontal row */}
        <div className="hidden items-center sm:flex">
          {/* Check-in */}
          <label className="group relative flex flex-1 cursor-pointer items-center gap-3 px-6 py-4 transition-colors hover:bg-primary-50/40 focus-within:bg-primary-50/40">
            <CalendarDays className="size-5 shrink-0 text-primary-deep" />
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold uppercase tracking-label text-foreground/50">
                Check-in
              </span>
              <span className="mt-0.5 block truncate text-sm font-medium text-foreground">
                {formatDisplayDate(checkIn)}
              </span>
            </div>
            <input
              type="date"
              value={checkIn}
              min={todayStr}
              onChange={(e) => handleCheckInChange(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Check-in date"
            />
          </label>

          {/* Separator */}
          <div className="h-10 w-px bg-content-border" />

          {/* Check-out */}
          <label className="group relative flex flex-1 cursor-pointer items-center gap-3 px-6 py-4 transition-colors hover:bg-primary-50/40 focus-within:bg-primary-50/40">
            <CalendarDays className="size-5 shrink-0 text-primary-deep" />
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold uppercase tracking-label text-foreground/50">
                Check-out
              </span>
              <span className="mt-0.5 block truncate text-sm font-medium text-foreground">
                {formatDisplayDate(checkOut)}
              </span>
            </div>
            <input
              type="date"
              value={checkOut}
              min={checkIn ? formatDateInput(addDays(new Date(`${checkIn}T00:00:00`), 1)) : todayStr}
              onChange={(e) => setCheckOut(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Check-out date"
            />
          </label>

          {/* Separator */}
          <div className="h-10 w-px bg-content-border" />

          {/* Guests */}
          <label className="group relative flex flex-1 cursor-pointer items-center gap-3 px-6 py-4 transition-colors hover:bg-primary-50/40 focus-within:bg-primary-50/40">
            <Users className="size-5 shrink-0 text-primary-deep" />
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold uppercase tracking-label text-foreground/50">
                Guests
              </span>
              <span className="mt-0.5 block truncate text-sm font-medium text-foreground">
                {guests} {guests === 1 ? 'Guest' : 'Guests'}
              </span>
            </div>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Number of guests"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </label>

          {/* Search button */}
          <div className="pr-2.5">
            <Button
              type="button"
              onClick={handleSubmit}
              className="h-auto rounded-full bg-primary px-7 py-3.5 text-xs font-semibold uppercase tracking-label text-white shadow-[0_8px_25px_rgba(56,106,14,0.3)] transition-all hover:bg-primary-dark hover:shadow-[0_12px_35px_rgba(56,106,14,0.4)]"
            >
              <Search className="size-4" />
              Search
            </Button>
          </div>
        </div>

        {/* Mobile: Compact layout */}
        <div className="flex flex-col sm:hidden">
          <div className="grid grid-cols-2 border-b border-content-border/60">
            {/* Check-in */}
            <label className="group relative flex cursor-pointer items-start gap-2.5 border-r border-content-border/60 px-4 py-3.5 transition-colors focus-within:bg-primary-50/40">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary-deep" />
              <div className="min-w-0 flex-1 flex-col">
                <span className="block text-[10px] font-semibold uppercase tracking-label text-foreground/50">
                  Check-in
                </span>
                <span className="mt-0.5 block truncate text-[13px] font-medium text-foreground">
                  {formatDisplayDate(checkIn)}
                </span>
              </div>
              <input
                type="date"
                value={checkIn}
                min={todayStr}
                onChange={(e) => handleCheckInChange(e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Check-in date"
              />
            </label>

            {/* Check-out */}
            <label className="group relative flex cursor-pointer items-start gap-2.5 px-4 py-3.5 transition-colors focus-within:bg-primary-50/40">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary-deep" />
              <div className="min-w-0 flex-1 flex-col">
                <span className="block text-[10px] font-semibold uppercase tracking-label text-foreground/50">
                  Check-out
                </span>
                <span className="mt-0.5 block truncate text-[13px] font-medium text-foreground">
                  {formatDisplayDate(checkOut)}
                </span>
              </div>
              <input
                type="date"
                value={checkOut}
                min={checkIn ? formatDateInput(addDays(new Date(`${checkIn}T00:00:00`), 1)) : todayStr}
                onChange={(e) => setCheckOut(e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Check-out date"
              />
            </label>
          </div>

          {/* Guests */}
          <label className="group relative flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors focus-within:bg-primary-50/40">
            <Users className="size-4 shrink-0 text-primary-deep" />
            <div className="min-w-0 flex-1 flex-col">
              <span className="block text-[10px] font-semibold uppercase tracking-label text-foreground/50">
                Guests
              </span>
              <span className="mt-0.5 block truncate text-[13px] font-medium text-foreground">
                {guests} {guests === 1 ? 'Guest' : 'Guests'}
              </span>
            </div>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Number of guests"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </label>

          {/* Search button */}
          <div className="p-3 pt-1">
            <Button
              type="button"
              onClick={handleSubmit}
              className="h-auto w-full rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-label text-white shadow-[0_8px_25px_rgba(56,106,14,0.3)] transition-all hover:bg-primary-dark"
            >
              <Search className="size-4" />
              Check Availability
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
