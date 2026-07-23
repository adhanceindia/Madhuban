import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { getTestUsers } from './utils'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function globalTeardown() {
  console.log('--- Global Teardown: Deleting Test Accounts ---')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const dbUrl = process.env.DATABASE_URI!

  const testUsers = getTestUsers()

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  
  const sql = postgres(dbUrl, { max: 1 })

  try {
    for (const testUser of testUsers) {
      console.log(`Cleaning up ${testUser.email}`)
      const { data: list } = await admin.auth.admin.listUsers()
      const found = list.users.find((u) => u.email === testUser.email)
      
      if (found) {
        await sql`DELETE FROM audit_log WHERE user_id = (SELECT id FROM users WHERE auth_id = ${found.id} LIMIT 1)`
        await sql`DELETE FROM users WHERE auth_id = ${found.id}`
        await admin.auth.admin.deleteUser(found.id)
      }
    }
  } finally {
    await sql.end()
  }
  
  console.log('--- Global Teardown: Done ---')
}

export default globalTeardown
