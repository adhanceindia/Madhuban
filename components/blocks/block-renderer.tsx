import { HeroBlock } from './hero-block'
import { RichTextBlock } from './rich-text-block'
import { FeaturesBlock } from './features-block'
import { GalleryBlock } from './gallery-block'
import { HighlightsBlock } from './highlights-block'
import { WeddingFeatureBlock } from './wedding-feature-block'
import { FeaturedRoomsBlock } from './featured-rooms-block'
import { CoreServicesBlock } from './core-services-block'
import { AmenitiesBlock } from './amenities-block'
import { InstagramFeedBlock } from './instagram-feed-block'
import { ReviewsBlock } from './reviews-block'
import { AttractionsBlock } from './attractions-block'

type BlockData = {
  id: string
  type: string
  props: Record<string, unknown>
}

type BlockRendererProps = {
  blocks: BlockData[]
  context?: Record<string, unknown>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BLOCK_COMPONENTS: Record<string, React.ElementType<any>> = {
  hero: HeroBlock,
  rich_text: RichTextBlock,
  features: FeaturesBlock,
  gallery: GalleryBlock,
  highlights: HighlightsBlock,
  wedding_feature: WeddingFeatureBlock,
  featured_rooms: FeaturedRoomsBlock,
  core_services: CoreServicesBlock,
  amenities: AmenitiesBlock,
  instagram_feed: InstagramFeedBlock,
  reviews: ReviewsBlock,
  attractions: AttractionsBlock,
}

export function BlockRenderer({ blocks, context }: BlockRendererProps) {
  if (!blocks || !Array.isArray(blocks)) return null

  return (
    <>
      {blocks.map((block) => {
        const Component = BLOCK_COMPONENTS[block.type]
        if (!Component) {
          console.warn(`No block component found for type: ${block.type}`)
          return null
        }

        return <Component key={block.id} {...block.props} {...context} />
      })}
    </>
  )
}
