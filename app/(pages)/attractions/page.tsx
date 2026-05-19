import type { Metadata } from 'next'

import { AttractionsPageView } from '@/components/attractions/attractions-page-view'
import { getSiteContent } from '@/lib/data'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent()

  return {
    title: 'Nearby Attractions',
    description: `Explore temple visits and nearby destinations while staying at Madhuban Garden Resort. ${site.tagline}`,
    openGraph: {
      title: 'Nearby Attractions | Madhuban Garden Resort',
      description: `Explore temple visits and nearby destinations while staying at Madhuban Garden Resort. ${site.tagline}`,
    },
  }
}

export default async function AttractionsPage() {
  const siteContent = await getSiteContent()
  return <AttractionsPageView siteContent={siteContent} />
}
