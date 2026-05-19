import { apiHandler } from '@/lib/api-handler'
import { getRoomById, updateRoom, deleteRoom } from '@/db/queries/rooms-admin'
import { roomUpdateSchema } from '@/lib/schemas/rooms'
import { logAudit } from '@/lib/audit'

export const GET = apiHandler<unknown, { id: string }>({
  module: 'rooms',
  handler: async ({ params }) => {
    const room = await getRoomById(parseInt(params.id))
    if (!room) throw new Error('Room not found')
    return { room }
  },
})

export const PATCH = apiHandler({
  module: 'rooms',
  schema: roomUpdateSchema,
  handler: async ({ params, body, session }) => {
    const roomId = parseInt((params as Record<string, string>).id)
    const existing = await getRoomById(roomId)
    if (!existing) throw new Error('Room not found')

    const updated = await updateRoom(roomId, body)

    await logAudit({
      user_id: session.id,
      action: 'room.updated',
      entity_type: 'room',
      entity_id: roomId,
      old_value: existing as unknown as Record<string, unknown>,
      new_value: body as Record<string, unknown>,
    })

    return { room: updated }
  },
})

export const DELETE = apiHandler<unknown, { id: string }>({
  module: 'rooms',
  handler: async ({ params, session }) => {
    const roomId = parseInt(params.id)
    const existing = await getRoomById(roomId)
    if (!existing) throw new Error('Room not found')

    const ok = await deleteRoom(roomId)
    if (!ok) throw new Error('Delete failed')

    await logAudit({
      user_id: session.id,
      action: 'room.deleted',
      entity_type: 'room',
      entity_id: roomId,
      old_value: existing as unknown as Record<string, unknown>,
    })

    return { ok: true }
  },
})
