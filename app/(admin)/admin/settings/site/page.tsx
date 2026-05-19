import { PageHeader } from '@/components/admin/shared/page-header'
import { SiteSettingsForm } from '@/components/admin/settings/SiteSettingsForm'

export default function SiteSettingsPage() {
  return (
    <div>
      <PageHeader
        title="Site Settings"
        subtitle="Contact info, social links, and default SEO"
        backHref="/admin/settings"
        backLabel="Back to settings"
      />
      <SiteSettingsForm />
    </div>
  )
}
