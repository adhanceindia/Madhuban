'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Inbox } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'

import { PageHeader } from '@/components/admin/shared/page-header'
import { DataTable } from '@/components/admin/shared/data-table'
import { FilterBar, type FilterConfig } from '@/components/admin/shared/filter-bar'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { formatDateShort, formatRelativeTime } from '@/lib/format'
import { EVENT_TYPE_LABELS } from '@/lib/schemas/inquiries'
import type { Inquiry } from '@/db/schema/inquiries'

const FILTER_CONFIG: FilterConfig[] = [
  { kind: 'search', key: 'search', placeholder: 'Name, email, phone...' },
  {
    kind: 'select',
    key: 'status',
    label: 'Status',
    options: [
      { value: '', label: 'All status' },
      { value: 'new', label: 'New' },
      { value: 'contacted', label: 'Contacted' },
      { value: 'closed', label: 'Closed' },
    ],
  },
  {
    kind: 'select',
    key: 'event_type',
    label: 'Event',
    options: [
      { value: '', label: 'All events' },
      { value: 'wedding', label: 'Wedding' },
      { value: 'birthday', label: 'Birthday' },
      { value: 'corporate', label: 'Corporate' },
      { value: 'other', label: 'Other' },
    ],
  },
]

export function InquiriesList() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', event_type: '', search: '' })

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => v && params.set(k, v))
      fetch('/api/admin/inquiries?' + params)
        .then((r) => r.json())
        .then((d) => setInquiries(d.inquiries || []))
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(t)
  }, [filters])

  const newCount = inquiries.filter((i) => i.status === 'new').length

  const columns: ColumnDef<Inquiry>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <Link
            href={`/admin/inquiries/${row.original.id}`}
            className="text-foreground font-medium no-underline hover:text-sage-deep"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: 'event_type',
        header: 'Event',
        cell: ({ getValue }) => (
          <span className="text-[12px] text-foreground">{EVENT_TYPE_LABELS[getValue() as string]}</span>
        ),
      },
      {
        accessorKey: 'event_date',
        header: 'Event date',
        cell: ({ getValue }) => (
          <span className="text-[12px] text-muted-foreground">
            {getValue() ? formatDateShort(getValue() as string) : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'guests_count',
        header: 'Guests',
        cell: ({ getValue }) => (
          <span className="text-[12px] font-admin-mono text-foreground">
            {(getValue() as number) || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge value={getValue() as string} />,
      },
      {
        accessorKey: 'created_at',
        header: 'Received',
        cell: ({ getValue }) => (
          <span className="text-[12px] text-muted-foreground">
            {formatRelativeTime(getValue() as string)}
          </span>
        ),
      },
    ],
    [],
  )

  return (
    <div className="max-w-[1300px]">
      <PageHeader
        title="Inquiries"
        subtitle={`${inquiries.length} total · ${newCount} new`}
      />

      <div className="mb-3">
        <FilterBar filters={filters} onChange={setFilters} config={FILTER_CONFIG} />
      </div>

      <DataTable
        columns={columns}
        data={inquiries}
        loading={loading}
        emptyState={
          <EmptyState
            icon={<Inbox size={32} />}
            title="No inquiries"
            description="Event inquiries from the website's contact form will appear here."
          />
        }
      />
    </div>
  )
}
