import { getDb } from './db/client'
import { rooms } from './db/schema'
import { eq } from 'drizzle-orm'
async function run() {
  const db = getDb()
  const allRooms = await db.select().from(rooms).where(eq(rooms.slug, 'executive-king-bed')).limit(1)
  console.log(allRooms[0].price_per_night)
}
run().then(() => process.exit(0))
