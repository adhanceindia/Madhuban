'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Leaf,
  Menu,
  MessageCircle,
  Instagram,
  Facebook,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { resort } from '@/lib/dummy-data'
import { cn } from '@/lib/utils'
import { navLinks } from '@/lib/site-nav'

export function SiteNavbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <motion.header
      initial={false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'sticky top-0 z-50 w-full',
        scrolled
          ? 'bg-background/80 shadow-[0_14px_40px_rgba(27,28,25,0.08)] backdrop-blur-2xl'
          : 'bg-background/55 backdrop-blur-xl',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary/12 text-primary-dark transition-transform duration-300 group-hover:scale-105">
            <Leaf className="size-5" />
          </span>
          <span className="flex flex-col">
            <span className="font-display text-2xl leading-none text-primary-dark sm:text-[1.7rem]">
              Madhuban Garden
            </span>
            <span className="text-[0.68rem] uppercase tracking-[0.3em] text-foreground/50">
              Resort
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'border-b border-transparent pb-1 font-display text-lg italic tracking-wide text-foreground/72 transition-colors duration-200 hover:text-primary-dark',
                pathname === link.href &&
                  'border-primary-dark/25 text-primary-dark',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            <Link
              href={`https://wa.me/${resort.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="gap-2"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </Link>
          </Button>
          <Button asChild size="sm" className="rounded-full px-5">
            <Link href="/rooms">Book Now</Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="inline-flex size-11 items-center justify-center rounded-full bg-white/80 text-foreground shadow-[0_10px_30px_rgba(27,28,25,0.08)] transition-transform duration-200 hover:scale-[1.02] lg:hidden"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="border-t border-white/10 bg-background/95 px-4 py-5 shadow-[0_20px_40px_rgba(27,28,25,0.06)] backdrop-blur-2xl lg:hidden"
          >
            <div className="mx-auto grid max-w-7xl gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl bg-white/70 px-4 py-3 text-base font-medium text-foreground transition-colors hover:text-primary-dark"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="outline" className="w-full justify-center rounded-full">
                  <Link
                    href={`https://wa.me/${resort.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="gap-2"
                  >
                    <MessageCircle className="size-4" />
                    WhatsApp
                  </Link>
                </Button>
                <Button asChild className="w-full rounded-full">
                  <Link href="/rooms">Book Now</Link>
                </Button>
              </div>
              <div className="flex items-center gap-4 pt-2 text-foreground/60">
                <Instagram className="size-5" />
                <Facebook className="size-5" />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  )
}
