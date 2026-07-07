import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans, Lato } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

import { getSiteContent } from '@/lib/data'
import { cn } from '@/lib/utils'
import '@/app/globals.css'
import { ReticleDev } from './reticle-dev'

const displayFont = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
})

const bodyFont = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '700'],
})

const adminFont = Lato({
  subsets: ['latin'],
  variable: '--font-admin',
  display: 'swap',
  weight: ['400', '700', '900'],
})

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
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        displayFont.variable,
        bodyFont.variable,
        adminFont.variable,
        'scroll-smooth',
      )}
    >
      <body suppressHydrationWarning className="min-h-screen bg-background font-body text-foreground antialiased">
        {process.env.NODE_ENV === 'development' ? <ReticleDev /> : null}
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
