import 'server-only'

import { getDb } from '@/db/client'
import { rooms, reviews, gallery, siteContent } from '@/db/schema'
import { eq, asc, desc } from 'drizzle-orm'
import type { SiteContent, RoomData, ReviewData, GalleryItemData, HeroImage } from './types'

const defaultSiteContent: SiteContent = {
  name: 'Madhuban Garden Resort',
  tagline: 'The most peaceful & lush green premises in Agar Malwa District.',
  phone: '+91 73899 09985',
  email: 'hello@madhubangarden.com',
  address: 'Agar Malwa District, Madhya Pradesh, India',
  whatsapp: '+91 73899 09985',
  instagram: 'https://instagram.com/madhubangarden',
  facebook: 'https://facebook.com/madhubangarden',
  hero_heading: 'Madhuban Garden Resort',
  hero_subtext: '',
  wedding_heading: 'Make your wedding unforgettable',
  wedding_description: '',
  hero_images: [],
}

type GeneralContent = {
  tagline?: string
  hero_heading?: string
  hero_subtext?: string
  wedding_heading?: string
  wedding_description?: string
}

type ContactContent = {
  phone?: string
  email?: string
  address?: string
  whatsapp?: string
}

type SocialContent = {
  instagram?: string
  facebook?: string
}

type HeroImagesContent = {
  images?: HeroImage[]
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const db = getDb()
    const rows = await db.select().from(siteContent)
    const contentMap: Record<string, unknown> = {}
    for (const row of rows) {
      contentMap[row.page] = row.content
    }

    const general = (contentMap['general'] as GeneralContent) || {}
    const contact = (contentMap['contact'] as ContactContent) || {}
    const social = (contentMap['social'] as SocialContent) || {}
    const heroData = (contentMap['hero_images'] as HeroImagesContent) || {}

    const hero_images: HeroImage[] = Array.isArray(heroData.images)
      ? heroData.images.filter((x) => x?.url)
      : []

    return {
      name: 'Madhuban Garden Resort',
      tagline: general.tagline || defaultSiteContent.tagline,
      hero_heading: general.hero_heading || defaultSiteContent.hero_heading,
      hero_subtext: general.hero_subtext || defaultSiteContent.hero_subtext,
      wedding_heading: general.wedding_heading || defaultSiteContent.wedding_heading,
      wedding_description: general.wedding_description || defaultSiteContent.wedding_description,
      phone: contact.phone || defaultSiteContent.phone,
      email: contact.email || defaultSiteContent.email,
      address: contact.address || defaultSiteContent.address,
      whatsapp: contact.whatsapp || defaultSiteContent.whatsapp,
      instagram: social.instagram || defaultSiteContent.instagram,
      facebook: social.facebook || defaultSiteContent.facebook,
      hero_images,
    }
  } catch (error) {
    console.error('[data] getSiteContent error:', error)
    return defaultSiteContent
  }
}

function normalizeRoom(room: typeof rooms.$inferSelect): RoomData {
  return {
    id: room.id,
    slug: room.slug,
    name: room.name,
    type: room.type,
    description: room.description || '',
    price_per_night: room.price_per_night,
    capacity: room.capacity,
    bed_type: room.bed_type || '',
    room_size: room.room_size || '',
    amenities: (room.amenities as string[]) || [],
    images: (room.images as string[]) || [],
    is_active: room.is_active,
  }
}

export async function getRooms(): Promise<RoomData[]> {
  try {
    const db = getDb()
    const results = await db.select().from(rooms).where(eq(rooms.is_active, true)).orderBy(asc(rooms.price_per_night))
    return results.map(normalizeRoom)
  } catch (error) {
    console.error('[data] getRooms error:', error)
    return []
  }
}

export async function getRoomBySlug(slug: string): Promise<RoomData | null> {
  try {
    const db = getDb()
    const [room] = await db.select().from(rooms).where(eq(rooms.slug, slug)).limit(1)
    if (!room) return null
    return normalizeRoom(room)
  } catch (error) {
    console.error('[data] getRoomBySlug error:', error)
    return null
  }
}

export async function getFeaturedRooms(): Promise<RoomData[]> {
  try {
    const db = getDb()
    const results = await db
      .select()
      .from(rooms)
      .where(eq(rooms.is_active, true))
      .orderBy(desc(rooms.price_per_night))
      .limit(3)
    return results.map(normalizeRoom)
  } catch (error) {
    console.error('[data] getFeaturedRooms error:', error)
    return []
  }
}

export async function getRelatedRooms(currentSlug: string, limit = 3): Promise<RoomData[]> {
  const allRooms = await getRooms()
  return allRooms.filter((r) => r.slug !== currentSlug).slice(0, limit)
}

export async function getReviews(): Promise<ReviewData[]> {
  try {
    const db = getDb()
    const results = await db
      .select()
      .from(reviews)
      .where(eq(reviews.is_published, true))
      .orderBy(desc(reviews.created_at))
      .limit(50)
    return results.map((r) => ({
      id: r.id,
      guest_name: r.guest_name,
      rating: r.rating,
      review_text: r.review_text,
      createdAt: r.created_at.toISOString(),
    }))
  } catch (error) {
    console.error('[data] getReviews error:', error)
    return []
  }
}

export async function getGallery(category?: string): Promise<GalleryItemData[]> {
  try {
    const db = getDb()
    const results = category && category !== 'all'
      ? await db.select().from(gallery).where(eq(gallery.category, category as 'rooms' | 'wedding' | 'events' | 'pool' | 'restaurant')).orderBy(asc(gallery.sort_order))
      : await db.select().from(gallery).orderBy(asc(gallery.sort_order))

    return results.map((g) => ({
      id: g.id,
      src: g.media_url,
      alt: g.caption || '',
      caption: g.caption || '',
      category: g.category,
      sort_order: g.sort_order,
    }))
  } catch (error) {
    console.error('[data] getGallery error:', error)
    return []
  }
}
