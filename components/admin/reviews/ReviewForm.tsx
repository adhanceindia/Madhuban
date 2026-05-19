'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Star } from 'lucide-react'
import toast from 'react-hot-toast'

import { FormCard } from '@/components/admin/shared/form-card'
import { Field, FormRow, TextInput, Textarea, Select } from '@/components/admin/shared/form-field'
import { Toggle } from '@/components/admin/shared/toggle'

export function ReviewForm() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    guest_name: '',
    rating: 5,
    review_text: '',
    source: 'manual' as 'manual' | 'google',
    is_published: true,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Save failed')
        return
      }
      toast.success('Review added')
      router.push('/admin/reviews')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[640px] space-y-5">
      <FormCard title="Review details">
        <FormRow>
          <Field label="Guest name" required>
            <TextInput
              required
              value={form.guest_name}
              onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
              placeholder="Rajiv Mehta"
            />
          </Field>
          <Field label="Source">
            <Select
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value as 'manual' | 'google' })}
            >
              <option value="manual">Manual</option>
              <option value="google">Google</option>
            </Select>
          </Field>
        </FormRow>

        <Field label="Rating" required>
          <div className="flex items-center gap-1.5 py-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm({ ...form, rating: s })}
                className="p-0.5 cursor-pointer transition-transform hover:scale-110"
                aria-label={`${s} star${s > 1 ? 's' : ''}`}
              >
                <Star
                  size={28}
                  className={s <= form.rating ? 'text-accent-deep fill-current' : 'text-sage-soft hover:text-accent'}
                />
              </button>
            ))}
            <span className="ml-3 text-[14px] font-semibold text-foreground font-admin-mono">
              {form.rating}/5
            </span>
          </div>
        </Field>

        <Field label="Review text" required>
          <Textarea
            required
            rows={5}
            value={form.review_text}
            onChange={(e) => setForm({ ...form, review_text: e.target.value })}
            placeholder="Beautiful gardens, attentive staff, peaceful setting..."
          />
        </Field>

        <Toggle
          checked={form.is_published}
          onChange={(v) => setForm({ ...form, is_published: v })}
          label="Publish on website"
          description="Unpublished reviews are saved but not shown publicly."
        />
      </FormCard>

      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg transition-colors disabled:opacity-50"
        >
          <Save size={14} /> {saving ? 'Saving...' : 'Add review'}
        </button>
      </div>
    </form>
  )
}
