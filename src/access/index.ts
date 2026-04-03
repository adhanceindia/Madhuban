import type { Access, FieldAccess } from 'payload'

/** Returns true only if the user is an admin */
export const isAdmin: Access = ({ req: { user } }) =>
  user?.role === 'admin'

/** Returns true if the user is admin or staff */
export const isAdminOrStaff: Access = ({ req: { user } }) =>
  ['admin', 'staff'].includes(user?.role)

/** Always deny — used for sections staff must never see */
export const denyAll: Access = () => false

/** Field-level: only admins can update this field */
export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) =>
  user?.role === 'admin'

/** Allow read for admin and staff, but restrict mutations to admin only */
export const adminFullStaffRead = {
  read: isAdminOrStaff,
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
}
