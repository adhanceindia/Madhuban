'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Users, Calendar, ChevronRight } from 'lucide-react'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { EmptyState } from '@/components/admin/shared/empty-state'

type BookingSummary = {
  id: number
  guest_name: string
  room_name: string
  check_in: string
  check_out: string
  total_amount: number
  status: string
  payment_status: string
  source: string
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

export function RecentBookings({ data }: { data: BookingSummary[] }) {
  return (
    <Card className="p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-blue-600" />
          <span className="text-sm font-semibold text-foreground">Recent Bookings</span>
        </div>
        <Link href="/admin/bookings" className="flex items-center gap-0.5 text-xs font-medium text-primary no-underline hover:underline">
          View all <ChevronRight size={14} />
        </Link>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={<Calendar size={24} />}
          title="No bookings yet"
          description="Your recent bookings will appear here"
          action={{ label: 'Create Booking', href: '/admin/bookings' }}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {['Guest', 'Room', 'Check-in', 'Check-out', 'Amount', 'Status', 'Payment'].map((h) => (
                  <th key={h} className="text-left px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((b) => (
                <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-3 border-b border-muted whitespace-nowrap">
                    <Link href={`/admin/bookings/${b.id}`} className="text-primary font-medium no-underline hover:underline">
                      {b.guest_name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 border-b border-muted whitespace-nowrap">{b.room_name}</td>
                  <td className="px-3 py-3 border-b border-muted whitespace-nowrap">{formatDate(b.check_in)}</td>
                  <td className="px-3 py-3 border-b border-muted whitespace-nowrap">{formatDate(b.check_out)}</td>
                  <td className="px-3 py-3 border-b border-muted font-medium font-admin-mono whitespace-nowrap">{formatCurrency(b.total_amount)}</td>
                  <td className="px-3 py-3 border-b border-muted whitespace-nowrap"><StatusBadge value={b.status} /></td>
                  <td className="px-3 py-3 border-b border-muted whitespace-nowrap"><StatusBadge value={b.payment_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
