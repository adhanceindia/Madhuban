// scripts/db-counts.ts
// PII-free read sanity check: row counts (numbers only) + per-query latency via
// the app's owner connection. Confirms reads work through RLS and measures latency.
//   npx tsx --require ./scripts/preload.cjs scripts/db-counts.ts
import postgres from 'postgres'

const TABLES = ['rooms', 'bookings', 'inquiries', 'reviews', 'gallery', 'site_content', 'users']

async function main() {
  const sql = postgres(process.env.DATABASE_URI!, { max: 1 })
  try {
    for (const t of TABLES) {
      const start = Date.now()
      const [{ n }] = await sql.unsafe(`select count(*)::int as n from public.${t}`)
      console.log(`${t.padEnd(14)} count=${String(n).padStart(5)}  (${Date.now() - start} ms)`)
    }
  } finally {
    await sql.end()
  }
}
main().catch((e) => { console.error(e); process.exit(1) })
