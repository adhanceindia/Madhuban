import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrStaff } from '../src/access'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  defaultSort: 'sort_order',
  access: {
    read: isAdminOrStaff,
    create: isAdminOrStaff,
    update: isAdminOrStaff,
    delete: isAdmin,
  },
  admin: {
    group: 'Management',
    defaultColumns: ['image', 'caption', 'category', 'sort_order'],
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Rooms', value: 'rooms' },
        { label: 'Wedding', value: 'wedding' },
        { label: 'Events', value: 'events' },
        { label: 'Pool', value: 'pool' },
        { label: 'Restaurant', value: 'restaurant' },
      ],
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'sort_order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Lower numbers appear first',
      },
    },
  ],
}
