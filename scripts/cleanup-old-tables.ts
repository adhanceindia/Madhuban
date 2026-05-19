import { config } from 'dotenv'
import postgres from 'postgres'

config({ path: '.env.local' })

async function main() {
  const sql = postgres(process.env.DATABASE_URI!, { max: 1 })
  const toDrop = ['content_hero_hero_images', 'content', 'rooms_rels', 'payload_kv']

  for (const t of toDrop) {
    try {
      await sql.unsafe(`DROP TABLE IF EXISTS "${t}" CASCADE`)
      console.log(`✓ dropped ${t}`)
    } catch (e) {
      console.log(`- ${t}:`, (e as Error).message)
    }
  }

  const tables = await sql<{ table_name: string }[]>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `
  console.log('\nFinal tables:')
  for (const t of tables) console.log(`  ${t.table_name}`)

  await sql.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
