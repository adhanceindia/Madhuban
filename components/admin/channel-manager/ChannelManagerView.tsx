'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Radio, AlertTriangle, Copy, ExternalLink, Save } from 'lucide-react'
import toast from 'react-hot-toast'

import { PageHeader } from '@/components/admin/shared/page-header'
import { FormCard } from '@/components/admin/shared/form-card'
import { Field, TextInput } from '@/components/admin/shared/form-field'
import { formatRelativeTime, formatDateShort } from '@/lib/format'

type ChannelData = {
  ical_config: { bookingcom_ical_url?: string; mmt_ical_url?: string; goibibo_ical_url?: string }
  blocked_counts: { manual: number; ical: number }
  ota_booking_count: number
  conflicts: { room_id: number; date: string; booking_id: number; guest_name: string }[]
  last_sync: string | null
  bookingcom_count: number | null
  mmt_count: number | null
}

export function ChannelManagerView() {
  const [data, setData] = useState<ChannelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [urls, setUrls] = useState({ bookingcom_ical_url: '', mmt_ical_url: '', goibibo_ical_url: '' })
  const [saving, setSaving] = useState(false)

  function refetch() {
    return fetch('/api/admin/channel-manager')
      .then((r) => r.json())
      .then((d: ChannelData) => {
        setData(d)
        setUrls({
          bookingcom_ical_url: d.ical_config?.bookingcom_ical_url || '',
          mmt_ical_url: d.ical_config?.mmt_ical_url || '',
          goibibo_ical_url: d.ical_config?.goibibo_ical_url || '',
        })
      })
  }

  useEffect(() => {
    setLoading(true)
    refetch().finally(() => setLoading(false))
  }, [])

  async function saveUrls() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/content/ical', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ content: urls }),
      })
      if (!res.ok) {
        const j = await res.json()
        toast.error(j.error || 'Save failed')
        return
      }
      toast.success('iCal URLs saved')
      refetch()
    } finally {
      setSaving(false)
    }
  }

  function copyExportUrl() {
    const url = `${window.location.origin}/api/ical/export`
    navigator.clipboard.writeText(url)
    toast.success('Export URL copied to clipboard')
  }

  if (loading || !data) {
    return (
      <div>
        <PageHeader title="Channel Manager" subtitle="Loading..." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[160px] bg-card rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px]">
      <PageHeader
        title="Channel Manager"
        subtitle={data.last_sync ? `Last sync ${formatRelativeTime(data.last_sync)}` : 'No sync yet'}
      />

      {/* Channel status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <ChannelCard
          name="Booking.com"
          url={data.ical_config?.bookingcom_ical_url}
          syncedCount={data.bookingcom_count}
          lastSync={data.last_sync}
        />
        <ChannelCard
          name="MakeMyTrip"
          url={data.ical_config?.mmt_ical_url}
          syncedCount={data.mmt_count}
          lastSync={data.last_sync}
        />
        <ChannelCard
          name="Goibibo"
          url={data.ical_config?.goibibo_ical_url}
          syncedCount={null}
          lastSync={null}
        />
      </div>

      {/* Conflicts */}
      {data.conflicts.length > 0 && (
        <div className="bg-status-cancelled-bg border border-status-cancelled/30 rounded-2xl p-5 mb-5">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-status-cancelled flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-[14px] font-semibold text-status-cancelled mb-2">
                {data.conflicts.length} double-booking conflict{data.conflicts.length > 1 ? 's' : ''}
              </h3>
              <p className="text-[12px] text-status-cancelled/80 mb-3">
                These rooms have both a direct booking and an OTA-imported block on the same date:
              </p>
              <div className="space-y-1">
                {data.conflicts.map((c, i) => (
                  <div key={i} className="text-[12px]">
                    <Link
                      href={`/admin/bookings/${c.booking_id}`}
                      className="text-foreground font-medium hover:text-sage-deep no-underline"
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

      {/* iCal URLs */}
      <FormCard
        title="OTA iCal feeds"
        description="Paste the iCal URL from each OTA's extranet. We sync these every 30 minutes."
      >
        <Field
          label="Booking.com iCal URL"
          hint="Find under Property → Calendar → Sync calendars"
        >
          <TextInput
            type="url"
            value={urls.bookingcom_ical_url}
            onChange={(e) => setUrls({ ...urls, bookingcom_ical_url: e.target.value })}
            placeholder="https://ical.booking.com/v1/export?t=..."
          />
        </Field>

        <Field label="MakeMyTrip iCal URL">
          <TextInput
            type="url"
            value={urls.mmt_ical_url}
            onChange={(e) => setUrls({ ...urls, mmt_ical_url: e.target.value })}
            placeholder="https://..."
          />
        </Field>

        <Field label="Goibibo iCal URL">
          <TextInput
            type="url"
            value={urls.goibibo_ical_url}
            onChange={(e) => setUrls({ ...urls, goibibo_ical_url: e.target.value })}
            placeholder="https://..."
          />
        </Field>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={saveUrls}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={13} /> {saving ? 'Saving...' : 'Save URLs'}
          </button>
        </div>
      </FormCard>

      <div className="mt-5">
        <FormCard
          title="Madhuban's iCal export"
          description="Paste this URL into each OTA's calendar import to push our bookings out to them."
        >
          <div className="flex items-center gap-2 bg-sage-soft/40 rounded-lg p-3">
            <code className="text-[12px] text-foreground font-admin-mono flex-1 truncate">
              {typeof window !== 'undefined' ? `${window.location.origin}/api/ical/export` : '/api/ical/export'}
            </code>
            <button
              type="button"
              onClick={copyExportUrl}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] font-semibold bg-card hover:bg-sage text-foreground border border-border rounded-md transition-colors"
            >
              <Copy size={12} /> Copy
            </button>
            <Link
              href="/api/ical/export"
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] font-semibold bg-card hover:bg-sage text-foreground border border-border rounded-md no-underline transition-colors"
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
  url,
  syncedCount,
  lastSync,
}: {
  name: string
  url: string | undefined
  syncedCount: number | null
  lastSync: string | null
}) {
  const configured = !!url
  return (
    <div className="bg-card rounded-2xl p-5 shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-sage-soft flex items-center justify-center">
          <Radio size={18} className="text-sage-deep" />
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
            configured ? 'bg-status-confirmed-bg text-status-confirmed' : 'bg-status-blocked-bg text-status-blocked'
          }`}
        >
          {configured ? 'CONNECTED' : 'NOT CONNECTED'}
        </span>
      </div>
      <div className="text-[15px] font-semibold text-foreground mb-1">{name}</div>
      {configured ? (
        <>
          <div className="text-[11px] text-muted-foreground">
            {syncedCount !== null && `${syncedCount} blocked dates synced`}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {lastSync ? `Last sync ${formatRelativeTime(lastSync)}` : 'Awaiting first sync'}
          </div>
        </>
      ) : (
        <div className="text-[11px] text-muted-foreground">Add iCal URL below to connect</div>
      )}
    </div>
  )
}
