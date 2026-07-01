import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/db/client'
import { media } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const db = getDb()

  try {
    const [item] = await db.select().from(media).where(eq(media.id, parseInt(id, 10)))
    if (!item) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Try to delete from R2
    const r2AccountId = process.env.R2_ACCOUNT_ID
    const r2AccessKey = process.env.R2_ACCESS_KEY_ID
    const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY
    const r2Bucket = process.env.R2_BUCKET_NAME

    if (r2AccountId && r2AccessKey && r2SecretKey && r2Bucket) {
      try {
        const r2 = new S3Client({
          region: 'auto',
          endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: r2AccessKey,
            secretAccessKey: r2SecretKey,
          },
        })
        
        // extract the path from URL. Format is usually https://public-url.com/folder/uuid.ext
        const urlObj = new URL(item.url)
        const objectKey = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname

        await r2.send(
          new DeleteObjectCommand({
            Bucket: r2Bucket,
            Key: objectKey,
          })
        )
      } catch (err) {
        console.error('[media] R2 Delete error:', err)
        // Proceed to delete from DB even if R2 fails (orphan file)
      }
    }

    await db.delete(media).where(eq(media.id, parseInt(id, 10)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[media] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { filename, alt } = await request.json()

  const db = getDb()

  try {
    const updates: Partial<{ filename: string; alt: string }> = {}
    if (filename !== undefined) updates.filename = filename
    if (alt !== undefined) updates.alt = alt

    const [updated] = await db
      .update(media)
      .set(updates)
      .where(eq(media.id, parseInt(id, 10)))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    return NextResponse.json({ item: updated })
  } catch (error) {
    console.error('[media] PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 })
  }
}
