'use client'

import { useState, type FormEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { SectionHeading } from '@/components/shared/section-heading'
import { SiteIcon } from '@/components/shared/site-icon'
import { Button } from '@/components/ui/button'
import { createEditorialMotion } from '@/lib/motion'

type ContactFormState = {
  name: string
  phone: string
  email: string
  serviceInterest: string
  message: string
}

const SERVICE_INTEREST_OPTIONS = [
  'Wedding Venue',
  'Events & Parties',
  'Room Booking',
  'Restaurant/Dining',
  'Other',
]

const defaultFormState: ContactFormState = {
  name: '',
  phone: '',
  email: '',
  serviceInterest: SERVICE_INTEREST_OPTIONS[0],
  message: '',
}

const SERVICE_TO_EVENT_TYPE: Record<string, string> = {
  'Wedding Venue': 'wedding',
  'Events & Parties': 'corporate',
}

const fieldClassName =
  'w-full rounded-card-inner border border-[#cfd5c6]/70 bg-white px-4 py-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15'

export interface ContactFormBlockProps {
  eyebrow?: string
  title?: string
  description?: string
}

export function ContactFormBlock({
  eyebrow = 'Query Form',
  title = 'Send us a message',
  description = 'Fill out the form below and we will get back to you shortly.',
}: ContactFormBlockProps) {
  const reduceMotion = useReducedMotion()
  const { sectionVariants, itemVariants } = createEditorialMotion(reduceMotion)

  const [formState, setFormState] = useState<ContactFormState>(defaultFormState)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedName, setSubmittedName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof ContactFormState>(
    key: K,
    value: ContactFormState[K]
  ) {
    setFormState((current) => ({ ...current, [key]: value }))
    setIsSubmitted(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const eventType =
        SERVICE_TO_EVENT_TYPE[formState.serviceInterest] ?? 'other'
      const messageWithInterest =
        eventType === 'other'
          ? `[Interest: ${formState.serviceInterest}]\n\n${formState.message}`
          : formState.message

      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formState.name,
          phone: formState.phone.replace(/\D/g, '').slice(-10),
          email: formState.email,
          event_type: eventType,
          message: messageWithInterest,
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

  return (
    <motion.section
      initial={false}
      whileInView="show"
      viewport={{ once: true, amount: 0.18 }}
      variants={sectionVariants}
      className="bg-background py-12 sm:py-16 lg:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div variants={itemVariants}>
          <section className="rounded-card bg-white/90 p-6 shadow-[0_28px_80px_rgba(27,28,25,0.08)] backdrop-blur sm:p-8 lg:p-10">
            {isSubmitted ? (
              <div className="flex min-h-[22rem] flex-col items-center justify-center text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-primary-light">
                  <CheckCircle2 className="size-8 text-primary-deep" />
                </div>
                <h3 className="mt-6 text-2xl italic text-foreground sm:text-3xl">
                  Thank you, {submittedName}!
                </h3>
                <p className="text-foreground/70 mt-3 max-w-sm text-sm leading-7">
                  We&apos;ve received your enquiry and will get back to you
                  within 24 hours.
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
            ) : (
              <>
                <SectionHeading
                  eyebrow={eyebrow}
                  title={title}
                  description={description}
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
                        onChange={(event) =>
                          updateField('name', event.target.value)
                        }
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
                        onChange={(event) =>
                          updateField('phone', event.target.value)
                        }
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
                        onChange={(event) =>
                          updateField('email', event.target.value)
                        }
                        className={fieldClassName}
                        placeholder="name@example.com"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
                        Service Interest
                      </span>
                      <select
                        value={formState.serviceInterest}
                        onChange={(event) =>
                          updateField('serviceInterest', event.target.value)
                        }
                        className={fieldClassName}
                      >
                        {SERVICE_INTEREST_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="grid gap-2">
                    <span className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
                      Message
                    </span>
                    <textarea
                      required
                      rows={6}
                      value={formState.message}
                      onChange={(event) =>
                        updateField('message', event.target.value)
                      }
                      className={fieldClassName}
                      placeholder="Tell us what you are planning or what you need help with."
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
                        Send Enquiry
                        <SiteIcon icon="ArrowRight" className="size-4" />
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}
          </section>
        </motion.div>
      </div>
    </motion.section>
  )
}
