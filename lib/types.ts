/**
 * Frontend-facing types that normalize Payload CMS response shapes
 * into what UI components expect. All Payload → frontend transformations
 * happen in lib/data.ts, so components never deal with raw Payload data.
 */

// ---------------------------------------------------------------------------
// Site Content (from Content global)
// ---------------------------------------------------------------------------

export type HeroImage = {
  page: string
  url: string
  alt: string
}

export function getHeroImage(siteContent: SiteContent, page: string, fallback: string): string {
  const match = siteContent.hero_images.find((h) => h.page === page)
  return match?.url || fallback
}

export function getHeroAlt(siteContent: SiteContent, page: string, fallback: string): string {
  const match = siteContent.hero_images.find((h) => h.page === page)
  return match?.alt || fallback
}

export type MenuItem = {
  id: string
  label: string
  href: string
  description?: string
  image?: string
  parentId: string | null
  sort_order: number
}

export type SiteContent = {
  name: string
  tagline: string
  phone: string
  email: string
  address: string
  whatsapp: string
  instagram: string
  facebook: string
  hero_heading: string
  hero_subtext: string
  wedding_heading: string
  wedding_description: string
  hero_images: HeroImage[]
  homepage_blocks?: unknown[]
  header?: {
    logo_url?: string
    cta_button_text?: string
    cta_button_link?: string
    nav_links?: MenuItem[] // Mobile fallback or flat menu
    mega_menu?: MenuItem[] // The nested drag-and-drop tree
  }
  footer?: {
    about_text?: string
    copyright_text?: string
    nav_links?: { label: string; href: string }[]
  }
}

// ---------------------------------------------------------------------------
// Rooms
// ---------------------------------------------------------------------------

export type RoomData = {
  id: string | number
  slug: string
  name: string
  type: string
  description: string
  price_per_night: number
  capacity: number
  quantity: number
  extra_bed_price: number
  breakfast_included: boolean
  bed_type: string
  room_size: string
  amenities: string[]
  images: string[]
  is_active: boolean
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export type ReviewData = {
  id: string | number
  guest_name: string
  rating: number
  review_text: string
  createdAt: string
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------

export type GalleryItemData = {
  id: string | number
  src: string
  alt: string
  caption: string
  category: string
  sort_order: number
}
