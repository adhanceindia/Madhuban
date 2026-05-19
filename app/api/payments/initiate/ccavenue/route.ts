import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/db/client'
import { bookings } from '@/db/schema'
import { eq } from 'drizzle-orm'

import { getPaymentConfig } from '@/lib/payments/resolve-gateway'
import { CCavenueGateway } from '@/lib/payments/ccavenue'

export async function GET(request: NextRequest) {
  try {
    const bookingId = request.nextUrl.searchParams.get('booking_id')

    if (!bookingId) {
      return new NextResponse('Missing booking_id', { status: 400 })
    }

    const db = getDb()
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(bookingId)))
      .limit(1)

    if (!booking || !booking.gateway_order_id) {
      return new NextResponse('Booking not found', { status: 404 })
    }

    const cfg = await getPaymentConfig()
    const gateway = new CCavenueGateway(cfg)
    const origin = new URL(request.url).origin

    const { encRequest, accessCode, gatewayUrl } = gateway.buildEncryptedRequest({
      orderId: booking.gateway_order_id,
      amount: booking.total_amount || 0,
      guestName: booking.guest_name,
      guestEmail: booking.guest_email,
      guestPhone: booking.guest_phone,
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
