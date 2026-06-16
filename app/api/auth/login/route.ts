// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { clientIp, isRateLimited, isLockedOut, recordLoginFailure, clearLoginFailures } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit'
import { getSession } from '@/lib/auth'

type CookieToSet = { name: string; value: string; options: CookieOptions }

const schema = z.object({ email: z.string().email(), password: z.string().min(1) })

export async function POST(request: NextRequest) {
  const ip = clientIp(request)
  if (await isRateLimited(`rl:login:${ip}`, 20, 900)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 })
  }
  const { email, password } = parsed.data

  if (await isLockedOut(email)) {
    return NextResponse.json(
      { error: 'Account temporarily locked due to failed attempts. Try again in 15 minutes.' },
      { status: 429 },
    )
  }

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

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    await recordLoginFailure(email)
    await logAudit({
      user_id: null,
      action: 'auth.login_failed',
      entity_type: 'auth',
      new_value: { email },
    })
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }
  await clearLoginFailures(email)

  // Best-effort: resolve the now-authenticated staff row to attribute the audit
  // entry. Falls back to null user_id if the user has no matching/active row.
  const session = await getSession()
  await logAudit({
    user_id: session?.id ?? null,
    action: 'auth.login',
    entity_type: 'auth',
    new_value: { email },
  })

  return NextResponse.json({ ok: true })
}
