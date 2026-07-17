import { getDb } from './db/client'
import { media, gallery } from './db/schema'
async function run() {
  const db = getDb()
  const m = await db.select().from(media)
  const g = await db.select().from(gallery)
  console.log("MEDIA:", m.map(x => x.url))
  console.log("GALLERY:", g.map(x => x.image_url))
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); })
