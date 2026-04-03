import type { Metadata } from 'next'

import { BanquetPageView } from '@/components/banquet/banquet-page-view'
import { getSiteContent } from '@/lib/data'

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

export default function BanquetPage() {
  return <BanquetPageView />
}
