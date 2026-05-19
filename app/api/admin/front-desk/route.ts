import { apiHandler } from '@/lib/api-handler'
import { getArrivals, getDepartures, getInHouse } from '@/db/queries/front-desk'
import { todayISO } from '@/lib/format'

export const GET = apiHandler({
  module: 'front-desk',
  handler: async ({ searchParams }) => {
    const date = searchParams.get('date') || todayISO()
    const [arrivals, departures, inHouse] = await Promise.all([
      getArrivals(date),
      getDepartures(date),
      getInHouse(date),
    ])
    return { date, arrivals, departures, in_house: inHouse }
  },
})
