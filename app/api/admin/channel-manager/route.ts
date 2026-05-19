import { apiHandler } from '@/lib/api-handler'
import { getBlockedCountsBySource, getOtaBookingCount, getConflicts } from '@/db/queries/channel-manager'
import { getRedis } from '@/lib/redis'
import { getPageContentAdmin } from '@/db/queries/content-admin'

export const GET = apiHandler({
  module: 'channel-manager',
  handler: async () => {
    const redis = getRedis()
    const [counts, otaBookings, conflicts, icalConfig] = await Promise.all([
      getBlockedCountsBySource(),
      getOtaBookingCount(),
      getConflicts(),
      getPageContentAdmin('ical'),
    ])

    let lastSync: string | null = null
    let bookingcomCount: number | null = null
    let mmtCount: number | null = null
    if (redis) {
      try {
        const [ls, bc, mc] = await Promise.all([
          redis.get<string>('ical:last_sync'),
          redis.get<number>('ical:bookingcom_count'),
          redis.get<number>('ical:mmt_count'),
        ])
        lastSync = ls
        bookingcomCount = bc
        mmtCount = mc
      } catch {
        // Redis unavailable
      }
    }

    return {
      ical_config: icalConfig,
      blocked_counts: counts,
      ota_booking_count: otaBookings,
      conflicts,
      last_sync: lastSync,
      bookingcom_count: bookingcomCount,
      mmt_count: mmtCount,
    }
  },
})
