import crypto from 'crypto'

import type {
  CreateOrderParams,
  GatewayOrderResult,
  PaymentConfigData,
  PaymentGateway,
} from './types'

// ---------------------------------------------------------------------------
// CCAvenue — Form POST redirect with AES-128-CBC encryption
// ---------------------------------------------------------------------------

const GATEWAY_URLS = {
  test: 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
  production:
    'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
}

// Fixed IV per CCAvenue's official integration kit
const IV = Buffer.from([
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
  0x0c, 0x0d, 0x0e, 0x0f,
])

export function ccavenueEncrypt(plainText: string, workingKey: string): string {
  const key = crypto.createHash('md5').update(workingKey).digest()
  const cipher = crypto.createCipheriv('aes-128-cbc', key, IV)
  let encrypted = cipher.update(plainText, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

export function ccavenueDecrypt(
  encryptedText: string,
  workingKey: string,
): string {
  const key = crypto.createHash('md5').update(workingKey).digest()
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, IV)
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export class CCavenueGateway implements PaymentGateway {
  readonly name = 'ccavenue' as const
  readonly type = 'redirect' as const

  private env: 'test' | 'production'
  private merchantId: string
  private accessCode: string
  private workingKey: string

  constructor(cfg: PaymentConfigData) {
    this.env = cfg.ccavenue_environment || 'test'
    this.merchantId = cfg.ccavenue_merchant_id!
    this.accessCode = cfg.ccavenue_access_code!
    this.workingKey = cfg.ccavenue_working_key!
  }

  async createOrder(params: CreateOrderParams): Promise<GatewayOrderResult> {
    const orderId = `MGB${params.booking_id}T${Date.now()}`

    // CCAvenue doesn't have a server-side "create order" API for non-seamless.
    // Instead, we build the encrypted payload and redirect via a form POST page.
    // The /api/payments/initiate/ccavenue route renders the auto-submit form.
    return {
      type: 'redirect',
      gateway_order_id: orderId,
      redirect_url:
        `${params.site_url}/api/payments/initiate/ccavenue?booking_id=${params.booking_id}`,
    }
  }

  /** Build the encrypted request string for the auto-submit form */
  buildEncryptedRequest(params: {
    orderId: string
    amount: number
    guestName: string
    guestEmail: string
    guestPhone: string
    redirectUrl: string
    cancelUrl: string
  }): { encRequest: string; accessCode: string; gatewayUrl: string } {
    const fields = [
      `merchant_id=${this.merchantId}`,
      `order_id=${params.orderId}`,
      `currency=INR`,
      `amount=${params.amount.toFixed(2)}`,
      `redirect_url=${params.redirectUrl}`,
      `cancel_url=${params.cancelUrl}`,
      `language=EN`,
      `billing_name=${params.guestName}`,
      `billing_email=${params.guestEmail}`,
      `billing_tel=${params.guestPhone}`,
      `merchant_param1=${params.orderId}`,
    ].join('&')

    return {
      encRequest: ccavenueEncrypt(fields, this.workingKey),
      accessCode: this.accessCode,
      gatewayUrl: GATEWAY_URLS[this.env],
    }
  }
}
