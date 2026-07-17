import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { PageHeader } from '@/components/admin/shared/page-header'
import { MfaCard } from '@/components/admin/settings/mfa-card'

export default async function AccountPage() {
  const session = await getSession('admin')
  if (!session) redirect('/login')

  return (
    <div>
      <PageHeader title="My Account" subtitle="Your profile and login security" />

      <div className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Profile</h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Name</dt>
              <dd className="mt-0.5 text-sm text-foreground">{session.name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Email</dt>
              <dd className="mt-0.5 text-sm text-foreground">{session.email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Role</dt>
              <dd className="mt-0.5 text-sm capitalize text-foreground">
                {session.role.replace(/_/g, ' ')}
              </dd>
            </div>
          </dl>
        </div>

        <MfaCard />
      </div>
    </div>
  )
}
