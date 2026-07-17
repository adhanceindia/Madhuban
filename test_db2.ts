import { getPaymentConfig } from './lib/payments/resolve-gateway'
async function run() {
  const cfg = await getPaymentConfig()
  console.log("App ID:", cfg.cashfree_app_id)
  console.log("Secret Key Length:", cfg.cashfree_secret_key?.length || 0)
}
run().then(() => process.exit(0))
