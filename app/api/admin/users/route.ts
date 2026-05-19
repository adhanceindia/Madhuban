import { apiHandler } from '@/lib/api-handler'
import { listStaffUsers } from '@/db/queries/users-admin'
import { createStaffUser } from '@/lib/admin-users'
import { userCreateSchema } from '@/lib/schemas/users'

export const GET = apiHandler({
  module: 'users',
  handler: async () => {
    return { users: await listStaffUsers() }
  },
})

export const POST = apiHandler({
  module: 'users',
  schema: userCreateSchema,
  audit: { action: 'user.created', entityType: 'user' },
  handler: async ({ body }) => {
    const user = await createStaffUser(body)
    return { user }
  },
})
