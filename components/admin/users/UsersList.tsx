'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Users as UsersIcon } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'

import { PageHeader } from '@/components/admin/shared/page-header'
import { DataTable } from '@/components/admin/shared/data-table'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { formatRelativeTime } from '@/lib/format'
import { ROLE_LABELS } from '@/lib/schemas/users'
import type { User, UserRole } from '@/db/schema/users'

export function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <Link
            href={`/admin/users/${row.original.id}`}
            className="text-foreground font-medium no-underline hover:text-sage-deep"
          >
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ getValue }) => (
          <span className="text-[12px] font-medium text-foreground">
            {ROLE_LABELS[getValue() as UserRole]}
          </span>
        ),
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge value={getValue() ? 'available' : 'blocked'} />,
      },
      {
        accessorKey: 'last_login',
        header: 'Last login',
        cell: ({ getValue }) => (
          <span className="text-[12px] text-muted-foreground">
            {getValue() ? formatRelativeTime(getValue() as string) : '—'}
          </span>
        ),
      },
    ],
    [],
  )

  return (
    <div className="max-w-[1100px]">
      <PageHeader
        title="Staff Users"
        subtitle={`${users.length} ${users.length === 1 ? 'account' : 'accounts'}`}
        actions={
          <Link
            href="/admin/users/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg no-underline transition-colors"
          >
            <Plus size={16} /> New User
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyState={
          <EmptyState
            icon={<UsersIcon size={32} />}
            title="No staff users yet"
            description="Add resort managers, front desk, accountants, and other staff."
            action={{ label: 'Add Staff', href: '/admin/users/new' }}
          />
        }
      />
    </div>
  )
}
