'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  ConciergeBell,
  CalendarCheck,
  List,
  BedDouble,
  MessageSquare,
  Star,
  Image as ImageIcon,
  FileText,
  CreditCard,
  FolderOpen,
  Users,
  HelpCircle,
  Leaf,
  type LucideIcon,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NavItem = {
  label: string
  href: string
  Icon: LucideIcon
  exact?: boolean
  adminOnly?: boolean
}

type NavSection = {
  title: string
  items: NavItem[]
}

type NavClientProps = {
  userName?: string
  userEmail?: string
  userRole?: string
}

// ---------------------------------------------------------------------------
// Navigation structure — store component references, not JSX instances
// ---------------------------------------------------------------------------

const navSections: NavSection[] = [
  {
    title: 'DAILY OPERATION',
    items: [
      { label: 'Dashboard', href: '/admin', Icon: LayoutDashboard, exact: true },
      { label: 'Front Desk', href: '/admin/front-desk', Icon: ConciergeBell },
      { label: 'Bookings', href: '/admin/bookings-view', Icon: CalendarCheck },
      { label: 'All Bookings', href: '/admin/collections/bookings', Icon: List },
      { label: 'Rooms', href: '/admin/collections/rooms', Icon: BedDouble },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { label: 'Inquiries', href: '/admin/collections/inquiries', Icon: MessageSquare },
      { label: 'Reviews', href: '/admin/reviews-view', Icon: Star },
      { label: 'Gallery', href: '/admin/collections/gallery', Icon: ImageIcon },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Site Content', href: '/admin/globals/content', Icon: FileText },
      { label: 'Payments', href: '/admin/globals/payment-config', Icon: CreditCard },
      { label: 'Media', href: '/admin/collections/media', Icon: FolderOpen },
      { label: 'Users', href: '/admin/collections/users', Icon: Users, adminOnly: true },
    ],
  },
]

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href
  if (href === '/admin') return pathname === '/admin'
  return pathname.startsWith(href)
}

// ---------------------------------------------------------------------------
// NavClient Component
// ---------------------------------------------------------------------------

export function NavClient({ userName, userEmail, userRole }: NavClientProps) {
  const pathname = usePathname()

  return (
    <>
      {/* ---- Brand header ---- */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--madhuban-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
        }}
      >
        <Link
          href="/admin"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Leaf size={18} color="#386a0e" strokeWidth={2.2} />
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: '15px',
              color: 'var(--madhuban-text)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Madhuban
          </span>
        </Link>
      </div>

      {/* ---- Hotel status pill ---- */}
      <div style={{ padding: '12px 16px 8px', flexShrink: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 10px',
            background: 'var(--madhuban-bg-elevated)',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: 500,
            color: 'var(--madhuban-text-secondary)',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#16a34a',
              flexShrink: 0,
            }}
          />
          Madhuban Garden Resort
        </div>
      </div>

      {/* ---- Nav sections ---- */}
      {navSections.map((section) => {
        const visibleItems = section.items.filter(
          (item) => !item.adminOnly || userRole === 'admin'
        )
        if (visibleItems.length === 0) return null

        return (
          <div key={section.title} style={{ marginBottom: '8px' }}>
            {/* Section label */}
            <div
              style={{
                padding: '8px 12px 4px',
                fontSize: '10px',
                fontWeight: 650,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--madhuban-text-faint)',
              }}
            >
              {section.title}
            </div>

            {/* Nav items */}
            {visibleItems.map((item) => {
              const active = isActive(pathname, item.href, item.exact)
              const IconComp = item.Icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '7px 12px',
                    margin: '1px 0',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: active ? 550 : 450,
                    color: active ? '#386a0e' : '#6b7280',
                    background: active ? '#f0fdf4' : 'transparent',
                    textDecoration: 'none',
                    transition: 'background 0.15s, color 0.15s',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = '#f3f4f6'
                      e.currentTarget.style.color = '#374151'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#6b7280'
                    }
                  }}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '3px',
                        height: '18px',
                        borderRadius: '0 3px 3px 0',
                        background: '#386a0e',
                        boxShadow: '0 0 6px rgba(56, 106, 14, 0.25)',
                      }}
                    />
                  )}
                  <IconComp
                    size={16}
                    strokeWidth={2}
                    color={active ? '#386a0e' : '#9ca3af'}
                    style={{ flexShrink: 0 }}
                  />
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        )
      })}

      {/* ---- Support link ---- */}
      <div style={{ marginTop: 'auto', padding: '4px 0' }}>
        <Link
          href="/admin"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '7px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#6b7280',
            textDecoration: 'none',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#eef4e7'
            e.currentTarget.style.color = '#356609'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#6b7280'
          }}
        >
          <HelpCircle size={16} strokeWidth={2} color="#9ca3af" style={{ flexShrink: 0 }} />
          <span>Support</span>
        </Link>
      </div>

      {/* ---- User profile ---- */}
      {(userName || userEmail) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            borderTop: '1px solid var(--madhuban-border)',
            marginTop: '4px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: '#386a0e',
              flexShrink: 0,
            }}
          >
            {(userName || userEmail || 'U').charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--madhuban-text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {userName || userEmail || 'User'}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--madhuban-text-faint)',
                textTransform: 'capitalize',
              }}
            >
              {userRole || 'Staff'}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
