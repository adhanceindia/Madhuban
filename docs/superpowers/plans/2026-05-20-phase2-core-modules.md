# Phase 2: Core Operations — Rooms, Bookings, Front Desk, Calendar

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the four most-used admin modules: Rooms (CRUD), Bookings (TanStack Table with filters + create + detail), Calendar (rooms × dates grid, signature view), and Front Desk (today's arrivals/departures + walk-ins + check-in/out).

**Architecture:** Each module = an `app/(admin)/admin/<module>/` route + API routes for mutations + components under `components/admin/<module>/` + Drizzle queries in `db/queries/<module>.ts`. All mutations write to `audit_log`. All UI uses the Lodgify design tokens (lime accent, sage backgrounds, status pill badges) established in Phase 1.5.

**Tech Stack:** Next.js 15, Drizzle ORM, TanStack Table v8, shadcn/ui (Dialog, Select, Input, Button), Recharts, lucide-react icons.

---

## Design Tokens (from Phase 1.5)

| Token | Use |
|---|---|
| `bg-accent` (#d6ed5e) | Primary CTAs, active states, status "checked-in" |
| `bg-sage-soft` (#eef4e1) | Surface tints, row hover, icon backgrounds |
| `bg-card` (#ffffff) | Cards on the sage-cream background |
| `bg-background` (#f5f7ed) | Page background |
| `text-foreground` (#1a1f12) | Primary text |
| `text-muted-foreground` (#6b7355) | Labels, captions |
| `font-admin` | Plus Jakarta Sans for UI |
| `font-admin-mono` | JetBrains Mono for numbers |
| `border-border` (#e5e9d8) | Subtle separators |
| `StatusBadge` | Reusable pill with auto-color mapping |

---

## Task 1: Rooms Module (CRUD)

**Goal:** Admin can list all rooms (active + inactive), create a new room, edit an existing room, toggle active state, delete a room.

**Files:**
- Create: `app/(admin)/admin/rooms/page.tsx`, `app/(admin)/admin/rooms/[id]/page.tsx`, `app/(admin)/admin/rooms/new/page.tsx`
- Create: `app/api/admin/rooms/route.ts`, `app/api/admin/rooms/[id]/route.ts`
- Create: `db/queries/rooms-admin.ts`
- Create: `components/admin/rooms/RoomsList.tsx`, `components/admin/rooms/RoomForm.tsx`, `components/admin/rooms/RoomCard.tsx`

- [ ] **Step 1: Create db/queries/rooms-admin.ts**

```typescript
import { getDb } from '@/db/client'
import { rooms } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import type { NewRoom, Room } from '@/db/schema/rooms'

export async function listAllRooms(): Promise<Room[]> {
  const db = getDb()
  return db.select().from(rooms).orderBy(desc(rooms.is_active), rooms.price_per_night)
}

export async function getRoomById(id: number): Promise<Room | null> {
  const db = getDb()
  const [room] = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1)
  return room || null
}

export async function createRoom(data: NewRoom): Promise<Room> {
  const db = getDb()
  const [created] = await db.insert(rooms).values(data).returning()
  return created
}

export async function updateRoom(id: number, data: Partial<NewRoom>): Promise<Room | null> {
  const db = getDb()
  const [updated] = await db
    .update(rooms)
    .set({ ...data, updated_at: new Date() })
    .where(eq(rooms.id, id))
    .returning()
  return updated || null
}

export async function deleteRoom(id: number): Promise<boolean> {
  const db = getDb()
  const result = await db.delete(rooms).where(eq(rooms.id, id)).returning({ id: rooms.id })
  return result.length > 0
}
```

- [ ] **Step 2: Create app/api/admin/rooms/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession, canAccess } from '@/lib/auth'
import { listAllRooms, createRoom } from '@/db/queries/rooms-admin'
import { logAudit } from '@/lib/audit'

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers and dashes only'),
  type: z.enum(['standard', 'deluxe', 'suite']),
  price_per_night: z.number().int().positive(),
  capacity: z.number().int().positive().default(2),
  bed_type: z.string().optional(),
  room_size: z.string().optional(),
  description: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
})

export async function GET() {
  const session = await getSession()
  if (!session || !canAccess(session.role, 'rooms')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const rooms = await listAllRooms()
  return NextResponse.json({ rooms })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || !canAccess(session.role, 'rooms')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid input' },
      { status: 400 }
    )
  }

  const room = await createRoom(parsed.data)

  await logAudit({
    user_id: session.id,
    action: 'room.created',
    entity_type: 'room',
    entity_id: room.id,
    new_value: parsed.data,
  })

  return NextResponse.json({ room })
}
```

- [ ] **Step 3: Create app/api/admin/rooms/[id]/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession, canAccess } from '@/lib/auth'
import { getRoomById, updateRoom, deleteRoom } from '@/db/queries/rooms-admin'
import { logAudit } from '@/lib/audit'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  type: z.enum(['standard', 'deluxe', 'suite']).optional(),
  price_per_night: z.number().int().positive().optional(),
  capacity: z.number().int().positive().optional(),
  bed_type: z.string().nullable().optional(),
  room_size: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
})

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session || !canAccess(session.role, 'rooms')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const room = await getRoomById(parseInt(id))
  if (!room) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ room })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session || !canAccess(session.role, 'rooms')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const roomId = parseInt(id)

  const existing = await getRoomById(roomId)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid input' },
      { status: 400 }
    )
  }

  const updated = await updateRoom(roomId, parsed.data)

  await logAudit({
    user_id: session.id,
    action: 'room.updated',
    entity_type: 'room',
    entity_id: roomId,
    old_value: existing as unknown as Record<string, unknown>,
    new_value: parsed.data,
  })

  return NextResponse.json({ room: updated })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session || !canAccess(session.role, 'rooms')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const roomId = parseInt(id)

  const existing = await getRoomById(roomId)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const ok = await deleteRoom(roomId)
  if (!ok) return NextResponse.json({ error: 'Delete failed' }, { status: 500 })

  await logAudit({
    user_id: session.id,
    action: 'room.deleted',
    entity_type: 'room',
    entity_id: roomId,
    old_value: existing as unknown as Record<string, unknown>,
  })

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Create components/admin/rooms/RoomCard.tsx (Lodgify-style list card with thumbnail)**

```tsx
'use client'

import Link from 'next/link'
import { BedDouble, Users, Maximize2 } from 'lucide-react'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import type { Room } from '@/db/schema/rooms'

function formatPrice(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

export function RoomCard({ room }: { room: Room }) {
  const thumbnail = (room.images as string[])?.[0]

  return (
    <Link
      href={`/admin/rooms/${room.id}`}
      className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-accent-deep/40 hover:shadow-[0_2px_8px_rgba(45,55,30,0.06)] transition-all no-underline font-admin"
    >
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-sage-soft flex-shrink-0">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnail} alt={room.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sage-deep/40">
            <BedDouble size={28} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="text-[14px] font-semibold text-foreground">{room.name}</div>
            <div className="text-[11px] text-muted-foreground capitalize mt-0.5">{room.type}</div>
          </div>
          <StatusBadge value={room.is_active ? 'available' : 'blocked'} />
        </div>
        <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users size={11} /> {room.capacity} guests
          </span>
          {room.bed_type && (
            <span className="inline-flex items-center gap-1">
              <BedDouble size={11} /> {room.bed_type}
            </span>
          )}
          {room.room_size && (
            <span className="inline-flex items-center gap-1">
              <Maximize2 size={11} /> {room.room_size}
            </span>
          )}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <div className="text-[18px] font-bold text-foreground font-admin-mono leading-none">
          {formatPrice(room.price_per_night)}
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">per night</div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 5: Create components/admin/rooms/RoomsList.tsx**

```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, BedDouble } from 'lucide-react'
import { RoomCard } from './RoomCard'
import { EmptyState } from '@/components/admin/shared/empty-state'
import type { Room } from '@/db/schema/rooms'

export function RoomsList() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    fetch('/api/admin/rooms')
      .then((r) => r.json())
      .then((d) => {
        setRooms(d.rooms || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = rooms.filter((r) => {
    if (filter === 'active') return r.is_active
    if (filter === 'inactive') return !r.is_active
    return true
  })

  return (
    <div className="font-admin max-w-[1200px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-foreground tracking-tight">Rooms</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {rooms.length} total · {rooms.filter((r) => r.is_active).length} active
          </p>
        </div>
        <Link
          href="/admin/rooms/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg no-underline transition-colors"
        >
          <Plus size={16} /> Add Room
        </Link>
      </div>

      <div className="flex gap-1 mb-4 bg-card rounded-lg p-1 border border-border w-fit">
        {(['all', 'active', 'inactive'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 text-[12px] font-semibold rounded-md transition-colors capitalize ${
              filter === f
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[100px] bg-card rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl p-8">
          <EmptyState
            icon={<BedDouble size={36} />}
            title="No rooms yet"
            description="Add your first room to start accepting bookings."
            action={{ label: 'Add Room', href: '/admin/rooms/new' }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => <RoomCard key={r.id} room={r} />)}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Create components/admin/rooms/RoomForm.tsx (shared between new and edit)**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Trash2 } from 'lucide-react'
import type { Room } from '@/db/schema/rooms'
import toast from 'react-hot-toast'

type RoomFormData = {
  name: string
  slug: string
  type: 'standard' | 'deluxe' | 'suite'
  price_per_night: number
  capacity: number
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

  const [form, setForm] = useState<RoomFormData>({
    name: room?.name || '',
    slug: room?.slug || '',
    type: room?.type || 'standard',
    price_per_night: room?.price_per_night || 0,
    capacity: room?.capacity || 2,
    bed_type: room?.bed_type || '',
    room_size: room?.room_size || '',
    description: room?.description || '',
    amenities: (room?.amenities as string[]) || [],
    images: (room?.images as string[]) || [],
    is_active: room?.is_active ?? true,
  })

  const [amenityInput, setAmenityInput] = useState('')
  const [imageInput, setImageInput] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const url = isEdit ? `/api/admin/rooms/${room.id}` : '/api/admin/rooms'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
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
    if (!isEdit || !confirm(`Delete "${room!.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/rooms/${room!.id}`, { method: 'DELETE' })
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
    }
  }

  function addAmenity() {
    const v = amenityInput.trim()
    if (!v) return
    setForm((f) => ({ ...f, amenities: [...f.amenities, v] }))
    setAmenityInput('')
  }

  function removeAmenity(i: number) {
    setForm((f) => ({ ...f, amenities: f.amenities.filter((_, idx) => idx !== i) }))
  }

  function addImage() {
    const v = imageInput.trim()
    if (!v) return
    setForm((f) => ({ ...f, images: [...f.images, v] }))
    setImageInput('')
  }

  function removeImage(i: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))
  }

  return (
    <form onSubmit={handleSubmit} className="font-admin max-w-[800px] space-y-6">
      <div className="bg-card rounded-2xl p-6 space-y-4">
        <h2 className="text-[14px] font-semibold text-foreground">Basic details</h2>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Name">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Slug (URL)">
            <input
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              pattern="^[a-z0-9-]+$"
              placeholder="deluxe-garden-room"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Type">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as 'standard' | 'deluxe' | 'suite' })}
              className={inputClass}
            >
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
              <option value="suite">Suite</option>
            </select>
          </Field>
          <Field label="Price / night (₹)">
            <input
              required
              type="number"
              min={0}
              value={form.price_per_night}
              onChange={(e) => setForm({ ...form, price_per_night: parseInt(e.target.value) || 0 })}
              className={inputClass}
            />
          </Field>
          <Field label="Capacity">
            <input
              required
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 1 })}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Bed type">
            <input
              value={form.bed_type}
              onChange={(e) => setForm({ ...form, bed_type: e.target.value })}
              placeholder="King bed"
              className={inputClass}
            />
          </Field>
          <Field label="Room size">
            <input
              value={form.room_size}
              onChange={(e) => setForm({ ...form, room_size: e.target.value })}
              placeholder="350 sq ft"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className={inputClass}
          />
        </Field>
      </div>

      {/* Amenities */}
      <div className="bg-card rounded-2xl p-6">
        <h2 className="text-[14px] font-semibold text-foreground mb-3">Amenities</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {form.amenities.map((a, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sage-soft text-foreground rounded-md text-[12px]"
            >
              {a}
              <button type="button" onClick={() => removeAmenity(i)} className="text-muted-foreground hover:text-destructive">
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={amenityInput}
            onChange={(e) => setAmenityInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAmenity() } }}
            placeholder="WiFi, AC, Garden view..."
            className={inputClass + ' flex-1'}
          />
          <button type="button" onClick={addAmenity} className={btnSecondary}>
            Add
          </button>
        </div>
      </div>

      {/* Images */}
      <div className="bg-card rounded-2xl p-6">
        <h2 className="text-[14px] font-semibold text-foreground mb-3">Images</h2>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {form.images.map((img, i) => (
            <div key={i} className="relative group rounded-lg overflow-hidden bg-sage-soft aspect-video">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-foreground/80 text-white rounded-md w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage() } }}
            placeholder="https://..."
            className={inputClass + ' flex-1'}
          />
          <button type="button" onClick={addImage} className={btnSecondary}>
            Add URL
          </button>
        </div>
      </div>

      {/* Active toggle */}
      <div className="bg-card rounded-2xl p-6 flex items-center justify-between">
        <div>
          <div className="text-[14px] font-semibold text-foreground">Active</div>
          <div className="text-[12px] text-muted-foreground mt-0.5">
            Inactive rooms are hidden from the website and unavailable for booking.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setForm({ ...form, is_active: !form.is_active })}
          className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? 'bg-accent-deep' : 'bg-border'}`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              form.is_active ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        {isEdit ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 size={14} /> Delete
          </button>
        ) : (
          <div />
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg transition-colors disabled:opacity-50"
        >
          <Save size={14} /> {saving ? 'Saving...' : 'Save room'}
        </button>
      </div>
    </form>
  )
}

const inputClass =
  'w-full px-3 py-2 text-[13px] bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-deep/30 focus:border-accent-deep text-foreground placeholder:text-muted-foreground/60'

const btnSecondary =
  'px-3.5 py-2 text-[12px] font-semibold bg-sage-soft hover:bg-sage text-foreground rounded-lg transition-colors'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </span>
      {children}
    </label>
  )
}
```

- [ ] **Step 7: Create the route pages**

`app/(admin)/admin/rooms/page.tsx`:
```tsx
import { RoomsList } from '@/components/admin/rooms/RoomsList'

export default function RoomsPage() {
  return <RoomsList />
}
```

`app/(admin)/admin/rooms/new/page.tsx`:
```tsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { RoomForm } from '@/components/admin/rooms/RoomForm'

export default function NewRoomPage() {
  return (
    <div className="font-admin">
      <Link href="/admin/rooms" className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground mb-3 no-underline">
        <ArrowLeft size={14} /> Back to rooms
      </Link>
      <h1 className="text-[24px] font-bold text-foreground tracking-tight mb-6">New room</h1>
      <RoomForm />
    </div>
  )
}
```

`app/(admin)/admin/rooms/[id]/page.tsx`:
```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getRoomById } from '@/db/queries/rooms-admin'
import { RoomForm } from '@/components/admin/rooms/RoomForm'

export default async function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = await getRoomById(parseInt(id))
  if (!room) notFound()

  return (
    <div className="font-admin">
      <Link href="/admin/rooms" className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground mb-3 no-underline">
        <ArrowLeft size={14} /> Back to rooms
      </Link>
      <h1 className="text-[24px] font-bold text-foreground tracking-tight mb-6">Edit {room.name}</h1>
      <RoomForm room={room} />
    </div>
  )
}
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(admin): rooms CRUD module

List, create, edit, delete rooms with image + amenity management.
RBAC-gated to super_admin and resort_manager. All mutations log
to audit_log."
```

---

## Task 2: Bookings Module (TanStack Table)

**Goal:** Admin can list all bookings with filters (status, payment status, source, date range), search by guest name, sort columns, paginate, click into detail view, change status inline, create new booking manually.

**Files:**
- Create: `app/(admin)/admin/bookings/page.tsx`, `app/(admin)/admin/bookings/[id]/page.tsx`, `app/(admin)/admin/bookings/new/page.tsx`
- Create: `app/api/admin/bookings/route.ts`, `app/api/admin/bookings/[id]/route.ts`
- Create: `db/queries/bookings-admin.ts`
- Create: `components/admin/bookings/BookingsTable.tsx`, `components/admin/bookings/BookingDetail.tsx`, `components/admin/bookings/BookingForm.tsx`, `components/admin/bookings/FilterBar.tsx`

- [ ] **Step 1: Create db/queries/bookings-admin.ts**

```typescript
import { getDb } from '@/db/client'
import { bookings, rooms } from '@/db/schema'
import { eq, and, desc, gte, lte, sql, or, ilike, inArray } from 'drizzle-orm'
import type { NewBooking } from '@/db/schema/bookings'

type ListFilters = {
  status?: string
  payment_status?: string
  source?: string
  room_id?: number
  start_date?: string
  end_date?: string
  search?: string
}

export async function listBookings(filters: ListFilters = {}) {
  const db = getDb()
  const conditions = []

  if (filters.status) conditions.push(eq(bookings.status, filters.status as 'confirmed' | 'pending' | 'cancelled'))
  if (filters.payment_status) conditions.push(eq(bookings.payment_status, filters.payment_status as 'pending' | 'paid' | 'failed' | 'refunded'))
  if (filters.source) conditions.push(eq(bookings.source, filters.source as 'website' | 'booking_com' | 'mmt' | 'manual'))
  if (filters.room_id) conditions.push(eq(bookings.room_id, filters.room_id))
  if (filters.start_date) conditions.push(gte(bookings.check_in, filters.start_date))
  if (filters.end_date) conditions.push(lte(bookings.check_in, filters.end_date))
  if (filters.search) {
    const q = `%${filters.search}%`
    conditions.push(or(ilike(bookings.guest_name, q), ilike(bookings.guest_email, q), ilike(bookings.guest_phone, q))!)
  }

  const rows = await db
    .select({
      booking: bookings,
      room_name: rooms.name,
    })
    .from(bookings)
    .leftJoin(rooms, eq(bookings.room_id, rooms.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(bookings.created_at))
    .limit(500)

  return rows.map((r) => ({
    ...r.booking,
    room_name: r.room_name || 'Unknown',
  }))
}

export async function getBookingDetail(id: number) {
  const db = getDb()
  const [row] = await db
    .select({
      booking: bookings,
      room_name: rooms.name,
      room_type: rooms.type,
    })
    .from(bookings)
    .leftJoin(rooms, eq(bookings.room_id, rooms.id))
    .where(eq(bookings.id, id))
    .limit(1)

  if (!row) return null
  return {
    ...row.booking,
    room_name: row.room_name || 'Unknown',
    room_type: row.room_type || 'standard',
  }
}

export async function createBookingAdmin(data: NewBooking) {
  const db = getDb()
  const [created] = await db.insert(bookings).values(data).returning()
  return created
}

export async function updateBooking(id: number, data: Partial<NewBooking>) {
  const db = getDb()
  const [updated] = await db
    .update(bookings)
    .set({ ...data, updated_at: new Date() })
    .where(eq(bookings.id, id))
    .returning()
  return updated || null
}

export async function cancelBooking(id: number) {
  return updateBooking(id, { status: 'cancelled' })
}
```

- [ ] **Step 2: Create app/api/admin/bookings/route.ts and app/api/admin/bookings/[id]/route.ts**

Both routes follow same pattern as Rooms — GET (list/detail), POST (create), PATCH (update status/details), audit log all mutations. Wire `canAccess(session.role, 'bookings')`.

(Full code follows the Rooms pattern — see Task 1 Step 2 + 3.)

- [ ] **Step 3: Create components/admin/bookings/FilterBar.tsx**

Lodgify-style chip filters (status dropdown, payment dropdown, source dropdown, date range chip with calendar icon, search input). Each is a styled button that opens a popover or native select.

```tsx
'use client'

import { Search, CalendarRange } from 'lucide-react'

type Filters = {
  status: string
  payment_status: string
  source: string
  start_date: string
  end_date: string
  search: string
}

export function FilterBar({ filters, onChange }: {
  filters: Filters
  onChange: (f: Filters) => void
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap mb-4 font-admin">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-[280px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search guest name, email, phone..."
          className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-deep/30 focus:border-accent-deep"
        />
      </div>

      {/* Status filter */}
      <FilterSelect
        label="Status"
        value={filters.status}
        onChange={(v) => onChange({ ...filters, status: v })}
        options={[
          { value: '', label: 'All status' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'pending', label: 'Pending' },
          { value: 'cancelled', label: 'Cancelled' },
        ]}
      />

      {/* Payment filter */}
      <FilterSelect
        label="Payment"
        value={filters.payment_status}
        onChange={(v) => onChange({ ...filters, payment_status: v })}
        options={[
          { value: '', label: 'All payments' },
          { value: 'paid', label: 'Paid' },
          { value: 'pending', label: 'Pending' },
          { value: 'failed', label: 'Failed' },
          { value: 'refunded', label: 'Refunded' },
        ]}
      />

      {/* Source filter */}
      <FilterSelect
        label="Source"
        value={filters.source}
        onChange={(v) => onChange({ ...filters, source: v })}
        options={[
          { value: '', label: 'All sources' },
          { value: 'website', label: 'Website' },
          { value: 'booking_com', label: 'Booking.com' },
          { value: 'mmt', label: 'MakeMyTrip' },
          { value: 'manual', label: 'Manual' },
        ]}
      />

      {/* Date range */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent rounded-lg text-[12px] font-semibold text-foreground">
        <CalendarRange size={14} />
        <input
          type="date"
          value={filters.start_date}
          onChange={(e) => onChange({ ...filters, start_date: e.target.value })}
          className="bg-transparent outline-none w-[100px]"
        />
        <span className="text-foreground/60">→</span>
        <input
          type="date"
          value={filters.end_date}
          onChange={(e) => onChange({ ...filters, end_date: e.target.value })}
          className="bg-transparent outline-none w-[100px]"
        />
      </div>
    </div>
  )
}

function FilterSelect({ label, value, onChange, options }: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-1.5 text-[12px] font-medium bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-deep/30"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
```

- [ ] **Step 4: Create components/admin/bookings/BookingsTable.tsx**

```tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronLeft, ChevronRight, Plus, Download } from 'lucide-react'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { FilterBar } from './FilterBar'

type BookingRow = {
  id: number
  guest_name: string
  guest_email: string
  guest_phone: string
  room_id: number
  room_name: string
  check_in: string
  check_out: string
  total_amount: number | null
  status: string
  payment_status: string
  source: string
  created_at: string | Date
}

function formatDate(s: string): string {
  if (!s) return '—'
  return new Date(s + (s.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: '2-digit',
  })
}

function formatCurrency(n: number | null): string {
  if (!n) return '—'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

export function BookingsTable() {
  const [filters, setFilters] = useState({
    status: '', payment_status: '', source: '', start_date: '', end_date: '', search: '',
  })
  const [rows, setRows] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])

  // Refetch on filter change (debounced for search)
  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
      fetch('/api/admin/bookings?' + params)
        .then((r) => r.json())
        .then((d) => setRows(d.bookings || []))
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(t)
  }, [filters])

  const columns: ColumnDef<BookingRow>[] = useMemo(() => [
    {
      accessorKey: 'guest_name',
      header: 'Guest',
      cell: ({ row }) => (
        <Link href={`/admin/bookings/${row.original.id}`} className="text-foreground font-medium no-underline hover:text-sage-deep">
          {row.original.guest_name}
        </Link>
      ),
    },
    { accessorKey: 'room_name', header: 'Room' },
    { accessorKey: 'check_in', header: 'Check-in', cell: ({ getValue }) => formatDate(getValue() as string) },
    { accessorKey: 'check_out', header: 'Check-out', cell: ({ getValue }) => formatDate(getValue() as string) },
    {
      accessorKey: 'total_amount',
      header: 'Amount',
      cell: ({ getValue }) => (
        <span className="font-semibold font-admin-mono">{formatCurrency(getValue() as number | null)}</span>
      ),
    },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusBadge value={getValue() as string} /> },
    { accessorKey: 'payment_status', header: 'Payment', cell: ({ getValue }) => <StatusBadge value={getValue() as string} /> },
    { accessorKey: 'source', header: 'Source', cell: ({ getValue }) => <StatusBadge value={getValue() as string} /> },
  ], [])

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  function exportCsv() {
    const headers = ['ID', 'Guest', 'Email', 'Phone', 'Room', 'Check-in', 'Check-out', 'Amount', 'Status', 'Payment', 'Source']
    const csvRows = [headers.join(',')]
    rows.forEach((r) => {
      csvRows.push([
        r.id, r.guest_name, r.guest_email, r.guest_phone, r.room_name,
        r.check_in, r.check_out, r.total_amount || 0, r.status, r.payment_status, r.source,
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    })
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="font-admin max-w-[1400px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-foreground tracking-tight">Bookings</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {rows.length} {rows.length === 1 ? 'reservation' : 'reservations'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold bg-card border border-border text-foreground hover:bg-sage-soft rounded-lg transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
          <Link
            href="/admin/bookings/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg no-underline transition-colors"
          >
            <Plus size={16} /> New Booking
          </Link>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-5 shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
        <FilterBar filters={filters} onChange={setFilters} />

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-border">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="text-left px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground"
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <ArrowUpDown size={10} className="text-muted-foreground/40" />
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length} className="text-center py-10 text-muted-foreground">Loading...</td></tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr><td colSpan={columns.length} className="text-center py-10 text-muted-foreground">No bookings match your filters.</td></tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/50 hover:bg-sage-soft/40 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-3 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-[12px] text-muted-foreground">
          <div>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-md hover:bg-sage-soft disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-md hover:bg-sage-soft disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Build BookingDetail component + page**

Two-column layout: left = guest info + dates + payment summary; right = status actions (Confirm / Cancel buttons), notes textarea, audit history. On status change, PATCH the booking and log to audit.

- [ ] **Step 6: Build BookingForm + new booking page**

Form fields: room selector (dropdown of active rooms), guest name/phone/email, date range picker, guest count, payment method (online/at_reception), total auto-calculated. Same lime-button save pattern as RoomForm.

- [ ] **Step 7: Wire route pages and commit**

```bash
git add -A
git commit -m "feat(admin): bookings module with TanStack Table, filters, CSV export

Full CRUD with status transitions, RBAC-gated, audit-logged.
Table supports sorting, filtering, search, pagination, and CSV
export of filtered set."
```

---

## Task 3: Front Desk Module

**Goal:** Operator-focused view of today: arrivals (with check-in button), departures (with check-out button), in-house guests, walk-in booking quick form, room status board.

**Files:**
- Create: `app/(admin)/admin/front-desk/page.tsx`
- Update: `app/api/front-desk/route.ts` (already exists from Phase 1, extend with check-in/out actions)
- Create: `app/api/front-desk/check-in/route.ts`, `app/api/front-desk/check-out/route.ts`, `app/api/front-desk/walk-in/route.ts`
- Create: `components/admin/front-desk/FrontDeskBoard.tsx`, `components/admin/front-desk/ArrivalsList.tsx`, `components/admin/front-desk/DeparturesList.tsx`, `components/admin/front-desk/WalkInForm.tsx`

- [ ] **Step 1: Create `app/api/front-desk/check-in/route.ts`**

POST `{ booking_id }`. Auth + canAccess('front-desk'). Updates booking.status to 'confirmed' if pending, marks check_in_actual_time (will need DB column add — defer), logs audit. Returns updated booking.

- [ ] **Step 2: Create `app/api/front-desk/check-out/route.ts`**

POST `{ booking_id }`. Similar pattern. Marks check_out_actual_time. Logs audit.

- [ ] **Step 3: Create `app/api/front-desk/walk-in/route.ts`**

POST with guest details + room_id + dates + payment_method='at_reception'. Creates booking with status='confirmed', source='manual'. Logs audit. Same availability check pattern as `/api/bookings`.

- [ ] **Step 4: ArrivalsList component**

Card-style list of today's expected check-ins. Each has: guest name + photo placeholder, room name + number, "Pending" or "Confirmed" badge, "Check In" lime button on the right. Filter pills above: All / Pending / Checked-In.

- [ ] **Step 5: DeparturesList component**

Similar — today's expected check-outs, "Check Out" button per row, balance due indicator if payment_status !== 'paid'.

- [ ] **Step 6: WalkInForm component**

Compact form in a sidebar/panel: phone-based search (auto-fill if matches existing guest), room dropdown, dates, guest count, payment method. Submit creates booking.

- [ ] **Step 7: FrontDeskBoard root layout**

Two-column: left = ArrivalsList + DeparturesList stacked; right = WalkInForm sticky panel. Date selector at top defaults to today, can navigate previous/next.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(admin): front desk operations - arrivals, departures, walk-ins, check-in/out

Today's operations view with single-click check-in/out, walk-in
quick form with availability validation, balance-due indicators.
All actions audit-logged."
```

---

## Task 4: Calendar Module (Signature Element)

**Goal:** Rooms × dates grid showing booking statuses as colored blocks. Click an empty cell to block/unblock, click a booking to view detail, drag-select to create a new booking.

**Files:**
- Create: `app/(admin)/admin/calendar/page.tsx`
- Create: `app/api/admin/calendar/route.ts`
- Create: `app/api/admin/blocked-dates/route.ts`, `app/api/admin/blocked-dates/[id]/route.ts`
- Create: `components/admin/calendar/CalendarGrid.tsx`, `components/admin/calendar/CalendarHeader.tsx`, `components/admin/calendar/BookingBlock.tsx`

- [ ] **Step 1: Create db/queries/calendar.ts**

```typescript
import { getDb } from '@/db/client'
import { rooms, bookings, blockedDates } from '@/db/schema'
import { eq, and, gte, lte, inArray, asc } from 'drizzle-orm'

export async function getCalendarData(start: string, end: string) {
  const db = getDb()

  const allRooms = await db.select().from(rooms).where(eq(rooms.is_active, true)).orderBy(asc(rooms.name))

  const overlappingBookings = await db
    .select()
    .from(bookings)
    .where(and(
      lte(bookings.check_in, end),
      gte(bookings.check_out, start),
      inArray(bookings.status, ['confirmed', 'pending']),
    ))
    .orderBy(asc(bookings.check_in))

  const blocked = await db
    .select()
    .from(blockedDates)
    .where(and(
      gte(blockedDates.date, start),
      lte(blockedDates.date, end),
    ))

  return { rooms: allRooms, bookings: overlappingBookings, blocked }
}
```

- [ ] **Step 2: Create app/api/admin/calendar/route.ts**

GET with `start` and `end` params. Auth + canAccess('calendar'). Returns above query.

- [ ] **Step 3: Create app/api/admin/blocked-dates/route.ts**

POST `{ room_id, date }` — manual block. Validates no existing booking on that date. Logs audit. Returns created entry.

- [ ] **Step 4: Create app/api/admin/blocked-dates/[id]/route.ts**

DELETE by id — only allows deletion of source='manual' (never iCal). Logs audit.

- [ ] **Step 5: CalendarHeader component**

Top bar with: month navigation arrows, current month label, view toggle (14-day / 30-day), filter by room type. All styled with lime accent on the active items.

- [ ] **Step 6: CalendarGrid component**

```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Room } from '@/db/schema/rooms'
import type { Booking } from '@/db/schema/bookings'
import type { BlockedDate } from '@/db/schema/blocked-dates'

type CalendarData = { rooms: Room[]; bookings: Booking[]; blocked: BlockedDate[] }

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  confirmed: { bg: '#d6ed5e', text: '#1a1f12', border: '#b8d04a' },
  pending: { bg: '#f7ebbc', text: '#5e4a0a', border: '#d4a017' },
  blocked_manual: { bg: '#eeeeee', text: '#5a5a5a', border: '#bbbbbb' },
  blocked_ical: { bg: '#e0e9ec', text: '#3a5a6a', border: '#a5bdca' },
}

export function CalendarGrid({ days }: { days: number }) {
  const [data, setData] = useState<CalendarData | null>(null)
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])

  useEffect(() => {
    const start = startDate
    const endDt = new Date(start + 'T00:00:00')
    endDt.setDate(endDt.getDate() + days - 1)
    const end = endDt.toISOString().split('T')[0]
    fetch(`/api/admin/calendar?start=${start}&end=${end}`)
      .then((r) => r.json())
      .then(setData)
  }, [startDate, days])

  if (!data) return <div className="bg-card rounded-2xl p-10 text-center text-muted-foreground">Loading calendar...</div>

  const dateColumns = Array.from({ length: days }, (_, i) => {
    const d = new Date(startDate + 'T00:00:00')
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  function findStatusForCell(roomId: number, date: string) {
    const booking = data!.bookings.find((b) => b.room_id === roomId && b.check_in <= date && b.check_out > date)
    if (booking) return { type: booking.status, booking }
    const block = data!.blocked.find((b) => b.room_id === roomId && b.date === date)
    if (block) return { type: block.source === 'ical' ? 'blocked_ical' : 'blocked_manual', block }
    return null
  }

  return (
    <div className="bg-card rounded-2xl p-5 overflow-x-auto font-admin">
      <div className="min-w-fit">
        <div className="grid" style={{ gridTemplateColumns: `200px repeat(${days}, minmax(36px, 1fr))` }}>
          {/* Header row */}
          <div className="sticky left-0 bg-card z-10 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
            Room
          </div>
          {dateColumns.map((d) => {
            const date = new Date(d + 'T00:00:00')
            const isToday = d === new Date().toISOString().split('T')[0]
            return (
              <div
                key={d}
                className={`px-1 py-2 text-center border-b border-border ${isToday ? 'bg-accent-soft' : ''}`}
              >
                <div className="text-[10px] text-muted-foreground/70">
                  {date.toLocaleDateString('en-IN', { weekday: 'short' })}
                </div>
                <div className="text-[12px] font-semibold text-foreground">{date.getDate()}</div>
              </div>
            )
          })}

          {/* Room rows */}
          {data.rooms.map((room) => (
            <RoomRow
              key={room.id}
              room={room}
              dateColumns={dateColumns}
              findStatus={(d) => findStatusForCell(room.id, d)}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 pl-1 text-[11px] text-muted-foreground">
          {Object.entries(STATUS_COLORS).map(([key, c]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: c.bg, border: `1px solid ${c.border}` }} />
              <span className="capitalize">{key.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RoomRow({ room, dateColumns, findStatus }: {
  room: Room
  dateColumns: string[]
  findStatus: (d: string) => { type: string; booking?: Booking; block?: BlockedDate } | null
}) {
  return (
    <>
      <div className="sticky left-0 bg-card z-10 px-3 py-2 text-[12px] font-medium text-foreground border-b border-border/50 flex items-center">
        {room.name}
      </div>
      {dateColumns.map((d) => {
        const status = findStatus(d)
        const colors = status ? STATUS_COLORS[status.type] : null
        return (
          <div key={d} className="border-b border-border/50 border-r border-border/30 p-0.5 min-h-[44px] relative">
            {colors && (
              <div
                title={status?.booking?.guest_name || 'Blocked'}
                className="absolute inset-0.5 rounded-md flex items-center px-1.5"
                style={{ background: colors.bg, borderLeft: `3px solid ${colors.border}` }}
              >
                {status?.booking && (
                  <Link
                    href={`/admin/bookings/${status.booking.id}`}
                    className="text-[10px] font-medium truncate no-underline"
                    style={{ color: colors.text }}
                  >
                    {status.booking.guest_name}
                  </Link>
                )}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
```

- [ ] **Step 7: Wire calendar page with view toggle (14d / 30d)**

`app/(admin)/admin/calendar/page.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarGrid } from '@/components/admin/calendar/CalendarGrid'

export default function CalendarPage() {
  const [days, setDays] = useState<14 | 30>(14)

  return (
    <div className="font-admin max-w-[1400px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-foreground tracking-tight">Calendar</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Room availability across all bookings and blocks</p>
        </div>
        <div className="flex gap-1 bg-card rounded-lg p-1 border border-border">
          {([14, 30] as const).map((n) => (
            <button
              key={n}
              onClick={() => setDays(n)}
              className={`px-3.5 py-1.5 text-[12px] font-semibold rounded-md transition-colors ${
                days === n ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {n} days
            </button>
          ))}
        </div>
      </div>

      <CalendarGrid days={days} />
    </div>
  )
}
```

- [ ] **Step 8: Add click-to-block and drag-to-create (advanced — separate sub-task)**

This is the optional polish. Defer if time is tight; the read-only calendar is already valuable.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(admin): calendar module — rooms x dates grid

Signature visual: status-colored blocks per room per day (confirmed
lime, pending mustard, blocked grey/blue based on source). Today
column highlighted. Click a booking to jump to detail."
```

---

## Verification (after Phase 2)

1. Log in to `/admin` as super_admin
2. Navigate to `/admin/rooms`, create 3 rooms with images + amenities
3. Navigate to `/admin/bookings`, click "New Booking", create one for each room
4. Navigate to `/admin/calendar`, confirm the bookings appear as lime blocks
5. Navigate to `/admin/front-desk`, see today's arrivals if any match today
6. Click "Check In" on a pending arrival, confirm status changes to 'confirmed'
7. Filter bookings by status='pending', confirm filter works
8. Export bookings CSV, confirm download starts
9. Run `npm run build` and verify no compilation errors
10. Check audit_log table — every mutation logged

## Files Modified Summary

```
app/(admin)/admin/
├── rooms/
│   ├── page.tsx (new)
│   ├── new/page.tsx (new)
│   └── [id]/page.tsx (new)
├── bookings/
│   ├── page.tsx (new)
│   ├── new/page.tsx (new)
│   └── [id]/page.tsx (new)
├── front-desk/
│   └── page.tsx (new)
└── calendar/
    └── page.tsx (new)

app/api/
├── admin/
│   ├── rooms/route.ts (new)
│   ├── rooms/[id]/route.ts (new)
│   ├── bookings/route.ts (new)
│   ├── bookings/[id]/route.ts (new)
│   ├── calendar/route.ts (new)
│   └── blocked-dates/route.ts (new)
│   └── blocked-dates/[id]/route.ts (new)
└── front-desk/
    ├── route.ts (extended)
    ├── check-in/route.ts (new)
    ├── check-out/route.ts (new)
    └── walk-in/route.ts (new)

db/queries/
├── rooms-admin.ts (new)
├── bookings-admin.ts (new)
└── calendar.ts (new)

components/admin/
├── rooms/ (RoomCard, RoomsList, RoomForm)
├── bookings/ (BookingsTable, BookingDetail, BookingForm, FilterBar)
├── front-desk/ (FrontDeskBoard, ArrivalsList, DeparturesList, WalkInForm)
└── calendar/ (CalendarGrid, CalendarHeader, BookingBlock)
```

Estimated: ~30 files, ~3000 LOC. After Phase 2, the resort can actually be operated from the admin panel for daily ops.
