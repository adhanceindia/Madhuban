import type { Metadata } from 'next'

import { BanquetPageView } from '@/components/banquet/banquet-page-view'
import { getSiteContent } from '@/lib/data'
import { getPageContent } from '@/db/queries/content'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent()

  return {
    title: 'Banquet Hall',
    description: `Discover the Madhuban banquet hall for weddings, conferences, and parties. ${site.tagline}`,
    openGraph: {
      title: 'Banquet Hall | Madhuban Garden Resort',
      description: `Discover the Madhuban banquet hall for weddings, conferences, and parties. ${site.tagline}`,
    },
  }
}

export default async function BanquetPage() {
  const siteContent = await getSiteContent()
  const pageData = await getPageContent('banquet')
  return <BanquetPageView siteContent={siteContent} pageData={pageData} />
}
