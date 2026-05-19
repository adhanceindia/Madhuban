import { getDb } from '@/db/client'
import { siteContent } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function getPageContent(page: string): Promise<Record<string, unknown>> {
  const db = getDb()
  const [row] = await db.select().from(siteContent).where(eq(siteContent.page, page)).limit(1)
  return (row?.content as Record<string, unknown>) || {}
}

export async function getAllSiteContent(): Promise<Record<string, Record<string, unknown>>> {
  const db = getDb()
  const rows = await db.select().from(siteContent)
  const result: Record<string, Record<string, unknown>> = {}
  for (const row of rows) {
    result[row.page] = row.content as Record<string, unknown>
  }
  return result
}
