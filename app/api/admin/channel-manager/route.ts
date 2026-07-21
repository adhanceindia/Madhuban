import { apiHandler } from '@/lib/api-handler'
import {
  getBlockedCountsBySource,
  getOtaBookingCount,
  getConflicts,
  getRecentSyncLogs,
} from '@/db/queries/channel-manager'
import { getActiveRooms } from '@/db/queries/rooms'
import { getRedis } from '@/lib/redis'
import { getIcalConfig } from '@/lib/ical/config'
import { ICAL_SOURCES } from '@/lib/ical/types'
import type { IcalSource } from '@/lib/ical/types'

export const GET = apiHandler({
  module: 'channel-manager',
  handler: async () => {
    const redis = getRedis()
    const [
      counts,
      otaBookings,
      conflicts,
      icalConfig,
      activeRooms,
      recentLogs,
    ] = await Promise.all([
      getBlockedCountsBySource(),
      getOtaBookingCount(),
      getConflicts(),
      getIcalConfig(),
      getActiveRooms(),
      getRecentSyncLogs(20),
    ])

    let lastSync: string | null = null
    const perSourceCount: Record<IcalSource, number | null> = {
      booking_com: null,
      mmt: null,
      airbnb: null,
      agoda: null,
      goibibo: null,
    }
    if (redis) {
      try {
        const [ls, ...sourceCounts] = await Promise.all([
          redis.get<string>('ical:last_sync'),
          ...ICAL_SOURCES.map((s) => redis.get<number>(`ical:count:${s}`)),
        ])
        lastSync = ls
        ICAL_SOURCES.forEach((s, i) => {
          perSourceCount[s] = sourceCounts[i]
        })
      } catch {
        // Redis unavailable — counts stay null, UI handles gracefully.
      }
    }

    return {
      feeds: icalConfig.feeds,
      rooms: activeRooms.map((r) => ({ id: r.id, name: r.name, slug: r.slug })),
      blocked_counts: counts,
      ota_booking_count: otaBookings,
      conflicts,
      last_sync: lastSync,
      counts: perSourceCount,
      recent_logs: recentLogs,
    }
  },
})
