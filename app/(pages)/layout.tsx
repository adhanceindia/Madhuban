import { FloatingWhatsAppButton } from '@/components/layout/floating-whatsapp-button'
import { PageTransitionWrapper } from '@/components/layout/page-transition-wrapper'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteNavbar } from '@/components/layout/site-navbar'
import { getSiteContent } from '@/lib/data'

export default async function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteContent = await getSiteContent()

  return (
    <>
      <SiteNavbar siteContent={siteContent} />
      <main className="relative">
        <PageTransitionWrapper>{children}</PageTransitionWrapper>
      </main>
      <SiteFooter siteContent={siteContent} />
      <FloatingWhatsAppButton siteContent={siteContent} />
    </>
  )
}
