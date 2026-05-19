import { PageHeader } from '@/components/admin/shared/page-header'
import { PaymentConfigForm } from '@/components/admin/settings/PaymentConfigForm'

export default function PaymentSettingsPage() {
  return (
    <div>
      <PageHeader
        title="Payment Gateways"
        subtitle="Configure credentials and choose the active gateway for online bookings"
        backHref="/admin/settings"
        backLabel="Back to settings"
      />
      <PaymentConfigForm />
    </div>
  )
}
