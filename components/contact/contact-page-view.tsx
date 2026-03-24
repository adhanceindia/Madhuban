'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

import { EditorialPageHero } from '@/components/shared/editorial-page-hero'
import { SectionHeading } from '@/components/shared/section-heading'
import { SiteIcon } from '@/components/shared/site-icon'
import { Button } from '@/components/ui/button'
import { contactPage, resort } from '@/lib/dummy-data'
import { createEditorialMotion } from '@/lib/motion'

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

const fieldClassName =
  'w-full rounded-[1.35rem] border border-[#cfd5c6]/70 bg-white px-4 py-3.5 text-sm text-foreground outline-none transition focus:border-[#4caf50] focus:ring-4 focus:ring-[#4caf50]/12'

export function ContactPageView() {
  const reduceMotion = useReducedMotion()
  const { sectionVariants, itemVariants } = createEditorialMotion(reduceMotion)
  const [formState, setFormState] = useState<ContactFormState>(defaultFormState)
  const [isSubmitted, setIsSubmitted] = useState(false)

  function updateField<K extends keyof ContactFormState>(
    key: K,
    value: ContactFormState[K],
  ) {
    setFormState((current) => ({ ...current, [key]: value }))
    setIsSubmitted(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitted(true)
    setFormState(defaultFormState)
  }

  return (
    <div className="-mt-[92px] overflow-x-clip bg-[#fbf9f4]">
      <EditorialPageHero
        hero={contactPage.hero}
        minHeightClassName="min-h-[68svh]"
        imageAlt="Madhuban Garden Resort exterior and lush grounds"
      >
        <Button
          asChild
          size="lg"
          className="h-auto rounded-full bg-[#ba7517] px-8 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-white hover:bg-[#a46612]"
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
        className="bg-[#fbf9f4] py-20 sm:py-24"
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
                    <div className="flex items-start gap-4 rounded-[1.75rem] bg-white px-5 py-5 shadow-[0_22px_60px_rgba(27,28,25,0.06)]">
                      <span className="mt-1 inline-flex size-11 items-center justify-center rounded-full bg-[#ecf4e6] text-[#356609]">
                        <SiteIcon icon={channel.icon} className="size-5" />
                      </span>
                      <div>
                        <p className="text-[#356609]/76 text-[0.72rem] font-semibold uppercase tracking-[0.26em]">
                          {channel.label}
                        </p>
                        <p className="text-foreground/74 mt-3 text-sm leading-7">
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

              <div className="rounded-[2rem] bg-[linear-gradient(135deg,rgba(56,106,14,0.95),rgba(102,146,48,0.93))] p-7 text-white shadow-[0_24px_70px_rgba(56,106,14,0.18)]">
                <p className="text-white/72 text-xs font-semibold uppercase tracking-[0.32em]">
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
                  className="hover:bg-white/92 mt-6 h-auto rounded-full bg-white px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-[#356609]"
                >
                  <Link
                    href={`https://wa.me/${resort.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <SiteIcon icon="MessageCircle" className="size-4" />
                    Chat on WhatsApp
                  </Link>
                </Button>
              </div>

              <div className="overflow-hidden rounded-[2rem] bg-[#eef4e7] p-3 shadow-[0_20px_60px_rgba(27,28,25,0.05)]">
                <div className="flex min-h-[19rem] flex-col justify-between rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,255,255,0.92)),radial-gradient(circle_at_top_right,rgba(186,117,23,0.16),transparent_35%)] p-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#ba7517]">
                      {contactPage.mapTitle}
                    </p>
                    <h3 className="mt-4 text-3xl italic text-foreground">
                      Madhuban Garden Resort
                    </h3>
                    <p className="text-foreground/68 mt-4 max-w-md text-sm leading-7">
                      {contactPage.mapDescription}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] bg-white/85 p-5 backdrop-blur">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#356609]/70">
                      Location
                    </p>
                    <p className="text-foreground/72 mt-3 text-sm leading-7">
                      Agar Malwa District, Madhya Pradesh
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <section
                id="query-form"
                className="rounded-[2.3rem] bg-white/90 p-6 shadow-[0_28px_80px_rgba(27,28,25,0.08)] backdrop-blur sm:p-8 lg:p-10"
              >
                <SectionHeading
                  eyebrow="Query Form"
                  title={contactPage.formTitle}
                  description={contactPage.formDescription}
                />

                {isSubmitted ? (
                  <div className="mt-8 rounded-[1.6rem] bg-[#eef7e7] px-5 py-4 text-sm leading-7 text-[#356609]">
                    Your enquiry has been captured in this demo flow. The final
                    build will connect this form to the live resort enquiry
                    system.
                  </div>
                ) : null}

                <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-foreground/56 text-[0.72rem] font-semibold uppercase tracking-[0.24em]">
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
                      <span className="text-foreground/56 text-[0.72rem] font-semibold uppercase tracking-[0.24em]">
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
                      <span className="text-foreground/56 text-[0.72rem] font-semibold uppercase tracking-[0.24em]">
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
                      <span className="text-foreground/56 text-[0.72rem] font-semibold uppercase tracking-[0.24em]">
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
                    <span className="text-foreground/56 text-[0.72rem] font-semibold uppercase tracking-[0.24em]">
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
                    className="mt-2 h-auto rounded-full bg-[linear-gradient(135deg,#386a0e,#76a839)] px-8 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-white hover:opacity-95"
                  >
                    Send Enquiry
                    <SiteIcon icon="ArrowRight" className="size-4" />
                  </Button>
                </form>
              </section>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
