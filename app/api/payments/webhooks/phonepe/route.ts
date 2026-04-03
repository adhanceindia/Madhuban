import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

import { getPaymentConfig } from '@/lib/payments/resolve-gateway'
import { confirmBookingPayment, failBookingPayment } from '@/lib/payments/common'

// ---------------------------------------------------------------------------
// POST /api/payments/webhooks/phonepe
// PhonePe v2 webhook — Authorization header = SHA256(username:password)
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const authHeader = request.headers.get('authorization') || ''

    const cfg = await getPaymentConfig()

    if (!cfg.phonepe_webhook_username || !cfg.phonepe_webhook_password) {
      console.error('[phonepe-webhook] Webhook credentials not configured')
      return NextResponse.json({ status: 'ok' })
    }

    // Verify: Authorization header should match SHA256(username:password)
    const expected = crypto
      .createHash('sha256')
      .update(`${cfg.phonepe_webhook_username}:${cfg.phonepe_webhook_password}`)
      .digest('hex')

    if (authHeader !== expected) {
      console.error('[phonepe-webhook] Invalid authorization')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const event = JSON.parse(body)

    switch (event.event) {
      case 'checkout.order.completed': {
        const payload = event.payload
        await confirmBookingPayment({
          gateway_order_id: payload.merchantOrderId,
          gateway_payment_id: payload.orderId || payload.merchantOrderId,
          gateway_name: 'phonepe',
        })
        break
      }

      case 'checkout.order.failed': {
        const payload = event.payload
        await failBookingPayment(payload.merchantOrderId)
        break
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('[phonepe-webhook] Error:', error)
    return NextResponse.json({ status: 'ok' })
  }
}
