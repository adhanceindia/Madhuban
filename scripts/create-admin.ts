// Usage: npx tsx scripts/create-admin.ts <email> <password> <name> [role]
// Example: npx tsx scripts/create-admin.ts admin@madhubangarden.com Strong#Pass123 "Admin User" super_admin

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'

config({ path: '.env.local' })

type Role = 'super_admin' | 'resort_manager' | 'front_desk' | 'event_manager' | 'accountant' | 'content_manager'

async function main() {
  const [, , emailArg, passwordArg, nameArg, roleArg] = process.argv

  if (!emailArg || !passwordArg || !nameArg) {
    console.error('Usage: npx tsx scripts/create-admin.ts <email> <password> <name> [role]')
    console.error('Roles: super_admin (default), resort_manager, front_desk, event_manager, accountant, content_manager')
    process.exit(1)
  }

  const role = (roleArg as Role) || 'super_admin'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const dbUrl = process.env.DATABASE_URI

  if (!supabaseUrl || !serviceKey || !dbUrl) {
    console.error('Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URI')
    process.exit(1)
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log(`Creating Supabase Auth user for ${emailArg}...`)

  let authId: string
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: emailArg,
    password: passwordArg,
    email_confirm: true,
  })

  if (createError && createError.message.includes('already')) {
    console.log('  - User already exists in Supabase Auth, looking up...')
    const { data: list } = await admin.auth.admin.listUsers()
    const found = list.users.find((u) => u.email === emailArg)
    if (!found) {
      console.error('  ✗ Could not find existing user')
      process.exit(1)
    }
    authId = found.id
    console.log(`  ✓ Found existing auth_id: ${authId}`)
  } else if (createError) {
    console.error('  ✗ Supabase Auth error:', createError.message)
    process.exit(1)
  } else {
    authId = created.user.id
    console.log(`  ✓ Created auth user with id: ${authId}`)
  }

  console.log(`\nInserting users row...`)
  const sql = postgres(dbUrl, { max: 1 })
  try {
    const existing = await sql<{ id: number }[]>`
      SELECT id FROM users WHERE auth_id = ${authId} LIMIT 1
    `
    if (existing.length > 0) {
      await sql`
        UPDATE users
        SET name = ${nameArg}, email = ${emailArg}, role = ${role}, is_active = true, updated_at = now()
        WHERE auth_id = ${authId}
      `
      console.log(`  ✓ Updated existing users row (id=${existing[0].id}) with role=${role}`)
    } else {
      const [row] = await sql<{ id: number }[]>`
        INSERT INTO users (auth_id, name, email, role, is_active)
        VALUES (${authId}, ${nameArg}, ${emailArg}, ${role}, true)
        RETURNING id
      `
      console.log(`  ✓ Inserted users row (id=${row.id}) with role=${role}`)
    }

    console.log('\n✓ Done. You can now log in at /login with:')
    console.log(`  Email:    ${emailArg}`)
    console.log(`  Password: ${passwordArg}`)
    console.log(`  Role:     ${role}`)
  } finally {
    await sql.end()
  }
}

main().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
