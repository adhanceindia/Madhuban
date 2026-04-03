import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

import { getPaymentConfig } from '@/lib/payments/resolve-gateway'
import { CCavenueGateway } from '@/lib/payments/ccavenue'

// ---------------------------------------------------------------------------
// GET /api/payments/initiate/ccavenue?booking_id=123
// Renders an auto-submit HTML form that POSTs to CCAvenue
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const bookingId = request.nextUrl.searchParams.get('booking_id')

    if (!bookingId) {
      return new NextResponse('Missing booking_id', { status: 400 })
    }

    const payload = await getPayload({ config })
    const booking = await payload.findByID({ collection: 'bookings', id: bookingId })

    if (!booking) {
      return new NextResponse('Booking not found', { status: 404 })
    }

    const bookingData = booking as unknown as Record<string, unknown>
    const cfg = await getPaymentConfig()

    const gateway = new CCavenueGateway(cfg)
    const origin = new URL(request.url).origin

    const { encRequest, accessCode, gatewayUrl } = gateway.buildEncryptedRequest({
      orderId: bookingData.gateway_order_id as string,
      amount: bookingData.total_amount as number,
      guestName: bookingData.guest_name as string,
      guestEmail: bookingData.guest_email as string,
      guestPhone: bookingData.guest_phone as string,
      redirectUrl: `${origin}/api/payments/callbacks/ccavenue`,
      cancelUrl: `${origin}/api/payments/callbacks/ccavenue`,
    })

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Redirecting to CCAvenue...</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f9f0; }
    .loader { text-align: center; }
    .spinner { width: 40px; height: 40px; border: 4px solid #d9e2cf; border-top-color: #386a0e; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    p { color: #555; font-size: 14px; }
  </style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <p>Redirecting to CCAvenue for payment...</p>
  </div>
  <form id="ccavForm" method="POST" action="${gatewayUrl}">
    <input type="hidden" name="encRequest" value="${encRequest}" />
    <input type="hidden" name="access_code" value="${accessCode}" />
  </form>
  <script>document.getElementById('ccavForm').submit();</script>
</body>
</html>`

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    })
  } catch (error) {
    console.error('[ccavenue-initiate] Error:', error)
    return new NextResponse('Something went wrong', { status: 500 })
  }
}
