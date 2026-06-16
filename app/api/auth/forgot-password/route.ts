// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { clientIp, isRateLimited } from '@/lib/rate-limit'

type CookieToSet = { name: string; value: string; options: CookieOptions }

const schema = z.object({ email: z.string().email() })

export async function POST(request: NextRequest) {
  const ip = clientIp(request)
  // 5 requests per hour per IP.
  if (await isRateLimited(`rl:forgot:${ip}`, 5, 3600)) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
  }

  const parsed = schema.safeParse(await request.json().catch(() => null))
  // Always return 200 to prevent account enumeration — even on malformed input.
  if (!parsed.success) {
    return NextResponse.json({ ok: true })
  }
  const { email } = parsed.data

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(toSet: CookieToSet[]) {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  const origin = request.nextUrl.origin
  // Fire-and-await but ignore the outcome so we never reveal whether the
  // address exists (no account enumeration).
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  })

  return NextResponse.json({ ok: true })
}
