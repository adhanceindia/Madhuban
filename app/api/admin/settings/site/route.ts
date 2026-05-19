import { apiHandler } from '@/lib/api-handler'
import { getSiteSettings, upsertSiteSettings } from '@/db/queries/settings'
import { siteSettingsSchema } from '@/lib/schemas/settings'

export const GET = apiHandler({
  auth: ['super_admin', 'resort_manager'],
  module: 'settings',
  handler: async ({ searchParams }) => {
    const page = searchParams.get('page')
    if (!page) throw new Error('page query param required')
    return { content: await getSiteSettings(page) }
  },
})

export const POST = apiHandler({
  auth: ['super_admin', 'resort_manager'],
  module: 'settings',
  schema: siteSettingsSchema,
  audit: { action: 'settings.site_updated', entityType: 'site_content' },
  handler: async ({ body }) => {
    const content = await upsertSiteSettings(body.page, body.content)
    return { content }
  },
})
