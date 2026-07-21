import type { Metadata } from 'next'

import { RestaurantPageView } from '@/components/restaurant/restaurant-page-view'
import { getSiteContent } from '@/lib/data'
import { getPageContent } from '@/db/queries/content'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent()

  return {
    title: 'Restaurant & Dining',
    description: `Experience fine dining with our indoor and outdoor restaurant at Madhuban Garden Resort. ${site.tagline}`,
    openGraph: {
      title: 'Restaurant & Dining | Madhuban Garden Resort',
      description: `Experience fine dining with our indoor and outdoor restaurant at Madhuban Garden Resort. ${site.tagline}`,
    },
  }
}

export default async function RestaurantPage() {
  const siteContent = await getSiteContent()
  const pageData = await getPageContent('restaurant')
  return <RestaurantPageView siteContent={siteContent} pageData={pageData} />
}
