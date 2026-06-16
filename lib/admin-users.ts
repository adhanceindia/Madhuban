import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { getDb } from '@/db/client'
import { users } from '@/db/schema'
import { eq, count, and } from 'drizzle-orm'
import type { UserRole, User } from '@/db/schema/users'

/**
 * Admin-only helpers for creating/updating Supabase Auth users alongside
 * the matching `users` table row. All functions require service-role key
 * and should only be called from server code that's already auth-gated.
 */

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Supabase service credentials missing')
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function createStaffUser(input: {
  email: string
  password: string
  name: string
  role: UserRole
}): Promise<User> {
  const admin = getAdminClient()
  const db = getDb()

  // 1. Create Supabase Auth user (idempotent — reuse existing if email matches)
  let authId: string
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  })

  if (createError) {
    if (createError.message.toLowerCase().includes('already')) {
      // Find existing
      const { data: list } = await admin.auth.admin.listUsers()
      const found = list.users.find((u) => u.email === input.email)
      if (!found) throw new Error('User exists but could not be found')
      authId = found.id
    } else {
      throw new Error(createError.message)
    }
  } else {
    authId = created.user.id
  }

  // 2. Upsert users row
  const existing = await db.select().from(users).where(eq(users.auth_id, authId)).limit(1)
  if (existing.length > 0) {
    const [updated] = await db
      .update(users)
      .set({
        name: input.name,
        email: input.email,
        role: input.role,
        is_active: true,
        updated_at: new Date(),
      })
      .where(eq(users.auth_id, authId))
      .returning()
    return updated
  }

  const [inserted] = await db
    .insert(users)
    .values({
      auth_id: authId,
      name: input.name,
      email: input.email,
      role: input.role,
      is_active: true,
    })
    .returning()
  return inserted
}

export async function updateStaffUser(
  id: number,
  input: { name?: string; role?: UserRole; is_active?: boolean },
): Promise<User | null> {
  const db = getDb()
  const [updated] = await db
    .update(users)
    .set({ ...input, updated_at: new Date() })
    .where(eq(users.id, id))
    .returning()
  return updated || null
}

export async function resetStaffPassword(authId: string, newPassword: string): Promise<void> {
  const admin = getAdminClient()
  const { error } = await admin.auth.admin.updateUserById(authId, { password: newPassword })
  if (error) throw new Error(error.message)
}

export async function deleteStaffUser(id: number): Promise<boolean> {
  const db = getDb()
  const [existing] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  if (!existing) return false

  const admin = getAdminClient()
  // Best-effort delete Supabase Auth user (may fail if already gone)
  try {
    await admin.auth.admin.deleteUser(existing.auth_id)
  } catch {
    // Continue regardless
  }

  const result = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id })
  return result.length > 0
}

/**
 * Revoke all active sessions for a Supabase Auth user (e.g. on deactivation or
 * role change). Best-effort: failures are swallowed because per-request
 * getSession() already re-checks is_active/role, so this is defense-in-depth.
 */
export async function signOutAllSessions(authId: string): Promise<void> {
  const admin = getAdminClient()
  try {
    await admin.auth.admin.signOut(authId, 'global')
  } catch {
    // best-effort
  }
}

export async function countActiveSuperAdmins(): Promise<number> {
  const db = getDb()
  const [{ value }] = await db
    .select({ value: count() })
    .from(users)
    .where(and(eq(users.role, 'super_admin'), eq(users.is_active, true)))
  return value
}
