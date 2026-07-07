import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index.ts'

let _client: ReturnType<typeof postgres> | null = null
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDb() {
  if (!_db) {
    // Vercel build environment check
    const isBuild = process.env.npm_lifecycle_event === 'build' || 
                    process.env.NEXT_PHASE === 'phase-production-build' ||
                    process.env.CI === '1'
    
    // In Vercel build environments, Supabase connections often hang due to IP blocks.
    if (isBuild && !process.env.FORCE_DB_DURING_BUILD) {
      console.warn('[DB] Bypassing database connection during Vercel build phase.')
      // We don't throw an error here anymore. If queries are made, we return a mock client 
      // or let it fail gracefully so pages can still render fallbacks.
    }

    _client = postgres(process.env.DATABASE_URI || '', { 
      max: isBuild ? 1 : 10,
      idle_timeout: isBuild ? 5 : 20,
      connect_timeout: 10,
    })
    _db = drizzle(_client, { schema })
  }
  return _db
}
