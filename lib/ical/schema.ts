import { z } from 'zod'
import { ICAL_SOURCES } from './types'

/**
 * Zod schemas for the `IcalConfig` shape stored in site_content.page='ical'.
 *
 * The PUT route validates against `zodIcalConfigSchema` before persisting so
 * the JSON blob stays well-formed regardless of who writes it.
 */
export const zodIcalFeedSchema = z.object({
  id: z.string().min(1),
  source: z.enum(ICAL_SOURCES),
  url: z.string().url(),
  roomId: z.number().int().positive().nullable(),
})

export const zodIcalConfigSchema = z.object({
  feeds: z.array(zodIcalFeedSchema),
})

/** Bare-bones shape check for the legacy flat config (pre-per-listing mapping). */
const legacyFlatShape = z
  .object({
    bookingcom_ical_url: z.string().optional(),
    mmt_ical_url: z.string().optional(),
    goibibo_ical_url: z.string().optional(),
    airbnb_ical_url: z.string().optional(),
    agoda_ical_url: z.string().optional(),
  })
  .passthrough()

export function isLegacyFlatConfig(
  v: unknown,
): v is z.infer<typeof legacyFlatShape> {
  return legacyFlatShape.safeParse(v).success
}
