import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrStaff, isAdminFieldLevel } from '../src/access'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  defaultSort: '-check_in',
  access: {
    read: isAdminOrStaff,
    create: isAdminOrStaff,
    update: isAdminOrStaff,
    delete: isAdmin,
  },
  admin: {
    group: 'Main',
    defaultColumns: [
      'id',
      'guest_name',
      'guest_phone',
      'room',
      'check_in',
      'check_out',
      'nights',
      'total_amount',
      'payment_status',
      'source',
      'status',
    ],
    listSearchableFields: ['guest_name', 'guest_phone', 'guest_email'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
  },
  hooks: {
    afterRead: [
      ({ doc }) => {
        if (doc.check_in && doc.check_out) {
          const checkIn = new Date(doc.check_in)
          const checkOut = new Date(doc.check_out)
          const diffMs = checkOut.getTime() - checkIn.getTime()
          doc.nights = Math.max(1, Math.ceil(diffMs / 86400000))
        } else {
          doc.nights = null
        }
        return doc
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Guest Info',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'guest_name',
                  type: 'text',
                  required: true,
                  label: 'Guest Name',
                },
                {
                  name: 'guest_phone',
                  type: 'text',
                  required: true,
                  label: 'Phone',
                  admin: {
                    components: {
                      Cell: '/components/admin/PhoneLinkCell',
                    },
                  },
                },
                {
                  name: 'guest_email',
                  type: 'text',
                  required: true,
                  label: 'Email',
                },
              ],
            },
          ],
        },
        {
          label: 'Booking Details',
          fields: [
            {
              name: 'room',
              type: 'relationship',
              relationTo: 'rooms',
              required: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'check_in',
                  type: 'date',
                  required: true,
                  label: 'Check-in',
                  admin: {
                    date: {
                      pickerAppearance: 'dayOnly',
                      displayFormat: 'dd MMM yyyy',
                    },
                  },
                },
                {
                  name: 'check_out',
                  type: 'date',
                  required: true,
                  label: 'Check-out',
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
                  required: true,
                  label: 'Guests',
                  min: 1,
                },
              ],
            },
            {
              name: 'nights',
              type: 'number',
              label: 'Nights',
              admin: {
                readOnly: true,
                description: 'Auto-computed from check-in and check-out dates',
              },
            },
          ],
        },
        {
          label: 'Payment Info',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'payment_method',
                  type: 'select',
                  required: true,
                  label: 'Payment Method',
                  options: [
                    { label: 'Pay Online', value: 'online' },
                    { label: 'Pay at Reception', value: 'at_reception' },
                  ],
                },
                {
                  name: 'payment_status',
                  type: 'select',
                  defaultValue: 'pending',
                  label: 'Payment Status',
                  options: [
                    { label: 'Pending', value: 'pending' },
                    { label: 'Paid', value: 'paid' },
                    { label: 'Failed', value: 'failed' },
                    { label: 'Refunded', value: 'refunded' },
                  ],
                  access: {
                    update: isAdminFieldLevel,
                  },
                },
              ],
            },
            {
              name: 'total_amount',
              type: 'number',
              min: 0,
              label: 'Total Amount (₹)',
              access: {
                update: isAdminFieldLevel,
              },
              admin: {
                description: 'Total amount in INR (including GST)',
              },
            },
            {
              name: 'gateway_used',
              type: 'select',
              label: 'Payment Gateway',
              admin: {
                description: 'Which gateway processed this transaction',
              },
              options: [
                { label: 'Razorpay', value: 'razorpay' },
                { label: 'PhonePe', value: 'phonepe' },
                { label: 'Cashfree', value: 'cashfree' },
                { label: 'CCAvenue', value: 'ccavenue' },
                { label: 'PayU', value: 'payu' },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'gateway_order_id',
                  type: 'text',
                  label: 'Gateway Order / Txn ID',
                  admin: {
                    readOnly: true,
                    description: 'Auto-filled when payment is initiated',
                  },
                },
                {
                  name: 'gateway_payment_id',
                  type: 'text',
                  label: 'Gateway Payment Ref',
                  admin: {
                    readOnly: true,
                    description: 'Auto-filled on payment success',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'source',
                  type: 'select',
                  defaultValue: 'website',
                  label: 'Booking Source',
                  options: [
                    { label: 'Website', value: 'website' },
                    { label: 'Booking.com', value: 'booking_com' },
                    { label: 'MakeMyTrip', value: 'mmt' },
                    { label: 'Manual Entry', value: 'manual' },
                  ],
                },
                {
                  name: 'status',
                  type: 'select',
                  defaultValue: 'pending',
                  label: 'Booking Status',
                  options: [
                    { label: 'Confirmed', value: 'confirmed' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Cancelled', value: 'cancelled' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
