import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/db/client'
import { bookings, rooms } from '@/db/schema'
import { eq } from 'drizzle-orm'

import { getPaymentConfig } from '@/lib/payments/resolve-gateway'
import { PayUGateway } from '@/lib/payments/payu'

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

    const [room] = await db.select().from(rooms).where(eq(rooms.id, booking.room_id)).limit(1)
    const roomName = room?.name || 'Room Booking'

    const cfg = await getPaymentConfig()
    const gateway = new PayUGateway(cfg)
    const origin = new URL(request.url).origin
    const callbackUrl = `${origin}/api/payments/callbacks/payu`

    const fields = gateway.buildFormFields({
      txnid: booking.gateway_order_id,
      amount: booking.total_amount || 0,
      productinfo: `${roomName} — Madhuban Garden Resort`,
      firstname: booking.guest_name,
      email: booking.guest_email,
      phone: booking.guest_phone,
      surl: callbackUrl,
      furl: callbackUrl,
      udf1: String(booking.id),
    })

    const { action, ...hiddenFields } = fields

    const inputs = Object.entries(hiddenFields)
      .map(([name, value]) => `<input type="hidden" name="${name}" value="${escapeHtml(value)}" />`)
      .join('\n    ')

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Redirecting to PayU...</title>
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
    <p>Redirecting to PayU for payment...</p>
  </div>
  <form id="payuForm" method="POST" action="${action}">
    ${inputs}
  </form>
  <script>document.getElementById('payuForm').submit();</script>
</body>
</html>`

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    })
  } catch (error) {
    console.error('[payu-initiate] Error:', error)
    return new NextResponse('Something went wrong', { status: 500 })
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
