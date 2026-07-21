import { NextRequest } from 'next/server'
import { runIcalSync } from '@/lib/ical/sync'

export const dynamic = 'force-dynamic'

/**
 * QStash-scheduled iCal sync — runs every 30 minutes.
 *
 * The actual sync engine lives in `lib/ical/sync.ts` and is shared with the
 * admin "Sync now" button at `POST /api/admin/channel-manager/sync`.
 * Only QStash-signed requests reach `handler()` (see `POST` below).
 */
async function handler() {
  const summary = await runIcalSync({ triggeredBy: 'cron' })
  return Response.json({
    success: summary.status !== 'error',
    status: summary.status,
    total_synced: summary.totalSynced,
    total_removed: summary.totalRemoved,
    feeds_processed: summary.perFeed.length,
    rooms_touched: summary.roomsTouched.length,
    timestamp: summary.finishedAt,
  })
}

export async function POST(request: NextRequest) {
  const { verifySignatureAppRouter } = await import('@upstash/qstash/nextjs')
  const verified = verifySignatureAppRouter(handler)
  return verified(request)
}
