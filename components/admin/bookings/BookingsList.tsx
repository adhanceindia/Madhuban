'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Calendar } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'

import { PageHeader } from '@/components/admin/shared/page-header'
import { DataTable } from '@/components/admin/shared/data-table'
import { FilterBar, type FilterConfig } from '@/components/admin/shared/filter-bar'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { formatINR, formatDateShort } from '@/lib/format'
import type { BookingRow } from '@/db/queries/bookings-admin'

const FILTER_CONFIG: FilterConfig[] = [
  { kind: 'search', key: 'search', placeholder: 'Guest name, email, phone...' },
  {
    kind: 'select',
    key: 'status',
    label: 'Status',
    options: [
      { value: '', label: 'All status' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'pending', label: 'Pending' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
  {
    kind: 'select',
    key: 'payment_status',
    label: 'Payment',
    options: [
      { value: '', label: 'All payments' },
      { value: 'paid', label: 'Paid' },
      { value: 'pending', label: 'Pending' },
      { value: 'failed', label: 'Failed' },
      { value: 'refunded', label: 'Refunded' },
    ],
  },
  {
    kind: 'select',
    key: 'source',
    label: 'Source',
    options: [
      { value: '', label: 'All sources' },
      { value: 'website', label: 'Website' },
      { value: 'booking_com', label: 'Booking.com' },
      { value: 'mmt', label: 'MakeMyTrip' },
      { value: 'manual', label: 'Manual' },
    ],
  },
  { kind: 'dateRange', startKey: 'start_date', endKey: 'end_date' },
]

const INITIAL_FILTERS = {
  search: '',
  status: '',
  payment_status: '',
  source: '',
  start_date: '',
  end_date: '',
}

export function BookingsList() {
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(INITIAL_FILTERS)

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, v)
      })
      fetch('/api/admin/bookings?' + params)
        .then((r) => r.json())
        .then((d) => setBookings(d.bookings || []))
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(t)
  }, [filters])

  const columns: ColumnDef<BookingRow>[] = useMemo(
    () => [
      {
        accessorKey: 'guest_name',
        header: 'Guest',
        cell: ({ row }) => (
          <Link
            href={`/admin/bookings/${row.original.id}`}
            className="text-foreground font-medium no-underline hover:text-sage-deep"
          >
            {row.original.guest_name}
          </Link>
        ),
      },
      {
        accessorKey: 'room_name',
        header: 'Room',
        cell: ({ getValue }) => <span className="text-[12px] text-foreground">{getValue() as string}</span>,
      },
      {
        accessorKey: 'check_in',
        header: 'Check-in',
        cell: ({ getValue }) => (
          <span className="text-[12px] text-muted-foreground">{formatDateShort(getValue() as string)}</span>
        ),
      },
      {
        accessorKey: 'check_out',
        header: 'Check-out',
        cell: ({ getValue }) => (
          <span className="text-[12px] text-muted-foreground">{formatDateShort(getValue() as string)}</span>
        ),
      },
      {
        accessorKey: 'total_amount',
        header: 'Amount',
        cell: ({ getValue }) => (
          <span className="font-semibold font-admin-mono text-foreground">
            {formatINR(getValue() as number | null)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge value={getValue() as string} />,
      },
      {
        accessorKey: 'payment_status',
        header: 'Payment',
        cell: ({ getValue }) => <StatusBadge value={getValue() as string} />,
      },
      {
        accessorKey: 'source',
        header: 'Source',
        cell: ({ getValue }) => <StatusBadge value={getValue() as string} />,
      },
    ],
    [],
  )

  function exportRows(): (string | number)[][] {
    const headers = ['ID', 'Guest', 'Email', 'Phone', 'Room', 'Check-in', 'Check-out', 'Amount', 'Status', 'Payment', 'Source']
    const rows = bookings.map((b) => [
      b.id,
      b.guest_name,
      b.guest_email,
      b.guest_phone,
      b.room_name,
      b.check_in,
      b.check_out,
      b.total_amount || 0,
      b.status,
      b.payment_status,
      b.source,
    ])
    return [headers, ...rows]
  }

  return (
    <div className="max-w-[1400px]">
      <PageHeader
        title="Bookings"
        subtitle={`${bookings.length} ${bookings.length === 1 ? 'reservation' : 'reservations'}`}
        actions={
          <Link
            href="/admin/bookings/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg no-underline transition-colors"
          >
            <Plus size={16} /> New Booking
          </Link>
        }
      />

      <div className="mb-3">
        <FilterBar filters={filters} onChange={setFilters} config={FILTER_CONFIG} />
      </div>

      <DataTable
        columns={columns}
        data={bookings}
        loading={loading}
        exportRows={exportRows}
        exportFileName={`bookings-${new Date().toISOString().split('T')[0]}.csv`}
        emptyState={
          <EmptyState
            icon={<Calendar size={32} />}
            title="No bookings match your filters"
            description="Adjust filters above or create a new booking."
            action={{ label: 'New Booking', href: '/admin/bookings/new' }}
          />
        }
      />
    </div>
  )
}
