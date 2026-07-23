import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function cleanupTestAccounts() {
  console.log('--- Scheduled Cleanup: Orphaned Test Accounts ---')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const dbUrl = process.env.DATABASE_URI

  if (!supabaseUrl || !serviceKey || !dbUrl) {
    console.error('Missing required environment variables')
    process.exit(1)
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  
  const sql = postgres(dbUrl, { max: 1 })

  try {
    let hasMore = true
    let page = 1
    let deletedCount = 0
    const now = new Date()
    const ONE_DAY_MS = 24 * 60 * 60 * 1000

    while (hasMore) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
      if (error) throw error

      if (data.users.length === 0) {
        hasMore = false
        break
      }

      for (const user of data.users) {
        if (!user.email?.startsWith('playwright-ci-') || !user.email.endsWith('@madhubangarden.com')) {
          continue
        }

        const createdAt = new Date(user.created_at)
        const ageMs = now.getTime() - createdAt.getTime()

        if (ageMs > ONE_DAY_MS) {
          console.log(`Deleting orphan: ${user.email} (created ${user.created_at})`)
          
          // Mimic global-teardown deletion order
          await sql`DELETE FROM audit_log WHERE user_id = (SELECT id FROM users WHERE auth_id = ${user.id} LIMIT 1)`
          await sql`DELETE FROM users WHERE auth_id = ${user.id}`
          await admin.auth.admin.deleteUser(user.id)
          
          deletedCount++
        }
      }

      if (data.users.length < 1000) {
        hasMore = false
      } else {
        page++
      }
    }

    console.log(`\nCleanup complete. Total orphaned accounts deleted: ${deletedCount}`)
  } catch (error) {
    console.error('Cleanup failed:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

cleanupTestAccounts()
