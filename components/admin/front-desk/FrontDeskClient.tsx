'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Room = {
  id: string | number
  name: string
  type: string
  bed_type: string
  capacity: number
}

type Booking = {
  id: string | number
  guest_name: string
  room_id: string | number
  check_in: string
  check_out: string
  status: string
  payment_status: string
  source: string
}

type BlockedDate = {
  room_id: string | number
  date: string
  source: string
}

type FrontDeskData = {
  rooms: Room[]
  bookings: Booking[]
  blocked_dates: BlockedDate[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: '2-digit' })
}

function formatDayOfWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { weekday: 'short' })
}

function formatMonthYear(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

function getDaysBetween(start: string, end: string): number {
  const s = new Date(start)
  const e = new Date(end)
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

// ---------------------------------------------------------------------------
// Status colors for booking blocks
// ---------------------------------------------------------------------------

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  confirmed: { bg: '#dcfce7', border: '#86efac', text: '#166534' },
  pending: { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af' },
  cancelled: { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' },
  blocked: { bg: '#f3f4f6', border: '#d1d5db', text: '#4b5563' },
}

// ---------------------------------------------------------------------------
// Gantt Timeline Component
// ---------------------------------------------------------------------------

function GanttTimeline({
  rooms,
  bookings,
  blockedDates,
  startDate,
  days,
}: {
  rooms: Room[]
  bookings: Booking[]
  blockedDates: BlockedDate[]
  startDate: string
  days: number
}) {
  const today = getToday()
  const dates = Array.from({ length: days }, (_, i) => addDays(startDate, i))
  const colWidth = 44

  return (
    <div style={{ overflowX: 'auto' }} className="no-scrollbar">
      <div style={{ minWidth: `${180 + days * colWidth}px` }}>
        {/* ---- Date header row ---- */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb' }}>
          {/* Room label column */}
          <div
            style={{
              width: '180px',
              minWidth: '180px',
              padding: '8px 12px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: '#fafafa',
              position: 'sticky',
              left: 0,
              zIndex: 10,
            }}
          >
            Room
          </div>
          {/* Date columns */}
          {dates.map((date) => {
            const isToday = date === today
            return (
              <div
                key={date}
                style={{
                  width: `${colWidth}px`,
                  minWidth: `${colWidth}px`,
                  textAlign: 'center',
                  padding: '4px 0',
                  background: isToday ? '#f0fdf4' : '#fafafa',
                  borderLeft: '1px solid #f0f0f0',
                }}
              >
                <div
                  style={{
                    fontSize: '10px',
                    color: '#9ca3af',
                    fontWeight: 500,
                  }}
                >
                  {formatDayOfWeek(date)}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: isToday ? 700 : 500,
                    color: isToday ? '#ffffff' : '#374151',
                    width: isToday ? '26px' : 'auto',
                    height: isToday ? '26px' : 'auto',
                    borderRadius: isToday ? '50%' : '0',
                    background: isToday ? '#386a0e' : 'transparent',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '2px auto 0',
                  }}
                >
                  {formatDate(date)}
                </div>
              </div>
            )
          })}
        </div>

        {/* ---- Room rows ---- */}
        {rooms.map((room) => {
          // Get bookings for this room
          const roomBookings = bookings.filter(
            (b) => String(b.room_id) === String(room.id)
          )
          // Get blocked dates for this room
          const roomBlocked = blockedDates.filter(
            (bd) => String(bd.room_id) === String(room.id)
          )
          const blockedSet = new Set(roomBlocked.map((bd) => bd.date))

          return (
            <div
              key={room.id}
              style={{
                display: 'flex',
                borderBottom: '1px solid #f0f0f0',
                minHeight: '54px',
                position: 'relative',
              }}
            >
              {/* Room label */}
              <div
                style={{
                  width: '180px',
                  minWidth: '180px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  background: '#ffffff',
                  position: 'sticky',
                  left: 0,
                  zIndex: 5,
                  borderRight: '1px solid #e5e7eb',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#111827',
                  }}
                >
                  {room.name}
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                  {room.type} · {room.bed_type || `${room.capacity} guests`}
                </div>
              </div>

              {/* Date cells (background grid) */}
              <div style={{ position: 'relative', display: 'flex', flex: 1 }}>
                {dates.map((date) => {
                  const isToday = date === today
                  const isBlocked = blockedSet.has(date)
                  return (
                    <div
                      key={date}
                      style={{
                        width: `${colWidth}px`,
                        minWidth: `${colWidth}px`,
                        borderLeft: '1px solid #f0f0f0',
                        background: isToday
                          ? 'rgba(56, 106, 14, 0.04)'
                          : isBlocked
                          ? '#f9fafb'
                          : 'transparent',
                      }}
                    />
                  )
                })}

                {/* Booking blocks (absolutely positioned) */}
                {roomBookings.map((booking) => {
                  const bookingStart = booking.check_in.split('T')[0]
                  const bookingEnd = booking.check_out.split('T')[0]

                  // Calculate position
                  const startOffset = getDaysBetween(startDate, bookingStart)
                  const endOffset = getDaysBetween(startDate, bookingEnd)

                  // Clip to visible range
                  const visStart = Math.max(0, startOffset)
                  const visEnd = Math.min(days, endOffset)

                  if (visStart >= days || visEnd <= 0) return null

                  const left = visStart * colWidth + 2
                  const width = (visEnd - visStart) * colWidth - 4
                  const colors =
                    statusColors[booking.status] || statusColors.pending

                  return (
                    <Link
                      key={booking.id}
                      href={`/admin/collections/bookings/${booking.id}`}
                      style={{
                        position: 'absolute',
                        left: `${left}px`,
                        top: '6px',
                        width: `${width}px`,
                        height: 'calc(100% - 12px)',
                        background: colors.bg,
                        border: `1.5px solid ${colors.border}`,
                        borderRadius: '6px',
                        padding: '4px 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.15s',
                        zIndex: 2,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 600,
                          color: colors.text,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {booking.guest_name}
                      </div>
                      {width > 80 && (
                        <div
                          style={{
                            fontSize: '10px',
                            color: colors.text,
                            opacity: 0.7,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {booking.source !== 'website' && `${booking.source} · `}
                          {booking.status}
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Front Desk Client Component
// ---------------------------------------------------------------------------

export function FrontDeskClient() {
  const [data, setData] = useState<FrontDeskData | null>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(getToday())
  const [bedFilter, setBedFilter] = useState<string>('all')

  const days = 30

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const end = addDays(startDate, days)
      const res = await fetch(
        `/api/front-desk?start=${startDate}&end=${end}`
      )
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error('Failed to fetch front desk data:', err)
    } finally {
      setLoading(false)
    }
  }, [startDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredRooms =
    data?.rooms.filter((r) => {
      if (bedFilter === 'all') return true
      return r.type === bedFilter
    }) || []

  return (
    <div style={{ padding: '24px' }}>
      {/* ---- Header ---- */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CalendarRange size={20} color="#386a0e" />
          </div>
          <div>
            <h1
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#111827',
                margin: 0,
                fontFamily: 'var(--font-admin)',
              }}
            >
              Front Desk
            </h1>
            <p
              style={{
                fontSize: '12px',
                color: '#9ca3af',
                margin: 0,
              }}
            >
              {days} days of {formatMonthYear(startDate)}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link
            href="/admin/collections/bookings/create"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#386a0e',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
          >
            <Plus size={16} />
            Add Booking
          </Link>
        </div>
      </div>

      {/* ---- Filters row ---- */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Bed type filter tabs */}
        {['all', 'standard', 'deluxe', 'suite'].map((type) => (
          <button
            key={type}
            onClick={() => setBedFilter(type)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12.5px',
              fontWeight: 550,
              border:
                bedFilter === type
                  ? '1.5px solid #386a0e'
                  : '1.5px solid #e5e7eb',
              background: bedFilter === type ? '#f0fdf4' : '#ffffff',
              color: bedFilter === type ? '#386a0e' : '#6b7280',
              cursor: 'pointer',
              transition: 'all 0.15s',
              textTransform: 'capitalize',
            }}
          >
            {type === 'all' ? 'All Rooms' : type}
            {data &&
              ` (${
                type === 'all'
                  ? data.rooms.length
                  : data.rooms.filter((r) => r.type === type).length
              })`}
          </button>
        ))}

        {/* Date navigation */}
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => setStartDate(addDays(startDate, -30))}
            style={{
              padding: '6px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronLeft size={16} color="#6b7280" />
          </button>
          <button
            onClick={() => setStartDate(getToday())}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
              color: '#374151',
            }}
          >
            Today
          </button>
          <button
            onClick={() => setStartDate(addDays(startDate, 30))}
            style={{
              padding: '6px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronRight size={16} color="#6b7280" />
          </button>
        </div>
      </div>

      {/* ---- Gantt timeline ---- */}
      <Card
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
        }}
      >
        {loading ? (
          <div style={{ padding: '24px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                style={{
                  height: '54px',
                  marginBottom: '4px',
                  borderRadius: '8px',
                }}
              />
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div
            style={{
              padding: '48px',
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '14px',
            }}
          >
            No rooms found for the selected filter.
          </div>
        ) : (
          <GanttTimeline
            rooms={filteredRooms}
            bookings={data?.bookings || []}
            blockedDates={data?.blocked_dates || []}
            startDate={startDate}
            days={days}
          />
        )}
      </Card>

      {/* ---- Legend ---- */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginTop: '12px',
          fontSize: '11.5px',
          color: '#6b7280',
          flexWrap: 'wrap',
        }}
      >
        {Object.entries(statusColors).map(([status, colors]) => (
          <div
            key={status}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                background: colors.bg,
                border: `1.5px solid ${colors.border}`,
              }}
            />
            <span style={{ textTransform: 'capitalize' }}>{status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
