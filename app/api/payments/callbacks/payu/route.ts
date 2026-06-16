import { NextRequest, NextResponse } from 'next/server'

import { getPaymentConfig } from '@/lib/payments/resolve-gateway'
import { verifyPayUReverseHash } from '@/lib/payments/payu'
import { confirmBookingPayment, failBookingPayment } from '@/lib/payments/common'

// ---------------------------------------------------------------------------
// POST /api/payments/callbacks/payu
// PayU POSTs form data to surl (success) or furl (failure)
// We use a single endpoint for both and check the status field.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const status = (formData.get('status') as string) || ''
    const txnid = (formData.get('txnid') as string) || ''
    const hash = (formData.get('hash') as string) || ''
    const mihpayid = (formData.get('mihpayid') as string) || ''
    const amount = (formData.get('amount') as string) || ''
    const productinfo = (formData.get('productinfo') as string) || ''
    const firstname = (formData.get('firstname') as string) || ''
    const email = (formData.get('email') as string) || ''
    const udf1 = (formData.get('udf1') as string) || ''
    const additionalCharges = (formData.get('additionalCharges') as string) || ''

    const cfg = await getPaymentConfig()

    if (!cfg.payu_merchant_salt || !cfg.payu_merchant_key) {
      console.error('[payu-callback] Credentials not configured')
      return redirectToStatus(request, txnid, 'error')
    }

    // Verify reverse hash
    const isValid = verifyPayUReverseHash(
      {
        key: cfg.payu_merchant_key,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        status,
        udf1,
        additionalCharges: additionalCharges || undefined,
      },
      cfg.payu_merchant_salt,
      hash,
    )

    if (!isValid) {
      console.error('[payu-callback] Invalid hash')
      return redirectToStatus(request, txnid, 'error')
    }

    if (status === 'success') {
      await confirmBookingPayment({
        gateway_order_id: txnid,
        gateway_payment_id: mihpayid,
        gateway_name: 'payu',
        paid_amount_inr: Number(amount),
      })
      return redirectToStatus(request, txnid, 'success')
    } else {
      // failure, pending, etc.
      await failBookingPayment(txnid)
      return redirectToStatus(request, txnid, 'failed')
    }
  } catch (error) {
    console.error('[payu-callback] Error:', error)
    return redirectToStatus(request, '', 'error')
  }
}

function redirectToStatus(request: NextRequest, orderId: string, status: string) {
  const origin = new URL(request.url).origin
  const url = `${origin}/booking/status?gateway=payu&order_id=${orderId}&status=${status}`
  return NextResponse.redirect(url, { status: 303 })
}
