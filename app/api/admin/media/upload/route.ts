import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'node:crypto'
import sharp from 'sharp'
import { getSession } from '@/lib/auth'
import { getDb } from '@/db/client'
import { media } from '@/db/schema'

/**
 * Upload an image/video to Cloudflare R2 and return its public URL.
 */
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const r2AccountId = process.env.R2_ACCOUNT_ID
  const r2AccessKey = process.env.R2_ACCESS_KEY_ID
  const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY
  const r2Bucket = process.env.R2_BUCKET_NAME
  const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL

  if (!r2AccountId || !r2AccessKey || !r2SecretKey || !r2Bucket || !r2PublicUrl) {
    return NextResponse.json({ error: 'Storage not configured on server' }, { status: 500 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  const folder = (formData.get('folder') as string | null) || 'uploads'

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  }

  const maxBytes = 20 * 1024 * 1024 // 20 MB
  if (file.size > maxBytes) {
    return NextResponse.json({ error: 'File exceeds 20 MB limit' }, { status: 413 })
  }

  const ALLOWED = {
    'image/jpeg': { ext: 'jpg', magic: [[0xff, 0xd8, 0xff]] },
    'image/png': { ext: 'png', magic: [[0x89, 0x50, 0x4e, 0x47]] },
    'image/webp': { ext: 'webp', magic: [[0x52, 0x49, 0x46, 0x46]] }, // RIFF
    'image/gif': { ext: 'gif', magic: [[0x47, 0x49, 0x46, 0x38]] },
    'video/mp4': { ext: 'mp4', magic: [[0x66, 0x74, 0x79, 0x70]] }, // 'ftyp' at offset 4
  } as const

  const declared = (file as File).type
  const spec = ALLOWED[declared as keyof typeof ALLOWED]
  if (!spec) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 })
  }

  const arrayBuffer = await (file as Blob).arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  const offset = declared === 'video/mp4' ? 4 : 0
  const magicOk = spec.magic.some((sig) => sig.every((b, i) => bytes[offset + i] === b))
  if (!magicOk) {
    return NextResponse.json({ error: 'File content does not match its type' }, { status: 415 })
  }

  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, '').replace(/\.\.+/g, '') || 'uploads'
  const path = `${safeFolder}/${crypto.randomUUID()}.${spec.ext}`

  const r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2AccessKey,
      secretAccessKey: r2SecretKey,
    },
  })

  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: r2Bucket,
        Key: path,
        Body: Buffer.from(arrayBuffer),
        ContentType: declared,
        CacheControl: 'max-age=31536000',
      })
    )
  } catch (uploadError: unknown) {
    console.error('[media/upload] Upload failed:', uploadError)
    const message = uploadError instanceof Error ? uploadError.message : String(uploadError)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const publicUrl = `${r2PublicUrl.replace(/\/$/, '')}/${path}`

  let width = null
  let height = null

  if (declared.startsWith('image/')) {
    try {
      const metadata = await sharp(Buffer.from(arrayBuffer)).metadata()
      width = metadata.width || null
      height = metadata.height || null
    } catch (err) {
      console.warn('Could not get image dimensions:', err)
    }
  }

  const db = getDb()
  const originalName = (file as File).name
  let filename = originalName
  if (!filename || filename === 'image.jpg' || filename === 'image.png' || filename === 'blob') {
     filename = `Untitled-${crypto.randomBytes(2).toString('hex')}.${spec.ext}`
  }

  try {
    await db.insert(media).values({
      filename,
      url: publicUrl,
      mime_type: declared,
      size: file.size,
      width,
      height,
      folder: folder || 'General',
    })
  } catch (dbError) {
    console.error('Failed to save media record to DB', dbError)
  }

  return NextResponse.json({ url: publicUrl, path })
}
