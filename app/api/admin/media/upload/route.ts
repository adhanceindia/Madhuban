import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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

  const fileName = (file as File).name || 'upload.bin'
  const safeName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.\-]/g, '-')
    .replace(/-+/g, '-')
  const path = `${folder}/${Date.now()}-${safeName}`

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, arrayBuffer, {
      contentType: file.type || 'application/octet-stream',
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
