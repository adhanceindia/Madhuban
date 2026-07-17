import { PageHeader } from '@/components/admin/shared/page-header'
import { SettingsLanding } from '@/components/admin/settings/SettingsLanding'

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="System configuration" />
      <SettingsLanding />
    </div>
  )
}
