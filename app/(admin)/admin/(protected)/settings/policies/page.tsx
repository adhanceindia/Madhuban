import { PageHeader } from '@/components/admin/shared/page-header'
import { PoliciesSettingsForm } from '@/components/admin/settings/PoliciesSettingsForm'

export default function PoliciesSettingsPage() {
  return (
    <div>
      <PageHeader
        title="Hotel Policies"
        subtitle="Manage check-in, check-out, and cancellation policies"
        backHref="/admin/settings"
        backLabel="Back to settings"
      />
      <PoliciesSettingsForm />
    </div>
  )
}
