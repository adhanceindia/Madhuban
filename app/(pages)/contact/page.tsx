import type { Metadata } from 'next'

import { ContactPageView } from '@/components/contact/contact-page-view'
import { getSiteContent } from '@/lib/data'
import { getPageContent } from '@/db/queries/content'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent()

  return {
    title: 'Contact',
    description: `Get in touch with Madhuban Garden Resort for room stays, wedding enquiries, and event planning. ${site.tagline}`,
    openGraph: {
      title: 'Contact | Madhuban Garden Resort',
      description: `Get in touch with Madhuban Garden Resort for room stays, wedding enquiries, and event planning. ${site.tagline}`,
    },
  }
}

export default async function ContactPage() {
  const siteContent = await getSiteContent()
  const pageData = await getPageContent('contact')

  return <ContactPageView siteContent={siteContent} pageData={pageData} />
}
