'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ScrollText, ExternalLink, X } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'

import { PageHeader } from '@/components/admin/shared/page-header'
import { DataTable } from '@/components/admin/shared/data-table'
import { FilterBar, type FilterConfig } from '@/components/admin/shared/filter-bar'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import type { AuditRow } from '@/db/queries/audit-log'

const ENTITY_LINK_BASES: Record<string, string> = {
  booking: '/admin/bookings',
  room: '/admin/rooms',
  inquiry: '/admin/inquiries',
  review: '/admin/reviews',
  user: '/admin/users',
}

export function AuditLogView() {
  const [entries, setEntries] = useState<AuditRow[]>([])
  const [users, setUsers] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    user_id: '',
    entity_type: '',
    start_date: '',
    end_date: '',
    search: '',
  })
  const [detail, setDetail] = useState<AuditRow | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => v && params.set(k, v))
      fetch('/api/admin/audit-log?' + params)
        .then((r) => r.json())
        .then((d) => {
          setEntries(d.entries || [])
          if (d.filter_options?.users) setUsers(d.filter_options.users)
        })
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(t)
  }, [filters])

  const filterConfig: FilterConfig[] = useMemo(
    () => [
      { kind: 'search', key: 'search', placeholder: 'Action, entity, ID...' },
      {
        kind: 'select',
        key: 'user_id',
        label: 'User',
        options: [{ value: '', label: 'All users' }, ...users.map((u) => ({ value: String(u.id), label: u.name }))],
      },
      {
        kind: 'select',
        key: 'entity_type',
        label: 'Entity',
        options: [
          { value: '', label: 'All entities' },
          { value: 'booking', label: 'Bookings' },
          { value: 'room', label: 'Rooms' },
          { value: 'inquiry', label: 'Inquiries' },
          { value: 'review', label: 'Reviews' },
          { value: 'gallery', label: 'Gallery' },
          { value: 'site_content', label: 'Site content' },
          { value: 'user', label: 'Users' },
          { value: 'payment_config', label: 'Payment config' },
          { value: 'blocked_date', label: 'Blocked dates' },
        ],
      },
      { kind: 'dateRange', startKey: 'start_date', endKey: 'end_date' },
    ],
    [users],
  )

  const columns: ColumnDef<AuditRow>[] = useMemo(
    () => [
      {
        accessorKey: 'created_at',
        header: 'When',
        cell: ({ getValue }) => (
          <span className="text-[12px] text-muted-foreground" title={formatDateTime(getValue() as string)}>
            {formatRelativeTime(getValue() as string)}
          </span>
        ),
      },
      {
        accessorKey: 'user_name',
        header: 'User',
        cell: ({ row }) => (
          <span className="text-[12px] text-foreground">
            {row.original.user_name || <span className="text-muted-foreground italic">System</span>}
          </span>
        ),
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ getValue }) => (
          <code className="text-[11px] font-admin-mono bg-sage-soft px-1.5 py-0.5 rounded text-foreground">
            {getValue() as string}
          </code>
        ),
      },
      {
        accessorKey: 'entity_type',
        header: 'Entity',
        cell: ({ row }) => {
          const base = ENTITY_LINK_BASES[row.original.entity_type]
          if (base && row.original.entity_id) {
            return (
              <Link
                href={`${base}/${row.original.entity_id}`}
                className="text-foreground no-underline hover:text-sage-deep inline-flex items-center gap-1"
              >
                {row.original.entity_type} #{row.original.entity_id} <ExternalLink size={10} />
              </Link>
            )
          }
          return (
            <span className="text-[12px] text-foreground">
              {row.original.entity_type}
              {row.original.entity_id ? ` #${row.original.entity_id}` : ''}
            </span>
          )
        },
      },
      {
        id: 'view',
        header: '',
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => setDetail(row.original)}
            className="text-[11px] font-semibold text-foreground hover:text-sage-deep underline"
          >
            View diff
          </button>
        ),
      },
    ],
    [],
  )

  return (
    <div className="max-w-[1400px]">
      <PageHeader
        title="Audit Log"
        subtitle={`${entries.length} entries · super admin only`}
      />

      <div className="mb-3">
        <FilterBar filters={filters} onChange={setFilters} config={filterConfig} />
      </div>

      <DataTable
        columns={columns}
        data={entries}
        loading={loading}
        pageSize={50}
        emptyState={
          <EmptyState
            icon={<ScrollText size={32} />}
            title="No audit entries"
            description="Staff actions are logged here automatically."
          />
        }
      />

      {detail && <AuditDetailModal entry={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}

function AuditDetailModal({ entry, onClose }: { entry: AuditRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-admin">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-card p-5 border-b border-border/50 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Audit entry #{entry.id}
            </div>
            <h3 className="text-[15px] font-semibold text-foreground">
              <code className="font-admin-mono text-[13px] bg-sage-soft px-1.5 py-0.5 rounded">
                {entry.action}
              </code>
            </h3>
            <div className="text-[11px] text-muted-foreground mt-2">
              {entry.user_name || 'System'} · {formatDateTime(entry.created_at)}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-sage-soft text-muted-foreground"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Entity
            </div>
            <div className="text-[13px] text-foreground">
              {entry.entity_type}
              {entry.entity_id ? ` #${entry.entity_id}` : ''}
            </div>
          </div>

          {entry.old_value !== null && entry.old_value !== undefined && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Previous value
              </div>
              <pre className="bg-status-cancelled-bg/40 text-foreground text-[11px] font-admin-mono p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(entry.old_value, null, 2)}
              </pre>
            </div>
          )}

          {entry.new_value !== null && entry.new_value !== undefined && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                New value
              </div>
              <pre className="bg-status-confirmed-bg/40 text-foreground text-[11px] font-admin-mono p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(entry.new_value, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
