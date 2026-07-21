'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Radio,
  AlertTriangle,
  Copy,
  ExternalLink,
  Save,
  RefreshCw,
  Plus,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { PageHeader } from '@/components/admin/shared/page-header'
import { FormCard } from '@/components/admin/shared/form-card'
import { Field, Select, TextInput } from '@/components/admin/shared/form-field'
import { formatRelativeTime, formatDateShort } from '@/lib/format'
import { SyncLogs } from './SyncLogs'
import {
  ICAL_SOURCES,
  ICAL_SOURCE_META,
  type IcalFeedConfig,
  type IcalSource,
} from '@/lib/ical/types'

type ChannelRoom = { id: number; name: string; slug: string }

type ChannelData = {
  feeds: IcalFeedConfig[]
  rooms: ChannelRoom[]
  blocked_counts: { manual: number; ical: number }
  ota_booking_count: number
  conflicts: {
    room_id: number
    date: string
    booking_id: number
    guest_name: string
  }[]
  last_sync: string | null
  counts: Record<IcalSource, number | null>
  recent_logs: Array<{
    id: number
    source: IcalSource
    feed_url: string
    room_id: number | null
    started_at: string
    finished_at: string | null
    status: 'success' | 'error' | 'partial'
    synced_count: number
    removed_count: number
    error: string | null
    triggered_by: 'cron' | 'manual'
  }>
}

export function ChannelManagerView() {
  const [data, setData] = useState<ChannelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [feeds, setFeeds] = useState<IcalFeedConfig[]>([])
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)

  function refetch() {
    return fetch('/api/admin/channel-manager')
      .then((r) => r.json())
      .then((d: ChannelData) => {
        setData(d)
        // Seed local repeater state with server-side feeds (clone to allow editing).
        setFeeds(d.feeds.length > 0 ? d.feeds.map((f) => ({ ...f })) : [])
      })
  }

  useEffect(() => {
    setLoading(true)
    refetch().finally(() => setLoading(false))
  }, [])

  async function saveFeeds() {
    // Basic client-side validation before round-tripping.
    for (const f of feeds) {
      if (!f.url || !/^https?:\/\//.test(f.url)) {
        toast.error(`Every feed needs a valid URL starting with http(s)://`)
        return
      }
      if (!f.source) {
        toast.error('Every feed needs a channel selected')
        return
      }
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/channel-manager/feeds', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ feeds }),
      })
      if (!res.ok) {
        const j = await res.json()
        toast.error(j.error || 'Save failed')
        return
      }
      toast.success('iCal feeds saved')
      refetch()
    } finally {
      setSaving(false)
    }
  }

  async function syncNow() {
    setSyncing(true)
    try {
      const res = await fetch('/api/admin/channel-manager/sync', {
        method: 'POST',
      })
      const j = await res.json()
      if (!res.ok) {
        toast.error(j.error || 'Sync failed')
        return
      }
      if (j.status === 'error') {
        toast.error('Sync completed with errors — see logs below')
      } else if (j.status === 'partial') {
        toast(
          `Synced — some feeds failed (${j.total_synced} added, ${j.total_removed} removed)`,
        )
      } else {
        toast.success(
          `Synced ${j.total_synced} dates (removed ${j.total_removed})`,
        )
      }
      refetch()
    } finally {
      setSyncing(false)
    }
  }

  function copyExportUrl() {
    const url = `${window.location.origin}/api/ical/export`
    navigator.clipboard.writeText(url)
    toast.success(
      'Export URL copied — append ?token=… before sharing with an OTA',
    )
  }

  // ---- feed repeater helpers ---------------------------------------------

  function addFeed() {
    setFeeds((prev) => [
      ...prev,
      {
        id: `feed_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        source: 'booking_com',
        url: '',
        roomId: null,
      },
    ])
  }

  function removeFeed(id: string) {
    setFeeds((prev) => prev.filter((f) => f.id !== id))
  }

  function patchFeed(id: string, patch: Partial<IcalFeedConfig>) {
    setFeeds((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  // Per-channel "connected" status — derived from saved feeds (server data),
  // not from local edits, so the card only flips after a Save + refetch.
  const connectedSources = useMemo(
    () =>
      new Set((data?.feeds ?? []).filter((f) => f.url).map((f) => f.source)),
    [data],
  )

  if (loading || !data) {
    return (
      <div>
        <PageHeader title="Channel Manager" subtitle="Loading..." />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[160px] animate-pulse rounded-2xl bg-card"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px]">
      <PageHeader
        title="Channel Manager"
        subtitle={
          data.last_sync
            ? `Last sync ${formatRelativeTime(data.last_sync)}`
            : 'No sync yet'
        }
        actions={
          <button
            type="button"
            onClick={syncNow}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[12px] font-semibold text-foreground transition-colors hover:bg-accent-deep disabled:opacity-50"
          >
            <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing…' : 'Sync now'}
          </button>
        }
      />

      {/* Channel status cards — one per OTA */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {ICAL_SOURCES.map((source) => (
          <ChannelCard
            key={source}
            name={ICAL_SOURCE_META[source].label}
            connected={connectedSources.has(source)}
            syncedCount={data.counts?.[source] ?? null}
            lastSync={data.last_sync}
          />
        ))}
      </div>

      {/* Conflicts */}
      {data.conflicts.length > 0 && (
        <div className="mb-5 rounded-2xl border border-status-cancelled/30 bg-status-cancelled-bg p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={20}
              className="mt-0.5 flex-shrink-0 text-status-cancelled"
            />
            <div className="flex-1">
              <h3 className="mb-2 text-[14px] font-semibold text-status-cancelled">
                {data.conflicts.length} double-booking conflict
                {data.conflicts.length > 1 ? 's' : ''}
              </h3>
              <p className="mb-3 text-[12px] text-status-cancelled/80">
                These rooms have both a direct booking and an OTA-imported block
                on the same date:
              </p>
              <div className="space-y-1">
                {data.conflicts.map((c, i) => (
                  <div key={i} className="text-[12px]">
                    <Link
                      href={`/admin/bookings/${c.booking_id}`}
                      className="font-medium text-foreground no-underline hover:text-sage-deep"
                    >
                      {c.guest_name}
                    </Link>{' '}
                    on {formatDateShort(c.date)} (room #{c.room_id})
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* iCal feeds repeater */}
      <FormCard
        title="iCal feeds"
        description="One row per OTA listing. Map each listing to a specific room, or leave on “All rooms” to block the whole property. We sync every 30 minutes."
      >
        {feeds.length === 0 && (
          <p className="text-[12px] italic text-muted-foreground">
            No feeds configured yet. Click “Add feed” to connect your first OTA
            listing.
          </p>
        )}

        {feeds.map((feed) => (
          <div
            key={feed.id}
            className="grid grid-cols-1 items-end gap-2 md:grid-cols-[140px_1fr_180px_36px]"
          >
            <Field label="Channel">
              <Select
                value={feed.source}
                onChange={(e) =>
                  patchFeed(feed.id, { source: e.target.value as IcalSource })
                }
              >
                {ICAL_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {ICAL_SOURCE_META[s].label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="iCal URL" hint={ICAL_SOURCE_META[feed.source]?.hint}>
              <TextInput
                type="url"
                value={feed.url}
                onChange={(e) => patchFeed(feed.id, { url: e.target.value })}
                placeholder="https://…"
              />
            </Field>

            <Field label="Applies to">
              <Select
                value={feed.roomId === null ? '' : String(feed.roomId)}
                onChange={(e) =>
                  patchFeed(feed.id, {
                    roomId:
                      e.target.value === '' ? null : Number(e.target.value),
                  })
                }
              >
                <option value="">All rooms</option>
                {data.rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </Field>

            <button
              type="button"
              onClick={() => removeFeed(feed.id)}
              title="Remove feed"
              className="mb-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-status-cancelled-bg hover:text-status-cancelled"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={addFeed}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-accent-deep transition-colors hover:bg-sage-soft"
          >
            <Plus size={13} /> Add feed
          </button>
          <button
            type="button"
            onClick={saveFeeds}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[12px] font-semibold text-foreground transition-colors hover:bg-accent-deep disabled:opacity-50"
          >
            <Save size={13} /> {saving ? 'Saving…' : 'Save feeds'}
          </button>
        </div>
      </FormCard>

      {/* Sync logs */}
      <div className="mt-5">
        <FormCard
          title="Sync history"
          description="Most recent 20 sync runs. A failed feed does not abort the whole run."
        >
          <SyncLogs logs={data.recent_logs} />
        </FormCard>
      </div>

      {/* Export URL */}
      <div className="mt-5">
        <FormCard
          title="Madhuban's iCal export"
          description="Paste this URL into each OTA's calendar import to push our bookings out to them. The OTA must append the secret token (see ICAL_EXPORT_TOKEN in .env)."
        >
          <div className="flex items-center gap-2 rounded-lg bg-sage-soft/40 p-3">
            <code className="flex-1 truncate font-admin-mono text-[12px] text-foreground">
              {typeof window !== 'undefined'
                ? `${window.location.origin}/api/ical/export?token=…`
                : '/api/ical/export?token=…'}
            </code>
            <button
              type="button"
              onClick={copyExportUrl}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-semibold text-foreground transition-colors hover:bg-sage"
            >
              <Copy size={12} /> Copy
            </button>
            <Link
              href="/api/ical/export"
              target="_blank"
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-semibold text-foreground no-underline transition-colors hover:bg-sage"
            >
              <ExternalLink size={12} /> Open
            </Link>
          </div>
        </FormCard>
      </div>
    </div>
  )
}

function ChannelCard({
  name,
  connected,
  syncedCount,
  lastSync,
}: {
  name: string
  connected: boolean
  syncedCount: number | null
  lastSync: string | null
}) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
      <div className="mb-2 flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-soft">
          <Radio size={16} className="text-sage-deep" />
        </div>
        <span
          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
            connected
              ? 'bg-status-confirmed-bg text-status-confirmed'
              : 'bg-status-blocked-bg text-status-blocked'
          }`}
        >
          {connected ? 'ON' : 'OFF'}
        </span>
      </div>
      <div className="mb-0.5 text-[13px] font-semibold text-foreground">
        {name}
      </div>
      {connected ? (
        <>
          <div className="text-[11px] text-muted-foreground">
            {syncedCount !== null
              ? `${syncedCount} dates synced`
              : 'No counts yet'}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground/80">
            {lastSync ? formatRelativeTime(lastSync) : 'Awaiting first sync'}
          </div>
        </>
      ) : (
        <div className="text-[11px] text-muted-foreground">
          Add a feed below
        </div>
      )}
    </div>
  )
}
