import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession('admin')

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background font-admin">
      <main className="h-screen w-full flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
