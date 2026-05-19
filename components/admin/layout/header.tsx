import type { SessionUser } from '@/lib/auth'
import { UserMenu } from './user-menu'

export function AdminHeader({ user }: { user: SessionUser }) {
  return (
    <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6 sticky top-0 z-30">
      <div />
      <UserMenu user={user} />
    </header>
  )
}
