import { PageHeader } from '@/components/admin/shared/page-header'
import { PagesList } from '@/components/admin/content/PagesList'

export default function ContentPage() {
  return (
    <div>
      <PageHeader
        title="Pages"
        subtitle="Edit the content shown on every public page of the website"
      />
      <PagesList />
    </div>
  )
}
