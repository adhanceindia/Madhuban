import { Search, Bell } from 'lucide-react'
import type { SessionUser } from '@/lib/auth'
import { UserMenu } from './user-menu'

export function AdminHeader({ user }: { user: SessionUser }) {
  return (
    <header className="h-16 bg-background flex items-center justify-between px-6 sticky top-0 z-30 font-admin">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70"
          />
          <input
            type="search"
            placeholder="Search rooms, guests, bookings..."
            className="w-full pl-9 pr-3 py-2 text-[13px] bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-deep/30 focus:border-accent-deep text-foreground placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-sage-soft transition-colors text-muted-foreground hover:text-foreground">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
        </button>
        <UserMenu user={user} />
      </div>
    </header>
  )
}
