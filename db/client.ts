import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index.ts'

let _client: ReturnType<typeof postgres> | null = null
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDb() {
  if (!_db) {
    _client = postgres(process.env.DATABASE_URI!, { max: 10 })
    _db = drizzle(_client, { schema })
  }
  return _db
}
