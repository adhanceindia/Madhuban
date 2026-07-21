'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

import { FormCard } from '@/components/admin/shared/form-card'
import {
  Field,
  FormRow,
  TextInput,
  Select,
} from '@/components/admin/shared/form-field'
import { formatINR, nightsBetween, todayISO, addDays } from '@/lib/format'
import type { Room } from '@/db/schema/rooms'

export function BookingForm() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [saving, setSaving] = useState(false)

  const tomorrow = addDays(todayISO(), 1)
  const dayAfter = addDays(todayISO(), 2)

  const [form, setForm] = useState({
    room_id: 0,
    guest_name: '',
    guest_phone: '',
    guest_email: '',
    check_in: tomorrow,
    check_out: dayAfter,
    guests_count: 2,
    payment_method: 'at_reception' as 'online' | 'at_reception',
    payment_status: 'pending' as 'pending' | 'paid' | 'failed' | 'refunded',
    status: 'confirmed' as 'confirmed' | 'pending' | 'cancelled',
    source: 'manual' as
      | 'website'
      | 'booking_com'
      | 'mmt'
      | 'airbnb'
      | 'agoda'
      | 'goibibo'
      | 'manual',
  })

  useEffect(() => {
    fetch('/api/admin/rooms')
      .then((r) => r.json())
      .then((d) => {
        const activeRooms = (d.rooms || []).filter((r: Room) => r.is_active)
        setRooms(activeRooms)
        if (activeRooms.length > 0)
          setForm((f) => ({ ...f, room_id: activeRooms[0].id }))
      })
  }, [])

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === form.room_id),
    [rooms, form.room_id],
  )

  const calculation = useMemo(() => {
    if (!selectedRoom || !form.check_in || !form.check_out) return null
    const nights = nightsBetween(form.check_in, form.check_out)
    const subtotal = selectedRoom.price_per_night * nights
    const gst = Math.round(subtotal * 0.12)
    const total = subtotal + gst
    return { nights, subtotal, gst, total }
  }, [selectedRoom, form.check_in, form.check_out])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.room_id) {
      toast.error('Select a room')
      return
    }
    if (new Date(form.check_out) <= new Date(form.check_in)) {
      toast.error('Check-out must be after check-in')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Booking creation failed')
        return
      }
      toast.success('Booking created')
      router.push(`/admin/bookings/${data.booking.id}`)
      router.refresh()
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[800px] space-y-5">
      <FormCard title="Room & dates">
        <Field label="Room" required>
          <Select
            value={form.room_id || ''}
            onChange={(e) =>
              setForm({ ...form, room_id: parseInt(e.target.value) })
            }
            required
          >
            <option value="">Select a room…</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} — {formatINR(r.price_per_night)}/night
              </option>
            ))}
          </Select>
        </Field>

        <FormRow>
          <Field label="Check-in" required>
            <TextInput
              required
              type="date"
              value={form.check_in}
              onChange={(e) => setForm({ ...form, check_in: e.target.value })}
              min={todayISO()}
            />
          </Field>
          <Field label="Check-out" required>
            <TextInput
              required
              type="date"
              value={form.check_out}
              onChange={(e) => setForm({ ...form, check_out: e.target.value })}
              min={form.check_in}
            />
          </Field>
        </FormRow>

        <Field
          label="Number of guests"
          required
          hint={
            selectedRoom
              ? `Max ${selectedRoom.capacity} for this room`
              : undefined
          }
        >
          <TextInput
            required
            type="number"
            min={1}
            max={selectedRoom?.capacity || 10}
            value={form.guests_count}
            onChange={(e) =>
              setForm({ ...form, guests_count: parseInt(e.target.value) || 1 })
            }
          />
        </Field>

        {calculation && (
          <div className="space-y-1.5 rounded-lg bg-sage-soft/60 p-4 text-[13px]">
            <div className="flex justify-between text-muted-foreground">
              <span>
                {calculation.nights} nights ×{' '}
                {formatINR(selectedRoom?.price_per_night || 0)}
              </span>
              <span className="font-admin-mono">
                {formatINR(calculation.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>GST (12%)</span>
              <span className="font-admin-mono">
                {formatINR(calculation.gst)}
              </span>
            </div>
            <div className="mt-1.5 flex justify-between border-t border-border pt-1.5 font-semibold text-foreground">
              <span>Total</span>
              <span className="font-admin-mono">
                {formatINR(calculation.total)}
              </span>
            </div>
          </div>
        )}
      </FormCard>

      <FormCard title="Guest details">
        <Field label="Name" required>
          <TextInput
            required
            value={form.guest_name}
            onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
            placeholder="Rahul Verma"
          />
        </Field>
        <FormRow>
          <Field label="Phone" required hint="10-digit Indian">
            <TextInput
              required
              value={form.guest_phone}
              onChange={(e) =>
                setForm({ ...form, guest_phone: e.target.value })
              }
              pattern="^[6-9]\d{9}$"
              placeholder="9876543210"
            />
          </Field>
          <Field label="Email" required>
            <TextInput
              required
              type="email"
              value={form.guest_email}
              onChange={(e) =>
                setForm({ ...form, guest_email: e.target.value })
              }
              placeholder="rahul@example.com"
            />
          </Field>
        </FormRow>
      </FormCard>

      <FormCard title="Payment & status">
        <FormRow>
          <Field label="Payment method" required>
            <Select
              value={form.payment_method}
              onChange={(e) =>
                setForm({
                  ...form,
                  payment_method: e.target.value as 'online' | 'at_reception',
                })
              }
            >
              <option value="at_reception">Pay at reception</option>
              <option value="online">Online (gateway)</option>
            </Select>
          </Field>
          <Field label="Payment status">
            <Select
              value={form.payment_status}
              onChange={(e) =>
                setForm({
                  ...form,
                  payment_status: e.target.value as typeof form.payment_status,
                })
              }
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </Select>
          </Field>
        </FormRow>
        <FormRow>
          <Field label="Booking status">
            <Select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as typeof form.status,
                })
              }
            >
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </Field>
          <Field label="Source">
            <Select
              value={form.source}
              onChange={(e) =>
                setForm({
                  ...form,
                  source: e.target.value as typeof form.source,
                })
              }
            >
              <option value="manual">Manual entry</option>
              <option value="website">Website</option>
              <option value="booking_com">Booking.com</option>
              <option value="mmt">MakeMyTrip</option>
              <option value="airbnb">Airbnb</option>
              <option value="agoda">Agoda</option>
              <option value="goibibo">Goibibo</option>
            </Select>
          </Field>
        </FormRow>
      </FormCard>

      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-accent-deep disabled:opacity-50"
        >
          <Save size={14} /> {saving ? 'Creating...' : 'Create booking'}
        </button>
      </div>
    </form>
  )
}
