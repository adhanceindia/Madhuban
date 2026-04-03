import type { Metadata } from 'next'

import { WeddingPageView } from '@/components/wedding/wedding-page-view'
import { getSiteContent } from '@/lib/data'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent()

  return {
    title: 'Wedding Venue',
    description: `Begin your forever at Madhuban Garden Resort. ${site.tagline}`,
    openGraph: {
      title: 'Wedding Venue | Madhuban Garden Resort',
      description: `Begin your forever at Madhuban Garden Resort. ${site.tagline}`,
    },
  }
}

export default async function WeddingPage() {
  const siteContent = await getSiteContent()

  return <WeddingPageView siteContent={siteContent} />
}
