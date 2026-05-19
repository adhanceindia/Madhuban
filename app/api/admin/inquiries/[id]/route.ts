import { apiHandler } from '@/lib/api-handler'
import { getInquiryById, updateInquiry } from '@/db/queries/inquiries-admin'
import { inquiryUpdateSchema } from '@/lib/schemas/inquiries'
import { logAudit } from '@/lib/audit'

export const GET = apiHandler<unknown, { id: string }>({
  module: 'inquiries',
  handler: async ({ params }) => {
    const inquiry = await getInquiryById(parseInt(params.id))
    if (!inquiry) throw new Error('Inquiry not found')
    return { inquiry }
  },
})

export const PATCH = apiHandler({
  module: 'inquiries',
  schema: inquiryUpdateSchema,
  handler: async ({ params, body, session }) => {
    const id = parseInt((params as Record<string, string>).id)
    const existing = await getInquiryById(id)
    if (!existing) throw new Error('Inquiry not found')

    const updated = await updateInquiry(id, body)
    await logAudit({
      user_id: session.id,
      action: 'inquiry.updated',
      entity_type: 'inquiry',
      entity_id: id,
      old_value: { status: existing.status, staff_notes: existing.staff_notes },
      new_value: body as Record<string, unknown>,
    })

    return { inquiry: updated }
  },
})
