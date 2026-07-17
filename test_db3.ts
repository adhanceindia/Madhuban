import { getPaymentConfig } from './lib/payments/resolve-gateway'
async function run() {
  const cfg = await getPaymentConfig()
  console.log("Env:", cfg.cashfree_environment)
}
run().then(() => process.exit(0))
