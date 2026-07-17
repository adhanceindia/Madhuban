'use client'

import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'

import { FormCard } from '@/components/admin/shared/form-card'
import { Field, FormRow, TextInput } from '@/components/admin/shared/form-field'

const RichTextEditor = dynamic(() => import('@/components/admin/shared/rich-text-editor').then(mod => mod.RichTextEditor), { ssr: false, loading: () => <div className="h-[200px] w-full bg-card border border-border rounded-lg animate-pulse" /> })

type HotelPoliciesData = {
  check_in_time?: string
  check_out_time?: string
  cancellation_policy?: string
  refund_policy?: string
  gst_percentage?: string
}

export function PoliciesSettingsForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [policies, setPolicies] = useState<HotelPoliciesData>({})

  useEffect(() => {
    fetch('/api/admin/settings/site?page=hotel_policies')
      .then((r) => r.json())
      .then((data) => {
        setPolicies(data.content || {})
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings/site', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ page: 'hotel_policies', content: policies }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Save failed')
      }
      toast.success('Hotel policies updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="h-[400px] bg-card rounded-2xl animate-pulse" />
  }

  return (
    <div className="max-w-[800px] space-y-5">
      <FormCard title="Check-in & Check-out" description="Standard timings displayed to guests during booking.">
        <FormRow>
          <Field label="Check-in Time">
            <TextInput
              value={policies.check_in_time || ''}
              onChange={(e) => setPolicies({ ...policies, check_in_time: e.target.value })}
              placeholder="e.g. 2:00 PM"
            />
          </Field>
          <Field label="Check-out Time">
            <TextInput
              value={policies.check_out_time || ''}
              onChange={(e) => setPolicies({ ...policies, check_out_time: e.target.value })}
              placeholder="e.g. 11:00 AM"
            />
          </Field>
        </FormRow>
      </FormCard>

      <FormCard title="Tax Configuration" description="Global GST percentage applied to bookings.">
        <Field label="GST Percentage (%)">
          <TextInput
            type="number"
            min={0}
            max={100}
            value={policies.gst_percentage || ''}
            onChange={(e) => setPolicies({ ...policies, gst_percentage: e.target.value })}
            placeholder="12"
          />
        </Field>
      </FormCard>

      <FormCard title="Cancellation Policy" description="Rules for cancelling a booking, shown during checkout.">
        <RichTextEditor
          value={policies.cancellation_policy || ''}
          onChange={(html) => setPolicies({ ...policies, cancellation_policy: html })}
          placeholder="Free cancellation up to 48 hours before check-in..."
        />
      </FormCard>

      <FormCard title="Refund Policy" description="Terms regarding refunds for cancellations or modifications.">
        <RichTextEditor
          value={policies.refund_policy || ''}
          onChange={(html) => setPolicies({ ...policies, refund_policy: html })}
          placeholder="Refunds will be processed within 5-7 business days..."
        />
      </FormCard>

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg transition-colors disabled:opacity-50"
        >
          <Save size={14} /> {saving ? 'Saving...' : 'Save hotel policies'}
        </button>
      </div>
    </div>
  )
}
