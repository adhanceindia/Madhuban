import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrStaff } from '../src/access/index.ts'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'System',
  },
  upload: {
    mimeTypes: ['image/*'],
  },
  access: {
    read: isAdminOrStaff,
    create: isAdminOrStaff,
    update: isAdminOrStaff,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Describe the image for accessibility',
      },
    },
  ],
}
