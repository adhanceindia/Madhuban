import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/admin/shared/page-header'
import { UserForm } from '@/components/admin/users/UserForm'
import { getStaffUserById } from '@/db/queries/users-admin'
import { getSession } from '@/lib/auth'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [user, session] = await Promise.all([
    getStaffUserById(parseInt(id)),
    getSession('admin'),
  ])
  if (!user) notFound()

  return (
    <div>
      <PageHeader
        title={`Edit ${user.name}`}
        subtitle={user.email}
        backHref="/admin/users"
        backLabel="Back to users"
      />
      <UserForm user={user} currentUserId={session?.id} />
    </div>
  )
}
