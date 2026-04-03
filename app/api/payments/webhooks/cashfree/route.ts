import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

import { getPaymentConfig } from '@/lib/payments/resolve-gateway'
import { confirmBookingPayment, failBookingPayment } from '@/lib/payments/common'

// ---------------------------------------------------------------------------
// POST /api/payments/webhooks/cashfree
// Signature: HMAC-SHA256(timestamp + rawBody, secret_key) → base64
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-webhook-signature') || ''
    const timestamp = request.headers.get('x-webhook-timestamp') || ''

    const cfg = await getPaymentConfig()

    if (!cfg.cashfree_secret_key) {
      console.error('[cashfree-webhook] Secret key not configured')
      return NextResponse.json({ status: 'ok' })
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', cfg.cashfree_secret_key)
      .update(timestamp + body)
      .digest('base64')

    if (expectedSignature !== signature) {
      console.error('[cashfree-webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)

    switch (event.type) {
      case 'PAYMENT_SUCCESS_WEBHOOK': {
        const data = event.data
        await confirmBookingPayment({
          gateway_order_id: data.order.order_id,
          gateway_payment_id: String(data.payment.cf_payment_id),
          gateway_name: 'cashfree',
        })
        break
      }

      case 'PAYMENT_FAILED_WEBHOOK':
      case 'PAYMENT_USER_DROPPED_WEBHOOK': {
        const data = event.data
        await failBookingPayment(data.order.order_id)
        break
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('[cashfree-webhook] Error:', error)
    return NextResponse.json({ status: 'ok' })
  }
}
