/**
 * Canonical types for the channel-manager iCal subsystem.
 *
 * The same `IcalConfig` shape is the single source of truth shared by:
 *   - the QStash-scheduled cron (`app/api/cron/sync-ical`)
 *   - the admin "Sync now" route (`app/api/admin/channel-manager/sync`)
 *   - the admin feeds PUT route (`app/api/admin/channel-manager/feeds`)
 *   - the Channel Manager admin UI
 *
 * It is persisted as JSON in `site_content.content` for `page = 'ical'`.
 */

/** Every OTA the channel manager can sync from. */
export const ICAL_SOURCES = [
  'booking_com',
  'mmt',
  'airbnb',
  'agoda',
  'goibibo',
] as const

export type IcalSource = (typeof ICAL_SOURCES)[number]

/**
 * A single OTA listing mapped to a Madhuban room.
 * One OTA may have multiple feeds (e.g. two Airbnb listings → two rows).
 * `roomId === null` means fan out to every active room.
 */
export type IcalFeedConfig = {
  /** Stable id for React keys + repeater state. */
  id: string
  source: IcalSource
  url: string
  roomId: number | null
}

export type IcalConfig = {
  feeds: IcalFeedConfig[]
}

/** Result of one (feed × room) sync operation inside a run. */
export type IcalFeedSyncResult = {
  source: IcalSource
  feedUrl: string
  roomId: number | null
  synced: number
  removed: number
  status: 'success' | 'error'
  error?: string
  startedAt: string
  finishedAt: string
}

/** Aggregate result of one full sync run (cron or manual). */
export type IcalRunSummary = {
  startedAt: string
  finishedAt: string
  status: 'success' | 'partial' | 'error'
  perFeed: IcalFeedSyncResult[]
  /** Distinct room IDs that received new or removed blocked_dates — used for cache invalidation. */
  roomsTouched: number[]
  totalSynced: number
  totalRemoved: number
  triggeredBy: 'cron' | 'manual'
}

/** Human-readable labels + channel card metadata, used by the admin UI. */
export const ICAL_SOURCE_META: Record<
  IcalSource,
  { label: string; hint: string }
> = {
  booking_com: {
    label: 'Booking.com',
    hint: 'Extranet → Calendar → Sync calendars → Export',
  },
  mmt: {
    label: 'MakeMyTrip',
    hint: 'MMT extranet → Property → Calendar Sync',
  },
  airbnb: {
    label: 'Airbnb',
    hint: 'Listing → Calendar → Import/Export → Calendar URL',
  },
  agoda: {
    label: 'Agoda',
    hint: 'YCS extranet → Calendar → iCal export',
  },
  goibibo: {
    label: 'Goibibo',
    hint: 'Goibibo extranet → Calendar → Sync → Export',
  },
}
