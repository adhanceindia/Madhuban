import type { Metadata } from 'next'

import { HomePageView } from '@/components/sections/home-page-view'
import { resort } from '@/lib/dummy-data'

export const metadata: Metadata = {
  description: resort.tagline,
  openGraph: {
    title: resort.name,
    description: resort.tagline,
    siteName: resort.name,
    locale: 'en_IN',
    type: 'website',
  },
}

export default function HomePage() {
  return <HomePageView />
}
