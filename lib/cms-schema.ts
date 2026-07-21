/**
 * Per-page editable field config. The PageEditor walks this and renders
 * the appropriate input for each field. To add a new editable page,
 * add an entry here — no UI changes required.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'image'
  | 'url'
  | 'repeater'
  | 'blocks'
  | 'menu_builder'

export type BlockDef = {
  type: string
  label: string
  fields: FieldDef[]
}

export type FieldDef = {
  field: string
  label: string
  type: FieldType
  hint?: string
  required?: boolean
  /** For repeater fields, defines the shape of each item */
  itemFields?: FieldDef[]
  /** For 'blocks' fields, defines which blocks can be added */
  availableBlocks?: BlockDef[]
}

export type PageSchema = {
  key: string
  label: string
  description?: string
  publicPath?: string
  sections: { title?: string; fields: FieldDef[] }[]
}

export const BLOCKS_REGISTRY: Record<string, BlockDef> = {
  hero: {
    type: 'hero',
    label: 'Hero Section',
    fields: [
      { field: 'image', label: 'Background Image', type: 'image' },
      { field: 'heading', label: 'Heading', type: 'text' },
      { field: 'subtext', label: 'Subtext', type: 'richtext' },
      { field: 'cta_text', label: 'CTA Button Text', type: 'text' },
      { field: 'cta_link', label: 'CTA Link URL', type: 'url' },
    ],
  },
  rich_text: {
    type: 'rich_text',
    label: 'Rich Text Block',
    fields: [{ field: 'content', label: 'Content', type: 'richtext' }],
  },
  gallery: {
    type: 'gallery',
    label: 'Image Gallery',
    fields: [{ field: 'title', label: 'Gallery Title', type: 'text' }],
  },
  features: {
    type: 'features',
    label: 'Features List',
    fields: [
      { field: 'title', label: 'Section Title', type: 'text' },
      { field: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  highlights: {
    type: 'highlights',
    label: 'Highlights Grid',
    fields: [
      {
        field: 'items',
        label: 'Highlight Items',
        type: 'repeater',
        itemFields: [
          { field: 'title', label: 'Title', type: 'text' },
          { field: 'description', label: 'Description', type: 'text' },
          { field: 'icon', label: 'Icon Name', type: 'text' },
        ],
      },
    ],
  },
  wedding_feature: {
    type: 'wedding_feature',
    label: 'Wedding Feature',
    fields: [
      { field: 'badge', label: 'Badge', type: 'text' },
      { field: 'title', label: 'Title', type: 'text' },
      { field: 'description', label: 'Description', type: 'textarea' },
      { field: 'image', label: 'Image', type: 'image' },
      { field: 'ctaLabel', label: 'CTA Label', type: 'text' },
      {
        field: 'points',
        label: 'Highlights',
        type: 'repeater',
        itemFields: [
          { field: 'label', label: 'Label', type: 'text' },
          { field: 'value', label: 'Value', type: 'text' },
          { field: 'icon', label: 'Icon Name', type: 'text' },
        ],
      },
    ],
  },
  featured_rooms: {
    type: 'featured_rooms',
    label: 'Featured Rooms',
    fields: [
      { field: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { field: 'title', label: 'Title', type: 'text' },
      { field: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  core_services: {
    type: 'core_services',
    label: 'Core Services',
    fields: [
      { field: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { field: 'title', label: 'Title', type: 'text' },
      { field: 'description', label: 'Description', type: 'textarea' },
      {
        field: 'items',
        label: 'Services',
        type: 'repeater',
        itemFields: [
          { field: 'title', label: 'Title', type: 'text' },
          { field: 'description', label: 'Description', type: 'text' },
          { field: 'icon', label: 'Icon Name', type: 'text' },
        ],
      },
    ],
  },
  amenities: {
    type: 'amenities',
    label: 'Amenities Grid',
    fields: [
      {
        field: 'items',
        label: 'Amenities',
        type: 'repeater',
        itemFields: [
          { field: 'label', label: 'Label', type: 'text' },
          { field: 'icon', label: 'Icon Name', type: 'text' },
        ],
      },
    ],
  },
  instagram_feed: {
    type: 'instagram_feed',
    label: 'Instagram Feed',
    fields: [
      { field: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { field: 'title', label: 'Title', type: 'text' },
      { field: 'description', label: 'Description', type: 'textarea' },
      { field: 'instagramHandle', label: 'Instagram Handle', type: 'text' },
      { field: 'instagramLink', label: 'Instagram Link', type: 'url' },
      {
        field: 'photos',
        label: 'Photos',
        type: 'repeater',
        itemFields: [
          { field: 'src', label: 'Image URL', type: 'url' },
          { field: 'alt', label: 'Alt Text', type: 'text' },
        ],
      },
    ],
  },
  reviews: {
    type: 'reviews',
    label: 'Guest Reviews',
    fields: [
      { field: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { field: 'title', label: 'Title', type: 'text' },
      { field: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  attractions: {
    type: 'attractions',
    label: 'Nearby Attractions',
    fields: [
      { field: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { field: 'title', label: 'Title', type: 'text' },
      { field: 'description', label: 'Description', type: 'textarea' },
      {
        field: 'items',
        label: 'Attractions',
        type: 'repeater',
        itemFields: [
          { field: 'name', label: 'Name', type: 'text' },
          { field: 'description', label: 'Description', type: 'text' },
          { field: 'image', label: 'Image URL', type: 'url' },
          { field: 'distance', label: 'Distance', type: 'text' },
        ],
      },
    ],
  },
}

export const PAGE_SCHEMAS: PageSchema[] = [
  {
    key: 'homepage',
    label: 'Homepage',
    description: 'Block-based homepage builder',
    publicPath: '/',
    sections: [
      {
        title: 'Page Blocks',
        fields: [
          {
            field: 'homepage_blocks',
            label: 'Page Blocks',
            type: 'blocks',
            availableBlocks: Object.values(BLOCKS_REGISTRY),
          },
        ],
      },
    ],
  },
  {
    key: 'rooms',
    label: 'Rooms page',
    description: 'Banner and listing intro',
    publicPath: '/rooms',
    sections: [
      {
        fields: [
          { field: 'banner_image', label: 'Banner image', type: 'image' },
          { field: 'page_heading', label: 'Heading', type: 'text' },
          { field: 'page_description', label: 'Description', type: 'richtext' },
          { field: 'seo_title', label: 'SEO title', type: 'text' },
          {
            field: 'seo_description',
            label: 'SEO description',
            type: 'textarea',
          },
        ],
      },
    ],
  },
  {
    key: 'wedding',
    label: 'Wedding page',
    publicPath: '/wedding',
    sections: [
      {
        fields: [
          { field: 'hero_image', label: 'Hero image', type: 'image' },
          { field: 'wedding_heading', label: 'Heading', type: 'text' },
          {
            field: 'wedding_description',
            label: 'Description',
            type: 'richtext',
          },
          { field: 'packages_text', label: 'Packages text', type: 'richtext' },
        ],
      },
    ],
  },
  {
    key: 'banquet',
    label: 'Banquet page',
    publicPath: '/banquet',
    sections: [
      {
        fields: [
          { field: 'hero_image', label: 'Hero image', type: 'image' },
          { field: 'heading', label: 'Heading', type: 'text' },
          { field: 'description', label: 'Description', type: 'richtext' },
          { field: 'capacity_info', label: 'Capacity info', type: 'text' },
        ],
      },
    ],
  },
  {
    key: 'pool',
    label: 'Pool page',
    publicPath: '/pool',
    sections: [
      {
        fields: [
          { field: 'hero_image', label: 'Hero image', type: 'image' },
          { field: 'heading', label: 'Heading', type: 'text' },
          { field: 'description', label: 'Description', type: 'richtext' },
          { field: 'timings', label: 'Timings', type: 'text' },
          { field: 'rules', label: 'Rules', type: 'textarea' },
        ],
      },
    ],
  },
  {
    key: 'events',
    label: 'Events page',
    publicPath: '/events',
    sections: [
      {
        fields: [
          { field: 'hero_image', label: 'Hero image', type: 'image' },
          { field: 'heading', label: 'Heading', type: 'text' },
          { field: 'description', label: 'Description', type: 'richtext' },
        ],
      },
    ],
  },
  {
    key: 'attractions',
    label: 'Attractions page',
    publicPath: '/attractions',
    sections: [
      {
        fields: [
          { field: 'hero_image', label: 'Hero image', type: 'image' },
          { field: 'heading', label: 'Heading', type: 'text' },
          { field: 'description', label: 'Description', type: 'richtext' },
        ],
      },
    ],
  },
  {
    key: 'gallery_page',
    label: 'Gallery page',
    publicPath: '/gallery',
    sections: [
      {
        fields: [
          { field: 'hero_image', label: 'Hero image', type: 'image' },
          { field: 'heading', label: 'Heading', type: 'text' },
          { field: 'description', label: 'Description', type: 'richtext' },
        ],
      },
    ],
  },
  {
    key: 'contact',
    label: 'Contact page',
    description: 'Hero only — phone/email/address live in Site Settings',
    publicPath: '/contact',
    sections: [
      {
        fields: [
          { field: 'hero_image', label: 'Hero image', type: 'image' },
          { field: 'heading', label: 'Heading', type: 'text' },
          { field: 'map_embed', label: 'Google Maps embed URL', type: 'url' },
        ],
      },
    ],
  },
  {
    key: 'header',
    label: 'Header / Navigation',
    sections: [
      {
        fields: [
          { field: 'logo_url', label: 'Logo image', type: 'image' },
          {
            field: 'cta_button_text',
            label: 'CTA button text',
            type: 'text',
            hint: 'e.g. "Book Now"',
          },
          { field: 'cta_button_link', label: 'CTA button link', type: 'url' },
          {
            field: 'nav_links',
            label: 'Flat Navigation links (Mobile fallback)',
            type: 'repeater',
            itemFields: [
              { field: 'label', label: 'Label', type: 'text' },
              { field: 'href', label: 'URL', type: 'url' },
            ],
          },
          {
            field: 'mega_menu',
            label: 'Shopify-Style Drag & Drop Mega Menu',
            type: 'menu_builder',
          },
        ],
      },
    ],
  },
  {
    key: 'footer',
    label: 'Footer',
    sections: [
      {
        fields: [
          { field: 'about_text', label: 'About text', type: 'richtext' },
          { field: 'copyright_text', label: 'Copyright text', type: 'text' },
          {
            field: 'nav_links',
            label: 'Footer links',
            type: 'repeater',
            itemFields: [
              { field: 'label', label: 'Label', type: 'text' },
              { field: 'href', label: 'URL', type: 'url' },
            ],
          },
        ],
      },
    ],
  },
  {
    key: 'ical',
    label: 'iCal feeds (internal)',
    description:
      'Managed via the Channel Manager page (Admin → Channel Manager) — supports per-listing → room mapping across Booking.com, MakeMyTrip, Airbnb, Agoda and Goibibo. Editing the raw JSON here is not recommended.',
    sections: [
      {
        fields: [],
      },
    ],
  },
]

export function getPageSchema(key: string): PageSchema | undefined {
  return PAGE_SCHEMAS.find((p) => p.key === key)
}
