// One-off: insert a users row linked to an existing Supabase Auth user.
// Usage: npx tsx scripts/insert-user-row.ts

import { config } from 'dotenv'
import postgres from 'postgres'

config({ path: '.env.local' })

const AUTH_ID = 'c00291f3-621f-4b66-95de-1d67eae27ec6'
const EMAIL = 'admin@madhubangarden.com'
const NAME = 'Admin'
const ROLE = 'super_admin' as const

async function main() {
  const dbUrl = process.env.DATABASE_URI!
  const sql = postgres(dbUrl, { max: 1 })

  try {
    const existing = await sql<{ id: number; role: string }[]>`
      SELECT id, role FROM users WHERE auth_id = ${AUTH_ID} LIMIT 1
    `

    if (existing.length > 0) {
      await sql`
        UPDATE users
        SET name = ${NAME}, email = ${EMAIL}, role = ${ROLE}, is_active = true, updated_at = now()
        WHERE auth_id = ${AUTH_ID}
      `
      console.log(`✓ Updated existing users row (id=${existing[0].id}) → role=${ROLE}`)
    } else {
      const [row] = await sql<{ id: number }[]>`
        INSERT INTO users (auth_id, name, email, role, is_active)
        VALUES (${AUTH_ID}, ${NAME}, ${EMAIL}, ${ROLE}, true)
        RETURNING id
      `
      console.log(`✓ Inserted users row (id=${row.id}) → role=${ROLE}`)
    }

    console.log(`\nLogin at /login with: ${EMAIL} + your password from Supabase`)
  } finally {
    await sql.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
