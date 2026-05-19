import { apiHandler } from '@/lib/api-handler'
import { listInquiries } from '@/db/queries/inquiries-admin'

export const GET = apiHandler({
  module: 'inquiries',
  handler: async ({ searchParams }) => {
    const filters = {
      status: searchParams.get('status') || undefined,
      event_type: searchParams.get('event_type') || undefined,
      search: searchParams.get('search') || undefined,
    }
    return { inquiries: await listInquiries(filters) }
  },
})
