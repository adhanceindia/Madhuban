import { getDb } from '../db/client.ts'
import fs from 'fs'
import path from 'path'

async function run() {
  try {
    const db = getDb()
    const sql = fs.readFileSync(path.join(process.cwd(), 'db/migrations/0001_stale_doctor_spectrum.sql'), 'utf-8')
    
    // Split by statement-breakpoint if needed, or just execute raw if postgres driver supports multiple commands
    const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s)
    
    console.log('Applying blog migration...')
    for (const stmt of statements) {
      await db.execute(stmt)
    }
    
    console.log('Migration applied successfully!')
    process.exit(0)
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  }
}

run()
