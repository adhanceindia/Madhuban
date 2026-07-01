import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index.ts'

let _client: ReturnType<typeof postgres> | null = null
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDb() {
  if (!_db) {
    const isBuild = process.env.npm_lifecycle_event === 'build' || process.env.NEXT_PHASE === 'phase-production-build'
    
    // In Vercel build environments, Supabase connections often hang due to IP blocks.
    // Since Phase 1 uses dummy data for static builds, we can just fail fast.
    if (isBuild && !process.env.FORCE_DB_DURING_BUILD) {
      throw new Error('Database connections are disabled during build to prevent Vercel 60s timeouts.')
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
