import { apiHandler } from '@/lib/api-handler'
import { listAllRooms, createRoom, getRoomBySlugAdmin } from '@/db/queries/rooms-admin'
import { roomCreateSchema } from '@/lib/schemas/rooms'

export const GET = apiHandler({
  module: 'rooms',
  handler: async () => {
    return { rooms: await listAllRooms() }
  },
})

export const POST = apiHandler({
  module: 'rooms',
  schema: roomCreateSchema,
  audit: { action: 'room.created', entityType: 'room' },
  handler: async ({ body }) => {
    const existing = await getRoomBySlugAdmin(body.slug)
    if (existing) {
      throw new Error('A room with this slug already exists')
    }
    const room = await createRoom(body)
    return { room }
  },
})
