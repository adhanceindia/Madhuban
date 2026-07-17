import type {
  CreateOrderParams,
  GatewayOrderResult,
  PaymentConfigData,
  PaymentGateway,
} from './types'

// ---------------------------------------------------------------------------
// Cashfree Payments — JS Drop-in Checkout
// ---------------------------------------------------------------------------

const BASE_URLS = {
  sandbox: 'https://sandbox.cashfree.com/pg',
  production: 'https://api.cashfree.com/pg',
}

const API_VERSION = '2023-08-01'

export class CashfreeGateway implements PaymentGateway {
  readonly name = 'cashfree' as const
  readonly type = 'js-checkout' as const

  private env: 'sandbox' | 'production'
  private appId: string
  private secretKey: string

  constructor(cfg: PaymentConfigData) {
    const envStr = (cfg.cashfree_environment || '').toLowerCase()
    this.env = (envStr === 'prod' || envStr === 'production') ? 'production' : 'sandbox'
    this.appId = cfg.cashfree_app_id!
    this.secretKey = cfg.cashfree_secret_key!
  }

  async createOrder(params: CreateOrderParams): Promise<GatewayOrderResult> {
    const orderId = `MGB${params.booking_id}T${Date.now()}`

    const url = `${BASE_URLS[this.env]}/orders`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': this.appId,
        'x-client-secret': this.secretKey,
        'x-api-version': API_VERSION,
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: params.amount_inr,
        order_currency: 'INR',
        customer_details: {
          customer_id: `guest_${params.booking_id}`,
          customer_name: params.guest_name,
          customer_email: params.guest_email,
          customer_phone: params.guest_phone,
        },
        order_meta: {
          return_url: `${params.site_url.replace('http://', 'https://')}/booking/status?gateway=cashfree&order_id=${orderId}`,
          payment_methods: '',
        },
        order_tags: {
          booking_id: String(params.booking_id),
          room: params.room_name,
        },
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Cashfree create order failed (${res.status}): ${text}`)
    }

    const data = await res.json()

    return {
      type: 'js-checkout',
      gateway_order_id: orderId,
      checkout_data: {
        payment_session_id: data.payment_session_id,
        order_id: data.order_id,
        mode: this.env,
      },
    }
  }
}
