'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Menu,
  MessageCircle,
  Instagram,
  Facebook,
  X,
  ChevronDown,
  ArrowRight
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { mainNavigation } from '@/lib/site-nav'
import type { SiteContent } from '@/lib/types'

export function SiteNavbar({ siteContent }: { siteContent: SiteContent }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

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

  // Close menus on route change
  useEffect(() => {
    setActiveMenu(null)
    setIsOpen(false)
  }, [pathname])

  return (
    <motion.header
      initial={false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'sticky top-0 z-50 w-full transition-[background-color,box-shadow] duration-300',
        'border-b border-content-border/60 bg-background/95 shadow-[0_14px_40px_rgba(27,28,25,0.08)] backdrop-blur-2xl'
      )}
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex min-w-0 items-center">
          {siteContent.header?.logo_url ? (
            <Image
              src={siteContent.header.logo_url}
              alt={`${siteContent.name} logo`}
              width={220}
              height={80}
              priority
              className="h-12 w-auto max-w-[180px] object-contain transition-transform duration-300 group-hover:scale-[1.02] sm:max-w-[220px]"
            />
          ) : (
            <span
              className={cn(
                'truncate font-display text-2xl leading-none sm:text-[1.7rem]',
                'text-primary-dark',
              )}
            >
              {siteContent.name}
            </span>
          )}
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden items-center lg:flex h-full">
          <ul className="flex items-center gap-8">
            {mainNavigation.map((link) => {
              const hasItems = link.items && link.items.length > 0;
              return (
                <li key={link.label} className="flex h-16 items-center">
                  {hasItems ? (
                    <button
                      onMouseEnter={() => setActiveMenu(link.label)}
                      className={cn(
                        'flex h-full items-center gap-1.5 font-body text-[15px] font-medium tracking-normal transition-colors duration-200 outline-none',
                        activeMenu === link.label ? 'text-primary-dark' : 'text-foreground/80 hover:text-primary-dark'
                      )}
                    >
                      {link.label}
                      <ChevronDown className={cn("size-3.5 transition-transform duration-300", activeMenu === link.label && "rotate-180")} />
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      onMouseEnter={() => setActiveMenu(null)}
                      className={cn(
                        'flex h-full items-center font-body text-[15px] font-medium tracking-normal transition-colors duration-200 outline-none',
                        pathname === link.href ? 'text-primary-dark border-b-2 border-primary-dark font-semibold' : 'text-foreground/80 hover:text-primary-dark border-b-2 border-transparent'
                      )}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full font-body font-semibold tracking-[0.08em]"
          >
            <Link
              href={`https://wa.me/${siteContent.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="gap-2"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </Link>
          </Button>
          <Button asChild size="sm" className="rounded-full px-5 font-body font-semibold tracking-[0.08em]">
            <Link href={siteContent.header?.cta_button_link || '/rooms'}>
              {siteContent.header?.cta_button_text || 'Book Now'}
            </Link>
          </Button>
        </div>

        {/* MOBILE TRIGGER */}
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="inline-flex size-11 items-center justify-center rounded-full shadow-[0_10px_30px_rgba(27,28,25,0.08)] transition-transform duration-200 hover:scale-[1.02] lg:hidden bg-white/80 text-foreground"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* DESKTOP MEGA MENU PANEL */}
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute left-0 top-full w-full border-t border-content-border/60 bg-background/95 shadow-2xl backdrop-blur-3xl"
          >
            {mainNavigation.map((link) => {
              if (link.label !== activeMenu || !link.items) return null;
              return (
                <div key={link.label} className="mx-auto flex max-w-7xl justify-between px-4 py-12 sm:px-6 lg:px-8">
                  {/* Links Column */}
                  <div className="w-1/2 pr-12">
                    <h3 className="font-display text-3xl italic text-foreground mb-8">Discover {link.label}</h3>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                      {link.items.map(item => (
                        <Link
                          key={item.title}
                          href={item.href}
                          onClick={() => setActiveMenu(null)}
                          className="group flex flex-col gap-1.5 transition-colors"
                        >
                          <span className="font-body text-[17px] font-semibold text-foreground group-hover:text-primary-dark transition-colors">{item.title}</span>
                          <span className="font-body text-sm text-foreground/60 leading-relaxed group-hover:text-foreground/80 transition-colors">{item.description}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  
                  {/* Featured Image & CTA Column */}
                  {link.featuredImage && (
                    <div className="relative w-[45%] h-[280px] overflow-hidden rounded-2xl bg-warm-sand">
                      <Image
                        src={link.featuredImage}
                        alt={link.label}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                        <div>
                          <h4 className="font-display text-2xl text-white mb-2 tracking-wide">Experience {link.label}</h4>
                        </div>
                        {link.ctaLink && (
                          <Button asChild variant="default" className="rounded-full bg-white text-foreground hover:bg-white/90 border-0 font-body font-semibold tracking-[0.08em]">
                            <Link href={link.ctaLink} onClick={() => setActiveMenu(null)}>
                              {link.ctaText}
                              <ArrowRight className="ml-2 size-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute left-0 top-full w-full max-h-[calc(100vh-80px)] overflow-y-auto border-t border-white/10 bg-background/95 px-4 py-5 shadow-[0_20px_40px_rgba(27,28,25,0.06)] backdrop-blur-2xl lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-6 pt-2 pb-6">
              <div className="flex flex-col gap-1">
                {mainNavigation.map((link) => {
                  if (link.items && link.items.length > 0) {
                    return (
                      <div key={link.label} className="flex flex-col border-b border-content-border/40 last:border-0">
                        <button
                          type="button"
                          onClick={() => setExpandedSection(expandedSection === link.label ? null : link.label)}
                          className="flex w-full items-center justify-between py-4 text-left font-display text-[1.6rem] italic text-foreground transition-colors hover:text-primary-dark"
                        >
                          {link.label}
                          <motion.div
                            animate={{ rotate: expandedSection === link.label ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="size-5 text-foreground/40" />
                          </motion.div>
                        </button>
                        
                        <AnimatePresence initial={false}>
                          {expandedSection === link.label && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-col gap-4 pb-5 pt-2">
                                <div className="flex flex-col gap-1.5">
                                  {link.items.map((item) => (
                                    <Link
                                      key={item.title}
                                      href={item.href}
                                      onClick={() => setIsOpen(false)}
                                      className="group flex flex-col justify-center rounded-lg py-3 text-[15px] font-medium text-foreground/80 transition-colors hover:text-primary-dark font-body"
                                    >
                                      <span className="font-semibold">{item.title}</span>
                                      <span className="text-xs text-foreground/50 font-normal">{item.description}</span>
                                    </Link>
                                  ))}
                                  {link.ctaLink && (
                                    <Link
                                      href={link.ctaLink}
                                      onClick={() => setIsOpen(false)}
                                      className="mt-2 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-primary-dark uppercase font-body"
                                    >
                                      {link.ctaText} <ArrowRight className="size-4" />
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  }

                  // Flat link fallback
                  return (
                    <div key={link.label} className="flex flex-col border-b border-content-border/40 last:border-0">
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="flex w-full items-center justify-between py-4 text-left font-display text-[1.6rem] italic text-foreground transition-colors hover:text-primary-dark"
                      >
                        {link.label}
                      </Link>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-2 flex flex-col gap-3">
                <Button asChild size="lg" className="w-full rounded-full text-base font-semibold tracking-wide uppercase h-14 bg-primary hover:bg-primary-dark font-body">
                  <Link href={siteContent.header?.cta_button_link || '/rooms'} onClick={() => setIsOpen(false)}>
                    {siteContent.header?.cta_button_text || 'Book Your Stay'}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full justify-center rounded-full text-[13px] font-semibold tracking-wide uppercase h-14 border-primary/20 hover:bg-primary-50/40 font-body">
                  <Link
                    href={`https://wa.me/${siteContent.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="gap-2 text-primary-deep"
                  >
                    <MessageCircle className="size-4" />
                    WhatsApp Concierge
                  </Link>
                </Button>
              </div>
              
              <div className="mt-2 flex items-center justify-center gap-6 text-foreground/40 pb-4">
                <Link href={siteContent.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-primary-dark transition-colors">
                  <Instagram className="size-5" />
                </Link>
                <Link href={siteContent.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-primary-dark transition-colors">
                  <Facebook className="size-5" />
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  )
}
