import postgres from 'postgres'
import fs from 'fs'
import path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = postgres(process.env.DATABASE_URI)

async function run() {
  try {
    const migration = fs.readFileSync('db/migrations/0002_odd_manta.sql', 'utf-8')
    console.log('Running migration:')
    console.log(migration)
    
    // We split by statement-breakpoint if needed, but drizzle-kit puts '--> statement-breakpoint'
    const statements = migration.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean)
    
    for (const stmt of statements) {
      console.log('Executing:', stmt)
      try {
        await sql.unsafe(stmt)
      } catch (err) {
        console.warn('Ignored error:', err.message)
      }
    }
    console.log('Done!')
  } catch (err) {
    console.error(err)
  } finally {
    await sql.end()
  }
}

run()
