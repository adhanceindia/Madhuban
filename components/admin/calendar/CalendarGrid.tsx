'use client'

import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, BedDouble } from 'lucide-react'
import toast from 'react-hot-toast'

import { PageHeader } from '@/components/admin/shared/page-header'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { ConfirmDialog } from '@/components/admin/shared/confirm-dialog'
import { todayISO, addDays, formatDate } from '@/lib/format'
import type { Room } from '@/db/schema/rooms'
import type { Booking } from '@/db/schema/bookings'
import type { BlockedDate } from '@/db/schema/blocked-dates'

type CalendarData = {
  rooms: Room[]
  bookings: Booking[]
  blocked: BlockedDate[]
}

type CellState =
  | { type: 'available' }
  | { type: 'confirmed'; booking: Booking; isStart: boolean }
  | { type: 'pending'; booking: Booking; isStart: boolean }
  | { type: 'blocked_manual'; block: BlockedDate }
  | { type: 'blocked_ical'; block: BlockedDate }

const AVAILABLE_CELL_STATE: CellState = { type: 'available' }

const STATUS_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  confirmed: { bg: '#d6ed5e', border: '#9ab53b', text: '#1a1f12' },
  pending: { bg: '#f7ebbc', border: '#d4a017', text: '#5e4a0a' },
  blocked_manual: { bg: '#eeeeee', border: '#bbbbbb', text: '#5a5a5a' },
  blocked_ical: { bg: '#e0e9ec', border: '#a5bdca', text: '#3a5a6a' },
}

export function CalendarGrid() {
  const [days, setDays] = useState<14 | 30>(14)
  const [startDate, setStartDate] = useState<string>(todayISO())
  const [data, setData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [blockTarget, setBlockTarget] = useState<{ roomId: number; date: string; roomName: string } | null>(null)
  const [unblockTarget, setUnblockTarget] = useState<{ blockId: number; date: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const endDate = useMemo(() => addDays(startDate, days - 1), [startDate, days])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/calendar?start=${startDate}&end=${endDate}`)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const dateColumns = useMemo(() => {
    return Array.from({ length: days }, (_, i) => addDays(startDate, i))
  }, [startDate, days])

  const cellStatesByRoom = useMemo(() => {
    const states = new Map<number, Map<string, CellState>>()
    if (!data) return states

    const statesForRoom = (roomId: number) => {
      let roomStates = states.get(roomId)
      if (!roomStates) {
        roomStates = new Map<string, CellState>()
        states.set(roomId, roomStates)
      }
      return roomStates
    }

    const endExclusive = addDays(endDate, 1)

    // Bookings take priority over blocks, matching the previous lookup order.
    for (const booking of data.bookings) {
      const roomStates = statesForRoom(booking.room_id)
      const firstVisibleDate = booking.check_in < startDate ? startDate : booking.check_in
      const lastVisibleDate = booking.check_out > endExclusive ? endExclusive : booking.check_out

      for (let date = firstVisibleDate; date < lastVisibleDate; date = addDays(date, 1)) {
        if (!roomStates.has(date)) {
          roomStates.set(date, {
            type: booking.status === 'confirmed' ? 'confirmed' : 'pending',
            booking,
            isStart: booking.check_in === date,
          })
        }
      }
    }

    for (const block of data.blocked) {
      if (block.date < startDate || block.date > endDate) continue

      const roomStates = statesForRoom(block.room_id)
      if (!roomStates.has(block.date)) {
        roomStates.set(block.date, {
          type: block.source === 'ical' ? 'blocked_ical' : 'blocked_manual',
          block,
        })
      }
    }

    return states
  }, [data, startDate, endDate])

  const today = todayISO()

  async function createBlock() {
    if (!blockTarget) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/blocked-dates', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ room_id: blockTarget.roomId, date: blockTarget.date }),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.error || 'Could not block date')
        return
      }
      toast.success('Date blocked')
      fetchData()
    } finally {
      setSubmitting(false)
      setBlockTarget(null)
    }
  }

  async function removeBlock() {
    if (!unblockTarget) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/blocked-dates/${unblockTarget.blockId}`, { method: 'DELETE' })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.error || 'Could not unblock')
        return
      }
      toast.success('Block removed')
      fetchData()
    } finally {
      setSubmitting(false)
      setUnblockTarget(null)
    }
  }

  const handleCellClick = useCallback((roomId: number, date: string, state: CellState, roomName: string) => {
    if (state.type === 'available') {
      setBlockTarget({ roomId, date, roomName })
    } else if (state.type === 'blocked_manual') {
      setUnblockTarget({ blockId: state.block.id, date })
    } else if (state.type === 'blocked_ical') {
      toast('iCal blocks sync automatically — remove from the source calendar.', { icon: 'ℹ️' })
    }
    // Booking cells use Link to navigate, handled by the markup
  }, [])

  return (
    <div className="max-w-[1500px]">
      <PageHeader
        title="Calendar"
        subtitle="Room availability across all bookings and blocks"
        actions={
          <div className="flex gap-1 bg-card rounded-lg p-1 border border-border">
            {([14, 30] as const).map((n) => (
              <button
                key={n}
                onClick={() => setDays(n)}
                className={`px-3.5 py-1.5 text-[12px] font-semibold rounded-md transition-colors ${
                  days === n
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {n} days
              </button>
            ))}
          </div>
        }
      />

      {/* Navigator */}
      <div className="flex items-center gap-2 mb-5 bg-card rounded-lg p-1 border border-border w-fit">
        <button
          type="button"
          onClick={() => setStartDate(addDays(startDate, -days))}
          className="p-1.5 rounded-md hover:bg-sage-soft transition-colors text-muted-foreground"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="px-3 text-[12px] font-semibold text-foreground min-w-[200px] text-center">
          {formatDate(startDate)} – {formatDate(endDate)}
        </div>
        <button
          type="button"
          onClick={() => setStartDate(todayISO())}
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
            startDate === today
              ? 'bg-accent text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-sage-soft'
          }`}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => setStartDate(addDays(startDate, days))}
          className="p-1.5 rounded-md hover:bg-sage-soft transition-colors text-muted-foreground"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Grid */}
      <div className="bg-card rounded-2xl p-5 shadow-[0_1px_2px_rgba(45,55,30,0.04)] font-admin">
        {loading && !data ? (
          <div className="h-[400px] bg-sage-soft/40 rounded-lg animate-pulse" />
        ) : !data?.rooms.length ? (
          <EmptyState
            icon={<BedDouble size={32} />}
            title="No active rooms"
            description="Add rooms to see the calendar."
            action={{ label: 'Add Room', href: '/admin/rooms/new' }}
          />
        ) : (
          <div className="overflow-x-auto">
            <div
              className="grid min-w-fit"
              style={{ gridTemplateColumns: `180px repeat(${days}, minmax(38px, 1fr))` }}
            >
              {/* Header row */}
              <div className="sticky left-0 bg-card z-10 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                Room
              </div>
              {dateColumns.map((d) => {
                const date = new Date(d + 'T00:00:00')
                const isToday = d === today
                const isWeekend = date.getDay() === 0 || date.getDay() === 6
                return (
                  <div
                    key={d}
                    className={`px-1 py-2 text-center border-b border-border ${
                      isToday ? 'bg-accent-soft' : ''
                    }`}
                  >
                    <div className={`text-[9px] uppercase tracking-wider ${isWeekend ? 'text-status-pending' : 'text-muted-foreground/70'}`}>
                      {date.toLocaleDateString('en-IN', { weekday: 'short' })}
                    </div>
                    <div className={`text-[12px] font-semibold ${isToday ? 'text-foreground' : 'text-foreground'}`}>
                      {date.getDate()}
                    </div>
                  </div>
                )
              })}

              {/* Room rows */}
              {data.rooms.map((room) => (
                <RoomRow
                  key={room.id}
                  room={room}
                  dateColumns={dateColumns}
                  cellStates={cellStatesByRoom.get(room.id)}
                  today={today}
                  onCellClick={handleCellClick}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 pl-1 text-[11px] text-muted-foreground flex-wrap">
              {[
                { key: 'confirmed', label: 'Confirmed' },
                { key: 'pending', label: 'Pending' },
                { key: 'blocked_manual', label: 'Blocked (manual)' },
                { key: 'blocked_ical', label: 'Blocked (OTA / iCal)' },
              ].map((s) => {
                const style = STATUS_STYLES[s.key]
                return (
                  <div key={s.key} className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ background: style.bg, border: `1px solid ${style.border}` }}
                    />
                    <span>{s.label}</span>
                  </div>
                )
              })}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-white border border-border" />
                <span>Available · click to block</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Block dialog */}
      <ConfirmDialog
        open={!!blockTarget}
        title={blockTarget ? `Block ${formatDate(blockTarget.date)}?` : ''}
        message={blockTarget ? `This will mark ${blockTarget.roomName} as unavailable for ${formatDate(blockTarget.date)}. Use this for maintenance, private events, or seasonal closures.` : ''}
        confirmLabel="Block date"
        loading={submitting}
        onConfirm={createBlock}
        onCancel={() => setBlockTarget(null)}
      />

      {/* Unblock dialog */}
      <ConfirmDialog
        open={!!unblockTarget}
        destructive
        title={unblockTarget ? `Unblock ${formatDate(unblockTarget.date)}?` : ''}
        message="The room will become available to book on this date again."
        confirmLabel="Unblock"
        loading={submitting}
        onConfirm={removeBlock}
        onCancel={() => setUnblockTarget(null)}
      />
    </div>
  )
}

const RoomRow = memo(function RoomRow({
  room,
  dateColumns,
  cellStates,
  today,
  onCellClick,
}: {
  room: Room
  dateColumns: string[]
  cellStates: Map<string, CellState> | undefined
  today: string
  onCellClick: (roomId: number, date: string, state: CellState, roomName: string) => void
}) {
  return (
    <>
      <div className="sticky left-0 bg-card z-10 px-3 py-2 text-[12px] font-medium text-foreground border-b border-border/40 flex items-center min-h-[44px]">
        <Link
          href={`/admin/rooms/${room.id}`}
          className="text-foreground no-underline hover:text-sage-deep truncate"
        >
          {room.name}
        </Link>
      </div>
      {dateColumns.map((d) => {
        const state = cellStates?.get(d) ?? AVAILABLE_CELL_STATE
        return (
          <Cell
            key={d}
            date={d}
            state={state}
            isToday={d === today}
            roomId={room.id}
            roomName={room.name}
            onCellClick={onCellClick}
          />
        )
      })}
    </>
  )
})

const Cell = memo(function Cell({
  date,
  state,
  isToday,
  roomId,
  roomName,
  onCellClick,
}: {
  date: string
  state: CellState
  isToday: boolean
  roomId: number
  roomName: string
  onCellClick: (roomId: number, date: string, state: CellState, roomName: string) => void
}) {
  const handleClick = () => onCellClick(roomId, date, state, roomName)

  if (state.type === 'available') {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={`Available · click to block`}
        className={`border-b border-border/40 border-r border-border/20 min-h-[44px] p-0.5 hover:bg-sage-soft/60 transition-colors ${
          isToday ? 'bg-accent-soft/40' : ''
        }`}
      />
    )
  }

  if (state.type === 'blocked_manual' || state.type === 'blocked_ical') {
    const style = STATUS_STYLES[state.type]
    return (
      <button
        type="button"
        onClick={handleClick}
        title={state.type === 'blocked_manual' ? 'Blocked (manual) · click to unblock' : 'Blocked (synced from OTA)'}
        className="border-b border-border/40 border-r border-border/20 min-h-[44px] p-0.5 relative"
      >
        <div
          className="absolute inset-0.5 rounded-md"
          style={{ background: style.bg, border: `1px solid ${style.border}` }}
        />
      </button>
    )
  }

  // Booking cell — confirmed or pending
  const style = STATUS_STYLES[state.type]
  return (
    <Link
      href={`/admin/bookings/${state.booking.id}`}
      title={`${state.booking.guest_name} · ${state.booking.status}`}
      className="border-b border-border/40 border-r border-border/20 min-h-[44px] p-0.5 relative block no-underline"
    >
      <div
        className="absolute inset-0.5 rounded-md flex items-center px-1.5 overflow-hidden"
        style={{
          background: style.bg,
          borderLeft: state.isStart ? `3px solid ${style.border}` : undefined,
          border: state.isStart ? undefined : `1px solid ${style.border}`,
        }}
      >
        {state.isStart && (
          <span
            className="text-[10px] font-semibold truncate"
            style={{ color: style.text }}
          >
            {state.booking.guest_name}
          </span>
        )}
      </div>
    </Link>
  )
})
