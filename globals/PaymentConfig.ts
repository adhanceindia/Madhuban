import type { GlobalConfig } from 'payload'
import { isAdmin } from '../src/access'

export const PaymentConfig: GlobalConfig = {
  slug: 'payment-config',
  label: 'Payment Settings',
  admin: {
    group: 'Settings',
    description:
      'Configure payment gateways. Enable/disable gateways and set one as active. Credentials are stored securely and never exposed to the client.',
    hidden: ({ user }) => user?.role !== 'admin',
  },
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  fields: [
    {
      name: 'active_gateway',
      type: 'select',
      required: true,
      defaultValue: 'razorpay',
      label: 'Active Payment Gateway',
      admin: {
        description:
          'The gateway used for all new online payments. The selected gateway must be enabled with valid credentials below.',
      },
      options: [
        { label: 'Razorpay', value: 'razorpay' },
        { label: 'PhonePe', value: 'phonepe' },
        { label: 'Cashfree', value: 'cashfree' },
        { label: 'CCAvenue', value: 'ccavenue' },
        { label: 'PayU', value: 'payu' },
      ],
    },

    // -----------------------------------------------------------------------
    // Razorpay
    // -----------------------------------------------------------------------
    {
      type: 'collapsible',
      label: 'Razorpay',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'razorpay_enabled',
          type: 'checkbox',
          label: 'Enable Razorpay',
          defaultValue: false,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'razorpay_key_id',
              type: 'text',
              label: 'Key ID',
              admin: {
                description: 'Razorpay Dashboard → Settings → API Keys',
                condition: (data) => data?.razorpay_enabled,
              },
            },
            {
              name: 'razorpay_key_secret',
              type: 'text',
              label: 'Key Secret',
              admin: {
                condition: (data) => data?.razorpay_enabled,
              },
            },
          ],
        },
        {
          name: 'razorpay_webhook_secret',
          type: 'text',
          label: 'Webhook Secret',
          admin: {
            description: 'Razorpay Dashboard → Settings → Webhooks',
            condition: (data) => data?.razorpay_enabled,
          },
        },
      ],
    },

    // -----------------------------------------------------------------------
    // PhonePe
    // -----------------------------------------------------------------------
    {
      type: 'collapsible',
      label: 'PhonePe',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'phonepe_enabled',
          type: 'checkbox',
          label: 'Enable PhonePe',
          defaultValue: false,
        },
        {
          name: 'phonepe_environment',
          type: 'select',
          label: 'Environment',
          defaultValue: 'sandbox',
          options: [
            { label: 'Sandbox', value: 'sandbox' },
            { label: 'Production', value: 'production' },
          ],
          admin: {
            condition: (data) => data?.phonepe_enabled,
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'phonepe_client_id',
              type: 'text',
              label: 'Client ID',
              admin: {
                condition: (data) => data?.phonepe_enabled,
              },
            },
            {
              name: 'phonepe_client_secret',
              type: 'text',
              label: 'Client Secret',
              admin: {
                condition: (data) => data?.phonepe_enabled,
              },
            },
          ],
        },
        {
          name: 'phonepe_client_version',
          type: 'text',
          label: 'Client Version',
          admin: {
            condition: (data) => data?.phonepe_enabled,
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'phonepe_webhook_username',
              type: 'text',
              label: 'Webhook Username',
              admin: {
                description: 'Set in PhonePe Dashboard → Developer Settings → Webhook',
                condition: (data) => data?.phonepe_enabled,
              },
            },
            {
              name: 'phonepe_webhook_password',
              type: 'text',
              label: 'Webhook Password',
              admin: {
                condition: (data) => data?.phonepe_enabled,
              },
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Cashfree
    // -----------------------------------------------------------------------
    {
      type: 'collapsible',
      label: 'Cashfree',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'cashfree_enabled',
          type: 'checkbox',
          label: 'Enable Cashfree',
          defaultValue: false,
        },
        {
          name: 'cashfree_environment',
          type: 'select',
          label: 'Environment',
          defaultValue: 'sandbox',
          options: [
            { label: 'Sandbox', value: 'sandbox' },
            { label: 'Production', value: 'production' },
          ],
          admin: {
            condition: (data) => data?.cashfree_enabled,
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'cashfree_app_id',
              type: 'text',
              label: 'App ID',
              admin: {
                description: 'Merchant Dashboard → Developers → API Keys',
                condition: (data) => data?.cashfree_enabled,
              },
            },
            {
              name: 'cashfree_secret_key',
              type: 'text',
              label: 'Secret Key',
              admin: {
                condition: (data) => data?.cashfree_enabled,
              },
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // CCAvenue
    // -----------------------------------------------------------------------
    {
      type: 'collapsible',
      label: 'CCAvenue',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'ccavenue_enabled',
          type: 'checkbox',
          label: 'Enable CCAvenue',
          defaultValue: false,
        },
        {
          name: 'ccavenue_environment',
          type: 'select',
          label: 'Environment',
          defaultValue: 'test',
          options: [
            { label: 'Test', value: 'test' },
            { label: 'Production', value: 'production' },
          ],
          admin: {
            condition: (data) => data?.ccavenue_enabled,
          },
        },
        {
          name: 'ccavenue_merchant_id',
          type: 'text',
          label: 'Merchant ID',
          admin: {
            condition: (data) => data?.ccavenue_enabled,
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'ccavenue_access_code',
              type: 'text',
              label: 'Access Code',
              admin: {
                condition: (data) => data?.ccavenue_enabled,
              },
            },
            {
              name: 'ccavenue_working_key',
              type: 'text',
              label: 'Working Key (Encryption Key)',
              admin: {
                description: 'Used for AES-128-CBC encryption. Never exposed to client.',
                condition: (data) => data?.ccavenue_enabled,
              },
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // PayU
    // -----------------------------------------------------------------------
    {
      type: 'collapsible',
      label: 'PayU',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'payu_enabled',
          type: 'checkbox',
          label: 'Enable PayU',
          defaultValue: false,
        },
        {
          name: 'payu_environment',
          type: 'select',
          label: 'Environment',
          defaultValue: 'test',
          options: [
            { label: 'Test', value: 'test' },
            { label: 'Production', value: 'production' },
          ],
          admin: {
            condition: (data) => data?.payu_enabled,
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'payu_merchant_key',
              type: 'text',
              label: 'Merchant Key',
              admin: {
                condition: (data) => data?.payu_enabled,
              },
            },
            {
              name: 'payu_merchant_salt',
              type: 'text',
              label: 'Merchant Salt',
              admin: {
                description: 'Used for SHA-512 hash generation. Never exposed to client.',
                condition: (data) => data?.payu_enabled,
              },
            },
          ],
        },
      ],
    },
  ],
}
