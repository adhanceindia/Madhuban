import { createSupabaseServerClient } from './supabase/server.ts'
import { getDb } from '@/db/client.ts'
import { users } from '@/db/schema/users.ts'
import { eq } from 'drizzle-orm'
import type { User, UserRole } from '@/db/schema/users.ts'

export type SessionUser = {
  id: number
  auth_id: string
  name: string
  email: string
  role: UserRole
}

export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient()
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

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole)
}

export function canAccess(userRole: UserRole, module: string): boolean {
  const permissions: Record<string, UserRole[]> = {
    dashboard: ['super_admin', 'resort_manager', 'front_desk', 'event_manager', 'accountant', 'content_manager'],
    bookings: ['super_admin', 'resort_manager', 'front_desk', 'accountant'],
    rooms: ['super_admin', 'resort_manager'],
    'front-desk': ['super_admin', 'resort_manager', 'front_desk'],
    calendar: ['super_admin', 'resort_manager', 'front_desk'],
    'channel-manager': ['super_admin', 'resort_manager'],
    gallery: ['super_admin', 'resort_manager', 'event_manager', 'content_manager'],
    reviews: ['super_admin', 'resort_manager', 'event_manager', 'content_manager'],
    inquiries: ['super_admin', 'resort_manager', 'front_desk', 'event_manager'],
    content: ['super_admin', 'resort_manager', 'content_manager'],
    analytics: ['super_admin', 'resort_manager', 'accountant'],
    'audit-log': ['super_admin'],
    users: ['super_admin'],
    settings: ['super_admin'],
  }

  const allowed = permissions[module]
  if (!allowed) return false
  return allowed.includes(userRole)
}
