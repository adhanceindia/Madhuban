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
  Image as ImageIcon,
  Star,
  Inbox,
  FileText,
  BarChart3,
  ScrollText,
  Users,
  Settings,
} from 'lucide-react'
import type { UserRole } from '@/db/schema/users'
import { canAccess } from '@/lib/permissions'

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
      { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={18} />, module: 'dashboard' },
      { label: 'Bookings', href: '/admin/bookings', icon: <ClipboardList size={18} />, module: 'bookings' },
      { label: 'Front Desk', href: '/admin/front-desk', icon: <ConciergeBell size={18} />, module: 'front-desk' },
      { label: 'Calendar', href: '/admin/calendar', icon: <Calendar size={18} />, module: 'calendar' },
      { label: 'Rooms', href: '/admin/rooms', icon: <BedDouble size={18} />, module: 'rooms' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Gallery', href: '/admin/gallery', icon: <ImageIcon size={18} />, module: 'gallery' },
      { label: 'Reviews', href: '/admin/reviews', icon: <Star size={18} />, module: 'reviews' },
      { label: 'Inquiries', href: '/admin/inquiries', icon: <Inbox size={18} />, module: 'inquiries' },
      { label: 'Pages', href: '/admin/content', icon: <FileText size={18} />, module: 'content' },
      { label: 'Blog', href: '/admin/blog', icon: <FileText size={18} />, module: 'blog' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Channel Manager', href: '/admin/channel-manager', icon: <Radio size={18} />, module: 'channel-manager' },
      { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 size={18} />, module: 'analytics' },
      { label: 'Audit Log', href: '/admin/audit-log', icon: <ScrollText size={18} />, module: 'audit-log' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Users', href: '/admin/users', icon: <Users size={18} />, module: 'users' },
      { label: 'Settings', href: '/admin/settings', icon: <Settings size={18} />, module: 'settings' },
    ],
  },
]

export function Sidebar({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] h-screen sticky top-0 bg-sidebar flex flex-col">
      <div className="h-16 flex items-center px-5">
        <Link href="/admin" className="flex items-center gap-2 no-underline">
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
            <span className="text-foreground font-bold text-[13px] font-admin">M</span>
          </div>
          <span className="font-admin font-bold text-foreground text-[15px] tracking-tight">Madhuban</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 font-admin">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => canAccess(userRole, item.module))
          if (visibleItems.length === 0) return null

          return (
            <div key={group.label} className="mb-5">
              <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] no-underline transition-colors ${
                        isActive
                          ? 'bg-accent text-foreground font-semibold shadow-sm'
                          : 'text-muted-foreground hover:bg-sage-soft hover:text-foreground font-medium'
                      }`}
                    >
                      <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="px-4 py-4 text-[11px] text-muted-foreground/60 font-admin">
        Madhuban Garden &middot; v1.0
      </div>
    </aside>
  )
}
