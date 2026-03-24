import type { Metadata } from 'next'

import { EventsPageView } from '@/components/events/events-page-view'
import { resort } from '@/lib/dummy-data'

export const metadata: Metadata = {
  title: 'Events & Celebrations',
  description: `Plan birthdays, corporate meets, and smaller gatherings at Madhuban Garden Resort. ${resort.tagline}`,
}

export default function EventsPage() {
  return <EventsPageView />
}
