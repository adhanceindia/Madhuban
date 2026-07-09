'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Facebook, Instagram, MessageCircle } from 'lucide-react'

import { quickLinks } from '@/lib/site-nav'
import type { SiteContent } from '@/lib/types'

export function SiteFooter({ siteContent }: { siteContent: SiteContent }) {
  return (
    <motion.footer
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="bg-primary-dark text-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="font-body text-sm uppercase tracking-label text-white/70">
              About
            </h2>
            {siteContent.header?.logo_url ? (
              <Image
                src={siteContent.header.logo_url}
                alt={`${siteContent.name} logo`}
                width={220}
                height={80}
                className="h-16 w-auto max-w-[220px] object-contain"
              />
            ) : (
              <p className="font-display text-3xl leading-none">
                {siteContent.name}
              </p>
            )}
            <div className="mt-6 max-w-sm text-sm leading-7 text-white/80">
              {siteContent.footer?.about_text ? (
                <div dangerouslySetInnerHTML={{ __html: siteContent.footer.about_text }} />
              ) : (
                <p>{siteContent.tagline}</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-body text-sm uppercase tracking-label text-white/70">
              Links
            </h2>
            <div className="mt-6 grid gap-3">
              {(siteContent.footer?.nav_links || quickLinks).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/80 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-body text-sm uppercase tracking-label text-white/70">
              Contact
            </h2>
            <div className="mt-6 space-y-3 text-sm text-white/80">
              <p>{siteContent.address}</p>
              <p>{siteContent.phone}</p>
              <p>{siteContent.email}</p>
              <Link
                href={`https://wa.me/${siteContent.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-white transition-colors hover:text-white/80"
              >
                <MessageCircle className="size-4" />
                WhatsApp us
              </Link>
            </div>
          </div>
        </div>

          <div className="mt-14 flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/75">
              {siteContent.footer?.copyright_text || `© ${new Date().getFullYear()} Madhuban Garden Resort. All rights reserved.`}
            reserved.
          </p>
          <div className="flex items-center gap-4 text-white/80">
            <Link href={siteContent.instagram} aria-label="Instagram">
              <Instagram className="size-5" />
            </Link>
            <Link href={siteContent.facebook} aria-label="Facebook">
              <Facebook className="size-5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}
