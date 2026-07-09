import { z } from 'zod'

const roleEnum = z.enum([
  'super_admin',
  'resort_manager',
  'front_desk',
  'event_manager',
  'accountant',
  'content_manager',
  'customer',
])

export const strongPassword = z
  .string()
  .min(12, 'Use at least 12 characters')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/[0-9]/, 'Include a number')
  .regex(/[^A-Za-z0-9]/, 'Include a symbol')

export const userCreateSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: strongPassword,
  name: z.string().min(1, 'Name is required'),
  role: roleEnum,
})

export const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  role: roleEnum.optional(),
  is_active: z.boolean().optional(),
})

export const passwordResetSchema = z.object({
  password: strongPassword,
})

export type UserCreateInput = z.infer<typeof userCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>

export const ROLE_LABELS: Record<z.infer<typeof roleEnum>, string> = {
  super_admin: 'Super Admin',
  resort_manager: 'Resort Manager',
  front_desk: 'Front Desk',
  event_manager: 'Event Manager',
  accountant: 'Accountant',
  content_manager: 'Content Manager',
  customer: 'Customer',
}
