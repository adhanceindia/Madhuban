import '@/app/globals.css'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'

import { Toaster } from 'react-hot-toast'

import { FloatingWhatsAppButton } from '@/components/layout/floating-whatsapp-button'
import { PageTransitionWrapper } from '@/components/layout/page-transition-wrapper'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteNavbar } from '@/components/layout/site-navbar'
import { getSiteContent } from '@/lib/data'
import { cn } from '@/lib/utils'

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

export default async function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteContent = await getSiteContent()

  return (
    <html
      lang="en"
      className={cn(displayFont.variable, bodyFont.variable, 'scroll-smooth')}
    >
      <body className="min-h-screen bg-background font-body text-foreground antialiased">
        <SiteNavbar siteContent={siteContent} />
        <main className="relative">
          <PageTransitionWrapper>{children}</PageTransitionWrapper>
        </main>
        <SiteFooter siteContent={siteContent} />
        <FloatingWhatsAppButton siteContent={siteContent} />
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
