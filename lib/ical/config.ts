import {
  getPageContentAdmin,
  upsertPageContent,
} from '@/db/queries/content-admin'
import { zodIcalConfigSchema } from './schema'
import { isLegacyFlatConfig } from './schema'
import type { IcalConfig, IcalFeedConfig, IcalSource } from './types'

/**
 * Single source of truth for reading + writing the iCal feed config.
 *
 * The config lives in `site_content.content` for `page = 'ical'`. Legacy
 * installs stored flat `{ bookingcom_ical_url, mmt_ical_url, goibibo_ical_url }`;
 * `getIcalConfig()` transparently migrates that to the new `{ feeds: [...] }`
 * shape on read so we can keep one code path.
 */

const LEGACY_KEY_TO_SOURCE: Record<string, IcalSource> = {
  bookingcom_ical_url: 'booking_com',
  mmt_ical_url: 'mmt',
  goibibo_ical_url: 'goibibo',
  airbnb_ical_url: 'airbnb',
  agoda_ical_url: 'agoda',
}

function nextFeedId(): string {
  // crypto.randomUUID is available in Node 18+ and Edge.
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `feed_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/** Migrate the old flat URL map to the per-listing feeds array. */
function migrateLegacy(flat: Record<string, unknown>): IcalFeedConfig[] {
  const feeds: IcalFeedConfig[] = []
  for (const [key, source] of Object.entries(LEGACY_KEY_TO_SOURCE)) {
    const url = flat[key]
    if (typeof url === 'string' && url.trim()) {
      feeds.push({ id: nextFeedId(), source, url: url.trim(), roomId: null })
    }
  }
  return feeds
}

export const EMPTY_ICAL_CONFIG: IcalConfig = { feeds: [] }

/**
 * Load + normalize the iCal config. Always returns a valid `IcalConfig`
 * (empty feeds list if nothing configured yet). Never throws on shape —
 * returns EMPTY_ICAL_CONFIG if the stored JSON is unparseable.
 */
export async function getIcalConfig(): Promise<IcalConfig> {
  const raw = await getPageContentAdmin('ical')

  // New shape — validate and return.
  const parsed = zodIcalConfigSchema.safeParse(raw)
  if (parsed.success) {
    return parsed.data
  }

  // Legacy flat shape — migrate on read.
  if (isLegacyFlatConfig(raw)) {
    const feeds = migrateLegacy(raw)
    return feeds.length > 0 ? { feeds } : EMPTY_ICAL_CONFIG
  }

  return EMPTY_ICAL_CONFIG
}

/** Validate + persist the iCal config. Throws on invalid input. */
export async function saveIcalConfig(config: IcalConfig): Promise<IcalConfig> {
  const validated = zodIcalConfigSchema.parse(config)
  // Ensure every feed has a stable id (UI may send new rows without one).
  const normalized: IcalConfig = {
    feeds: validated.feeds.map((f) => ({ ...f, id: f.id || nextFeedId() })),
  }
  await upsertPageContent(
    'ical',
    normalized as unknown as Record<string, unknown>,
  )
  return normalized
}

/** Factory for new empty feed rows, used by the UI repeater. */
export function newFeed(source: IcalSource = 'booking_com'): IcalFeedConfig {
  return { id: nextFeedId(), source, url: '', roomId: null }
}
