import { FloatingWhatsAppButton } from '@/components/layout/floating-whatsapp-button'
import { PageTransitionWrapper } from '@/components/layout/page-transition-wrapper'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteNavbar } from '@/components/layout/site-navbar'
import { PreviewProvider } from '@/components/ui/preview-provider'
import { getSiteContent } from '@/lib/data'

export const dynamic = 'force-dynamic'

import { GlobalMap } from '@/components/shared/global-map'

export default async function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteContent = await getSiteContent()

  return (
    <PreviewProvider>
      <SiteNavbar siteContent={siteContent} />
      <main className="relative">
        <PageTransitionWrapper>{children}</PageTransitionWrapper>
      </main>
      <GlobalMap />
      <SiteFooter siteContent={siteContent} />
      <FloatingWhatsAppButton siteContent={siteContent} />
    </PreviewProvider>
  )
}
