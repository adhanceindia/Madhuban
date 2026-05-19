import { PageHeader } from '@/components/admin/shared/page-header'
import { UserForm } from '@/components/admin/users/UserForm'

export default function NewUserPage() {
  return (
    <div>
      <PageHeader
        title="New staff user"
        subtitle="Create a staff account with role-based access"
        backHref="/admin/users"
        backLabel="Back to users"
      />
      <UserForm />
    </div>
  )
}
