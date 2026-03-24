import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'

import { FloatingWhatsAppButton } from '@/components/layout/floating-whatsapp-button'
import { PageTransitionWrapper } from '@/components/layout/page-transition-wrapper'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteNavbar } from '@/components/layout/site-navbar'
import { resort } from '@/lib/dummy-data'
import { cn } from '@/lib/utils'

import './globals.css'

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

export const metadata: Metadata = {
  metadataBase: new URL('https://madhubangarden.com'),
  title: {
    default: resort.name,
    template: `%s | ${resort.name}`,
  },
  description: resort.tagline,
  openGraph: {
    title: resort.name,
    description: resort.tagline,
    siteName: resort.name,
    locale: 'en_IN',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(displayFont.variable, bodyFont.variable, 'scroll-smooth')}
    >
      <body className="min-h-screen bg-background font-body text-foreground antialiased">
        <SiteNavbar />
        <main className="relative">
          <PageTransitionWrapper>{children}</PageTransitionWrapper>
        </main>
        <SiteFooter />
        <FloatingWhatsAppButton />
      </body>
    </html>
  )
}
