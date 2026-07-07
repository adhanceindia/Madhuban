import { notFound } from 'next/navigation'
import { PageEditor } from '@/components/admin/content/PageEditor'
import { getPageSchema } from '@/lib/cms-schema'
import { getPageContentAdmin } from '@/db/queries/content-admin'

export default async function ContentEditPage({ params }: { params: Promise<{ page: string }> }) {
  const { page: pageKey } = await params
  const schema = getPageSchema(pageKey)
  if (!schema) notFound()

  const content = await getPageContentAdmin(pageKey)

  return <PageEditor page={schema} initialContent={content} />
}
