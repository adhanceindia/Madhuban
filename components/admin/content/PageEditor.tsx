'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ExternalLink, Plus, X } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

import { FormCard } from '@/components/admin/shared/form-card'
import { Field, TextInput, Textarea } from '@/components/admin/shared/form-field'
import { ImageUploader } from '@/components/admin/shared/image-uploader'
import { RichTextEditor } from '@/components/admin/shared/rich-text-editor'
import type { PageSchema, FieldDef } from '@/lib/cms-schema'

type EditorProps = {
  page: PageSchema
  initialContent: Record<string, unknown>
}

export function PageEditor({ page, initialContent }: EditorProps) {
  const router = useRouter()
  const [content, setContent] = useState<Record<string, unknown>>(initialContent)
  const [saving, setSaving] = useState(false)

  function setField(key: string, value: unknown) {
    setContent((c) => ({ ...c, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/content/${page.key}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Save failed')
        return
      }
      toast.success('Saved')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-[800px] space-y-5">
      {page.publicPath && (
        <Link
          href={page.publicPath}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground no-underline"
        >
          View live page <ExternalLink size={11} />
        </Link>
      )}

      {page.sections.map((section, sectionIdx) => (
        <FormCard key={sectionIdx} title={section.title}>
          {section.fields.map((field) => (
            <FieldRenderer
              key={field.field}
              def={field}
              value={content[field.field]}
              onChange={(v) => setField(field.field, v)}
            />
          ))}
        </FormCard>
      ))}

      <div className="flex items-center justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg transition-colors disabled:opacity-50"
        >
          <Save size={14} /> {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

function FieldRenderer({
  def,
  value,
  onChange,
}: {
  def: FieldDef
  value: unknown
  onChange: (v: unknown) => void
}) {
  if (def.type === 'text') {
    return (
      <Field label={def.label} hint={def.hint} required={def.required}>
        <TextInput value={(value as string) || ''} onChange={(e) => onChange(e.target.value)} />
      </Field>
    )
  }

  if (def.type === 'url') {
    return (
      <Field label={def.label} hint={def.hint} required={def.required}>
        <TextInput
          type="url"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
        />
      </Field>
    )
  }

  if (def.type === 'textarea') {
    return (
      <Field label={def.label} hint={def.hint} required={def.required}>
        <Textarea rows={4} value={(value as string) || ''} onChange={(e) => onChange(e.target.value)} />
      </Field>
    )
  }

  if (def.type === 'richtext') {
    return (
      <Field label={def.label} hint={def.hint} required={def.required}>
        <RichTextEditor
          value={(value as string) || ''}
          onChange={(html) => onChange(html)}
          placeholder={`Enter ${def.label.toLowerCase()}...`}
        />
      </Field>
    )
  }

  if (def.type === 'image') {
    const current = (value as string) || ''
    return (
      <Field label={def.label} hint={def.hint} required={def.required}>
        <ImageUploader
          value={current ? [current] : []}
          onChange={(urls) => onChange(urls[0] || '')}
          multiple={false}
          maxImages={1}
          folder={`content/${def.field}`}
        />
      </Field>
    )
  }

  if (def.type === 'repeater' && def.itemFields) {
    const items = (Array.isArray(value) ? value : []) as Record<string, string>[]
    function update(i: number, key: string, v: string) {
      const next = [...items]
      next[i] = { ...next[i], [key]: v }
      onChange(next)
    }
    function add() {
      const blank: Record<string, string> = {}
      def.itemFields!.forEach((f) => (blank[f.field] = ''))
      onChange([...items, blank])
    }
    function remove(i: number) {
      onChange(items.filter((_, idx) => idx !== i))
    }

    return (
      <Field label={def.label} hint={def.hint} required={def.required}>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="bg-sage-soft/40 rounded-lg p-3 flex items-start gap-3">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                {def.itemFields!.map((f) => (
                  <div key={f.field}>
                    <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                      {f.label}
                    </label>
                    <TextInput
                      type={f.type === 'url' ? 'url' : 'text'}
                      value={item[f.field] || ''}
                      onChange={(e) => update(i, f.field, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-muted-foreground hover:text-destructive p-1 mt-5"
                aria-label="Remove item"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold bg-sage-soft hover:bg-sage text-foreground rounded-md transition-colors"
          >
            <Plus size={13} /> Add item
          </button>
        </div>
      </Field>
    )
  }

  return null
}
