import { apiHandler } from '@/lib/api-handler'
import { removeManualBlock } from '@/db/queries/calendar'
import { logAudit } from '@/lib/audit'

export const DELETE = apiHandler<unknown, { id: string }>({
  module: 'calendar',
  handler: async ({ params, session }) => {
    const id = parseInt(params.id)
    const ok = await removeManualBlock(id)
    if (!ok) throw new Error('Block not found')

    await logAudit({
      user_id: session.id,
      action: 'blocked_date.removed',
      entity_type: 'blocked_date',
      entity_id: id,
    })

    return { ok: true }
  },
})
