import { apiHandler } from '@/lib/api-handler'
import { getPaymentConfigRow, updatePaymentConfig } from '@/db/queries/settings'
import { paymentConfigSchema } from '@/lib/schemas/settings'

export const GET = apiHandler({
  auth: ['super_admin'],
  module: 'settings',
  handler: async () => {
    return { config: await getPaymentConfigRow() }
  },
})

export const PATCH = apiHandler({
  auth: ['super_admin'],
  module: 'settings',
  schema: paymentConfigSchema,
  audit: { action: 'settings.payment_updated', entityType: 'payment_config' },
  handler: async ({ body }) => {
    const config = await updatePaymentConfig(body)
    return { config }
  },
})
