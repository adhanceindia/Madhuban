'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, User, Phone, Mail, BedDouble, IndianRupee, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

import { StatusBadge } from '@/components/admin/shared/status-badge'
import { ConfirmDialog } from '@/components/admin/shared/confirm-dialog'
import { formatINR, formatDate, formatDateTime, nightsBetween } from '@/lib/format'

type BookingDetailData = {
  id: number
  room_id: number
  room_name: string
  room_type: string
  guest_name: string
  guest_phone: string
  guest_email: string
  check_in: string
  check_out: string
  guests_count: number
  total_amount: number | null
  payment_method: string
  payment_status: string
  status: string
  source: string
  gateway_used: string | null
  gateway_order_id: string | null
  gateway_payment_id: string | null
  created_at: Date | string
  updated_at: Date | string
}

export function BookingDetail({ booking }: { booking: BookingDetailData }) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  async function transition(updates: Partial<BookingDetailData>) {
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Update failed')
        return
      }
      toast.success('Booking updated')
      router.refresh()
    } catch {
      toast.error('Network error')
    } finally {
      setUpdating(false)
    }
  }

  const nights = nightsBetween(booking.check_in, booking.check_out)
  const subtotal = booking.total_amount ? Math.round(booking.total_amount / 1.12) : 0
  const gst = (booking.total_amount || 0) - subtotal

  return (
    <div className="max-w-[1100px] grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left column — booking details */}
      <div className="lg:col-span-2 space-y-5">
        {/* Status row */}
        <div className="bg-card rounded-2xl p-5 shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Booking #{booking.id}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge value={booking.status} />
                <StatusBadge value={booking.payment_status} />
                <StatusBadge value={booking.source} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {booking.status !== 'confirmed' && (
                <button
                  type="button"
                  onClick={() => transition({ status: 'confirmed' })}
                  disabled={updating}
                  className="px-3.5 py-1.5 text-[12px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg transition-colors disabled:opacity-50"
                >
                  Confirm
                </button>
              )}
              {booking.status !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={updating}
                  className="px-3.5 py-1.5 text-[12px] font-semibold text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel booking
                </button>
              )}
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Created {formatDateTime(booking.created_at)}
            {booking.updated_at !== booking.created_at && (
              <span> · Updated {formatDateTime(booking.updated_at)}</span>
            )}
          </div>
        </div>

        {/* Stay */}
        <div className="bg-card rounded-2xl p-5 shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
          <h2 className="text-[14px] font-semibold text-foreground mb-4">Stay</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow icon={<Calendar size={16} />} label="Check-in" value={formatDate(booking.check_in)} />
            <InfoRow icon={<Calendar size={16} />} label="Check-out" value={formatDate(booking.check_out)} />
            <InfoRow
              icon={<BedDouble size={16} />}
              label="Room"
              value={
                <Link
                  href={`/admin/rooms/${booking.room_id}`}
                  className="text-foreground font-medium no-underline hover:text-sage-deep inline-flex items-center gap-1"
                >
                  {booking.room_name} <ExternalLink size={11} />
                </Link>
              }
            />
            <InfoRow icon={<User size={16} />} label="Nights / guests" value={`${nights} nights · ${booking.guests_count} guests`} />
          </div>
        </div>

        {/* Guest */}
        <div className="bg-card rounded-2xl p-5 shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
          <h2 className="text-[14px] font-semibold text-foreground mb-4">Guest</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow icon={<User size={16} />} label="Name" value={booking.guest_name} />
            <InfoRow
              icon={<Phone size={16} />}
              label="Phone"
              value={
                <a href={`tel:+91${booking.guest_phone}`} className="text-foreground no-underline hover:text-sage-deep">
                  +91 {booking.guest_phone}
                </a>
              }
            />
            <InfoRow
              icon={<Mail size={16} />}
              label="Email"
              value={
                <a href={`mailto:${booking.guest_email}`} className="text-foreground no-underline hover:text-sage-deep">
                  {booking.guest_email}
                </a>
              }
            />
          </div>
        </div>

        {/* Payment */}
        <div className="bg-card rounded-2xl p-5 shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
          <h2 className="text-[14px] font-semibold text-foreground mb-4">Payment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <InfoRow icon={<IndianRupee size={16} />} label="Method" value={booking.payment_method === 'online' ? 'Online' : 'At reception'} />
            <InfoRow icon={<IndianRupee size={16} />} label="Status" value={<StatusBadge value={booking.payment_status} />} />
            {booking.gateway_used && (
              <InfoRow icon={<IndianRupee size={16} />} label="Gateway" value={<span className="capitalize">{booking.gateway_used}</span>} />
            )}
            {booking.gateway_order_id && (
              <InfoRow icon={<IndianRupee size={16} />} label="Gateway order ID" value={<span className="font-admin-mono text-[12px]">{booking.gateway_order_id}</span>} />
            )}
          </div>

          {booking.total_amount !== null && (
            <div className="bg-sage-soft/60 rounded-lg p-4 space-y-1.5 text-[13px]">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({nights} nights)</span>
                <span className="font-admin-mono">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>GST (12%)</span>
                <span className="font-admin-mono">{formatINR(gst)}</span>
              </div>
              <div className="flex justify-between font-semibold text-foreground border-t border-border pt-1.5 mt-1.5">
                <span>Total</span>
                <span className="font-admin-mono">{formatINR(booking.total_amount)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right column — quick actions */}
      <div className="space-y-5">
        <div className="bg-card rounded-2xl p-5 shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
          <h2 className="text-[14px] font-semibold text-foreground mb-4">Mark payment</h2>
          <div className="space-y-2">
            {booking.payment_status !== 'paid' && (
              <button
                type="button"
                onClick={() => transition({ payment_status: 'paid' })}
                disabled={updating}
                className="w-full px-3.5 py-2 text-[12px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg transition-colors disabled:opacity-50"
              >
                Mark as paid
              </button>
            )}
            {booking.payment_status !== 'pending' && (
              <button
                type="button"
                onClick={() => transition({ payment_status: 'pending' })}
                disabled={updating}
                className="w-full px-3.5 py-2 text-[12px] font-semibold bg-sage-soft hover:bg-sage text-foreground rounded-lg transition-colors disabled:opacity-50"
              >
                Mark as pending
              </button>
            )}
            {booking.payment_status === 'paid' && (
              <button
                type="button"
                onClick={() => transition({ payment_status: 'refunded' })}
                disabled={updating}
                className="w-full px-3.5 py-2 text-[12px] font-semibold text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
              >
                Mark as refunded
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showCancelDialog}
        destructive
        title="Cancel this booking?"
        message={`This will cancel ${booking.guest_name}'s reservation for ${booking.room_name}. The dates will become available for re-booking.`}
        confirmLabel="Cancel booking"
        cancelLabel="Keep it"
        loading={updating}
        onConfirm={() => {
          transition({ status: 'cancelled' })
          setShowCancelDialog(false)
        }}
        onCancel={() => setShowCancelDialog(false)}
      />
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="text-muted-foreground mt-0.5 flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
          {label}
        </div>
        <div className="text-[13px] text-foreground">{value}</div>
      </div>
    </div>
  )
}
