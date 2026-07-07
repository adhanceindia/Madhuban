'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ExternalLink, Plus, X, Monitor, Smartphone, Tablet } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

import { FormCard } from '@/components/admin/shared/form-card'
import { Field, TextInput, Textarea } from '@/components/admin/shared/form-field'
import { ImageUploader } from '@/components/admin/shared/image-uploader'
import dynamic from 'next/dynamic'
const RichTextEditor = dynamic(() => import('@/components/admin/shared/rich-text-editor').then(mod => mod.RichTextEditor), { ssr: false, loading: () => <div className="h-[200px] w-full bg-card border border-border rounded-lg animate-pulse" /> })
import { BlockEditor } from '@/components/admin/shared/block-editor'
import { MenuBuilder } from '@/components/admin/shared/menu-builder'
import type { PageSchema, FieldDef } from '@/lib/cms-schema'

type EditorProps = {
  page: PageSchema
  initialContent: Record<string, unknown>
}

export function PageEditor({ page, initialContent }: EditorProps) {
  const router = useRouter()
  const [content, setContent] = useState<Record<string, unknown>>(initialContent)
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    // Send live preview updates to the iframe
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'CMS_PREVIEW_UPDATE', payload: content },
        '*'
      )
    }
  }, [content])

  function setField(key: string, value: unknown) {
    setContent((c) => ({ ...c, [key]: value }))
    setIsDirty(true)
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
      setIsDirty(false)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="flex h-full w-full bg-background">
      {/* Editor Pane */}
      <div className="w-[45%] lg:w-[40%] xl:w-[35%] min-w-[320px] max-w-[500px] flex-shrink-0 overflow-y-auto border-r border-border p-6 bg-card space-y-6">
        <div className="flex flex-col gap-2">
          <button 
            type="button" 
            onClick={() => {
              if (isDirty) {
                setShowUnsavedDialog(true)
              } else {
                router.push('/admin/content')
              }
            }}
            className="text-muted-foreground hover:text-foreground text-[13px] flex items-center gap-1 w-fit mb-2 bg-transparent border-none p-0 cursor-pointer"
          >
            &larr; Back to pages
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight">{page.label}</h1>
            {page.publicPath && (
              <Link
                href={page.publicPath}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground no-underline"
              >
                View live <ExternalLink size={11} />
              </Link>
            )}
          </div>
        </div>

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

        <div className="flex items-center justify-end pt-2 pb-10">
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

      {/* Preview Pane */}
      <div className="flex-1 flex flex-col bg-muted/30 relative">
        {page.publicPath ? (
          <>
            <div className="h-12 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-center gap-2 px-4 sticky top-0 z-10">
              <div className="flex items-center bg-muted/50 p-1 rounded-md border border-border/50">
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-1.5 rounded-sm transition-colors ${
                    previewMode === 'desktop'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                  title="Desktop preview"
                >
                  <Monitor size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('tablet')}
                  className={`p-1.5 rounded-sm transition-colors ${
                    previewMode === 'tablet'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                  title="Tablet preview"
                >
                  <Tablet size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-1.5 rounded-sm transition-colors ${
                    previewMode === 'mobile'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                  title="Mobile preview"
                >
                  <Smartphone size={14} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden flex items-center justify-center p-4 bg-[url('/checkered.svg')] bg-[size:16px_16px] opacity-90">
              <div
                className={`bg-background shadow-2xl border border-border overflow-hidden transition-all duration-300 ease-in-out flex flex-col h-full rounded-xl ${
                  previewMode === 'mobile'
                    ? 'w-[375px]'
                    : previewMode === 'tablet'
                    ? 'w-[768px]'
                    : 'w-full max-w-6xl'
                }`}
              >
                <iframe
                  ref={iframeRef}
                  src={page.publicPath}
                  className="w-full h-full bg-background border-0"
                  title="Live Preview"
                  onLoad={(e) => {
                    // Send initial state on load
                    const frame = e.target as HTMLIFrameElement
                    if (frame.contentWindow) {
                      frame.contentWindow.postMessage(
                        { type: 'CMS_PREVIEW_UPDATE', payload: content },
                        '*'
                      )
                    }
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm flex-col gap-2">
            <Monitor size={32} className="opacity-20" />
            <p>No public preview available for this page</p>
          </div>
        )}
      </div>
    </div>

      {showUnsavedDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md p-6 rounded-xl shadow-xl border border-border">
            <h2 className="text-xl font-semibold mb-2">Unsaved Changes</h2>
            <p className="text-muted-foreground text-sm mb-6">
              You have unsaved changes. Do you want to save them before leaving?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowUnsavedDialog(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
              >
                Continue Editing
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/content')}
                className="px-4 py-2 text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md transition-colors"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleSave()
                  router.push('/admin/content')
                }}
                className="px-4 py-2 text-sm font-medium bg-accent text-foreground hover:bg-accent-deep rounded-md transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function FieldRenderer({
  def,
  value,
  onChange,
}: {
  def: FieldDef
  value: unknown
  onChange: (v: unknown) => void
}) {
  if (def.type === 'menu_builder') {
    return (
      <Field label={def.label} hint={def.hint} required={def.required}>
        <MenuBuilder value={value} onChange={onChange} />
      </Field>
    )
  }

  if (def.type === 'blocks') {
    return (
      <Field label={def.label} hint={def.hint} required={def.required}>
        <BlockEditor
          availableBlocks={def.availableBlocks || []}
          value={(value as { id: string; type: string; props: Record<string, unknown> }[]) || []}
          onChange={onChange}
        />
      </Field>
    )
  }

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
    const items = (Array.isArray(value) ? value : []) as Record<string, unknown>[]
    function update(i: number, key: string, v: unknown) {
      const next = [...items]
      next[i] = { ...next[i], [key]: v }
      onChange(next)
    }
    function add() {
      const blank: Record<string, unknown> = {}
      def.itemFields!.forEach((f) => (blank[f.field] = f.type === 'repeater' ? [] : ''))
      onChange([...items, blank])
    }
    function remove(i: number) {
      onChange(items.filter((_, idx) => idx !== i))
    }

    return (
      <Field label={def.label} hint={def.hint} required={def.required}>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="bg-sage-soft/40 rounded-lg p-3 flex items-start gap-3 border border-border/50">
              <div className="flex-1 flex flex-col gap-3">
                {def.itemFields!.map((f) => (
                  <div key={f.field} className="w-full">
                    <FieldRenderer
                      def={f}
                      value={item[f.field]}
                      onChange={(v) => update(i, f.field, v)}
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
