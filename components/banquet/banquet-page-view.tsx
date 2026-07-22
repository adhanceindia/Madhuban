'use client'

import { BlockRenderer } from '@/components/blocks/block-renderer'
import { useSiteContent } from '@/components/ui/preview-provider'
import type { SiteContent } from '@/lib/types'
import { defaultBanquetBlocks } from '@/lib/default-blocks'

type BanquetPageViewProps = {
  siteContent: SiteContent
  pageData?: Record<string, unknown>
}

export function BanquetPageView({ siteContent: initialSiteContent, pageData: initialPageData }: BanquetPageViewProps) {
  const siteContent = useSiteContent(initialSiteContent) as SiteContent
  const pageData = useSiteContent(initialPageData || {}) as Record<string, unknown>
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocks = (pageData.page_blocks as any[]) || defaultBanquetBlocks

  return (
    <div className="-mt-navbar overflow-x-clip bg-background">
      <BlockRenderer blocks={blocks} context={{ siteContent }} />
    </div>
  )
}
