import type { Metadata } from 'next'

import { EventsPageView } from '@/components/events/events-page-view'
import { getSiteContent } from '@/lib/data'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent()

  return {
    title: 'Events & Celebrations',
    description: `Plan birthdays, corporate meets, and smaller gatherings at Madhuban Garden Resort. ${site.tagline}`,
    openGraph: {
      title: 'Events & Celebrations | Madhuban Garden Resort',
      description: `Plan birthdays, corporate meets, and smaller gatherings at Madhuban Garden Resort. ${site.tagline}`,
    },
  }
}

export default async function EventsPage() {
  const siteContent = await getSiteContent()
  return <EventsPageView siteContent={siteContent} />
}
