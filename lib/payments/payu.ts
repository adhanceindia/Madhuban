import crypto from 'crypto'

import type {
  CreateOrderParams,
  GatewayOrderResult,
  PaymentConfigData,
  PaymentGateway,
} from './types'

// ---------------------------------------------------------------------------
// PayU — Form POST redirect with SHA-512 hash
// ---------------------------------------------------------------------------

const GATEWAY_URLS = {
  test: 'https://test.payu.in/_payment',
  production: 'https://secure.payu.in/_payment',
}

/**
 * Payment request hash:
 * sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 */
export function generatePayUHash(
  params: {
    key: string
    txnid: string
    amount: string
    productinfo: string
    firstname: string
    email: string
    udf1?: string
    udf2?: string
    udf3?: string
    udf4?: string
    udf5?: string
  },
  salt: string,
): string {
  const hashString = [
    params.key,
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    params.udf1 || '',
    params.udf2 || '',
    params.udf3 || '',
    params.udf4 || '',
    params.udf5 || '',
    '', '', '', '', '', // 5 empty positions
    salt,
  ].join('|')

  return crypto.createHash('sha512').update(hashString).digest('hex')
}

/**
 * Reverse hash for response verification:
 * sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export function verifyPayUReverseHash(
  params: {
    key: string
    txnid: string
    amount: string
    productinfo: string
    firstname: string
    email: string
    status: string
    udf1?: string
    udf2?: string
    udf3?: string
    udf4?: string
    udf5?: string
    additionalCharges?: string
  },
  salt: string,
  receivedHash: string,
): boolean {
  const parts = [
    salt,
    params.status,
    '', '', '', '', '', // 5 empty positions
    params.udf5 || '',
    params.udf4 || '',
    params.udf3 || '',
    params.udf2 || '',
    params.udf1 || '',
    params.email,
    params.firstname,
    params.productinfo,
    params.amount,
    params.txnid,
    params.key,
  ]

  // If additional charges exist, prepend them
  if (params.additionalCharges) {
    parts.unshift(params.additionalCharges)
  }

  const hashString = parts.join('|')
  const calculated = crypto.createHash('sha512').update(hashString).digest('hex')
  return calculated === receivedHash
}

export class PayUGateway implements PaymentGateway {
  readonly name = 'payu' as const
  readonly type = 'redirect' as const

  private env: 'test' | 'production'
  private merchantKey: string
  private merchantSalt: string

  constructor(cfg: PaymentConfigData) {
    this.env = cfg.payu_environment || 'test'
    this.merchantKey = cfg.payu_merchant_key!
    this.merchantSalt = cfg.payu_merchant_salt!
  }

  async createOrder(params: CreateOrderParams): Promise<GatewayOrderResult> {
    const txnid = `MGB${params.booking_id}T${Date.now()}`

    // PayU uses form POST, so we redirect to our initiate route that renders the form
    return {
      type: 'redirect',
      gateway_order_id: txnid,
      redirect_url:
        `${params.site_url}/api/payments/initiate/payu?booking_id=${params.booking_id}`,
    }
  }

  /** Build form fields for the auto-submit page */
  buildFormFields(params: {
    txnid: string
    amount: number
    productinfo: string
    firstname: string
    email: string
    phone: string
    surl: string
    furl: string
    udf1?: string
  }): Record<string, string> & { action: string } {
    const amountStr = params.amount.toFixed(2)

    const hash = generatePayUHash(
      {
        key: this.merchantKey,
        txnid: params.txnid,
        amount: amountStr,
        productinfo: params.productinfo,
        firstname: params.firstname,
        email: params.email,
        udf1: params.udf1,
      },
      this.merchantSalt,
    )

    return {
      action: GATEWAY_URLS[this.env],
      key: this.merchantKey,
      txnid: params.txnid,
      amount: amountStr,
      productinfo: params.productinfo,
      firstname: params.firstname,
      email: params.email,
      phone: params.phone,
      surl: params.surl,
      furl: params.furl,
      hash,
      udf1: params.udf1 || '',
    }
  }
}
