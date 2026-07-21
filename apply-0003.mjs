// One-shot runner for db/migrations/0003_channel_manager.sql.
// Usage: node apply-0003.mjs   (reads DATABASE_URI from .env.local)
//
// Splits on drizzle's `--> statement-breakpoint` and runs each statement.
// Errors are logged but do not abort — re-running is idempotent for the
// CREATE TABLE because the table already exists, but RLS statements are
// safe to repeat. For a clean re-run, drop the table first.
import postgres from 'postgres'
import fs from 'fs'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = postgres(process.env.DATABASE_URI)

async function run() {
  try {
    const migration = fs.readFileSync('db/migrations/0003_channel_manager.sql', 'utf-8')
    console.log('Running migration: 0003_channel_manager')
    const statements = migration
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter(Boolean)

    for (const stmt of statements) {
      console.log('Executing:', stmt.split('\n')[0] + (stmt.length > 80 ? ' …' : ''))
      try {
        await sql.unsafe(stmt)
      } catch (err) {
        console.warn('Ignored error:', err.message)
      }
    }
    console.log('Done!')
  } catch (err) {
    console.error(err)
    process.exitCode = 1
  } finally {
    await sql.end()
  }
}

run()
