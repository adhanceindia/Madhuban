'use client'

import { BlockRenderer } from '@/components/blocks/block-renderer'
import { useSiteContent } from '@/components/ui/preview-provider'
import type { SiteContent, RoomData } from '@/lib/types'
import { defaultRoomsBlocks } from '@/lib/default-blocks'

type RoomsPageViewProps = {
  rooms: RoomData[]
  siteContent: SiteContent
  pageData?: Record<string, unknown>
  initialCheckIn?: string
  initialCheckOut?: string
  initialGuests?: number
}

export function RoomsPageView({ 
  rooms,
  siteContent: initialSiteContent, 
  pageData: initialPageData,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}: RoomsPageViewProps) {
  const siteContent = useSiteContent(initialSiteContent) as SiteContent
  const pageData = useSiteContent(initialPageData || {}) as Record<string, unknown>
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocks = (pageData.page_blocks as any[]) || defaultRoomsBlocks

  const context = {
    siteContent,
    rooms,
    initialCheckIn,
    initialCheckOut,
    initialGuests,
  }

  return (
    <div className="-mt-navbar overflow-x-clip bg-background">
      <BlockRenderer blocks={blocks} context={context} />
    </div>
  )
}
