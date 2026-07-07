import { RichTextContent } from '@/components/ui/rich-text-content'

type RichTextBlockProps = {
  content?: string
}

export function RichTextBlock({ content }: RichTextBlockProps) {
  if (!content) return null

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 prose prose-lg prose-headings:font-serif prose-headings:italic">
        <RichTextContent html={content} />
      </div>
    </section>
  )
}
