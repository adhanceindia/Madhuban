import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

import { getPaymentConfig } from '@/lib/payments/resolve-gateway'
import { confirmBookingPayment, failBookingPayment } from '@/lib/payments/common'

// ---------------------------------------------------------------------------
// POST /api/payments/webhooks/razorpay
// Runs independently — handles events even if Razorpay isn't the active gateway
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.text() // raw text for signature verification
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const cfg = await getPaymentConfig()

    if (!cfg.razorpay_webhook_secret) {
      console.error('[razorpay-webhook] Webhook secret not configured')
      return NextResponse.json({ status: 'ok' }) // return 200 to stop retries
    }

    // Verify signature
    const isValid = Razorpay.validateWebhookSignature(
      body,
      signature,
      cfg.razorpay_webhook_secret,
    )

    if (!isValid) {
      console.error('[razorpay-webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)

    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity
        await confirmBookingPayment({
          gateway_order_id: payment.order_id,
          gateway_payment_id: payment.id,
          gateway_name: 'razorpay',
          paid_amount_inr: payment.amount / 100,
        })
        break
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity
        await failBookingPayment(payment.order_id)
        break
      }
    }

    // Always return 200 to Razorpay
    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('[razorpay-webhook] Error:', error)
    return NextResponse.json({ status: 'ok' }) // 200 to prevent infinite retries
  }
}
