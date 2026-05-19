import { apiHandler } from '@/lib/api-handler'
import { listAuditEntries, getAuditFilters } from '@/db/queries/audit-log'

export const GET = apiHandler({
  auth: ['super_admin'],
  module: 'audit-log',
  handler: async ({ searchParams }) => {
    const filters = {
      user_id: searchParams.get('user_id') ? parseInt(searchParams.get('user_id')!) : undefined,
      action: searchParams.get('action') || undefined,
      entity_type: searchParams.get('entity_type') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      search: searchParams.get('search') || undefined,
    }
    const [entries, filterOptions] = await Promise.all([listAuditEntries(filters), getAuditFilters()])
    return { entries, filter_options: filterOptions }
  },
})
