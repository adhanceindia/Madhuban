import { getDb } from './db/client'
import { rooms } from './db/schema'
async function run() {
  const db = getDb()
  const allRooms = await db.select().from(rooms).limit(1)
  console.log(allRooms[0].id)
}
run().then(() => process.exit(0))
