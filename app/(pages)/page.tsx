import type { Metadata } from 'next'

import { HomePageView } from '@/components/sections/home-page-view'
import { getFeaturedRooms, getReviews, getSiteContent } from '@/lib/data'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent()

  return {
    description: site.tagline,
    openGraph: {
      title: site.name,
      description: site.tagline,
      siteName: site.name,
      locale: 'en_IN',
      type: 'website',
    },
  }
}

export default async function HomePage() {
  const [featuredRooms, reviews, siteContent] = await Promise.all([
    getFeaturedRooms(),
    getReviews(),
    getSiteContent(),
  ])

  return (
    <HomePageView
      featuredRooms={featuredRooms}
      reviews={reviews}
      siteContent={siteContent}
    />
  )
}
