import type { UserRole } from '@/db/schema/users'

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
    blog: ['super_admin', 'resort_manager', 'content_manager'],
    analytics: ['super_admin', 'resort_manager', 'accountant'],
    'audit-log': ['super_admin'],
    users: ['super_admin'],
    settings: ['super_admin'],
  }

  const allowed = permissions[module]
  if (!allowed) return false
  return allowed.includes(userRole)
}
