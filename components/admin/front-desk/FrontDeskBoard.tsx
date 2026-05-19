'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  Phone,
  Mail,
  Plus,
  ChevronLeft,
  ChevronRight,
  BedDouble,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { PageHeader } from '@/components/admin/shared/page-header'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { formatINR, formatDateShort, todayISO, addDays, nightsBetween } from '@/lib/format'
import type { FrontDeskBooking } from '@/db/queries/front-desk'

type FrontDeskData = {
  date: string
  arrivals: FrontDeskBooking[]
  departures: FrontDeskBooking[]
  in_house: FrontDeskBooking[]
}

export function FrontDeskBoard() {
  const [date, setDate] = useState(todayISO())
  const [data, setData] = useState<FrontDeskData | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/front-desk?date=${date}`)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function checkIn(bookingId: number) {
    setActing(bookingId)
    try {
      const res = await fetch('/api/admin/front-desk/check-in', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Check-in failed')
        return
      }
      toast.success('Guest checked in')
      fetchData()
    } finally {
      setActing(null)
    }
  }

  async function checkOut(bookingId: number, markPaid: boolean) {
    setActing(bookingId)
    try {
      const res = await fetch('/api/admin/front-desk/check-out', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, mark_paid: markPaid }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Check-out failed')
        return
      }
      toast.success('Guest checked out')
      fetchData()
    } finally {
      setActing(null)
    }
  }

  return (
    <div className="max-w-[1400px]">
      <PageHeader
        title="Front Desk"
        subtitle="Today's arrivals, departures, and walk-ins"
        actions={
          <Link
            href="/admin/bookings/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg no-underline transition-colors"
          >
            <Plus size={16} /> Walk-in Booking
          </Link>
        }
      />

      {/* Date navigator */}
      <div className="flex items-center gap-2 mb-6 bg-card rounded-lg p-1 border border-border w-fit">
        <button
          type="button"
          onClick={() => setDate((d) => addDays(d, -1))}
          className="p-1.5 rounded-md hover:bg-sage-soft transition-colors text-muted-foreground"
        >
          <ChevronLeft size={16} />
        </button>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-2.5 py-1 text-[12px] font-semibold text-foreground bg-transparent outline-none"
        />
        <button
          type="button"
          onClick={() => setDate(todayISO())}
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
            date === todayISO()
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-sage-soft'
          }`}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => setDate((d) => addDays(d, 1))}
          className="p-1.5 rounded-md hover:bg-sage-soft transition-colors text-muted-foreground"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Three columns: arrivals / departures / in-house */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Column
          icon={<ArrowDownToLine size={18} className="text-sage-deep" />}
          title="Arrivals"
          count={data?.arrivals.length || 0}
        >
          {loading ? (
            <ColumnSkeleton />
          ) : !data?.arrivals.length ? (
            <ColumnEmpty icon={<ArrowDownToLine size={28} />} text="No arrivals" />
          ) : (
            data.arrivals.map((b) => (
              <ArrivalCard
                key={b.id}
                booking={b}
                acting={acting === b.id}
                onCheckIn={() => checkIn(b.id)}
              />
            ))
          )}
        </Column>

        <Column
          icon={<ArrowUpFromLine size={18} className="text-status-pending" />}
          title="Departures"
          count={data?.departures.length || 0}
        >
          {loading ? (
            <ColumnSkeleton />
          ) : !data?.departures.length ? (
            <ColumnEmpty icon={<ArrowUpFromLine size={28} />} text="No departures" />
          ) : (
            data.departures.map((b) => (
              <DepartureCard
                key={b.id}
                booking={b}
                acting={acting === b.id}
                onCheckOut={(markPaid) => checkOut(b.id, markPaid)}
              />
            ))
          )}
        </Column>

        <Column
          icon={<Users size={18} className="text-status-checked-in" />}
          title="In-house"
          count={data?.in_house.length || 0}
        >
          {loading ? (
            <ColumnSkeleton />
          ) : !data?.in_house.length ? (
            <ColumnEmpty icon={<Users size={28} />} text="No guests in-house" />
          ) : (
            data.in_house.map((b) => <InHouseCard key={b.id} booking={b} />)
          )}
        </Column>
      </div>
    </div>
  )
}

function Column({
  icon,
  title,
  count,
  children,
}: {
  icon: React.ReactNode
  title: string
  count: number
  children: React.ReactNode
}) {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-[0_1px_2px_rgba(45,55,30,0.04)] font-admin">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[14px] font-semibold text-foreground">{title}</span>
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground bg-sage-soft px-2 py-0.5 rounded-md">
          {count}
        </span>
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

function ColumnSkeleton() {
  return (
    <>
      {[1, 2].map((i) => (
        <div key={i} className="h-[100px] bg-sage-soft/40 rounded-lg animate-pulse" />
      ))}
    </>
  )
}

function ColumnEmpty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="py-8">
      <EmptyState icon={icon} title={text} description="" />
    </div>
  )
}

function ArrivalCard({
  booking,
  acting,
  onCheckIn,
}: {
  booking: FrontDeskBooking
  acting: boolean
  onCheckIn: () => void
}) {
  return (
    <div className="border border-border rounded-lg p-3 hover:border-accent-deep/40 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link
          href={`/admin/bookings/${booking.id}`}
          className="text-[13px] font-semibold text-foreground no-underline hover:text-sage-deep"
        >
          {booking.guest_name}
        </Link>
        <StatusBadge value={booking.status} />
      </div>
      <div className="text-[11px] text-muted-foreground space-y-0.5 mb-3">
        <div className="flex items-center gap-1.5">
          <BedDouble size={11} /> {booking.room_name} · {booking.guests_count} guests
        </div>
        <div className="flex items-center gap-1.5">
          → out {formatDateShort(booking.check_out)} ({nightsBetween(booking.check_in, booking.check_out)}n)
        </div>
        <div className="flex items-center gap-2">
          <a href={`tel:+91${booking.guest_phone}`} className="inline-flex items-center gap-1 text-foreground no-underline hover:text-sage-deep">
            <Phone size={10} /> {booking.guest_phone}
          </a>
        </div>
      </div>
      <button
        type="button"
        onClick={onCheckIn}
        disabled={acting || booking.status === 'confirmed'}
        className="w-full px-3 py-1.5 text-[12px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-md transition-colors disabled:opacity-50"
      >
        {acting ? 'Checking in...' : booking.status === 'confirmed' ? 'Already confirmed' : 'Check in'}
      </button>
    </div>
  )
}

function DepartureCard({
  booking,
  acting,
  onCheckOut,
}: {
  booking: FrontDeskBooking
  acting: boolean
  onCheckOut: (markPaid: boolean) => void
}) {
  const balanceDue = booking.payment_status !== 'paid' && booking.total_amount
  return (
    <div className="border border-border rounded-lg p-3 hover:border-accent-deep/40 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link
          href={`/admin/bookings/${booking.id}`}
          className="text-[13px] font-semibold text-foreground no-underline hover:text-sage-deep"
        >
          {booking.guest_name}
        </Link>
        <StatusBadge value={booking.payment_status} />
      </div>
      <div className="text-[11px] text-muted-foreground space-y-0.5 mb-3">
        <div className="flex items-center gap-1.5">
          <BedDouble size={11} /> {booking.room_name}
        </div>
        {balanceDue && (
          <div className="text-status-pending font-semibold">
            Balance due: {formatINR(booking.total_amount)}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        {balanceDue ? (
          <>
            <button
              type="button"
              onClick={() => onCheckOut(true)}
              disabled={acting}
              className="flex-1 px-3 py-1.5 text-[12px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-md transition-colors disabled:opacity-50"
            >
              {acting ? '...' : 'Paid + check out'}
            </button>
            <button
              type="button"
              onClick={() => onCheckOut(false)}
              disabled={acting}
              className="px-3 py-1.5 text-[12px] font-semibold bg-sage-soft hover:bg-sage text-foreground rounded-md transition-colors disabled:opacity-50"
            >
              Out only
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onCheckOut(false)}
            disabled={acting}
            className="w-full px-3 py-1.5 text-[12px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-md transition-colors disabled:opacity-50"
          >
            {acting ? 'Checking out...' : 'Check out'}
          </button>
        )}
      </div>
    </div>
  )
}

function InHouseCard({ booking }: { booking: FrontDeskBooking }) {
  return (
    <Link
      href={`/admin/bookings/${booking.id}`}
      className="block border border-border rounded-lg p-3 hover:border-accent-deep/40 transition-colors no-underline"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="text-[13px] font-semibold text-foreground">{booking.guest_name}</span>
        <StatusBadge value="checked-in" />
      </div>
      <div className="text-[11px] text-muted-foreground space-y-0.5">
        <div className="flex items-center gap-1.5">
          <BedDouble size={11} /> {booking.room_name} · {booking.guests_count} guests
        </div>
        <div>Out {formatDateShort(booking.check_out)}</div>
        <div className="flex items-center gap-2">
          <a
            href={`tel:+91${booking.guest_phone}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-foreground no-underline hover:text-sage-deep"
          >
            <Phone size={10} /> {booking.guest_phone}
          </a>
          <a
            href={`mailto:${booking.guest_email}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-foreground no-underline hover:text-sage-deep"
          >
            <Mail size={10} />
          </a>
        </div>
      </div>
    </Link>
  )
}
