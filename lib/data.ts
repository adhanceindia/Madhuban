import 'server-only'

import { getPayload } from 'payload'
import type { Where } from 'payload'
import config from '@payload-config'

import type { SiteContent, RoomData, ReviewData, GalleryItemData } from './types'

// ---------------------------------------------------------------------------
// Helpers — Payload → Frontend normalization
// ---------------------------------------------------------------------------

function extractPlainText(richTextField: unknown): string {
  if (!richTextField) return ''
  if (typeof richTextField === 'string') return richTextField

  // Payload Lexical richText stores as { root: { children: [...] } }
  const root = (richTextField as Record<string, unknown>)?.root
  if (!root) return ''

  function walkNodes(nodes: unknown[]): string {
    return nodes
      .map((node: unknown) => {
        const n = node as Record<string, unknown>
        if (n.text) return n.text as string
        if (Array.isArray(n.children)) return walkNodes(n.children)
        return ''
      })
      .join(' ')
      .trim()
  }

  const children = (root as Record<string, unknown>)?.children
  if (Array.isArray(children)) return walkNodes(children)
  return ''
}

function normalizeRoom(doc: Record<string, unknown>): RoomData {
  // Extract amenities from Payload array-of-objects format: [{ amenity: 'WiFi' }]
  const rawAmenities = doc.amenities as Array<Record<string, unknown>> | undefined
  const amenities = Array.isArray(rawAmenities)
    ? rawAmenities.map((a) => (a.amenity as string) || '').filter(Boolean)
    : []

  // Extract image URLs — Payload upload returns objects with url/filename
  const rawImages = doc.images as Array<Record<string, unknown> | string> | undefined
  const images = Array.isArray(rawImages)
    ? rawImages
        .map((img) => {
          if (typeof img === 'string') return img
          return (img?.url as string) || (img?.filename as string) || ''
        })
        .filter(Boolean)
    : []

  return {
    id: (doc.id as string | number) || '',
    slug: (doc.slug as string) || '',
    name: (doc.name as string) || '',
    type: (doc.type as string) || '',
    description: extractPlainText(doc.description),
    price_per_night: (doc.price_per_night as number) || 0,
    capacity: (doc.capacity as number) || 1,
    bed_type: (doc.bed_type as string) || '',
    room_size: (doc.room_size as string) || '',
    amenities,
    images,
    is_active: (doc.is_active as boolean) ?? true,
  }
}

function normalizeReview(doc: Record<string, unknown>): ReviewData {
  return {
    id: (doc.id as string | number) || '',
    guest_name: (doc.guest_name as string) || '',
    rating: (doc.rating as number) || 5,
    review_text: (doc.review_text as string) || '',
    createdAt: (doc.createdAt as string) || new Date().toISOString(),
  }
}

function normalizeGalleryItem(doc: Record<string, unknown>): GalleryItemData {
  const image = doc.image as Record<string, unknown> | string | undefined
  let src = ''
  let alt = ''

  if (typeof image === 'string') {
    src = image
  } else if (image) {
    src = (image.url as string) || (image.filename as string) || ''
    alt = (image.alt as string) || ''
  }

  return {
    id: (doc.id as string | number) || '',
    src,
    alt: alt || (doc.caption as string) || '',
    caption: (doc.caption as string) || '',
    category: (doc.category as string) || '',
    sort_order: (doc.sort_order as number) || 0,
  }
}

// ---------------------------------------------------------------------------
// Default "resort" fallback (used when Content global hasn't loaded)
// ---------------------------------------------------------------------------

const defaultSiteContent: SiteContent = {
  name: 'Madhuban Garden Resort',
  tagline: 'The most peaceful & lush green premises in Agar Malwa District.',
  phone: '+91 98765 43210',
  email: 'hello@madhubangarden.com',
  address: 'Agar Malwa District, Madhya Pradesh, India',
  whatsapp: '+91 98765 43210',
  instagram: 'https://instagram.com/madhubangarden',
  facebook: 'https://facebook.com/madhubangarden',
  hero_heading: 'Madhuban Garden Resort',
  hero_subtext: '',
  wedding_heading: 'Make your wedding unforgettable',
  wedding_description: '',
}

// ---------------------------------------------------------------------------
// Data fetching functions
// ---------------------------------------------------------------------------

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const payload = await getPayload({ config })
    const data = await payload.findGlobal({ slug: 'content' })
    const d = data as Record<string, unknown>

    const hero = (d.hero as Record<string, unknown>) || {}
    const wedding = (d.wedding as Record<string, unknown>) || {}
    const contact = (d.contact as Record<string, unknown>) || {}
    const social = (d.social as Record<string, unknown>) || {}

    return {
      name: 'Madhuban Garden Resort',
      tagline: (hero.tagline as string) || defaultSiteContent.tagline,
      hero_heading: (hero.hero_heading as string) || defaultSiteContent.hero_heading,
      hero_subtext: (hero.hero_subtext as string) || defaultSiteContent.hero_subtext,
      wedding_heading: (wedding.wedding_heading as string) || defaultSiteContent.wedding_heading,
      wedding_description: (wedding.wedding_description as string) || defaultSiteContent.wedding_description,
      phone: (contact.contact_phone as string) || defaultSiteContent.phone,
      email: (contact.contact_email as string) || defaultSiteContent.email,
      address: (contact.contact_address as string) || defaultSiteContent.address,
      whatsapp: (contact.whatsapp_number as string) || defaultSiteContent.whatsapp,
      instagram: (social.instagram_url as string) || defaultSiteContent.instagram,
      facebook: (social.facebook_url as string) || defaultSiteContent.facebook,
    }
  } catch (error) {
    console.error('[data] getSiteContent error:', error)
    return defaultSiteContent
  }
}

export async function getRooms(): Promise<RoomData[]> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'rooms',
      where: { is_active: { equals: true } },
      limit: 100,
      sort: 'price_per_night',
    })

    return result.docs.map((doc) => normalizeRoom(doc as unknown as Record<string, unknown>))
  } catch (error) {
    console.error('[data] getRooms error:', error)
    return []
  }
}

export async function getRoomBySlug(slug: string): Promise<RoomData | null> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'rooms',
      where: { slug: { equals: slug } },
      limit: 1,
    })

    if (!result.docs.length) return null
    return normalizeRoom(result.docs[0] as unknown as Record<string, unknown>)
  } catch (error) {
    console.error('[data] getRoomBySlug error:', error)
    return null
  }
}

export async function getFeaturedRooms(): Promise<RoomData[]> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'rooms',
      where: { is_active: { equals: true } },
      limit: 3,
      sort: '-price_per_night',
    })

    return result.docs.map((doc) => normalizeRoom(doc as unknown as Record<string, unknown>))
  } catch (error) {
    console.error('[data] getFeaturedRooms error:', error)
    return []
  }
}

export async function getRelatedRooms(
  currentSlug: string,
  limit = 3,
): Promise<RoomData[]> {
  try {
    const rooms = await getRooms()
    return rooms.filter((r) => r.slug !== currentSlug).slice(0, limit)
  } catch (error) {
    console.error('[data] getRelatedRooms error:', error)
    return []
  }
}

export async function getReviews(): Promise<ReviewData[]> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'reviews',
      where: { is_published: { equals: true } },
      limit: 50,
      sort: '-createdAt',
    })

    return result.docs.map((doc) => normalizeReview(doc as unknown as Record<string, unknown>))
  } catch (error) {
    console.error('[data] getReviews error:', error)
    return []
  }
}

export async function getGallery(
  category?: string,
): Promise<GalleryItemData[]> {
  try {
    const payload = await getPayload({ config })

    const where: Where = {}
    if (category && category !== 'all') {
      where.category = { equals: category }
    }

    const result = await payload.find({
      collection: 'gallery',
      where,
      limit: 100,
      sort: 'sort_order',
    })

    return result.docs.map((doc) => normalizeGalleryItem(doc as unknown as Record<string, unknown>))
  } catch (error) {
    console.error('[data] getGallery error:', error)
    return []
  }
}
