'use client'

import { useEffect, useRef, useState } from 'react'
import { Image as ImageIcon, Upload, Trash2, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'

import { PageHeader } from '@/components/admin/shared/page-header'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { ConfirmDialog } from '@/components/admin/shared/confirm-dialog'
import { CATEGORY_LABELS } from '@/lib/schemas/gallery'
import type { GalleryItem } from '@/db/schema/gallery'

type Category = 'rooms' | 'wedding' | 'events' | 'pool' | 'restaurant'
const CATEGORIES: Category[] = ['rooms', 'wedding', 'events', 'pool', 'restaurant']

export function GalleryGrid() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<Category>('rooms')
  const [uploading, setUploading] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [reorderIndex, setReorderIndex] = useState<number | null>(null)
  const [editingCaption, setEditingCaption] = useState<{ id: number; value: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function refetch() {
    const res = await fetch(`/api/admin/gallery?category=${activeCategory}`)
    const data = await res.json()
    setItems(data.items || [])
  }

  useEffect(() => {
    setLoading(true)
    refetch().finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory])

  async function handleUpload(files: FileList) {
    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('folder', `gallery/${activeCategory}`)
        const res = await fetch('/api/admin/media/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok || !data.url) {
          toast.error(data.error || `Failed: ${file.name}`)
          continue
        }
        uploaded.push(data.url)
      }
      // Create gallery rows for each upload
      const startOrder = items.length
      for (let i = 0; i < uploaded.length; i++) {
        const isVideo = /\.(mp4|webm|mov)$/i.test(uploaded[i])
        await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            media_url: uploaded[i],
            media_type: isVideo ? 'video' : 'image',
            category: activeCategory,
            sort_order: startOrder + i,
          }),
        })
      }
      if (uploaded.length > 0) toast.success(`Added ${uploaded.length} item${uploaded.length > 1 ? 's' : ''}`)
      await refetch()
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/gallery/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error('Delete failed')
        return
      }
      toast.success('Removed')
      await refetch()
    } finally {
      setSubmitting(false)
      setDeleteId(null)
    }
  }

  async function saveCaption() {
    if (!editingCaption) return
    const res = await fetch(`/api/admin/gallery/${editingCaption.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ caption: editingCaption.value || null }),
    })
    if (!res.ok) {
      toast.error('Save failed')
      return
    }
    toast.success('Caption saved')
    setEditingCaption(null)
    refetch()
  }

  async function handleReorder(from: number, to: number) {
    if (from === to) return
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setItems(next)
    // Persist new sort_order
    const updates = next.map((item, idx) => ({ id: item.id, sort_order: idx }))
    await fetch('/api/admin/gallery/reorder', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ updates }),
    })
  }

  return (
    <div className="max-w-[1400px]">
      <PageHeader
        title="Gallery"
        subtitle={`${items.length} item${items.length === 1 ? '' : 's'} in ${CATEGORY_LABELS[activeCategory]}`}
        actions={
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg transition-colors disabled:opacity-50"
          >
            <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload'}
          </button>
        }
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
        className="hidden"
      />

      {/* Category chips */}
      <div className="flex gap-1 mb-5 bg-card rounded-lg p-1 border border-border w-fit flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActiveCategory(c)}
            className={`px-3.5 py-1.5 text-[12px] font-semibold rounded-md transition-colors ${
              activeCategory === c
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-video bg-sage-soft/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-card rounded-2xl py-10">
          <EmptyState
            icon={<ImageIcon size={36} />}
            title={`No photos in ${CATEGORY_LABELS[activeCategory]}`}
            description="Upload images or videos to display on the public gallery page."
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item, i) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => setReorderIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                if (reorderIndex !== null) handleReorder(reorderIndex, i)
                setReorderIndex(null)
              }}
              className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-accent-deep/40 transition-colors"
            >
              <div className="aspect-video bg-sage-soft">
                {item.media_type === 'video' ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video src={item.media_url} className="w-full h-full object-cover" muted />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.media_url} alt={item.caption || ''} className="w-full h-full object-cover" />
                )}
              </div>

              {/* Top-right actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setDeleteId(item.id)}
                  className="bg-foreground/80 text-white rounded-md w-7 h-7 flex items-center justify-center hover:bg-destructive transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Top-left drag handle */}
              <div className="absolute top-2 left-2 bg-foreground/80 text-white rounded-md w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                <GripVertical size={13} />
              </div>

              {/* Caption */}
              <div className="px-3 py-2">
                {editingCaption?.id === item.id ? (
                  <input
                    type="text"
                    value={editingCaption.value}
                    onChange={(e) => setEditingCaption({ ...editingCaption, value: e.target.value })}
                    onBlur={saveCaption}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveCaption()
                      if (e.key === 'Escape') setEditingCaption(null)
                    }}
                    autoFocus
                    className="w-full px-2 py-1 text-[12px] bg-sage-soft rounded-md outline-none focus:ring-2 focus:ring-accent-deep/30"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingCaption({ id: item.id, value: item.caption || '' })}
                    className="w-full text-left text-[12px] text-muted-foreground hover:text-foreground truncate"
                  >
                    {item.caption || <span className="italic text-muted-foreground/50">Add caption…</span>}
                  </button>
                )}
              </div>

              {item.media_type === 'video' && (
                <div className="absolute bottom-12 left-2 bg-foreground/80 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  VIDEO
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        destructive
        title="Remove this item?"
        message="It will no longer appear on the public gallery."
        confirmLabel="Remove"
        loading={submitting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
