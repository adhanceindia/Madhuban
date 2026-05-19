// Reset + migrate the database from the generated Drizzle SQL.
// WARNING: Drops all existing tables. Use only for fresh setup.

import { config } from 'dotenv'
import postgres from 'postgres'
import { readFileSync } from 'fs'
import { join } from 'path'

config({ path: '.env.local' })

const SQL_FILE = join(process.cwd(), 'db/migrations/0000_careless_next_avengers.sql')

const OLD_PAYLOAD_TABLES = [
  // App tables
  'rooms_amenities',
  'rooms_images',
  'rooms',
  'bookings',
  'inquiries',
  'blocked_dates',
  'gallery',
  'reviews',
  'media',
  'users',
  'audit_log',
  'site_content',
  'payment_config',
  // Payload-specific
  'payload_locked_documents_rels',
  'payload_locked_documents',
  'payload_preferences_rels',
  'payload_preferences',
  'payload_migrations',
  'users_sessions',
]

async function main() {
  const url = process.env.DATABASE_URI
  if (!url) {
    console.error('DATABASE_URI not set')
    process.exit(1)
  }

  const sql = postgres(url, { max: 1 })

  try {
    console.log('Dropping old tables...')
    for (const table of OLD_PAYLOAD_TABLES) {
      try {
        await sql.unsafe(`DROP TABLE IF EXISTS "${table}" CASCADE`)
        console.log(`  ✓ dropped ${table}`)
      } catch (err) {
        console.log(`  - ${table}:`, (err as Error).message)
      }
    }

    console.log('\nDropping old enums (if any)...')
    const enums = await sql<{ typname: string }[]>`
      SELECT typname FROM pg_type
      WHERE typcategory = 'E' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    `
    for (const e of enums) {
      try {
        await sql.unsafe(`DROP TYPE IF EXISTS "${e.typname}" CASCADE`)
        console.log(`  ✓ dropped enum ${e.typname}`)
      } catch {
        // Skip
      }
    }

    console.log('\nApplying new schema...')
    const migrationSql = readFileSync(SQL_FILE, 'utf-8')
    const statements = migrationSql.split('--> statement-breakpoint')

    for (const stmt of statements) {
      const trimmed = stmt.trim()
      if (!trimmed) continue
      await sql.unsafe(trimmed)
    }

    console.log(`  ✓ Applied ${statements.length} statements`)

    console.log('\nVerifying tables...')
    const tables = await sql<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    for (const t of tables) {
      console.log(`  ✓ ${t.table_name}`)
    }

    console.log('\n✓ Migration complete')
  } finally {
    await sql.end()
  }
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
