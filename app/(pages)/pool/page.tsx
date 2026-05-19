import type { Metadata } from 'next'

import { PoolPageView } from '@/components/pool/pool-page-view'
import { getSiteContent } from '@/lib/data'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent()

  return {
    title: 'Swimming Pool',
    description: `See the swimming pool experience at Madhuban Garden Resort, including timings and leisure details. ${site.tagline}`,
    openGraph: {
      title: 'Swimming Pool | Madhuban Garden Resort',
      description: `See the swimming pool experience at Madhuban Garden Resort, including timings and leisure details. ${site.tagline}`,
    },
  }
}

export default async function PoolPage() {
  const siteContent = await getSiteContent()
  return <PoolPageView siteContent={siteContent} />
}
