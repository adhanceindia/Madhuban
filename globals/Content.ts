import type { GlobalConfig } from 'payload'
import { isAdmin, isAdminOrStaff } from '../src/access'

export const Content: GlobalConfig = {
  slug: 'content',
  access: {
    read: isAdminOrStaff,
    update: isAdmin,
  },
  admin: {
    group: 'Settings',
    description: 'Site-wide editable content — headings, contact info, social links, iCal URLs',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              name: 'hero',
              type: 'group',
              label: 'Hero Section',
              fields: [
                {
                  name: 'tagline',
                  type: 'text',
                  defaultValue:
                    'The most peaceful & lush green premises in Agar Malwa District.',
                },
                {
                  name: 'hero_heading',
                  type: 'text',
                  label: 'Hero Heading',
                  defaultValue: 'Madhuban Garden Resort',
                },
                {
                  name: 'hero_subtext',
                  type: 'textarea',
                  label: 'Hero Subtext',
                },
              ],
            },
            {
              name: 'wedding',
              type: 'group',
              label: 'Wedding Section',
              fields: [
                {
                  name: 'wedding_heading',
                  type: 'text',
                  label: 'Wedding Heading',
                  defaultValue: 'Make your wedding unforgettable',
                },
                {
                  name: 'wedding_description',
                  type: 'textarea',
                  label: 'Wedding Description',
                },
              ],
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              name: 'contact',
              type: 'group',
              label: 'Contact Information',
              fields: [
                {
                  name: 'contact_phone',
                  type: 'text',
                  label: 'Phone Number',
                },
                {
                  name: 'contact_email',
                  type: 'text',
                  label: 'Email Address',
                },
                {
                  name: 'contact_address',
                  type: 'textarea',
                  label: 'Full Address',
                },
                {
                  name: 'whatsapp_number',
                  type: 'text',
                  label: 'WhatsApp Number',
                  admin: {
                    description:
                      'Full number with country code, e.g., 919876543210',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Social Media',
          fields: [
            {
              name: 'social',
              type: 'group',
              label: 'Social Media Links',
              fields: [
                {
                  name: 'instagram_url',
                  type: 'text',
                  label: 'Instagram URL',
                  admin: {
                    description: 'Full URL, e.g., https://instagram.com/madhubangarden',
                  },
                },
                {
                  name: 'facebook_url',
                  type: 'text',
                  label: 'Facebook URL',
                  admin: {
                    description: 'Full URL, e.g., https://facebook.com/madhubangarden',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'OTA Settings',
          fields: [
            {
              name: 'ical',
              type: 'group',
              label: 'iCal Sync URLs',
              admin: {
                description:
                  'These URLs are used to sync room availability with online travel agencies. They are pulled automatically every 30 minutes.',
              },
              fields: [
                {
                  name: 'bookingcom_ical_url',
                  type: 'text',
                  label: 'Booking.com iCal URL',
                  admin: {
                    description:
                      'Go to Booking.com Extranet → Rates & Availability → Sync Calendars → Copy the iCal export URL and paste it here. It usually looks like: https://admin.booking.com/...ical...',
                  },
                },
                {
                  name: 'mmt_ical_url',
                  type: 'text',
                  label: 'MakeMyTrip iCal URL',
                  admin: {
                    description:
                      'Go to MakeMyTrip Extranet → Calendar → Sync → Copy the iCal feed URL and paste it here. Contact MakeMyTrip support if you cannot find it.',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
