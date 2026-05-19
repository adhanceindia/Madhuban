import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Sidebar } from '@/components/admin/layout/sidebar'
import { AdminHeader } from '@/components/admin/layout/header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole={session.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={session} />
        <main className="flex-1 p-6 pt-0">
          {children}
        </main>
      </div>
    </div>
  )
}
