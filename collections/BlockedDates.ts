import type { CollectionConfig } from 'payload'
import { isAdminOrStaff } from '../src/access/index.ts'

export const BlockedDates: CollectionConfig = {
  slug: 'blocked-dates',
  access: {
    read: isAdminOrStaff,
    create: isAdminOrStaff,
    update: isAdminOrStaff,
    delete: isAdminOrStaff,
  },
  admin: {
    group: 'Management',
    defaultColumns: ['room', 'date', 'source'],
  },
  fields: [
    {
      name: 'room',
      type: 'relationship',
      relationTo: 'rooms',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd/MM/yyyy',
        },
      },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: [
        { label: 'iCal Sync', value: 'ical' },
        { label: 'Manual', value: 'manual' },
      ],
    },
    {
      name: 'ical_uid',
      type: 'text',
      admin: {
        description: 'UID from the iCal event (auto-filled during sync)',
        condition: (_, siblingData) => siblingData?.source === 'ical',
      },
    },
  ],
}
