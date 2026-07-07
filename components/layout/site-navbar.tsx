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
  ChevronDown
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { navLinks, megaNavLinks } from '@/lib/site-nav'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu" 
import type { SiteContent, MenuItem } from '@/lib/types'

type NavItem = {
  id?: string
  title?: string
  label?: string
  href?: string
  description?: string
  items?: NavItem[]
}

function buildMenuTree(items: MenuItem[]) {
  if (!items || !Array.isArray(items)) return []
  const rootItems = items.filter(i => !i.parentId).sort((a, b) => a.sort_order - b.sort_order)
  return rootItems.map(root => ({
    ...root,
    title: root.label, // bridge the gap between flat item label and existing rendering logic
    items: items.filter(i => i.parentId === root.id).sort((a, b) => a.sort_order - b.sort_order).map(child => ({
      ...child,
      title: child.label,
    }))
  }))
}

export function SiteNavbar({ siteContent }: { siteContent: SiteContent }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(megaNavLinks[0].title)

  const displayMenu = React.useMemo(() => {
    if (siteContent.header?.mega_menu && siteContent.header.mega_menu.length > 0) {
      return buildMenuTree(siteContent.header.mega_menu)
    }
    if (siteContent.header?.nav_links && siteContent.header.nav_links.length > 0) {
      return siteContent.header.nav_links
    }
    return navLinks
  }, [siteContent.header])

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
        'sticky top-0 z-50 w-full transition-[background-color,box-shadow] duration-300',
        'border-b border-content-border/60 bg-background/95 shadow-[0_14px_40px_rgba(27,28,25,0.08)] backdrop-blur-2xl'
      )}
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

        <nav className="hidden items-center lg:flex">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              {displayMenu.map((link: NavItem) => {
                if (link.items && Array.isArray(link.items) && link.items.length > 0) {
                  return (
                    <NavigationMenuItem key={link.title}>
                      <NavigationMenuTrigger 
                        className={cn(
                          'bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent font-display text-lg italic tracking-wide transition-colors duration-200',
                          'text-foreground/70 hover:text-primary-dark data-[state=open]:text-primary-dark'
                        )}
                      >
                        {link.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white rounded-xl shadow-xl border-border/50">
                          {link.items.map((item: NavItem) => (
                            <li key={item.title}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={item.href || '#'}
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/40 focus:bg-accent/40"
                                >
                                  <div className="text-sm font-semibold leading-none text-foreground">{item.title}</div>
                                  <p className="line-clamp-2 text-sm leading-snug text-foreground/70">
                                    {item.description}
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  )
                }

                // It's a flat link
                return (
                  <NavigationMenuItem key={link.label}>
                    <Link href={link.href || '#'} legacyBehavior passHref>
                      <NavigationMenuLink 
                        className={cn(
                          navigationMenuTriggerStyle(),
                          'bg-transparent hover:bg-transparent focus:bg-transparent font-display text-lg italic tracking-wide transition-colors duration-200',
                          pathname === link.href
                            ? 'border-b-2 border-primary-dark font-bold text-primary-dark'
                            : 'border-b-2 border-transparent text-foreground/80 hover:text-foreground'
                        )}
                      >
                        {link.label}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                )
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full"
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
          <Button asChild size="sm" className="rounded-full px-5">
            <Link href={siteContent.header?.cta_button_link || '/rooms'}>
              {siteContent.header?.cta_button_text || 'Book Now'}
            </Link>
          </Button>
        </div>

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

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="max-h-[calc(100vh-80px)] overflow-y-auto border-t border-white/10 bg-background/95 px-4 py-5 shadow-[0_20px_40px_rgba(27,28,25,0.06)] backdrop-blur-2xl lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-6 pt-2 pb-6">
              <div className="flex flex-col gap-1">
                {(siteContent.header?.mega_menu && siteContent.header.mega_menu.length > 0
                  ? siteContent.header.mega_menu
                  : siteContent.header?.nav_links && siteContent.header.nav_links.length > 0
                  ? siteContent.header.nav_links
                  : navLinks
                ).map((link: NavItem) => {
                  if (link.items && Array.isArray(link.items)) {
                    return (
                      <div key={link.title} className="flex flex-col border-b border-content-border/40 last:border-0">
                        <button
                          type="button"
                          onClick={() => setExpandedSection(expandedSection === link.title ? null : (link.title ?? null))}
                          className="flex w-full items-center justify-between py-4 text-left font-display text-[1.4rem] italic text-foreground transition-colors hover:text-primary-dark"
                        >
                          {link.title}
                          <motion.div
                            animate={{ rotate: expandedSection === link.title ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="size-5 text-foreground/40" />
                          </motion.div>
                        </button>
                        
                        <AnimatePresence initial={false}>
                          {expandedSection === link.title && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-col gap-4 pb-5 pt-2">
                                <div className="flex flex-col gap-1.5">
                                  {link.items.map((item: NavItem) => (
                                    <Link
                                      key={item.title}
                                      href={item.href || '#'}
                                      onClick={() => setIsOpen(false)}
                                      className="group flex items-center justify-between rounded-lg py-2 text-[15px] font-medium text-foreground/80 transition-colors hover:text-primary-dark"
                                    >
                                      {item.title}
                                      <span className="text-[10px] tracking-widest text-foreground/40 opacity-0 transition-opacity group-hover:opacity-100 uppercase">
                                        Explore
                                      </span>
                                    </Link>
                                  ))}
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
                        href={link.href || '#'}
                        onClick={() => setIsOpen(false)}
                        className="flex w-full items-center justify-between py-4 text-left font-display text-[1.4rem] italic text-foreground transition-colors hover:text-primary-dark"
                      >
                        {link.label}
                      </Link>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-2 flex flex-col gap-3">
                <Button asChild size="lg" className="w-full rounded-full text-base font-semibold tracking-wide uppercase h-14 bg-primary hover:bg-primary-dark">
                  <Link href={siteContent.header?.cta_button_link || '/rooms'} onClick={() => setIsOpen(false)}>
                    {siteContent.header?.cta_button_text || 'Book Your Stay'}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full justify-center rounded-full text-[13px] font-semibold tracking-wide uppercase h-14 border-primary/20 hover:bg-primary-50/40">
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
