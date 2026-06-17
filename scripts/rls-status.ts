// scripts/rls-status.ts
// Read-only RLS/grants status for the public tables. Prints METADATA ONLY (no row
// data / no PII). Safe to run before and after applying 9999_enable_rls.sql.
//   npx tsx --require ./scripts/preload.cjs scripts/rls-status.ts
import postgres from 'postgres'

const TABLES = [
  'audit_log', 'blocked_dates', 'bookings', 'gallery', 'inquiries',
  'media', 'payment_config', 'reviews', 'rooms', 'site_content', 'users',
]

async function main() {
  const sql = postgres(process.env.DATABASE_URI!, { max: 1 })
  try {
    const [who] = await sql`
      select current_user as user,
             (select rolbypassrls from pg_roles where rolname = current_user) as bypassrls
    `
    console.log(`connected as: ${who.user}  bypassrls=${who.bypassrls}`)
    console.log('table            rls_enabled  owner            anon/auth_grants')
    console.log('---------------- -----------  ---------------- ----------------')
    for (const t of TABLES) {
      const [r] = await sql`
        select c.relrowsecurity as rls, pg_get_userbyid(c.relowner) as owner,
          (select count(*) from information_schema.role_table_grants g
             where g.table_schema='public' and g.table_name=${t}
               and g.grantee in ('anon','authenticated')) as grants
        from pg_class c join pg_namespace n on n.oid=c.relnamespace
        where n.nspname='public' and c.relname=${t} and c.relkind='r'
      `
      if (!r) { console.log(`${t.padEnd(16)} (table not found)`); continue }
      console.log(`${t.padEnd(16)} ${String(r.rls).padEnd(11)}  ${String(r.owner).padEnd(16)} ${r.grants}`)
    }
  } finally {
    await sql.end()
  }
}
main().catch((e) => { console.error(e); process.exit(1) })
