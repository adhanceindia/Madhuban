import { z } from 'zod'

export const GATEWAY_NAMES = ['razorpay', 'phonepe', 'cashfree', 'ccavenue', 'payu'] as const
export const gatewayEnum = z.enum(GATEWAY_NAMES)

export const paymentConfigSchema = z.object({
  active_gateway: gatewayEnum.optional(),
  gateways: z.record(z.string(), z.unknown()).optional(),
})

export const siteSettingsSchema = z.object({
  page: z.string().min(1),
  content: z.record(z.string(), z.unknown()),
})

export const GATEWAY_CONFIG: Record<
  (typeof GATEWAY_NAMES)[number],
  { label: string; fields: { key: string; label: string; type?: 'text' | 'password'; required?: boolean }[] }
> = {
  razorpay: {
    label: 'Razorpay',
    fields: [
      { key: 'razorpay_key_id', label: 'Key ID', required: true },
      { key: 'razorpay_key_secret', label: 'Key Secret', type: 'password', required: true },
    ],
  },
  phonepe: {
    label: 'PhonePe',
    fields: [
      { key: 'phonepe_client_id', label: 'Client ID', required: true },
      { key: 'phonepe_client_secret', label: 'Client Secret', type: 'password', required: true },
      { key: 'phonepe_client_version', label: 'Client Version', required: true },
    ],
  },
  cashfree: {
    label: 'Cashfree',
    fields: [
      { key: 'cashfree_app_id', label: 'App ID', required: true },
      { key: 'cashfree_secret_key', label: 'Secret Key', type: 'password', required: true },
      { key: 'cashfree_environment', label: 'Environment (TEST/PROD)' },
    ],
  },
  ccavenue: {
    label: 'CCAvenue',
    fields: [
      { key: 'ccavenue_merchant_id', label: 'Merchant ID', required: true },
      { key: 'ccavenue_access_code', label: 'Access Code', required: true },
      { key: 'ccavenue_working_key', label: 'Working Key', type: 'password', required: true },
    ],
  },
  payu: {
    label: 'PayU',
    fields: [
      { key: 'payu_merchant_key', label: 'Merchant Key', required: true },
      { key: 'payu_merchant_salt', label: 'Merchant Salt', type: 'password', required: true },
    ],
  },
}
