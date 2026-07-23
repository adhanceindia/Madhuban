import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

import { getTestUsers } from './utils'

async function globalSetup() {
  const TEST_USERS = getTestUsers()
  process.env.TEST_USERS = JSON.stringify(TEST_USERS)
  console.log('--- Global Setup: Creating Test Accounts ---')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const dbUrl = process.env.DATABASE_URI!

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  
  const sql = postgres(dbUrl, { max: 1 })

  try {
    for (const testUser of TEST_USERS) {
      console.log(`Setting up ${testUser.role}: ${testUser.email}`)
      let authId: string

      // Check if user already exists
      const { data: list } = await admin.auth.admin.listUsers()
      const found = list.users.find((u) => u.email === testUser.email)
      
      if (found) {
        authId = found.id
        // Ensure password is correct
        await admin.auth.admin.updateUserById(authId, { password: testUser.password })
      } else {
        const { data: created, error } = await admin.auth.admin.createUser({
          email: testUser.email,
          password: testUser.password,
          email_confirm: true,
        })
        if (error) throw error
        authId = created.user.id
      }

      const existing = await sql`SELECT id FROM users WHERE auth_id = ${authId} LIMIT 1`
      if (existing.length > 0) {
        await sql`
          UPDATE users
          SET name = ${testUser.name}, role = ${testUser.role}, is_active = true, updated_at = now()
          WHERE auth_id = ${authId}
        `
      } else {
        await sql`
          INSERT INTO users (auth_id, name, email, role, is_active)
          VALUES (${authId}, ${testUser.name}, ${testUser.email}, ${testUser.role}, true)
        `
      }
    }
  } finally {
    await sql.end()
  }
  
  console.log('--- Global Setup: Done ---')
}

export default globalSetup
