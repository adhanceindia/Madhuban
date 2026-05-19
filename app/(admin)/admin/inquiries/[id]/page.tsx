import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/admin/shared/page-header'
import { InquiryDetail } from '@/components/admin/inquiries/InquiryDetail'
import { getInquiryById } from '@/db/queries/inquiries-admin'

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const inquiry = await getInquiryById(parseInt(id))
  if (!inquiry) notFound()

  return (
    <div>
      <PageHeader
        title={inquiry.name}
        subtitle={`Inquiry #${inquiry.id}`}
        backHref="/admin/inquiries"
        backLabel="Back to inquiries"
      />
      <InquiryDetail inquiry={inquiry} />
    </div>
  )
}
