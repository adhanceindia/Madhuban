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
import { EditorialHeroBlock } from './editorial-hero-block'
import { EditorialOverviewBlock } from './editorial-overview-block'
import { IconFeaturesGridBlock } from './icon-features-grid-block'
import { EditorialGalleryBlock } from './editorial-gallery-block'
import { EditorialCtaBlock } from './editorial-cta-block'
import { CorporateBookingFormBlock } from './corporate-booking-form-block'
import { ContactFormBlock } from './contact-form-block'
import { RoomsListingBlock } from './rooms-listing-block'


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
  editorial_hero: EditorialHeroBlock,
  editorial_overview: EditorialOverviewBlock,
  icon_features_grid: IconFeaturesGridBlock,
  editorial_gallery: EditorialGalleryBlock,
  editorial_cta: EditorialCtaBlock,
  corporate_booking_form: CorporateBookingFormBlock,
  contact_form: ContactFormBlock,
  rooms_listing: RoomsListingBlock,

}

export function BlockRenderer({ blocks, context }: BlockRendererProps) {
  if (!blocks || !Array.isArray(blocks)) return null

  return (
    <>
      {blocks.map((block) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Component = BLOCK_COMPONENTS[block.type] as any
        if (!Component) {
          console.warn(`No block component found for type: ${block.type}`)
          return null
        }

        return <Component key={block.id} {...block.props} {...context} />
      })}
    </>
  )
}
