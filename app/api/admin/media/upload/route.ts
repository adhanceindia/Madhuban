import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'
import { getSession } from '@/lib/auth'

/**
 * Upload an image/video to Supabase Storage and return its public URL.
 * Uses the service-role key to bypass RLS (admin-only endpoint).
 */
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const bucket = process.env.SUPABASE_S3_BUCKET

  if (!url || !serviceKey || !bucket) {
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

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, arrayBuffer, {
      contentType: declared,
      cacheControl: '31536000',
      upsert: false,
    })

  if (uploadError) {
    console.error('[media/upload] Upload failed:', uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path)
  if (!publicUrlData?.publicUrl) {
    return NextResponse.json({ error: 'Could not derive public URL' }, { status: 500 })
  }

  return NextResponse.json({ url: publicUrlData.publicUrl, path })
}
