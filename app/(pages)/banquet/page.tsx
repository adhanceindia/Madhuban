import type { Metadata } from 'next'

import { BanquetPageView } from '@/components/banquet/banquet-page-view'
import { resort } from '@/lib/dummy-data'

export const metadata: Metadata = {
  title: 'Banquet Hall',
  description: `Discover the Madhuban banquet hall for weddings, conferences, and parties. ${resort.tagline}`,
  openGraph: {
    title: 'Banquet Hall | Madhuban Garden Resort',
    description: `Discover the Madhuban banquet hall for weddings, conferences, and parties. ${resort.tagline}`,
  },
}

export default function BanquetPage() {
  return <BanquetPageView />
}
