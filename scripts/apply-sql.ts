// scripts/apply-sql.ts
import { readFileSync } from 'node:fs'
import postgres from 'postgres'

async function main() {
  const file = process.argv[2]
  if (!file) throw new Error('Usage: tsx scripts/apply-sql.ts <path-to.sql>')
  const sql = postgres(process.env.DATABASE_URI!, { max: 1 })
  try {
    await sql.unsafe(readFileSync(file, 'utf8'))
    console.log(`Applied ${file}`)
  } finally {
    await sql.end()
  }
}
main().catch((e) => { console.error(e); process.exit(1) })
