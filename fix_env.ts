import { getDb } from './db/client'
import { paymentConfig } from './db/schema'
import { eq } from 'drizzle-orm'
async function run() {
  const db = getDb()
  const cfg = await db.select().from(paymentConfig).limit(1)
  const gateways = cfg[0].gateways as any
  gateways.cashfree_environment = 'PROD'
  await db.update(paymentConfig).set({ gateways }).where(eq(paymentConfig.id, 1))
  console.log("Updated to PROD")
}
run().then(() => process.exit(0))
