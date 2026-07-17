import 'server-only'
import { createSupabaseServerClient } from './supabase/server.ts'
import { getDb } from '@/db/client.ts'
import { users } from '@/db/schema/users.ts'
import { eq } from 'drizzle-orm'
import type { UserRole } from '@/db/schema/users.ts'
import type { AuthContext } from './supabase/client.ts'

export { hasRole, canAccess } from './permissions.ts'

export type SessionUser = {
  id: number
  auth_id: string
  name: string
  email: string
  role: UserRole
}

export async function getSession(context: AuthContext): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient(context)
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) return null

  const db = getDb()
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.auth_id, authUser.id))
    .limit(1)

  if (!dbUser || !dbUser.is_active) return null

  return {
    id: dbUser.id,
    auth_id: dbUser.auth_id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
  }
}
