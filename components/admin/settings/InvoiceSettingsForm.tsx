'use client'

import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

import { FormCard } from '@/components/admin/shared/form-card'
import { Field, FormRow, TextInput, Textarea } from '@/components/admin/shared/form-field'

type InvoiceSettingsData = {
  business_name?: string
  gstin?: string
  address?: string
  phone?: string
  email?: string
  terms?: string
}

export function InvoiceSettingsForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<InvoiceSettingsData>({})

  useEffect(() => {
    fetch('/api/admin/settings/site?page=invoice_settings')
      .then((r) => r.json())
      .then((data) => {
        setSettings(data.content || {})
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
        body: JSON.stringify({ page: 'invoice_settings', content: settings }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Save failed')
      }
      toast.success('Invoice settings updated')
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
      <FormCard title="Business Info" description="This information will appear at the top of your printable invoices.">
        <FormRow>
          <Field label="Business Name">
            <TextInput
              value={settings.business_name || ''}
              onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
              placeholder="Madhuban Garden Resort"
            />
          </Field>
          <Field label="GSTIN">
            <TextInput
              value={settings.gstin || ''}
              onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
              placeholder="23XXXXXXXXXX1Z5"
            />
          </Field>
        </FormRow>
        <FormRow>
          <Field label="Contact Phone">
            <TextInput
              value={settings.phone || ''}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              placeholder="+91 73899 09985"
            />
          </Field>
          <Field label="Contact Email">
            <TextInput
              type="email"
              value={settings.email || ''}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder="billing@madhubangarden.com"
            />
          </Field>
        </FormRow>
        <Field label="Business Address">
          <Textarea
            value={settings.address || ''}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            rows={3}
            placeholder="Agar Malwa District, Madhya Pradesh, India"
          />
        </Field>
      </FormCard>

      <FormCard title="Invoice Terms" description="Terms and conditions to display at the bottom of the invoice.">
        <Field label="Terms & Conditions">
          <Textarea
            value={settings.terms || ''}
            onChange={(e) => setSettings({ ...settings, terms: e.target.value })}
            rows={4}
            placeholder="1. All disputes subject to local jurisdiction...&#10;2. Late payment fees apply..."
          />
        </Field>
      </FormCard>

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg transition-colors disabled:opacity-50"
        >
          <Save size={14} /> {saving ? 'Saving...' : 'Save settings'}
        </button>
      </div>
    </div>
  )
}
