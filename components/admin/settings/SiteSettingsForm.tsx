'use client'

import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

import { FormCard } from '@/components/admin/shared/form-card'
import { Field, FormRow, TextInput, Textarea } from '@/components/admin/shared/form-field'

type ContactData = {
  phone?: string
  email?: string
  address?: string
  whatsapp?: string
}

type SocialData = {
  instagram?: string
  facebook?: string
}

type SeoData = {
  default_title_suffix?: string
  default_description?: string
  og_image?: string
}

export function SiteSettingsForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [contact, setContact] = useState<ContactData>({})
  const [social, setSocial] = useState<SocialData>({})
  const [seo, setSeo] = useState<SeoData>({})

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/settings/site?page=contact').then((r) => r.json()),
      fetch('/api/admin/settings/site?page=social').then((r) => r.json()),
      fetch('/api/admin/settings/site?page=seo').then((r) => r.json()),
    ])
      .then(([c, s, e]) => {
        setContact(c.content || {})
        setSocial(s.content || {})
        setSeo(e.content || {})
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function savePage(page: string, content: Record<string, unknown>) {
    const res = await fetch('/api/admin/settings/site', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ page, content }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Save failed')
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await Promise.all([
        savePage('contact', contact as Record<string, unknown>),
        savePage('social', social as Record<string, unknown>),
        savePage('seo', seo as Record<string, unknown>),
      ])
      toast.success('Site settings updated')
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
      <FormCard title="Contact" description="Shown on the website's contact page, footer, and structured data.">
        <FormRow>
          <Field label="Phone">
            <TextInput
              value={contact.phone || ''}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              placeholder="+91 73899 09985"
            />
          </Field>
          <Field label="WhatsApp">
            <TextInput
              value={contact.whatsapp || ''}
              onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
              placeholder="+91 73899 09985"
            />
          </Field>
        </FormRow>
        <Field label="Email">
          <TextInput
            type="email"
            value={contact.email || ''}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            placeholder="hello@madhubangarden.com"
          />
        </Field>
        <Field label="Address">
          <Textarea
            value={contact.address || ''}
            onChange={(e) => setContact({ ...contact, address: e.target.value })}
            rows={3}
            placeholder="Agar Malwa District, Madhya Pradesh, India"
          />
        </Field>
      </FormCard>

      <FormCard title="Social links">
        <FormRow>
          <Field label="Instagram URL">
            <TextInput
              type="url"
              value={social.instagram || ''}
              onChange={(e) => setSocial({ ...social, instagram: e.target.value })}
              placeholder="https://instagram.com/madhubangarden"
            />
          </Field>
          <Field label="Facebook URL">
            <TextInput
              type="url"
              value={social.facebook || ''}
              onChange={(e) => setSocial({ ...social, facebook: e.target.value })}
              placeholder="https://facebook.com/madhubangarden"
            />
          </Field>
        </FormRow>
      </FormCard>

      <FormCard title="Default SEO" description="Used as fallbacks across the website.">
        <Field label="Title suffix" hint="Appended after page-specific titles">
          <TextInput
            value={seo.default_title_suffix || ''}
            onChange={(e) => setSeo({ ...seo, default_title_suffix: e.target.value })}
            placeholder="Madhuban Garden Resort"
          />
        </Field>
        <Field label="Default description">
          <Textarea
            value={seo.default_description || ''}
            onChange={(e) => setSeo({ ...seo, default_description: e.target.value })}
            rows={3}
            placeholder="The most peaceful & lush green premises in Agar Malwa District..."
          />
        </Field>
        <Field label="OG image URL" hint="Image used for social sharing">
          <TextInput
            type="url"
            value={seo.og_image || ''}
            onChange={(e) => setSeo({ ...seo, og_image: e.target.value })}
            placeholder="https://..."
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
          <Save size={14} /> {saving ? 'Saving...' : 'Save site settings'}
        </button>
      </div>
    </div>
  )
}
