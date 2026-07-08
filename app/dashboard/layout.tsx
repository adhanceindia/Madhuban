'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Bell, User, PlusCircle, LogOut } from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'My Bookings', href: '/dashboard/bookings', icon: Calendar },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Book a Stay', href: '/rooms', icon: PlusCircle },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-warm-base pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 font-body">
      {/* Sidebar (Desktop) */}
      <aside className="w-[280px] bg-white hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            {/* Simple leaf/resort logo placeholder */}
            <div className="w-4 h-4 text-primary">❈</div>
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-foreground leading-none">Madhuban</h2>
            <p className="text-[10px] tracking-widest text-muted-foreground uppercase mt-1">Garden Resort</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-warm-sand text-foreground font-medium' 
                    : 'text-muted-foreground hover:bg-gray-50'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[15px]">{item.name}</span>
                {item.name === 'Notifications' && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-destructive text-white text-[10px] flex items-center justify-center">
                    3
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 mb-4">
          <button className="flex w-full items-center gap-4 px-4 py-3 rounded-xl text-muted-foreground hover:bg-gray-50 transition-colors">
            <LogOut className="h-5 w-5" />
            <span className="text-[15px]">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-10 max-w-5xl mx-auto">{children}</div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around p-2 pb-[env(safe-area-inset-bottom)] z-50">
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`flex flex-col items-center p-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <item.icon className="h-5 w-5 mb-1" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
