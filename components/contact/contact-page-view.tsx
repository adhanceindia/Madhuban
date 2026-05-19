'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { EditorialPageHero } from '@/components/shared/editorial-page-hero'
import { SectionHeading } from '@/components/shared/section-heading'
import { SiteIcon } from '@/components/shared/site-icon'
import { Button } from '@/components/ui/button'
import { contactPage } from '@/lib/page-content'
import { createEditorialMotion } from '@/lib/motion'
import { getHeroImage, type SiteContent } from '@/lib/types'

type ContactFormState = {
  name: string
  phone: string
  email: string
  serviceInterest: string
  message: string
}

const defaultFormState: ContactFormState = {
  name: '',
  phone: '',
  email: '',
  serviceInterest: contactPage.serviceInterestOptions[0],
  message: '',
}

const SERVICE_TO_EVENT_TYPE: Record<string, string> = {
  'Wedding Venue': 'wedding',
  'Events & Parties': 'corporate',
}

const fieldClassName =
  'w-full rounded-card-inner border border-[#cfd5c6]/70 bg-white px-4 py-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15'

export function ContactPageView({ siteContent }: { siteContent: SiteContent }) {
  const reduceMotion = useReducedMotion()
  const { sectionVariants, itemVariants } = createEditorialMotion(reduceMotion)
  const [formState, setFormState] = useState<ContactFormState>(defaultFormState)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedName, setSubmittedName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof ContactFormState>(
    key: K,
    value: ContactFormState[K],
  ) {
    setFormState((current) => ({ ...current, [key]: value }))
    setIsSubmitted(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const eventType = SERVICE_TO_EVENT_TYPE[formState.serviceInterest] ?? 'other'
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
    <div className="-mt-navbar overflow-x-clip bg-background">
      <EditorialPageHero
        hero={contactPage.hero}
        imageOverride={getHeroImage(siteContent, 'contact', '')}
        minHeightClassName="min-h-[68svh]"
        imageAlt="Madhuban Garden Resort exterior and lush grounds"
      >
        <Button
          asChild
          size="lg"
          className="h-auto rounded-full bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-label text-white hover:bg-gold-dark"
        >
          <Link href="#query-form">
            Send Query
            <SiteIcon icon="ArrowRight" className="size-4" />
          </Link>
        </Button>
      </EditorialPageHero>

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.18 }}
        variants={sectionVariants}
        className="bg-background py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:gap-16">
            <motion.div variants={itemVariants} className="space-y-8">
              <SectionHeading
                eyebrow="Reach Out"
                title={contactPage.introTitle}
                description={contactPage.introDescription}
              />

              <div className="grid gap-4">
                {contactPage.channels.map((channel) => {
                  const content = (
                    <div className="flex items-start gap-4 rounded-card-md bg-white px-5 py-5 shadow-[0_22px_60px_rgba(27,28,25,0.06)]">
                      <span className="mt-1 inline-flex size-11 items-center justify-center rounded-full bg-primary-light text-primary-deep">
                        <SiteIcon icon={channel.icon} className="size-5" />
                      </span>
                      <div>
                        <p className="text-gold text-xs font-semibold uppercase tracking-label">
                          {channel.label}
                        </p>
                        <p className="text-foreground/70 mt-3 text-sm leading-7">
                          {channel.value}
                        </p>
                      </div>
                    </div>
                  )

                  return channel.href ? (
                    <Link
                      key={channel.label}
                      href={channel.href}
                      className="block"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div key={channel.label}>{content}</div>
                  )
                })}
              </div>

              <div className="rounded-card bg-[linear-gradient(135deg,rgba(56,106,14,0.95),rgba(102,146,48,0.93))] p-7 text-white shadow-[0_24px_70px_rgba(56,106,14,0.18)]">
                <p className="text-white/72 text-xs font-semibold uppercase tracking-eyebrow">
                  Instant Contact
                </p>
                <h3 className="mt-4 text-3xl italic">Prefer WhatsApp?</h3>
                <p className="text-white/82 mt-4 text-sm leading-7">
                  Send a quick message for room enquiries, wedding walkthrough
                  requests, or general planning help from the Madhuban team.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="hover:bg-white/92 mt-6 h-auto rounded-full bg-white px-6 py-3.5 text-sm font-semibold uppercase tracking-tag text-primary-deep"
                >
                  <Link
                    href={`https://wa.me/${siteContent.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <SiteIcon icon="MessageCircle" className="size-4" />
                    Chat on WhatsApp
                  </Link>
                </Button>
              </div>

              <div className="overflow-hidden rounded-card bg-primary-light p-3 shadow-[0_20px_60px_rgba(27,28,25,0.05)]">
                <div className="relative overflow-hidden rounded-card-inner" style={{ minHeight: '19rem' }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58844.83936774386!2d76.0!3d23.71!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3963711111111111%3A0x1111111111111111!2sAgar%20Malwa%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '19rem' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Madhuban Garden Resort location on Google Maps"
                    className="absolute inset-0"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-3">
                    <div className="pointer-events-auto rounded-card-inner bg-white/90 p-5 backdrop-blur">
                      <p className="text-xs font-semibold uppercase tracking-label text-primary-deep/70">
                        Location
                      </p>
                      <p className="text-foreground/70 mt-3 text-sm leading-7">
                        Agar Malwa District, Madhya Pradesh
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <section
                id="query-form"
                className="rounded-card bg-white/90 p-6 shadow-[0_28px_80px_rgba(27,28,25,0.08)] backdrop-blur sm:p-8 lg:p-10"
              >
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
                      eyebrow="Query Form"
                      title={contactPage.formTitle}
                      description={contactPage.formDescription}
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
                            {contactPage.serviceInterestOptions.map((option) => (
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
        </div>
      </motion.section>
    </div>
  )
}
