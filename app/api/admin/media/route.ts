import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/db/client'
import { media, gallery } from '@/db/schema'
import { desc, asc, ilike, or, and, eq } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const session = await getSession('admin')
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const folder = searchParams.get('folder') || ''
  const fileType = searchParams.get('fileType') || '' // e.g. 'image' or 'video'
  const sort = searchParams.get('sort') || 'newest' // 'newest', 'oldest', 'name'

  const db = getDb()

  try {
    const conditions: SQL[] = []
    
    if (search) {
      conditions.push(
        or(
          ilike(media.filename, `%${search}%`),
          ilike(media.alt, `%${search}%`)
        )!
      )
    }

    if (folder) {
      conditions.push(eq(media.folder, folder))
    }

    if (fileType === 'image') {
      conditions.push(ilike(media.mime_type, 'image/%'))
    } else if (fileType === 'video') {
      conditions.push(ilike(media.mime_type, 'video/%'))
    } else if (fileType === 'document') {
      conditions.push(ilike(media.mime_type, 'application/%'))
    }

    let query = db.select().from(media).$dynamic()
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }

    if (sort === 'oldest') {
      query = query.orderBy(asc(media.created_at))
    } else if (sort === 'name') {
      query = query.orderBy(asc(media.filename))
    } else {
      query = query.orderBy(desc(media.created_at))
    }

    const items = await query
    
    // Quick migration logic: Also fetch from gallery if they are not in media
    // This handles old media that was only saved to the gallery table.
    // In a full production setup we would run a migration script.
    // For this redesign, this will suffice to show previously uploaded assets.
    const galleryItems = await db.select().from(gallery).orderBy(desc(gallery.created_at))
    // Note: this mediaUrls set only contains the URLs for the current query,
    // which is a quick approximation to avoid fetching the entire media table.
    const mediaUrls = new Set(items.map(i => i.url))
    
    const missingFromMedia = galleryItems.filter(g => !mediaUrls.has(g.media_url))
    
    let syntheticMedia = missingFromMedia.map(g => ({
      id: -g.id, // Negative ID to avoid collision
      filename: g.media_url.split('/').pop() || 'Unknown',
      url: g.media_url,
      alt: g.caption || '',
      mime_type: g.media_type === 'video' ? 'video/mp4' : 'image/jpeg',
      size: 0,
      width: 0,
      height: 0,
      folder: g.category === 'rooms' ? 'Rooms' : 
              g.category === 'wedding' ? 'Wedding' : 
              g.category === 'events' ? 'Events' : 
              g.category === 'pool' ? 'Pool' : 
              g.category === 'restaurant' ? 'Restaurant' : 'General',
      created_at: g.created_at,
    }))

    if (folder) {
      syntheticMedia = syntheticMedia.filter(s => s.folder === folder)
    }
    if (search) {
      const sLower = search.toLowerCase()
      syntheticMedia = syntheticMedia.filter(s => 
        s.filename.toLowerCase().includes(sLower) || 
        s.alt.toLowerCase().includes(sLower)
      )
    }
    if (fileType) {
      if (fileType === 'image') {
        syntheticMedia = syntheticMedia.filter(s => s.mime_type.startsWith('image/'))
      } else if (fileType === 'video') {
        syntheticMedia = syntheticMedia.filter(s => s.mime_type.startsWith('video/'))
      } else if (fileType === 'document') {
        syntheticMedia = syntheticMedia.filter(s => s.mime_type.startsWith('application/'))
      }
    }
    
    // Combine and re-sort
    const allItems = [...items, ...syntheticMedia]
    
    if (sort === 'oldest') {
      allItems.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    } else if (sort === 'name') {
      allItems.sort((a, b) => a.filename.localeCompare(b.filename))
    } else {
      allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
    
    return NextResponse.json({ items: allItems })
  } catch (error) {
    console.error('[media] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}
