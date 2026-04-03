import Razorpay from 'razorpay'

import type {
  CreateOrderParams,
  GatewayOrderResult,
  PaymentConfigData,
  PaymentGateway,
} from './types'

export class RazorpayGateway implements PaymentGateway {
  readonly name = 'razorpay' as const
  readonly type = 'js-checkout' as const

  private client: Razorpay
  private keyId: string

  constructor(cfg: PaymentConfigData) {
    this.keyId = cfg.razorpay_key_id!
    this.client = new Razorpay({
      key_id: cfg.razorpay_key_id!,
      key_secret: cfg.razorpay_key_secret!,
    })
  }

  async createOrder(params: CreateOrderParams): Promise<GatewayOrderResult> {
    const order = await this.client.orders.create({
      amount: params.amount_inr * 100, // paise
      currency: 'INR',
      receipt: `booking_${params.booking_id}`,
      notes: {
        booking_id: String(params.booking_id),
        room: params.room_name,
        guest: params.guest_name,
      },
    })

    return {
      type: 'js-checkout',
      gateway_order_id: order.id,
      checkout_data: {
        key: this.keyId,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        name: 'Madhuban Garden Resort',
        description: `Booking — ${params.room_name}`,
        prefill: {
          name: params.guest_name,
          email: params.guest_email,
          contact: params.guest_phone,
        },
        theme: { color: '#386a0e' },
      },
    }
  }
}
