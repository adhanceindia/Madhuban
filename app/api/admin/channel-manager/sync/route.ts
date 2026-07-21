import { apiHandler } from '@/lib/api-handler'
import { runIcalSync } from '@/lib/ical/sync'

/**
 * Manual "Sync now" trigger from the Channel Manager admin UI.
 *
 * Gated by the admin session + `channel-manager` RBAC module. Runs the exact
 * same engine as the QStash-scheduled cron (`lib/ical/sync.ts`) — only the
 * auth wrapper differs. Audit-logged as `channel_manager.sync_triggered`.
 */
export const POST = apiHandler({
  module: 'channel-manager',
  audit: {
    action: 'channel_manager.sync_triggered',
    entityType: 'channel_manager',
  },
  handler: async ({ session }) => {
    const summary = await runIcalSync({
      triggeredBy: 'manual',
      triggeredByUserId: session.id,
    })
    return summary
  },
})
