import { apiHandler } from '@/lib/api-handler'
import { getPaymentConfigRow, updatePaymentConfig } from '@/db/queries/settings'
import { paymentConfigSchema } from '@/lib/schemas/settings'
import { encryptSecret } from '@/lib/crypto'

// Credential fields encrypted at rest. resolveActiveGateway() decrypts them
// (decryptSecret tolerates legacy plaintext, so unencrypted rows keep working).
const SECRET_FIELDS = [
  'razorpay_key_secret',
  'razorpay_webhook_secret',
  'phonepe_client_secret',
  'phonepe_webhook_password',
  'cashfree_secret_key',
  'ccavenue_working_key',
  'payu_merchant_salt',
] as const

/** Encrypt incoming secret fields. Skips empty values and anything already in the v1: envelope. */
function encryptIncomingSecrets(
  gateways: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!gateways) return gateways
  const out = { ...gateways }
  for (const field of SECRET_FIELDS) {
    const value = out[field]
    if (typeof value === 'string' && value.length > 0 && !value.startsWith('v1:')) {
      out[field] = encryptSecret(value)
    }
  }
  return out
}

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
    const config = await updatePaymentConfig({
      ...body,
      gateways: encryptIncomingSecrets(body.gateways),
    })
    return { config }
  },
})
