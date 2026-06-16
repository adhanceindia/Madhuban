import { Resend } from 'resend'
import { escapeHtml, stripHeader } from '@/lib/sanitize'

// ---------------------------------------------------------------------------
// Resend client (lazy — avoids crash when RESEND_API_KEY isn't set at build)
// ---------------------------------------------------------------------------

let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

const FROM_EMAIL = 'Madhuban Garden Resort <bookings@madhubangarden.com>'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// ---------------------------------------------------------------------------
// Booking confirmation email (Pay at Reception)
// ---------------------------------------------------------------------------

type BookingEmailData = {
  booking_id: string | number
  guest_name: string
  guest_email: string
  guest_phone: string
  room_name: string
  check_in: string
  check_out: string
  nights: number
  subtotal: number
  gst: number
  total_amount: number
  payment_method: 'online' | 'at_reception'
}

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  const {
    booking_id,
    guest_name,
    guest_email,
    room_name,
    check_in,
    check_out,
    nights,
    subtotal,
    gst,
    total_amount,
    payment_method,
  } = data

  const paymentNote =
    payment_method === 'at_reception'
      ? 'Please pay the full amount at the reception desk during check-in.'
      : 'Payment received successfully. Thank you!'

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #fffdf8; border: 1px solid #e8e4da; border-radius: 16px; overflow: hidden;">
      <div style="background: #386a0e; padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Booking Confirmed</h1>
        <p style="color: #c0dd97; margin: 8px 0 0; font-size: 14px;">Madhuban Garden Resort</p>
      </div>

      <div style="padding: 32px 24px;">
        <p style="color: #333; font-size: 16px; margin: 0 0 24px;">
          Dear <strong>${escapeHtml(guest_name)}</strong>,<br/>
          Thank you for choosing Madhuban Garden Resort. Your booking has been confirmed.
        </p>

        <div style="background: #f6f3eb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #555;">
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #333;">Booking ID</td>
              <td style="padding: 8px 0; text-align: right;">#${booking_id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #333;">Room</td>
              <td style="padding: 8px 0; text-align: right;">${escapeHtml(room_name)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #333;">Check-in</td>
              <td style="padding: 8px 0; text-align: right;">${formatDate(check_in)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #333;">Check-out</td>
              <td style="padding: 8px 0; text-align: right;">${formatDate(check_out)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #333;">Duration</td>
              <td style="padding: 8px 0; text-align: right;">${nights} ${nights === 1 ? 'night' : 'nights'}</td>
            </tr>
            <tr style="border-top: 1px solid #ddd9cf;">
              <td style="padding: 8px 0; font-weight: 600; color: #333;">Subtotal</td>
              <td style="padding: 8px 0; text-align: right;">${formatCurrency(subtotal)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #333;">GST (12%)</td>
              <td style="padding: 8px 0; text-align: right;">${formatCurrency(gst)}</td>
            </tr>
            <tr style="border-top: 1px solid #ddd9cf;">
              <td style="padding: 12px 0 8px; font-weight: 700; color: #333; font-size: 16px;">Total</td>
              <td style="padding: 12px 0 8px; text-align: right; font-weight: 700; color: #ba7517; font-size: 16px;">${formatCurrency(total_amount)}</td>
            </tr>
          </table>
        </div>

        <div style="background: ${payment_method === 'at_reception' ? '#fff4ee' : '#eef8e7'}; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: ${payment_method === 'at_reception' ? '#8e4b21' : '#2f5d0a'};">
            ${paymentNote}
          </p>
        </div>

        <p style="color: #777; font-size: 13px; margin: 0; line-height: 1.6;">
          If you have any questions, reach us at<br/>
          <strong>Phone:</strong> +91 7590 000 925<br/>
          <strong>Email:</strong> info@madhubangarden.com
        </p>
      </div>

      <div style="background: #f6f3eb; padding: 16px 24px; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #999;">
          Madhuban Garden Resort, Agar Malwa District, Madhya Pradesh
        </p>
      </div>
    </div>
  `

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: guest_email,
    subject: `Booking Confirmed — ${stripHeader(room_name)} | Madhuban Garden Resort`,
    html,
  })

  if (error) {
    console.error('[email] Failed to send booking confirmation:', error)
    throw error
  }
}

// ---------------------------------------------------------------------------
// Inquiry notification email (to admin)
// ---------------------------------------------------------------------------

type InquiryEmailData = {
  name: string
  phone: string
  email: string
  event_type: string
  event_date?: string | null
  guests_count?: number | null
  message: string
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: 'Wedding',
  birthday: 'Birthday Party',
  corporate: 'Corporate Event',
  other: 'Other',
}

export async function adminInquiryNotification(inquiry: InquiryEmailData) {
  const eventLabel = EVENT_TYPE_LABELS[inquiry.event_type] ?? inquiry.event_type

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #fffdf8; border: 1px solid #e8e4da; border-radius: 16px; overflow: hidden;">
      <div style="background: #386a0e; padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New ${escapeHtml(eventLabel)} Inquiry</h1>
        <p style="color: #c0dd97; margin: 8px 0 0; font-size: 14px;">Madhuban Garden Resort</p>
      </div>

      <div style="padding: 32px 24px;">
        <div style="background: #f6f3eb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #555;">
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #333;">Name</td>
              <td style="padding: 8px 0; text-align: right;">${escapeHtml(inquiry.name)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #333;">Phone</td>
              <td style="padding: 8px 0; text-align: right;"><a href="tel:+91${escapeHtml(inquiry.phone)}" style="color: #386a0e;">${escapeHtml(inquiry.phone)}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #333;">Email</td>
              <td style="padding: 8px 0; text-align: right;"><a href="mailto:${escapeHtml(inquiry.email)}" style="color: #386a0e;">${escapeHtml(inquiry.email)}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #333;">Event Type</td>
              <td style="padding: 8px 0; text-align: right;">${escapeHtml(eventLabel)}</td>
            </tr>
            ${inquiry.event_date ? `<tr><td style="padding: 8px 0; font-weight: 600; color: #333;">Event Date</td><td style="padding: 8px 0; text-align: right;">${formatDate(inquiry.event_date)}</td></tr>` : ''}
            ${inquiry.guests_count ? `<tr><td style="padding: 8px 0; font-weight: 600; color: #333;">Expected Guests</td><td style="padding: 8px 0; text-align: right;">${inquiry.guests_count}</td></tr>` : ''}
          </table>
        </div>

        <div style="background: #fff4ee; border-radius: 12px; padding: 16px 20px;">
          <p style="margin: 0 0 4px; font-weight: 600; font-size: 13px; color: #333;">Message</p>
          <p style="margin: 0; font-size: 14px; color: #555; white-space: pre-line;">${escapeHtml(inquiry.message)}</p>
        </div>
      </div>

      <div style="background: #f6f3eb; padding: 16px 24px; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #999;">
          View all inquiries at madhubangarden.com/admin/collections/inquiries
        </p>
      </div>
    </div>
  `

  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    console.error('[email] ADMIN_EMAIL not set — skipping admin notification')
    return
  }

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: adminEmail,
    subject: `New ${stripHeader(eventLabel)} Inquiry from ${stripHeader(inquiry.name)}`,
    html,
  })

  if (error) {
    console.error('[email] Failed to send admin inquiry notification:', error)
    throw error
  }
}

// ---------------------------------------------------------------------------
// Inquiry acknowledgement email (to guest)
// ---------------------------------------------------------------------------

export async function guestInquiryAcknowledgement(inquiry: InquiryEmailData) {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #fffdf8; border: 1px solid #e8e4da; border-radius: 16px; overflow: hidden;">
      <div style="background: #386a0e; padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">We've Received Your Inquiry</h1>
        <p style="color: #c0dd97; margin: 8px 0 0; font-size: 14px;">Madhuban Garden Resort</p>
      </div>

      <div style="padding: 32px 24px;">
        <p style="color: #333; font-size: 16px; margin: 0 0 24px;">
          Dear <strong>${escapeHtml(inquiry.name)}</strong>,<br/>
          Thank you for reaching out to Madhuban Garden Resort. We've received your inquiry and our team will get back to you within 24 hours.
        </p>

        <div style="background: #eef8e7; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #2f5d0a;">
            If your matter is urgent, please call us directly at <strong>+91 7590 000 925</strong>.
          </p>
        </div>

        <p style="color: #777; font-size: 13px; margin: 0; line-height: 1.6;">
          <strong>Phone:</strong> +91 7590 000 925<br/>
          <strong>Email:</strong> info@madhubangarden.com
        </p>
      </div>

      <div style="background: #f6f3eb; padding: 16px 24px; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #999;">
          Madhuban Garden Resort, Agar Malwa District, Madhya Pradesh
        </p>
      </div>
    </div>
  `

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: inquiry.email,
    subject: "We've received your inquiry — Madhuban Garden Resort",
    html,
  })

  if (error) {
    console.error('[email] Failed to send guest inquiry acknowledgement:', error)
    throw error
  }
}
