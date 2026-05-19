import { apiHandler } from '@/lib/api-handler'
import { getAnalyticsData } from '@/db/queries/analytics'
import { todayISO, addDays } from '@/lib/format'

export const GET = apiHandler({
  module: 'analytics',
  handler: async ({ searchParams }) => {
    const end = searchParams.get('end') || todayISO()
    const start = searchParams.get('start') || addDays(end, -29)
    return await getAnalyticsData(start, end)
  },
})
