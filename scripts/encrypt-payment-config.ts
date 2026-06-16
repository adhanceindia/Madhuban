// One-off migration: encrypt plaintext gateway secret fields in payment_config.
//
// Run AFTER setting ENCRYPTION_KEY in .env.local:
//   npx tsx --require ./scripts/preload.cjs scripts/encrypt-payment-config.ts
//
// Idempotent: values already in the `v1:` envelope are skipped, so it is safe
// to run more than once. Empty/missing fields are left untouched.

import { config } from 'dotenv'
import postgres from 'postgres'
import { encryptSecret } from '../lib/crypto'

config({ path: '.env.local' })

// Must mirror SECRET_FIELDS in app/api/admin/settings/payment/route.ts and
// lib/payments/resolve-gateway.ts.
const SECRET_FIELDS = [
  'razorpay_key_secret',
  'razorpay_webhook_secret',
  'phonepe_client_secret',
  'phonepe_webhook_password',
  'cashfree_secret_key',
  'ccavenue_working_key',
  'payu_merchant_salt',
] as const

async function main() {
  if (!process.env.ENCRYPTION_KEY) {
    console.error('ENCRYPTION_KEY not set. Aborting.')
    process.exit(1)
  }

  const url = process.env.DATABASE_URI
  if (!url) {
    console.error('DATABASE_URI not set. Aborting.')
    process.exit(1)
  }

  const sql = postgres(url, { max: 1 })
  try {
    const rows = await sql<{ id: number; gateways: Record<string, unknown> | null }[]>`
      SELECT id, gateways FROM payment_config
    `
    if (rows.length === 0) {
      console.log('No payment_config rows found. Nothing to do.')
      return
    }

    for (const row of rows) {
      const gateways = { ...(row.gateways || {}) }
      let changed = false

      for (const field of SECRET_FIELDS) {
        const value = gateways[field]
        if (typeof value === 'string' && value.length > 0 && !value.startsWith('v1:')) {
          gateways[field] = encryptSecret(value)
          changed = true
          console.log(`  row ${row.id}: encrypted ${field}`)
        }
      }

      if (changed) {
        await sql`
          UPDATE payment_config
          SET gateways = ${sql.json(gateways as Parameters<typeof sql.json>[0])}, updated_at = now()
          WHERE id = ${row.id}
        `
        console.log(`✓ updated row ${row.id}`)
      } else {
        console.log(`- row ${row.id}: nothing to encrypt`)
      }
    }

    console.log('\n✓ Encryption migration complete')
  } finally {
    await sql.end()
  }
}

main().catch((err) => {
  console.error('Encryption migration failed:', err)
  process.exit(1)
})
