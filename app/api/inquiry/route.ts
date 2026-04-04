import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'

import { adminInquiryNotification, guestInquiryAcknowledgement } from '@/lib/email'
import { getRedis } from '@/lib/redis'

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const inquirySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number'),
  email: z.string().email('Enter a valid email address'),
  event_type: z.enum(['wedding', 'birthday', 'corporate', 'other']),
  event_date: z.string().optional(),
  guests_count: z.number().int().positive().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

// ---------------------------------------------------------------------------
// Rate limiting — 5 requests per IP per hour
// ---------------------------------------------------------------------------

const RATE_LIMIT = 5
const RATE_WINDOW = 3600 // 1 hour in seconds

async function isRateLimited(ip: string): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return false

  const key = `inquiry_rl:${ip}`
  const current = await redis.incr(key)

  if (current === 1) {
    await redis.expire(key, RATE_WINDOW)
  }

  return current > RATE_LIMIT
}

// ---------------------------------------------------------------------------
// POST /api/inquiry
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'

    if (await isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }

    // Parse + validate body
    const body = await request.json()
    const result = inquirySchema.safeParse(body)

    if (!result.success) {
      const firstError = result.error.errors[0]?.message ?? 'Invalid request'
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 },
      )
    }

    const data = result.data

    // Save to Inquiries collection via Payload Local API
    const payload = await getPayload({ config })

    await payload.create({
      collection: 'inquiries',
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        event_type: data.event_type,
        event_date: data.event_date ?? null,
        guests_count: data.guests_count ?? null,
        message: data.message,
        status: 'new',
      },
    })

    // Send emails (fire-and-forget — don't block the response on email delivery)
    const emailData = {
      name: data.name,
      phone: data.phone,
      email: data.email,
      event_type: data.event_type,
      event_date: data.event_date,
      guests_count: data.guests_count,
      message: data.message,
    }

    Promise.all([
      adminInquiryNotification(emailData),
      guestInquiryAcknowledgement(emailData),
    ]).catch((err) => {
      console.error('[inquiry] Email sending failed:', err)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[inquiry] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
