import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminFieldLevel } from '../src/access/index.ts'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    group: 'System',
    useAsTitle: 'name',
    hidden: ({ user }) => user?.role !== 'admin',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'staff',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Staff', value: 'staff' },
      ],
      access: {
        update: isAdminFieldLevel,
      },
    },
  ],
}
