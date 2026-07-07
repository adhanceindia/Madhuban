'use client'

import { PageTransitionWrapper } from '@/components/layout/page-transition-wrapper'
import { useSiteContent } from '@/components/ui/preview-provider'
import { BlockRenderer } from '@/components/blocks/block-renderer'
import type { SiteContent, RoomData, ReviewData } from '@/lib/types'

type HomePageViewProps = {
  featuredRooms: RoomData[]
  reviews: ReviewData[]
  siteContent: SiteContent
}

export function HomePageView({ featuredRooms, reviews, siteContent: initialSiteContent }: HomePageViewProps) {
  const siteContent = useSiteContent(initialSiteContent) as SiteContent
  
  // Extract blocks from siteContent
  // In block mode, the CMS will save an array of blocks to homepage_blocks
  const blocks = (siteContent as Record<string, unknown>).homepage_blocks as { id: string; type: string; props: Record<string, unknown> }[] || []

  return (
    <PageTransitionWrapper>
      {blocks.length > 0 ? (
        <BlockRenderer blocks={blocks} context={{ featuredRooms, reviews }} />
      ) : (
        <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
          <p>No blocks added yet. Use the admin panel to build this page.</p>
        </div>
      )}
    </PageTransitionWrapper>
  )
}
