'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Trash2, X, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

import { FormCard } from '@/components/admin/shared/form-card'
import { Field, FormRow, TextInput, Select } from '@/components/admin/shared/form-field'
import dynamic from 'next/dynamic'
const RichTextEditor = dynamic(() => import('@/components/admin/shared/rich-text-editor').then(mod => mod.RichTextEditor), { ssr: false, loading: () => <div className="h-[200px] w-full bg-card border border-border rounded-lg animate-pulse" /> })
import { Toggle } from '@/components/admin/shared/toggle'
import { ConfirmDialog } from '@/components/admin/shared/confirm-dialog'
import { ImageUploader } from '@/components/admin/shared/image-uploader'
import type { Room } from '@/db/schema/rooms'

type RoomFormData = {
  name: string
  slug: string
  type: 'standard' | 'deluxe' | 'suite'
  price_per_night: number
  capacity: number
  quantity: number
  extra_bed_price: number
  breakfast_included: boolean
  bed_type: string
  room_size: string
  description: string
  amenities: string[]
  images: string[]
  is_active: boolean
}

export function RoomForm({ room }: { room?: Room }) {
  const router = useRouter()
  const isEdit = !!room
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [amenityInput, setAmenityInput] = useState('')
  const [priceInput, setPriceInput] = useState(room ? String(room.price_per_night) : '')
  const [capacityInput, setCapacityInput] = useState(String(room?.capacity ?? 2))
  const [quantityInput, setQuantityInput] = useState(String(room?.quantity ?? 1))
  const [extraBedPriceInput, setExtraBedPriceInput] = useState(String(room?.extra_bed_price ?? 0))

  const [form, setForm] = useState<RoomFormData>({
    name: room?.name || '',
    slug: room?.slug || '',
    type: room?.type || 'standard',
    price_per_night: room?.price_per_night || 0,
    capacity: room?.capacity || 2,
    quantity: room?.quantity ?? 1,
    extra_bed_price: room?.extra_bed_price ?? 0,
    breakfast_included: room?.breakfast_included ?? false,
    bed_type: room?.bed_type || '',
    room_size: room?.room_size || '',
    description: room?.description || '',
    amenities: (room?.amenities as string[]) || [],
    images: (room?.images as string[]) || [],
    is_active: room?.is_active ?? true,
  })

  function update<K extends keyof RoomFormData>(key: K, value: RoomFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function autoSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const url = isEdit ? `/api/admin/rooms/${room.id}` : '/api/admin/rooms'
      const method = isEdit ? 'PATCH' : 'POST'
      const payload = {
        ...form,
        bed_type: form.bed_type || null,
        room_size: form.room_size || null,
        description: form.description || null,
      }
      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Save failed')
        return
      }
      toast.success(isEdit ? 'Room updated' : 'Room created')
      router.push('/admin/rooms')
      router.refresh()
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!isEdit) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/rooms/${room.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Delete failed')
        return
      }
      toast.success('Room deleted')
      router.push('/admin/rooms')
      router.refresh()
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  function addAmenity() {
    const v = amenityInput.trim()
    if (!v || form.amenities.includes(v)) return
    update('amenities', [...form.amenities, v])
    setAmenityInput('')
  }

  function removeAmenity(i: number) {
    update('amenities', form.amenities.filter((_, idx) => idx !== i))
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[800px] space-y-5">
      <FormCard title="Basic details" description="Required information about the room.">
        <FormRow>
          <Field label="Name" required>
            <TextInput
              required
              value={form.name}
              onChange={(e) => {
                const name = e.target.value
                update('name', name)
                if (!isEdit && !form.slug) update('slug', autoSlug(name))
              }}
              placeholder="Garden Suite"
            />
          </Field>
          <Field label="URL slug" required hint="lowercase, dashes only">
            <TextInput
              required
              value={form.slug}
              onChange={(e) => update('slug', e.target.value)}
              pattern="^[a-z0-9-]+$"
              placeholder="garden-suite"
            />
          </Field>
        </FormRow>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Type" required>
            <Select value={form.type} onChange={(e) => update('type', e.target.value as RoomFormData['type'])}>
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
              <option value="suite">Suite</option>
            </Select>
          </Field>
          <Field label="Price / night (₹)" required>
            <TextInput
              required
              type="number"
              min={0}
              value={priceInput}
              onChange={(e) => {
                setPriceInput(e.target.value)
                if (!Number.isNaN(e.target.valueAsNumber)) {
                  update('price_per_night', e.target.valueAsNumber)
                }
              }}
            />
          </Field>
          <Field label="Capacity (guests)" required>
            <TextInput
              required
              type="number"
              min={1}
              value={capacityInput}
              onChange={(e) => {
                setCapacityInput(e.target.value)
                if (!Number.isNaN(e.target.valueAsNumber)) {
                  update('capacity', e.target.valueAsNumber)
                }
              }}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Inventory Quantity" required>
            <TextInput
              required
              type="number"
              min={1}
              value={quantityInput}
              onChange={(e) => {
                setQuantityInput(e.target.value)
                if (!Number.isNaN(e.target.valueAsNumber)) {
                  update('quantity', e.target.valueAsNumber)
                }
              }}
            />
          </Field>
          <Field label="Extra Bed Price (₹)" required>
            <TextInput
              required
              type="number"
              min={0}
              value={extraBedPriceInput}
              onChange={(e) => {
                setExtraBedPriceInput(e.target.value)
                if (!Number.isNaN(e.target.valueAsNumber)) {
                  update('extra_bed_price', e.target.valueAsNumber)
                }
              }}
            />
          </Field>
          <Field label="Breakfast Included">
            <div className="pt-2">
              <Toggle
                checked={form.breakfast_included}
                onChange={(v) => update('breakfast_included', v)}
                label=""
              />
            </div>
          </Field>
        </div>

        <FormRow>
          <Field label="Bed type">
            <TextInput
              value={form.bed_type}
              onChange={(e) => update('bed_type', e.target.value)}
              placeholder="King bed"
            />
          </Field>
          <Field label="Room size">
            <TextInput
              value={form.room_size}
              onChange={(e) => update('room_size', e.target.value)}
              placeholder="350 sq ft"
            />
          </Field>
        </FormRow>

        <Field label="Description">
          <RichTextEditor
            value={form.description}
            onChange={(html) => update('description', html)}
            placeholder="A spacious garden-facing suite with..."
          />
        </Field>
      </FormCard>

      <FormCard
        title="Amenities"
        description="Features highlighted on the public room page."
      >
        {form.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.amenities.map((a, i) => (
              <span
                key={`${a}-${i}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sage-soft text-foreground rounded-md text-[12px]"
              >
                {a}
                <button
                  type="button"
                  onClick={() => removeAmenity(i)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Remove ${a}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <TextInput
            value={amenityInput}
            onChange={(e) => setAmenityInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addAmenity()
              }
            }}
            placeholder="WiFi, AC, Garden view..."
            className="flex-1"
          />
          <button
            type="button"
            onClick={addAmenity}
            className="px-3.5 py-2 text-[12px] font-semibold bg-sage-soft hover:bg-sage text-foreground rounded-lg transition-colors inline-flex items-center gap-1"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </FormCard>

      <FormCard
        title="Photos"
        description="The first photo is shown as primary. Drag to reorder."
      >
        <ImageUploader
          value={form.images}
          onChange={(images) => update('images', images)}
          folder="rooms"
          maxImages={12}
        />
      </FormCard>

      <FormCard title="Visibility">
        <Toggle
          checked={form.is_active}
          onChange={(v) => update('is_active', v)}
          label="Active"
          description="Inactive rooms are hidden from the website and unavailable for booking."
        />
      </FormCard>

      <div className="flex items-center justify-between pt-2">
        {isEdit ? (
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 size={14} /> Delete room
          </button>
        ) : (
          <div />
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg transition-colors disabled:opacity-50"
        >
          <Save size={14} /> {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create room'}
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        destructive
        title={`Delete ${room?.name || 'room'}?`}
        message="This cannot be undone. The room and its listing on the website will be permanently removed."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </form>
  )
}
