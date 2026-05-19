import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/admin/shared/page-header'
import { PageEditor } from '@/components/admin/content/PageEditor'
import { getPageSchema } from '@/lib/cms-schema'
import { getPageContentAdmin } from '@/db/queries/content-admin'

export default async function ContentEditPage({ params }: { params: Promise<{ page: string }> }) {
  const { page: pageKey } = await params
  const schema = getPageSchema(pageKey)
  if (!schema) notFound()

  const content = await getPageContentAdmin(pageKey)

  return (
    <div>
      <PageHeader
        title={`Edit ${schema.label}`}
        subtitle={schema.description}
        backHref="/admin/content"
        backLabel="Back to pages"
      />
      <PageEditor page={schema} initialContent={content} />
    </div>
  )
}
