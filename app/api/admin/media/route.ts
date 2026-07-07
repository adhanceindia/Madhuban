import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/db/client'
import { media } from '@/db/schema'
import { desc, ilike, or } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''

  const db = getDb()

  try {
    const query = db.select().from(media)
    
    if (search) {
      query.where(
        or(
          ilike(media.filename, `%${search}%`),
          ilike(media.alt, `%${search}%`)
        )
      )
    }

    const items = await query.orderBy(desc(media.created_at))
    return NextResponse.json({ items })
  } catch (error) {
    console.error('[media] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}
