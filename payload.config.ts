import path from 'path'
import { fileURLToPath } from 'url'

import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import sharp from 'sharp'

import { Users } from './collections/Users.ts'
import { Rooms } from './collections/Rooms.ts'
import { Bookings } from './collections/Bookings.ts'
import { Inquiries } from './collections/Inquiries.ts'
import { BlockedDates } from './collections/BlockedDates.ts'
import { Gallery } from './collections/Gallery.ts'
import { Reviews } from './collections/Reviews.ts'
import { Media } from './collections/Media.ts'

import { Content } from './globals/Content.ts'
import { PaymentConfig } from './globals/PaymentConfig.ts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // Auth + Admin
  admin: {
    user: 'users',
    meta: {
      titleSuffix: ' — Madhuban Admin',
    },
    dateFormat: 'dd MMM yyyy',
    theme: 'light',
    components: {
      Nav: '/components/admin/Nav',
      beforeDashboard: ['/components/admin/DashboardMetrics'],
      views: {
        'front-desk': {
          Component: '/components/admin/views/FrontDeskView',
          path: '/front-desk',
        },
        'bookings-view': {
          Component: '/components/admin/views/BookingsListView',
          path: '/bookings-view',
        },
        'reviews-view': {
          Component: '/components/admin/views/ReviewsView',
          path: '/reviews-view',
        },
      },
    },
  },

  // Collections
  collections: [
    Users,
    Media,
    Rooms,
    Bookings,
    Inquiries,
    BlockedDates,
    Gallery,
    Reviews,
  ],

  // Globals
  globals: [Content, PaymentConfig],

  // Secret for hashing, JWT, etc.
  secret: process.env.PAYLOAD_SECRET || '',

  // Database
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),

  // Rich text editor
  editor: lexicalEditor(),

  // Image processing
  sharp,

  // Plugins
  plugins: [
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.SUPABASE_S3_BUCKET || 'madhuban-media',
      config: {
        credentials: {
          accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY || '',
          secretAccessKey: process.env.SUPABASE_S3_SECRET_KEY || '',
        },
        endpoint: process.env.SUPABASE_S3_ENDPOINT || '',
        region: 'ap-south-1',
        forcePathStyle: true,
      },
    }),
  ],

  // TypeScript auto-generated types
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
