import { getDb } from '@/db/client'
import { siteContent } from '@/db/schema'
import { eq } from 'drizzle-orm'

import { defaultMegaMenuFlat, navLinks, quickLinks } from '@/lib/site-nav'

export async function getPageContentAdmin(page: string): Promise<Record<string, unknown>> {
  const db = getDb()
  const [row] = await db.select().from(siteContent).where(eq(siteContent.page, page)).limit(1)
  
  if (!row) {
    if (page === 'header') {
      return {
        mega_menu: defaultMegaMenuFlat,
        nav_links: navLinks,
        cta_button_text: 'Book Now',
        cta_button_link: '/rooms',
      }
    }
    if (page === 'footer') {
      return {
        nav_links: quickLinks,
      }
    }
    return {}
  }

  return (row.content as Record<string, unknown>) || {}
}

export async function upsertPageContent(page: string, content: Record<string, unknown>) {
  const db = getDb()
  const [existing] = await db.select().from(siteContent).where(eq(siteContent.page, page)).limit(1)
  if (existing) {
    const [updated] = await db
      .update(siteContent)
      .set({ content, updated_at: new Date() })
      .where(eq(siteContent.page, page))
      .returning()
    return updated
  }
  const [inserted] = await db.insert(siteContent).values({ page, content }).returning()
  return inserted
}
