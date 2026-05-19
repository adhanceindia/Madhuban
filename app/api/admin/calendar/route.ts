import { apiHandler } from '@/lib/api-handler'
import { getCalendarData } from '@/db/queries/calendar'
import { todayISO, addDays } from '@/lib/format'

export const GET = apiHandler({
  module: 'calendar',
  handler: async ({ searchParams }) => {
    const start = searchParams.get('start') || todayISO()
    const end = searchParams.get('end') || addDays(start, 29)
    return await getCalendarData(start, end)
  },
})
