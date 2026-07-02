/**
 * Per-page editable field config. The PageEditor walks this and renders
 * the appropriate input for each field. To add a new editable page,
 * add an entry here — no UI changes required.
 */

export type FieldType = 'text' | 'textarea' | 'richtext' | 'image' | 'url' | 'repeater'

export type FieldDef = {
  field: string
  label: string
  type: FieldType
  hint?: string
  required?: boolean
  /** For repeater fields, defines the shape of each item */
  itemFields?: { field: string; label: string; type: 'text' | 'url' }[]
}

export type PageSchema = {
  key: string
  label: string
  description?: string
  publicPath?: string
  sections: { title?: string; fields: FieldDef[] }[]
}

export const PAGE_SCHEMAS: PageSchema[] = [
  {
    key: 'homepage',
    label: 'Homepage',
    description: 'Hero, tagline, featured rooms callout',
    publicPath: '/',
    sections: [
      {
        title: 'Hero',
        fields: [
          { field: 'hero_image', label: 'Hero image', type: 'image' },
          { field: 'hero_heading', label: 'Hero heading', type: 'text' },
          { field: 'tagline', label: 'Tagline', type: 'text' },
          { field: 'hero_subtext', label: 'Hero subtext', type: 'richtext' },
        ],
      },
      {
        title: 'Call to action',
        fields: [
          { field: 'cta_text', label: 'CTA button text', type: 'text' },
          { field: 'cta_link', label: 'CTA link URL', type: 'url' },
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
          { field: 'seo_description', label: 'SEO description', type: 'textarea' },
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
          { field: 'wedding_description', label: 'Description', type: 'richtext' },
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
          { field: 'cta_button_text', label: 'CTA button text', type: 'text', hint: 'e.g. "Book Now"' },
          { field: 'cta_button_link', label: 'CTA button link', type: 'url' },
          {
            field: 'nav_links',
            label: 'Navigation links',
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
    key: 'footer',
    label: 'Footer',
    sections: [
      {
        fields: [
          { field: 'about_text', label: 'About text', type: 'richtext' },
          { field: 'copyright_text', label: 'Copyright text', type: 'text' },
        ],
      },
    ],
  },
  {
    key: 'ical',
    label: 'iCal feeds (internal)',
    description: 'Managed via Channel Manager — not normally edited here',
    sections: [
      {
        fields: [
          { field: 'bookingcom_ical_url', label: 'Booking.com iCal URL', type: 'url' },
          { field: 'mmt_ical_url', label: 'MakeMyTrip iCal URL', type: 'url' },
          { field: 'goibibo_ical_url', label: 'Goibibo iCal URL', type: 'url' },
        ],
      },
    ],
  },
]

export function getPageSchema(key: string): PageSchema | undefined {
  return PAGE_SCHEMAS.find((p) => p.key === key)
}
