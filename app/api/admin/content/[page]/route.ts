import { z } from 'zod'
import { apiHandler } from '@/lib/api-handler'
import { getPageContentAdmin, upsertPageContent } from '@/db/queries/content-admin'
import { getPageSchema } from '@/lib/cms-schema'
import { logAudit } from '@/lib/audit'

const updateSchema = z.object({
  content: z.record(z.string(), z.unknown()),
})

export const GET = apiHandler<unknown, { page: string }>({
  module: 'content',
  handler: async ({ params }) => {
    const schema = getPageSchema(params.page)
    if (!schema) throw new Error('Unknown page')
    const content = await getPageContentAdmin(params.page)
    return { page: schema, content }
  },
})

export const PUT = apiHandler({
  module: 'content',
  schema: updateSchema,
  handler: async ({ params, body, session }) => {
    const pageKey = (params as Record<string, string>).page
    const schema = getPageSchema(pageKey)
    if (!schema) throw new Error('Unknown page')

    const existing = await getPageContentAdmin(pageKey)
    const updated = await upsertPageContent(pageKey, body.content)

    await logAudit({
      user_id: session.id,
      action: 'content.page_updated',
      entity_type: 'site_content',
      entity_id: pageKey,
      old_value: existing,
      new_value: body.content,
    })

    return { content: updated.content }
  },
})
