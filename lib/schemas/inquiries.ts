import { z } from 'zod'

export const inquiryUpdateSchema = z.object({
  status: z.enum(['new', 'contacted', 'closed']).optional(),
  staff_notes: z.string().nullable().optional(),
})

export type InquiryUpdateInput = z.infer<typeof inquiryUpdateSchema>

export const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: 'Wedding',
  birthday: 'Birthday',
  corporate: 'Corporate',
  other: 'Other',
}
