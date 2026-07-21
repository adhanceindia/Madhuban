import { apiHandler } from '@/lib/api-handler'
import { zodIcalConfigSchema } from '@/lib/ical/schema'
import { saveIcalConfig } from '@/lib/ical/config'

/**
 * Persist the per-listing iCal feed config from the Channel Manager admin UI.
 *
 * Replaces the old `PUT /api/admin/content/ical` flow for the iCal page —
 * this route is dedicated to the feeds repeater, validates against
 * `zodIcalConfigSchema` (proper shape for the per-listing model), and
 * audit-logs the change as `channel_manager.feeds_updated`.
 */
export const PUT = apiHandler({
  module: 'channel-manager',
  schema: zodIcalConfigSchema,
  audit: {
    action: 'channel_manager.feeds_updated',
    entityType: 'channel_manager',
  },
  handler: async ({ body }) => {
    const saved = await saveIcalConfig(body)
    return { ok: true, feeds: saved.feeds }
  },
})
