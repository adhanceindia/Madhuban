import { NextRequest, NextResponse } from 'next/server'

import { getPaymentConfig } from '@/lib/payments/resolve-gateway'
import { ccavenueDecrypt } from '@/lib/payments/ccavenue'
import { confirmBookingPayment, failBookingPayment } from '@/lib/payments/common'

// ---------------------------------------------------------------------------
// POST /api/payments/callbacks/ccavenue
// CCAvenue POSTs encResp back to this URL after payment
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const encResp = formData.get('encResp') as string

    if (!encResp) {
      return redirectToStatus(request, '', 'error')
    }

    const cfg = await getPaymentConfig()

    if (!cfg.ccavenue_working_key) {
      console.error('[ccavenue-callback] Working key not configured')
      return redirectToStatus(request, '', 'error')
    }

    // Decrypt the response
    const decrypted = ccavenueDecrypt(encResp, cfg.ccavenue_working_key)
    const params = new URLSearchParams(decrypted)

    const orderStatus = params.get('order_status') || ''
    const orderId = params.get('order_id') || params.get('merchant_param1') || ''
    const trackingId = params.get('tracking_id') || ''
    const amount = params.get('amount') || ''

    if (orderStatus === 'Success') {
      await confirmBookingPayment({
        gateway_order_id: orderId,
        gateway_payment_id: trackingId,
        gateway_name: 'ccavenue',
        paid_amount_inr: Number(amount),
      })
      return redirectToStatus(request, orderId, 'success')
    } else {
      // Failure, Aborted, Invalid
      await failBookingPayment(orderId)
      return redirectToStatus(request, orderId, 'failed')
    }
  } catch (error) {
    console.error('[ccavenue-callback] Error:', error)
    return redirectToStatus(request, '', 'error')
  }
}

function redirectToStatus(request: NextRequest, orderId: string, status: string) {
  const origin = new URL(request.url).origin
  const url = `${origin}/booking/status?gateway=ccavenue&order_id=${orderId}&status=${status}`
  return NextResponse.redirect(url, { status: 303 })
}
