import { apiHandler } from '@/lib/api-handler'
import { getStaffUserById } from '@/db/queries/users-admin'
import { resetStaffPassword } from '@/lib/admin-users'
import { passwordResetSchema } from '@/lib/schemas/users'
import { logAudit } from '@/lib/audit'

export const POST = apiHandler({
  module: 'users',
  schema: passwordResetSchema,
  handler: async ({ params, body, session }) => {
    const userId = parseInt((params as Record<string, string>).id)
    const target = await getStaffUserById(userId)
    if (!target) throw new Error('User not found')

    await resetStaffPassword(target.auth_id, body.password)

    await logAudit({
      user_id: session.id,
      action: 'user.password_reset',
      entity_type: 'user',
      entity_id: userId,
    })

    return { ok: true }
  },
})
