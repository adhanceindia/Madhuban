'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

import type { SiteContent } from '@/lib/types'

export function FloatingWhatsAppButton({ siteContent }: { siteContent: SiteContent }) {
  const phone = siteContent.whatsapp.replace(/\D/g, '')
  const message = encodeURIComponent(
    "Hi, I'm interested in booking at Madhuban Garden Resort.",
  )

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className="fixed bottom-24 right-5 z-40 lg:bottom-5"
    >
      <Link
        href={`https://wa.me/${phone}?text=${message}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,211,102,0.28)] transition-transform duration-200 hover:scale-[1.03]"
      >
        <MessageCircle className="size-5" />
        WhatsApp
      </Link>
    </motion.div>
  )
}
