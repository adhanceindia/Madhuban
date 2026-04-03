import type {
  CreateOrderParams,
  GatewayOrderResult,
  PaymentConfigData,
  PaymentGateway,
} from './types'

// ---------------------------------------------------------------------------
// PhonePe Standard Checkout v2 (OAuth-based)
// ---------------------------------------------------------------------------

const ENDPOINTS = {
  sandbox: {
    token: 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token',
    pay: 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay',
    status: 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order',
  },
  production: {
    token: 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token',
    pay: 'https://api.phonepe.com/apis/pg/checkout/v2/pay',
    status: 'https://api.phonepe.com/apis/pg/checkout/v2/order',
  },
}

// Module-level token cache
let cachedToken: { access_token: string; expires_at: number } | null = null

export class PhonePeGateway implements PaymentGateway {
  readonly name = 'phonepe' as const
  readonly type = 'redirect' as const

  private env: 'sandbox' | 'production'
  private clientId: string
  private clientSecret: string
  private clientVersion: string

  constructor(cfg: PaymentConfigData) {
    this.env = cfg.phonepe_environment || 'sandbox'
    this.clientId = cfg.phonepe_client_id!
    this.clientSecret = cfg.phonepe_client_secret!
    this.clientVersion = cfg.phonepe_client_version!
  }

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 60s buffer)
    if (cachedToken && Date.now() < cachedToken.expires_at * 1000 - 60_000) {
      return cachedToken.access_token
    }

    const url = ENDPOINTS[this.env].token
    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      client_version: this.clientVersion,
      grant_type: 'client_credentials',
    })

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`PhonePe token request failed (${res.status}): ${text}`)
    }

    const data = await res.json()
    cachedToken = {
      access_token: data.access_token,
      expires_at: data.expires_at,
    }
    return data.access_token
  }

  async createOrder(params: CreateOrderParams): Promise<GatewayOrderResult> {
    const token = await this.getAccessToken()
    const merchantOrderId = `MGB${params.booking_id}T${Date.now()}`

    const url = ENDPOINTS[this.env].pay
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `O-Bearer ${token}`,
      },
      body: JSON.stringify({
        merchantOrderId,
        amount: params.amount_inr * 100, // paisa
        expireAfter: 1800, // 30 minutes
        paymentFlow: {
          type: 'PG_CHECKOUT',
          merchantUrls: {
            redirectUrl: `${params.site_url}/booking/status?gateway=phonepe&order_id=${merchantOrderId}`,
          },
        },
        metaInfo: {
          udf1: String(params.booking_id),
          udf2: params.room_name,
        },
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`PhonePe create payment failed (${res.status}): ${text}`)
    }

    const data = await res.json()
    return {
      type: 'redirect',
      gateway_order_id: merchantOrderId,
      redirect_url: data.redirectUrl,
    }
  }

  /** Check order status — used by the booking/status page */
  async checkOrderStatus(
    merchantOrderId: string,
    environment: 'sandbox' | 'production',
    clientId: string,
    clientSecret: string,
    clientVersion: string,
  ): Promise<{ state: string; paymentDetails?: unknown[] }> {
    // Get fresh token
    this.env = environment
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.clientVersion = clientVersion

    const token = await this.getAccessToken()
    const url = `${ENDPOINTS[environment].status}/${merchantOrderId}/status?details=true`

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `O-Bearer ${token}`,
      },
    })

    if (!res.ok) {
      throw new Error(`PhonePe status check failed (${res.status})`)
    }

    return res.json()
  }
}
