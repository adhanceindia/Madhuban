import type { CollectionConfig } from 'payload'
import { isAdminOrStaff } from '../src/access/index.ts'

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  defaultSort: '-createdAt',
  access: {
    read: isAdminOrStaff,
    create: isAdminOrStaff,
    update: isAdminOrStaff,
    delete: isAdminOrStaff,
  },
  admin: {
    group: 'Management',
    defaultColumns: ['name', 'phone', 'event_type', 'event_date', 'status', 'createdAt'],
    listSearchableFields: ['name', 'phone', 'email'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contact Info',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'phone',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'email',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Event Details',
          fields: [
            {
              name: 'event_type',
              type: 'select',
              required: true,
              options: [
                { label: 'Wedding', value: 'wedding' },
                { label: 'Birthday Party', value: 'birthday' },
                { label: 'Corporate Event', value: 'corporate' },
                { label: 'Other', value: 'other' },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'event_date',
                  type: 'date',
                  admin: {
                    date: {
                      pickerAppearance: 'dayOnly',
                      displayFormat: 'dd MMM yyyy',
                    },
                  },
                },
                {
                  name: 'guests_count',
                  type: 'number',
                  min: 1,
                  label: 'Expected Guests',
                },
              ],
            },
            {
              name: 'message',
              type: 'textarea',
              label: 'Customer Message',
            },
          ],
        },
        {
          label: 'Status & Notes',
          fields: [
            {
              name: 'status',
              type: 'select',
              defaultValue: 'new',
              options: [
                { label: 'New', value: 'new' },
                { label: 'Contacted', value: 'contacted' },
                { label: 'Closed', value: 'closed' },
              ],
              admin: {
                components: {
                  Cell: '/components/admin/StatusBadgeCell',
                },
              },
            },
            {
              name: 'staff_notes',
              type: 'textarea',
              label: 'Staff Notes',
              admin: {
                description:
                  'Internal notes for the team — not visible to customers',
              },
            },
          ],
        },
      ],
    },
  ],
}
