// ---------------------------------------------------------------------------
// Shared types for the multi-gateway payment abstraction
// ---------------------------------------------------------------------------

export type GatewayName = 'razorpay' | 'phonepe' | 'cashfree' | 'ccavenue' | 'payu'

/** Input passed to every gateway when creating an order */
export type CreateOrderParams = {
  booking_id: number | string
  amount_inr: number // total in rupees (including GST)
  room_name: string
  guest_name: string
  guest_email: string
  guest_phone: string
  /** Full site origin, e.g. https://madhubangarden.com */
  site_url: string
}

/** Result returned by a gateway after order creation */
export type GatewayOrderResult = {
  /** The ID this gateway assigned to the order / transaction */
  gateway_order_id: string
} & (
  | {
      type: 'js-checkout'
      /** Arbitrary data the frontend needs to open the JS checkout */
      checkout_data: Record<string, unknown>
    }
  | {
      type: 'redirect'
      /** URL the frontend should navigate to (full-page redirect) */
      redirect_url: string
    }
)

/** Every gateway adapter implements this interface */
export interface PaymentGateway {
  readonly name: GatewayName
  readonly type: 'js-checkout' | 'redirect'
  createOrder(params: CreateOrderParams): Promise<GatewayOrderResult>
}

// ---------------------------------------------------------------------------
// Config shapes extracted from the PaymentConfig Payload global
// ---------------------------------------------------------------------------

export type RazorpayConfig = {
  razorpay_enabled?: boolean
  razorpay_key_id?: string
  razorpay_key_secret?: string
  razorpay_webhook_secret?: string
}

export type PhonePeConfig = {
  phonepe_enabled?: boolean
  phonepe_environment?: 'sandbox' | 'production'
  phonepe_client_id?: string
  phonepe_client_secret?: string
  phonepe_client_version?: string
  phonepe_webhook_username?: string
  phonepe_webhook_password?: string
}

export type CashfreeConfig = {
  cashfree_enabled?: boolean
  cashfree_environment?: 'sandbox' | 'production'
  cashfree_app_id?: string
  cashfree_secret_key?: string
}

export type CCavenueConfig = {
  ccavenue_enabled?: boolean
  ccavenue_environment?: 'test' | 'production'
  ccavenue_merchant_id?: string
  ccavenue_access_code?: string
  ccavenue_working_key?: string
}

export type PayUConfig = {
  payu_enabled?: boolean
  payu_environment?: 'test' | 'production'
  payu_merchant_key?: string
  payu_merchant_salt?: string
}

export type PaymentConfigData = {
  active_gateway: GatewayName
} & RazorpayConfig &
  PhonePeConfig &
  CashfreeConfig &
  CCavenueConfig &
  PayUConfig
