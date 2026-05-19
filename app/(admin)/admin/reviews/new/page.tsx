import { PageHeader } from '@/components/admin/shared/page-header'
import { ReviewForm } from '@/components/admin/reviews/ReviewForm'

export default function NewReviewPage() {
  return (
    <div>
      <PageHeader
        title="Add review"
        subtitle="Manually add a guest review (from email, Google, etc.)"
        backHref="/admin/reviews"
        backLabel="Back to reviews"
      />
      <ReviewForm />
    </div>
  )
}
