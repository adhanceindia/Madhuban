import { PageHeader } from '@/components/admin/shared/page-header'
import { InvoiceSettingsForm } from '@/components/admin/settings/InvoiceSettingsForm'

export default function InvoiceSettingsPage() {
  return (
    <div>
      <PageHeader
        title="Invoice & Tax Settings"
        subtitle="Manage business details, GSTIN, and terms for invoices"
        backHref="/admin/settings"
        backLabel="Back to settings"
      />
      <InvoiceSettingsForm />
    </div>
  )
}
