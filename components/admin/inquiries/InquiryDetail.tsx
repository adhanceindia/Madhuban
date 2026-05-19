'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Phone, Mail, Calendar, Users, MessageSquare, Save } from 'lucide-react'
import toast from 'react-hot-toast'

import { StatusBadge } from '@/components/admin/shared/status-badge'
import { Field, Textarea } from '@/components/admin/shared/form-field'
import { formatDate, formatDateTime } from '@/lib/format'
import { EVENT_TYPE_LABELS } from '@/lib/schemas/inquiries'
import type { Inquiry } from '@/db/schema/inquiries'

export function InquiryDetail({ inquiry }: { inquiry: Inquiry }) {
  const router = useRouter()
  const [status, setStatus] = useState(inquiry.status)
  const [notes, setNotes] = useState(inquiry.staff_notes || '')
  const [saving, setSaving] = useState(false)

  async function transition(nextStatus: typeof inquiry.status) {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Update failed')
        return
      }
      toast.success(`Marked as ${nextStatus}`)
      setStatus(nextStatus)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function saveNotes() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ staff_notes: notes }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Save failed')
        return
      }
      toast.success('Notes saved')
    } finally {
      setSaving(false)
    }
  }

  const subject = `Inquiry about ${EVENT_TYPE_LABELS[inquiry.event_type] || 'your event'}`

  return (
    <div className="max-w-[1100px] grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left — Inquiry detail */}
      <div className="lg:col-span-2 space-y-5">
        <div className="bg-card rounded-2xl p-5 shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Inquiry #{inquiry.id}
              </div>
              <StatusBadge value={status} />
            </div>
            <div className="text-[11px] text-muted-foreground">
              Received {formatDateTime(inquiry.created_at)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <InfoRow icon={<User size={16} />} label="Name" value={inquiry.name} />
            <InfoRow
              icon={<Phone size={16} />}
              label="Phone"
              value={
                <a href={`tel:+91${inquiry.phone}`} className="text-foreground no-underline hover:text-sage-deep">
                  +91 {inquiry.phone}
                </a>
              }
            />
            <InfoRow
              icon={<Mail size={16} />}
              label="Email"
              value={
                <a
                  href={`mailto:${inquiry.email}?subject=${encodeURIComponent(subject)}`}
                  className="text-foreground no-underline hover:text-sage-deep"
                >
                  {inquiry.email}
                </a>
              }
            />
            <InfoRow icon={<Calendar size={16} />} label="Event type" value={EVENT_TYPE_LABELS[inquiry.event_type]} />
            <InfoRow
              icon={<Calendar size={16} />}
              label="Event date"
              value={inquiry.event_date ? formatDate(inquiry.event_date) : '—'}
            />
            <InfoRow
              icon={<Users size={16} />}
              label="Guests"
              value={inquiry.guests_count ? `${inquiry.guests_count}` : '—'}
            />
          </div>

          {inquiry.message && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 flex items-center gap-1.5">
                <MessageSquare size={11} /> Message
              </div>
              <div className="text-[13px] text-foreground bg-sage-soft/40 rounded-lg p-4 leading-relaxed whitespace-pre-wrap">
                {inquiry.message}
              </div>
            </div>
          )}
        </div>

        {/* Staff notes */}
        <div className="bg-card rounded-2xl p-5 shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
          <h2 className="text-[14px] font-semibold text-foreground mb-3">Staff notes</h2>
          <Field label="Internal notes" hint="Visible only to staff">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Spoke to guest on 12 May. Quoted ₹2L for 100 guests including catering..."
            />
          </Field>
          <div className="flex justify-end mt-3">
            <button
              type="button"
              onClick={saveNotes}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={13} /> {saving ? 'Saving...' : 'Save notes'}
            </button>
          </div>
        </div>
      </div>

      {/* Right — Status transitions */}
      <div className="space-y-5">
        <div className="bg-card rounded-2xl p-5 shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
          <h2 className="text-[14px] font-semibold text-foreground mb-3">Pipeline</h2>
          <div className="space-y-2">
            {(['new', 'contacted', 'closed'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => transition(s)}
                disabled={saving || status === s}
                className={`w-full px-3.5 py-2 text-[12px] font-semibold rounded-lg transition-colors capitalize ${
                  status === s
                    ? 'bg-accent text-foreground cursor-default'
                    : 'bg-sage-soft hover:bg-sage text-foreground'
                }`}
              >
                {s === status && '✓ '}
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
          <h2 className="text-[14px] font-semibold text-foreground mb-3">Quick reply</h2>
          <a
            href={`mailto:${inquiry.email}?subject=${encodeURIComponent(subject)}`}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg no-underline transition-colors"
          >
            <Mail size={13} /> Email guest
          </a>
        </div>
      </div>
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
