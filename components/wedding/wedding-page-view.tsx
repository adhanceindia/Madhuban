'use client'

import { useRef, useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, CalendarDays, CheckCircle2, Loader2, MapPin, Users } from 'lucide-react'
import toast from 'react-hot-toast'

import { SectionHeading } from '@/components/shared/section-heading'
import { SiteIcon } from '@/components/shared/site-icon'
import { Button } from '@/components/ui/button'
import { weddingPage } from '@/lib/page-content'
import { formatDateInput } from '@/lib/room-helpers'
import type { SiteContent } from '@/lib/types'
import { cn } from '@/lib/utils'

const easing = [0.22, 1, 0.36, 1] as const

type InquiryFormState = {
  fullName: string
  phone: string
  email: string
  eventDate: string
  guests: string
  message: string
}

const defaultInquiryState: InquiryFormState = {
  fullName: '',
  phone: '',
  email: '',
  eventDate: '',
  guests: '',
  message: '',
}

export function WeddingPageView({ siteContent }: { siteContent: SiteContent }) {
  const reduceMotion = useReducedMotion()
  const galleryRef = useRef<HTMLDivElement | null>(null)
  const [formState, setFormState] =
    useState<InquiryFormState>(defaultInquiryState)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedName, setSubmittedName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const todayInput = formatDateInput(new Date())

  const sectionVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 26 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.65, ease: easing },
    },
  }

  const containerVariants = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.12,
        delayChildren: reduceMotion ? 0 : 0.06,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.5, ease: easing },
    },
  }

  function handleFieldChange<K extends keyof InquiryFormState>(
    key: K,
    value: InquiryFormState[K],
  ) {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }))
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
          name: formState.fullName,
          phone: formState.phone.replace(/\D/g, '').slice(-10),
          email: formState.email,
          event_type: 'wedding',
          event_date: formState.eventDate || undefined,
          guests_count: formState.guests ? Number(formState.guests) : undefined,
          message: formState.message,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        toast.error(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      setSubmittedName(formState.fullName)
      setIsSubmitted(true)
      setFormState(defaultInquiryState)
    } catch {
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function scrollGalleryToEnd() {
    galleryRef.current?.scrollTo({
      left: galleryRef.current.scrollWidth,
      behavior: 'smooth',
    })
  }

  return (
    <div className="-mt-navbar overflow-x-clip">
      <motion.section
        initial={false}
        animate="show"
        variants={sectionVariants}
        className="relative flex min-h-[100svh] items-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <Image
            src={weddingPage.hero.image}
            alt="Wedding venue lawn and floral ceremony setup at Madhuban Garden Resort"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,20,14,0.54),rgba(16,20,14,0.36)_42%,rgba(16,20,14,0.72))]" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl px-4 pb-16 pt-36 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-white/78 text-sm font-semibold uppercase tracking-eyebrow">
              {weddingPage.hero.eyebrow}
            </p>
            <p className="pointer-events-none mt-2 hidden select-none font-display text-[clamp(4.5rem,14vw,9rem)] italic leading-none text-white/10 lg:block">
              Forever
            </p>
            <h1 className="mt-4 text-balance text-5xl italic leading-tight text-white sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              {weddingPage.hero.title}
            </h1>
            <p className="text-white/88 mt-6 max-w-2xl text-lg leading-8 sm:text-xl">
              {weddingPage.hero.subtitle}
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-auto rounded-full bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-label text-white hover:bg-gold-dark"
              >
                <Link href="#wedding-inquiry">
                  Enquire Now
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <div className="text-white/82 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm backdrop-blur">
                Wedding venue in Agar Malwa District, Madhya Pradesh
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="bg-warm-base py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16">
            <motion.div variants={itemVariants}>
              <div className="overflow-hidden rounded-card border border-[#d8dfce] bg-white shadow-[0_28px_80px_rgba(56,106,14,0.12)]">
                <div className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5]">
                  <Image
                    src={weddingPage.overview.image}
                    alt="Elegant wedding venue interiors at Madhuban Garden Resort"
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <SectionHeading
                eyebrow={weddingPage.overview.eyebrow}
                title={weddingPage.overview.title}
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {weddingPage.overview.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-card-inner border border-[#dfddd5] bg-warm-sand px-4 py-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-label text-gold">
                      {stat.label}
                    </p>
                    <p className="text-foreground/70 mt-3 text-sm font-medium leading-6">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-5">
                {weddingPage.overview.description.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-base leading-8 text-foreground/70"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-8 grid gap-4">
                {weddingPage.overview.points.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-4 rounded-card-inner border border-[#e1e8d9] bg-[#f7fbf3] px-5 py-4"
                  >
                    <span className="mt-1 inline-flex size-9 items-center justify-center rounded-full bg-badge-green text-primary-deep">
                      <CheckCircle2 className="size-4" />
                    </span>
                    <p className="text-foreground/70 text-sm leading-7">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.18 }}
        variants={sectionVariants}
        className="bg-primary-light py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What We Offer"
            title="Wedding services thoughtfully layered around your celebration."
            description="Every function can be supported with venue planning, styling, guest comfort, and coordination help under one roof."
            centered
          />

          <motion.div
            variants={containerVariants}
            className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {weddingPage.services.map((service) => (
              <motion.article
                key={service.title}
                variants={itemVariants}
                className="bg-white/88 rounded-card border border-white/70 p-7 shadow-[0_20px_55px_rgba(56,106,14,0.08)] backdrop-blur"
              >
                <span className="inline-flex size-14 items-center justify-center rounded-full bg-badge-green text-primary-deep">
                  <SiteIcon icon={service.icon} className="size-6" />
                </span>
                <h3 className="mt-5 text-3xl italic text-foreground">
                  {service.title}
                </h3>
                <p className="text-foreground/70 mt-4 text-sm leading-7">
                  {service.description}
                </p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="wedding-gallery"
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.12 }}
        variants={sectionVariants}
        className="bg-warm-base py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Photo Gallery Strip"
            title="A glimpse into the mood, light, and beauty families can expect."
          />

          <div className="relative mt-10">
            <div
              ref={galleryRef}
              className="-mx-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex min-w-max gap-4 sm:gap-6">
                {weddingPage.gallery.map((image, index) => (
                  <motion.div
                    key={image.src}
                    variants={itemVariants}
                    className={cn(
                      'relative overflow-hidden rounded-card-md border border-[#d7dfce] bg-white shadow-[0_18px_50px_rgba(56,106,14,0.08)]',
                      index % 3 === 1
                        ? 'w-[19rem] sm:w-[24rem]'
                        : 'w-[16rem] sm:w-[19rem]',
                    )}
                  >
                    <div
                      className={cn(
                        'relative',
                        index % 3 === 1 ? 'aspect-[4/5]' : 'aspect-[4/4.8]',
                      )}
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(min-width: 640px) 28vw, 70vw"
                        className="object-cover"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-80 items-center justify-end md:flex">
              <div className="bg-white/72 pointer-events-auto rounded-card border border-white/70 p-6 shadow-[0_24px_80px_rgba(27,28,25,0.12)] backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-label text-gold">
                  Wedding Moments
                </p>
                <h3 className="mt-3 text-3xl italic text-foreground">
                  View Full Gallery
                </h3>
                <p className="text-foreground/70 mt-3 text-sm leading-7">
                  Scroll through the strip for more visual references from the
                  celebration atmosphere we are building around Madhuban.
                </p>
                <Button
                  type="button"
                  onClick={scrollGalleryToEnd}
                  className="mt-5 h-auto rounded-full bg-gold px-5 py-3 text-xs font-semibold uppercase tracking-label text-white hover:bg-gold-dark"
                >
                  View Full Gallery
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 md:hidden">
            <Button
              type="button"
              onClick={scrollGalleryToEnd}
              className="h-auto rounded-full bg-gold px-5 py-3 text-xs font-semibold uppercase tracking-label text-white hover:bg-gold-dark"
            >
              View Full Gallery
            </Button>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.18 }}
        variants={sectionVariants}
        className="bg-warm-sand py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why Madhuban Garden"
            title="The venue families choose when they want lush beauty and dependable execution."
            centered
          />

          <motion.div
            variants={containerVariants}
            className="mt-12 grid gap-6 md:grid-cols-2"
          >
            {weddingPage.reasons.map((reason) => (
              <motion.article
                key={reason.title}
                variants={itemVariants}
                className="rounded-card border border-divider bg-white p-7 shadow-[0_18px_55px_rgba(27,28,25,0.06)]"
              >
                <div className="inline-flex size-14 items-center justify-center rounded-full bg-primary-light text-primary-deep">
                  <SiteIcon icon={reason.icon} className="size-6" />
                </div>
                <h3 className="mt-5 text-3xl italic text-foreground">
                  {reason.title}
                </h3>
                <p className="text-foreground/70 mt-4 text-sm leading-7">
                  {reason.description}
                </p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="wedding-inquiry"
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.12 }}
        variants={sectionVariants}
        className="bg-primary-light py-20 sm:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-card border border-[#d8e0cf] bg-warm-cream shadow-[0_28px_90px_rgba(56,106,14,0.12)]">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              <div className="flex flex-col justify-between bg-[linear-gradient(180deg,#2f6e2f,#1f4f25)] px-6 py-8 text-white sm:px-8 sm:py-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-eyebrow text-white/75">
                    {weddingPage.inquiry.eyebrow}
                  </p>
                  <h2 className="mt-5 text-4xl italic leading-tight sm:text-5xl">
                    {weddingPage.inquiry.title}
                  </h2>
                  <p className="mt-5 max-w-md text-sm leading-7 text-white/80 sm:text-base">
                    {weddingPage.inquiry.description}
                  </p>
                </div>

                <div className="border-white/12 bg-white/8 mt-10 space-y-4 rounded-card-inner border p-5 backdrop-blur">
                  <div className="text-white/88 flex items-center gap-3 text-sm">
                    <MapPin className="size-4 text-[#f3d7a2]" />
                    {siteContent.address}
                  </div>
                  <div className="text-white/88 flex items-center gap-3 text-sm">
                    <CalendarDays className="size-4 text-[#f3d7a2]" />
                    Venue visits by appointment
                  </div>
                  <div className="text-white/88 flex items-center gap-3 text-sm">
                    <Users className="size-4 text-[#f3d7a2]" />
                    Wedding desk: {siteContent.phone}
                  </div>
                </div>
              </div>

              <div className="bg-[radial-gradient(circle_at_top_right,rgba(234,243,222,0.85),transparent_35%)] px-6 py-8 sm:px-8 sm:py-10">
                {isSubmitted ? (
                  <div className="flex min-h-[24rem] flex-col items-center justify-center text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-[#eef8e7]">
                      <CheckCircle2 className="size-8 text-primary-deep" />
                    </div>
                    <h3 className="mt-6 text-2xl italic text-foreground sm:text-3xl">
                      Thank you, {submittedName}!
                    </h3>
                    <p className="text-foreground/70 mt-3 max-w-sm text-sm leading-7">
                      We&apos;ve received your wedding enquiry. Our wedding team
                      will contact you within 24 hours to discuss your
                      requirements.
                    </p>
                    <Button
                      type="button"
                      onClick={() => setIsSubmitted(false)}
                      className="mt-8 h-auto rounded-full bg-gold px-8 py-3 text-xs font-semibold uppercase tracking-label text-white hover:bg-gold-dark"
                    >
                      Send Another Enquiry
                    </Button>
                  </div>
                ) : (
                  <form className="grid gap-5" onSubmit={handleSubmit}>
                    <div className="grid gap-5 md:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
                          Full Name
                        </span>
                        <input
                          required
                          type="text"
                          value={formState.fullName}
                          onChange={(event) =>
                            handleFieldChange('fullName', event.target.value)
                          }
                          placeholder="Your full name"
                          className="h-12 rounded-2xl border border-content-border bg-white/90 px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                      </label>

                      <label className="grid gap-2">
                        <span className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
                          Phone
                        </span>
                        <input
                          required
                          type="tel"
                          value={formState.phone}
                          onChange={(event) =>
                            handleFieldChange('phone', event.target.value)
                          }
                          placeholder="+91"
                          className="h-12 rounded-2xl border border-content-border bg-white/90 px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                      </label>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
                          Email
                        </span>
                        <input
                          required
                          type="email"
                          value={formState.email}
                          onChange={(event) =>
                            handleFieldChange('email', event.target.value)
                          }
                          placeholder="your@email.com"
                          className="h-12 rounded-2xl border border-content-border bg-white/90 px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                      </label>

                      <label className="grid gap-2">
                        <span className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
                          Event Date
                        </span>
                        <input
                          required
                          type="date"
                          min={todayInput}
                          value={formState.eventDate}
                          onChange={(event) =>
                            handleFieldChange('eventDate', event.target.value)
                          }
                          className="h-12 rounded-2xl border border-content-border bg-white/90 px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                      </label>
                    </div>

                    <div className="grid gap-5 md:grid-cols-[0.52fr_1fr]">
                      <label className="grid gap-2">
                        <span className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
                          Approx Guests
                        </span>
                        <input
                          required
                          type="number"
                          min={20}
                          value={formState.guests}
                          onChange={(event) =>
                            handleFieldChange('guests', event.target.value)
                          }
                          placeholder="250"
                          className="h-12 rounded-2xl border border-content-border bg-white/90 px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                      </label>

                      <label className="grid gap-2">
                        <span className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
                          Message
                        </span>
                        <textarea
                          required
                          rows={5}
                          value={formState.message}
                          onChange={(event) =>
                            handleFieldChange('message', event.target.value)
                          }
                          placeholder="Tell us about your functions, preferences, and family requirements."
                          className="min-h-[8.75rem] rounded-card-inner border border-content-border bg-white/90 px-4 py-3 text-sm leading-7 text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                      </label>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-foreground/55 text-sm leading-7">
                        Our wedding team will contact you to discuss your
                        requirements.
                      </p>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-auto rounded-full bg-gold px-8 py-3 text-xs font-semibold uppercase tracking-label text-white hover:bg-gold-dark disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Sending…
                          </>
                        ) : (
                          <>
                            Send Enquiry
                            <ArrowRight className="size-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={false}
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="bg-warm-base py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              variants={itemVariants}
              className="relative overflow-hidden rounded-card border border-[#d7dfce] bg-[linear-gradient(180deg,#e9f3df,#f7fbf2)] p-6 shadow-[0_20px_65px_rgba(56,106,14,0.08)] sm:p-8"
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(76,175,80,0.1),transparent_45%)]" />
              <div className="relative h-full min-h-[22rem] overflow-hidden rounded-card-md border border-white/80">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58844.83936774386!2d76.0!3d23.71!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3963711111111111%3A0x1111111111111111!2sAgar%20Malwa%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '22rem' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Madhuban Garden Resort location on Google Maps"
                  className="absolute inset-0"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="pointer-events-auto rounded-card-inner bg-white/90 p-4 shadow-sm backdrop-blur">
                      <p className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
                        Venue Zone
                      </p>
                      <p className="text-foreground/70 mt-3 text-sm leading-6">
                        Agar Malwa District
                      </p>
                    </div>
                    <div className="pointer-events-auto rounded-card-inner bg-white/90 p-4 shadow-sm backdrop-blur">
                      <p className="text-foreground/55 text-xs font-semibold uppercase tracking-label">
                        Arrival Experience
                      </p>
                      <p className="text-foreground/70 mt-3 text-sm leading-6">
                        Easy approach for guests, decorators, and event teams
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="rounded-card border border-divider bg-white p-6 shadow-[0_18px_55px_rgba(27,28,25,0.06)] sm:p-8"
            >
              <SectionHeading
                eyebrow={weddingPage.location.eyebrow}
                title={weddingPage.location.title}
                description={weddingPage.location.note}
              />

              <div className="mt-8 space-y-4">
                <div className="rounded-card-inner bg-warm-sand p-5">
                  <p className="text-xs font-semibold uppercase tracking-label text-gold">
                    Address
                  </p>
                  <p className="text-foreground/70 mt-3 text-base leading-7">
                    {weddingPage.location.address}
                    <br />
                    {weddingPage.location.region}
                  </p>
                </div>

                <div className="rounded-card-inner bg-primary-light p-5">
                  <p className="text-xs font-semibold uppercase tracking-label text-gold">
                    Wedding Desk
                  </p>
                  <p className="text-foreground/70 mt-3 text-base leading-7">
                    {siteContent.phone}
                    <br />
                    {siteContent.email}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
