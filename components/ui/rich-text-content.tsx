import { cn } from '@/lib/utils'

type RichTextContentProps = {
  html: string
  className?: string
}

/**
 * Renders HTML content from the CMS rich text editor on public-facing pages.
 * Falls back gracefully for legacy plain-text content.
 */
export function RichTextContent({ html, className }: RichTextContentProps) {
  if (!html) return null

  // If content has no HTML tags, it's legacy plain text — wrap in <p>
  const isPlainText = !/<[a-z][\s\S]*>/i.test(html)
  const safeHtml = isPlainText
    ? `<p>${html.replace(/\n/g, '</p><p>')}</p>`
    : html

  return (
    <div
      className={cn('rich-text-rendered', className)}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  )
}
