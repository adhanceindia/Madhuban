import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrStaff } from '../src/access/index.ts'

export const Rooms: CollectionConfig = {
  slug: 'rooms',
  access: {
    read: isAdminOrStaff,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    group: 'Main',
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'price_per_night', 'capacity', 'is_active'],
    listSearchableFields: ['name', 'slug'],
  },
  fields: [
    {
      name: 'view_on_site',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/ViewOnSiteLink',
        },
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier (e.g., deluxe-room-1)',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Standard', value: 'standard' },
        { label: 'Deluxe', value: 'deluxe' },
        { label: 'Suite', value: 'suite' },
      ],
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'price_per_night',
          type: 'number',
          required: true,
          min: 0,
          label: 'Price per Night (₹)',
          admin: {
            description: 'Price in INR',
          },
        },
        {
          name: 'capacity',
          type: 'number',
          required: true,
          min: 1,
          label: 'Max Guests',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'bed_type',
          type: 'text',
          admin: {
            description: 'e.g., King, Queen, Twin',
          },
        },
        {
          name: 'room_size',
          type: 'text',
          admin: {
            description: 'e.g., 350 sq ft',
          },
        },
      ],
    },
    {
      name: 'amenities',
      type: 'array',
      fields: [
        {
          name: 'amenity',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Only active rooms are shown on the website',
      },
    },
  ],
}
