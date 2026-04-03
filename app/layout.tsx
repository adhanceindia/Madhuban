import type { Metadata } from 'next'

import { getSiteContent } from '@/lib/data'


export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent()

  return {
    metadataBase: new URL('https://madhubangarden.com'),
    title: {
      default: site.name,
      template: `%s | ${site.name}`,
    },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
