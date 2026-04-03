import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrStaff, isAdminFieldLevel } from '../src/access'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  defaultSort: 'is_published',
  access: {
    read: isAdminOrStaff,
    create: isAdminOrStaff,
    update: isAdminOrStaff,
    delete: isAdmin,
  },
  admin: {
    group: 'Management',
    defaultColumns: ['guest_name', 'rating', 'source', 'is_published', 'createdAt'],
  },
  fields: [
    {
      name: 'guest_name',
      type: 'text',
      required: true,
      label: 'Guest Name',
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      label: 'Rating (1-5)',
      admin: {
        components: {
          Cell: '/components/admin/StarRatingCell',
        },
      },
    },
    {
      name: 'review_text',
      type: 'textarea',
      required: true,
      label: 'Review Text',
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: [
        { label: 'Google', value: 'google' },
        { label: 'Manual', value: 'manual' },
      ],
    },
    {
      name: 'is_published',
      type: 'checkbox',
      defaultValue: false,
      access: {
        update: isAdminFieldLevel,
      },
      admin: {
        description: 'Only published reviews are shown on the website',
      },
    },
  ],
}
