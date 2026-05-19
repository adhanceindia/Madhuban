'use client'

import Link from 'next/link'
import { Calendar, ChevronRight } from 'lucide-react'
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
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

export function RecentBookings({ data }: { data: BookingSummary[] }) {
  return (
    <div className="bg-card rounded-2xl p-5 font-admin shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[13px] font-semibold text-foreground">Recent Bookings</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Latest activity</div>
        </div>
        <Link
          href="/admin/bookings"
          className="flex items-center gap-0.5 text-[12px] font-semibold text-foreground bg-accent hover:bg-accent-deep px-3 py-1.5 rounded-md no-underline transition-colors"
        >
          View All <ChevronRight size={14} />
        </Link>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={<Calendar size={28} />}
          title="No bookings yet"
          description="Recent reservations will appear here as guests book."
          action={{ label: 'Create Booking', href: '/admin/bookings' }}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                {['Guest', 'Room', 'Check-in', 'Check-out', 'Amount', 'Status', 'Payment'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((b) => (
                <tr key={b.id} className="border-b border-border/50 hover:bg-sage-soft/40 transition-colors">
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="text-foreground font-medium no-underline hover:text-sage-deep"
                    >
                      {b.guest_name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-foreground">{b.room_name}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">{formatDate(b.check_in)}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">{formatDate(b.check_out)}</td>
                  <td className="px-3 py-3 whitespace-nowrap font-semibold text-foreground font-admin-mono">
                    {formatCurrency(b.total_amount)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap"><StatusBadge value={b.status} /></td>
                  <td className="px-3 py-3 whitespace-nowrap"><StatusBadge value={b.payment_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
