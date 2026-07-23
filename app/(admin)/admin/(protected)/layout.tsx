import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { ADMIN_ROLES } from '@/lib/permissions'
import { Sidebar } from '@/components/admin/layout/sidebar'
import { AdminHeader } from '@/components/admin/layout/header'

import { IdleTimeoutProvider } from '@/components/admin/idle-timeout-provider'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession('admin')

  if (!session || !ADMIN_ROLES.includes(session.role)) {
    redirect('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-background font-admin">
      <Sidebar userRole={session.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={session} />
        <main className="flex-1 p-6 pt-0">
          <IdleTimeoutProvider>
            {children}
          </IdleTimeoutProvider>
        </main>
      </div>
    </div>
  )
}
