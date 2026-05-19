import { getDb } from '@/db/client'
import { paymentConfig } from '@/db/schema'

import type { GatewayName, PaymentConfigData, PaymentGateway } from './types'
import { RazorpayGateway } from './razorpay'
import { PhonePeGateway } from './phonepe'
import { CashfreeGateway } from './cashfree'
import { CCavenueGateway } from './ccavenue'
import { PayUGateway } from './payu'

export async function getPaymentConfig(): Promise<PaymentConfigData> {
  const db = getDb()
  const [row] = await db.select().from(paymentConfig).limit(1)
  if (!row) {
    throw new Error('Payment config not found. Please configure in admin settings.')
  }
  const gateways = (row.gateways as Record<string, unknown>) || {}
  return {
    active_gateway: row.active_gateway,
    ...gateways,
  } as PaymentConfigData
}

const REQUIRED_FIELDS: Record<GatewayName, string[]> = {
  razorpay: ['razorpay_key_id', 'razorpay_key_secret'],
  phonepe: ['phonepe_client_id', 'phonepe_client_secret', 'phonepe_client_version'],
  cashfree: ['cashfree_app_id', 'cashfree_secret_key'],
  ccavenue: ['ccavenue_merchant_id', 'ccavenue_access_code', 'ccavenue_working_key'],
  payu: ['payu_merchant_key', 'payu_merchant_salt'],
}

function validateCredentials(gateway: GatewayName, cfg: PaymentConfigData): void {
  const missing = REQUIRED_FIELDS[gateway].filter(
    (field) => !((cfg as unknown as Record<string, unknown>)[field] as string)?.trim(),
  )
  if (missing.length > 0) {
    throw new Error(
      `Payment gateway "${gateway}" is missing required credentials: ${missing.join(', ')}. ` +
        'Please configure them in the admin panel under Payment Settings.',
    )
  }
}

export async function resolveActiveGateway(): Promise<PaymentGateway> {
  const cfg = await getPaymentConfig()
  const name = cfg.active_gateway

  const enabledKey = `${name}_enabled` as keyof PaymentConfigData
  if (!cfg[enabledKey]) {
    throw new Error(
      `Payment gateway "${name}" is set as active but is not enabled. ` +
        'Please enable it in the admin panel under Payment Settings.',
    )
  }

  validateCredentials(name, cfg)

  switch (name) {
    case 'razorpay':
      return new RazorpayGateway(cfg)
    case 'phonepe':
      return new PhonePeGateway(cfg)
    case 'cashfree':
      return new CashfreeGateway(cfg)
    case 'ccavenue':
      return new CCavenueGateway(cfg)
    case 'payu':
      return new PayUGateway(cfg)
    default:
      throw new Error(`Unknown payment gateway: ${name}`)
  }
}
