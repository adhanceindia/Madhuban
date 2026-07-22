'use client'

import { BlockRenderer } from '@/components/blocks/block-renderer'
import { useSiteContent } from '@/components/ui/preview-provider'
import type { SiteContent } from '@/lib/types'
import { defaultEventsBlocks } from '@/lib/default-blocks'

type EventsPageViewProps = {
  siteContent: SiteContent
  pageData?: Record<string, unknown>
}

export function EventsPageView({ siteContent: initialSiteContent, pageData: initialPageData }: EventsPageViewProps) {
  const siteContent = useSiteContent(initialSiteContent) as SiteContent
  const pageData = useSiteContent(initialPageData || {}) as Record<string, unknown>
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocks = (pageData.page_blocks as any[]) || defaultEventsBlocks

  return (
    <div className="-mt-navbar overflow-x-clip bg-background">
      <BlockRenderer blocks={blocks} context={{ siteContent }} />
    </div>
  )
}
