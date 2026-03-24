import type { Metadata } from 'next'

import { PoolPageView } from '@/components/pool/pool-page-view'
import { resort } from '@/lib/dummy-data'

export const metadata: Metadata = {
  title: 'Swimming Pool',
  description: `See the swimming pool experience at Madhuban Garden Resort, including timings and leisure details. ${resort.tagline}`,
}

export default function PoolPage() {
  return <PoolPageView />
}
