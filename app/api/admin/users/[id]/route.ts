import { apiHandler } from '@/lib/api-handler'
import { getStaffUserById } from '@/db/queries/users-admin'
import { updateStaffUser, deleteStaffUser, countActiveSuperAdmins } from '@/lib/admin-users'
import { userUpdateSchema } from '@/lib/schemas/users'
import { logAudit } from '@/lib/audit'

export const GET = apiHandler<unknown, { id: string }>({
  module: 'users',
  handler: async ({ params }) => {
    const user = await getStaffUserById(parseInt(params.id))
    if (!user) throw new Error('User not found')
    return { user }
  },
})

export const PATCH = apiHandler({
  module: 'users',
  schema: userUpdateSchema,
  handler: async ({ params, body, session }) => {
    const userId = parseInt((params as Record<string, string>).id)
    const existing = await getStaffUserById(userId)
    if (!existing) throw new Error('User not found')

    // Guardrails: cannot edit self
    if (existing.id === session.id) {
      throw new Error('You cannot edit your own account from this screen')
    }

    // Guardrails: cannot demote/deactivate the last super_admin
    if (existing.role === 'super_admin') {
      const wouldChangeRole = body.role !== undefined && body.role !== 'super_admin'
      const wouldDeactivate = body.is_active === false
      if (wouldChangeRole || wouldDeactivate) {
        const activeCount = await countActiveSuperAdmins()
        if (activeCount <= 1) {
          throw new Error('Cannot demote or deactivate the last super admin')
        }
      }
    }

    const updated = await updateStaffUser(userId, body)
    await logAudit({
      user_id: session.id,
      action: 'user.updated',
      entity_type: 'user',
      entity_id: userId,
      old_value: existing as unknown as Record<string, unknown>,
      new_value: body as Record<string, unknown>,
    })

    return { user: updated }
  },
})

export const DELETE = apiHandler<unknown, { id: string }>({
  module: 'users',
  handler: async ({ params, session }) => {
    const userId = parseInt(params.id)
    if (userId === session.id) throw new Error('You cannot delete your own account')

    const existing = await getStaffUserById(userId)
    if (!existing) throw new Error('User not found')

    if (existing.role === 'super_admin') {
      const activeCount = await countActiveSuperAdmins()
      if (activeCount <= 1) {
        throw new Error('Cannot delete the last super admin')
      }
    }

    const ok = await deleteStaffUser(userId)
    if (!ok) throw new Error('Delete failed')

    await logAudit({
      user_id: session.id,
      action: 'user.deleted',
      entity_type: 'user',
      entity_id: userId,
      old_value: existing as unknown as Record<string, unknown>,
    })

    return { ok: true }
  },
})
