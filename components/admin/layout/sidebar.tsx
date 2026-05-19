'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  BedDouble,
  ClipboardList,
  ConciergeBell,
  Radio,
  Image,
  Star,
  Inbox,
  FileText,
  BarChart3,
  ScrollText,
  Users,
  Settings,
} from 'lucide-react'
import type { UserRole } from '@/db/schema/users'
import { canAccess } from '@/lib/auth'

type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
  module: string
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Operations',
    items: [
      { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={20} />, module: 'dashboard' },
      { label: 'Bookings', href: '/admin/bookings', icon: <ClipboardList size={20} />, module: 'bookings' },
      { label: 'Front Desk', href: '/admin/front-desk', icon: <ConciergeBell size={20} />, module: 'front-desk' },
      { label: 'Calendar', href: '/admin/calendar', icon: <Calendar size={20} />, module: 'calendar' },
      { label: 'Rooms', href: '/admin/rooms', icon: <BedDouble size={20} />, module: 'rooms' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Gallery', href: '/admin/gallery', icon: <Image size={20} />, module: 'gallery' },
      { label: 'Reviews', href: '/admin/reviews', icon: <Star size={20} />, module: 'reviews' },
      { label: 'Inquiries', href: '/admin/inquiries', icon: <Inbox size={20} />, module: 'inquiries' },
      { label: 'Pages', href: '/admin/content', icon: <FileText size={20} />, module: 'content' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Channel Manager', href: '/admin/channel-manager', icon: <Radio size={20} />, module: 'channel-manager' },
      { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 size={20} />, module: 'analytics' },
      { label: 'Audit Log', href: '/admin/audit-log', icon: <ScrollText size={20} />, module: 'audit-log' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Users', href: '/admin/users', icon: <Users size={20} />, module: 'users' },
      { label: 'Settings', href: '/admin/settings', icon: <Settings size={20} />, module: 'settings' },
    ],
  },
]

export function Sidebar({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname()

  return (
    <aside className="w-[260px] h-screen sticky top-0 border-r border-border bg-white flex flex-col">
      <div className="h-16 flex items-center px-5 border-b border-border">
        <Link href="/admin" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-display font-bold text-foreground text-[15px]">Madhuban</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => canAccess(userRole, item.module))
          if (visibleItems.length === 0) return null

          return (
            <div key={group.label} className="mb-6">
              <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium no-underline transition-colors ${
                        isActive
                          ? 'bg-primary-light text-primary font-semibold'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
