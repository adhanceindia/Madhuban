import { getPaymentConfig } from './lib/payments/resolve-gateway'
async function run() {
  const cfg = await getPaymentConfig()
  console.log("App ID:", cfg.cashfree_app_id)
  console.log("Secret:", cfg.cashfree_secret_key)
}
run().then(() => process.exit(0))
