import { getDb } from '@/db/client'
import { paymentConfig, siteContent } from '@/db/schema'
import { eq } from 'drizzle-orm'

export type GatewayName = 'razorpay' | 'phonepe' | 'cashfree' | 'ccavenue' | 'payu'

export type PaymentConfigData = {
  active_gateway: GatewayName
  gateways: Record<string, unknown>
}

export async function getPaymentConfigRow(): Promise<PaymentConfigData> {
  const db = getDb()
  const [row] = await db.select().from(paymentConfig).limit(1)
  if (!row) {
    // Initialize empty config if none exists
    const [created] = await db
      .insert(paymentConfig)
      .values({ active_gateway: 'razorpay', gateways: {} })
      .returning()
    return {
      active_gateway: created.active_gateway,
      gateways: (created.gateways as Record<string, unknown>) || {},
    }
  }
  return {
    active_gateway: row.active_gateway,
    gateways: (row.gateways as Record<string, unknown>) || {},
  }
}

export async function updatePaymentConfig(input: {
  active_gateway?: GatewayName
  gateways?: Record<string, unknown>
}): Promise<PaymentConfigData> {
  const db = getDb()
  const existing = await getPaymentConfigRow()
  const [first] = await db.select({ id: paymentConfig.id }).from(paymentConfig).limit(1)

  const next = {
    active_gateway: input.active_gateway || existing.active_gateway,
    gateways: { ...existing.gateways, ...(input.gateways || {}) },
  }

  if (first) {
    const [updated] = await db
      .update(paymentConfig)
      .set({ ...next, updated_at: new Date() })
      .where(eq(paymentConfig.id, first.id))
      .returning()
    return {
      active_gateway: updated.active_gateway,
      gateways: (updated.gateways as Record<string, unknown>) || {},
    }
  }

  const [inserted] = await db.insert(paymentConfig).values(next).returning()
  return {
    active_gateway: inserted.active_gateway,
    gateways: (inserted.gateways as Record<string, unknown>) || {},
  }
}

export async function getSiteSettings(page: string): Promise<Record<string, unknown>> {
  const db = getDb()
  const [row] = await db.select().from(siteContent).where(eq(siteContent.page, page)).limit(1)
  return (row?.content as Record<string, unknown>) || {}
}

export async function upsertSiteSettings(
  page: string,
  content: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const db = getDb()
  const [existing] = await db.select().from(siteContent).where(eq(siteContent.page, page)).limit(1)

  if (existing) {
    const merged = { ...(existing.content as Record<string, unknown>), ...content }
    const [updated] = await db
      .update(siteContent)
      .set({ content: merged, updated_at: new Date() })
      .where(eq(siteContent.page, page))
      .returning()
    return updated.content as Record<string, unknown>
  }

  const [inserted] = await db
    .insert(siteContent)
    .values({ page, content })
    .returning()
  return inserted.content as Record<string, unknown>
}
