import type { Metadata } from 'next'

import { ContactPageView } from '@/components/contact/contact-page-view'
import { resort } from '@/lib/dummy-data'

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with Madhuban Garden Resort for room stays, wedding enquiries, and event planning. ${resort.tagline}`,
  openGraph: {
    title: 'Contact | Madhuban Garden Resort',
    description: `Get in touch with Madhuban Garden Resort for room stays, wedding enquiries, and event planning. ${resort.tagline}`,
  },
}

export default function ContactPage() {
  return <ContactPageView />
}
