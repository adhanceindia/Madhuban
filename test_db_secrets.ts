import { getPaymentConfig } from './lib/payments/resolve-gateway'
async function run() {
  try {
    const cfg = await getPaymentConfig()
    console.log("App ID:", cfg.cashfree_app_id)
    console.log("Secret Length:", cfg.cashfree_secret_key?.length || 0)
    console.log("Env:", cfg.cashfree_environment)
  } catch(e) {
    console.error("Error reading config:", e.message)
  }
}
run().then(() => process.exit(0))
