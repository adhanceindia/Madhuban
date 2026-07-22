'use client'

import { useState, type FormEvent } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { SiteIcon } from '@/components/shared/site-icon'
import { SectionHeading } from '@/components/shared/section-heading'

type CorporateFormState = {
  name: string
  phone: string
  email: string
  eventDate: string
  guestsCount: string
  message: string
}

const defaultFormState: CorporateFormState = {
  name: '',
  phone: '',
  email: '',
  eventDate: '',
  guestsCount: '',
  message: '',
}

const fieldClassName =
  'w-full rounded-card-inner border border-[#cfd5c6]/70 bg-white px-4 py-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15'

type CorporateBookingFormProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
};

export function CorporateBookingForm({ eyebrow, title, description }: CorporateBookingFormProps) {
  const [formState, setFormState] = useState<CorporateFormState>(defaultFormState)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedName, setSubmittedName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof CorporateFormState>(
    key: K,
    value: CorporateFormState[K],
  ) {
    setFormState((current) => ({ ...current, [key]: value }))
    setIsSubmitted(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formState.name,
          phone: formState.phone.replace(/\D/g, '').slice(-10),
          email: formState.email,
          event_type: 'corporate',
          event_date: formState.eventDate || undefined,
          guests_count: formState.guestsCount ? parseInt(formState.guestsCount, 10) : undefined,
          message: formState.message,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      setSubmittedName(formState.name)
      setIsSubmitted(true)
      setFormState(defaultFormState)
    } catch {
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-[22rem] flex-col items-center justify-center text-center rounded-card bg-white/90 p-6 shadow-[0_28px_80px_rgba(27,28,25,0.08)] backdrop-blur sm:p-8 lg:p-10">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary-light">
          <CheckCircle2 className="size-8 text-primary-deep" />
        </div>
        <h3 className="mt-6 text-2xl italic text-foreground sm:text-3xl">
          Thank you, {submittedName}!
        </h3>
        <p className="text-foreground/70 mt-3 max-w-sm text-sm leading-7">
          We&apos;ve received your corporate booking enquiry and our events team will get back to you shortly.
        </p>
        <Button
          type="button"
          onClick={() => setIsSubmitted(false)}
          size="lg"
          className="mt-8 h-auto rounded-full bg-[linear-gradient(135deg,#386a0e,#76a839)] px-8 py-4 text-sm font-semibold uppercase tracking-label text-white hover:opacity-95"
        >
          Send Another Enquiry
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-card bg-white/90 p-6 shadow-[0_28px_80px_rgba(27,28,25,0.08)] backdrop-blur sm:p-8 lg:p-10">
      <SectionHeading
        eyebrow={eyebrow || "Corporate Booking"}
        title={title || "Plan your corporate meet"}
        description={description || "Fill out the form below with your event details, and we'll help you organize the perfect corporate gathering."}
      />

      <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
              Full Name
            </span>
            <input
              type="text"
              required
              value={formState.name}
              onChange={(event) => updateField('name', event.target.value)}
              className={fieldClassName}
              placeholder="Your name"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
              Phone
            </span>
            <input
              type="tel"
              required
              value={formState.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              className={fieldClassName}
              placeholder="+91"
            />
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
              Email
            </span>
            <input
              type="email"
              required
              value={formState.email}
              onChange={(event) => updateField('email', event.target.value)}
              className={fieldClassName}
              placeholder="name@example.com"
            />
          </label>

          <div className="grid gap-2">
            <span className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
              Event Date (Optional)
            </span>
            <input
              type="date"
              value={formState.eventDate}
              onChange={(event) => updateField('eventDate', event.target.value)}
              className={fieldClassName}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <label className="grid gap-2">
          <span className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
            Expected Guests (Optional)
          </span>
          <input
            type="number"
            min="1"
            value={formState.guestsCount}
            onChange={(event) => updateField('guestsCount', event.target.value)}
            className={fieldClassName}
            placeholder="e.g. 50"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
            Message
          </span>
          <textarea
            required
            rows={4}
            value={formState.message}
            onChange={(event) => updateField('message', event.target.value)}
            className={fieldClassName}
            placeholder="Tell us about your corporate event requirements."
          />
        </label>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="mt-2 h-auto rounded-full bg-[linear-gradient(135deg,#386a0e,#76a839)] px-8 py-4 text-sm font-semibold uppercase tracking-label text-white hover:opacity-95 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              Request Booking
              <SiteIcon icon="ArrowRight" className="size-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
