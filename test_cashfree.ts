import { CashfreeGateway } from './lib/payments/cashfree'
import { getPaymentConfig } from './lib/payments/resolve-gateway'

async function run() {
  const cfg = await getPaymentConfig()
  const gw = new CashfreeGateway(cfg)
  
  try {
    const res = await gw.createOrder({
      booking_id: 9999,
      amount_inr: 1,
      room_name: 'Test Room',
      guest_name: 'Test User',
      guest_email: 'test@example.com',
      guest_phone: '9876543210',
      site_url: 'http://localhost:3000'
    })
    console.log("Success:", res)
  } catch(e) {
    console.error("Error:", e.message)
  }
}
run().then(() => process.exit(0))
