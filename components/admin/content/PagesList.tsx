import Link from 'next/link'
import { ChevronRight, FileText, ExternalLink } from 'lucide-react'
import { PAGE_SCHEMAS } from '@/lib/cms-schema'

export function PagesList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[1200px]">
      {PAGE_SCHEMAS.map((page) => (
        <div
          key={page.key}
          className="bg-card rounded-2xl p-5 border border-border hover:border-accent-deep/40 transition-colors group"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-sage-soft flex items-center justify-center flex-shrink-0">
              <FileText size={18} className="text-sage-deep" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] font-semibold text-foreground">{page.label}</h3>
              {page.description && (
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{page.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Link
              href={`/admin/content/${page.key}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-md no-underline transition-colors"
            >
              Edit <ChevronRight size={12} />
            </Link>
            {page.publicPath && (
              <Link
                href={page.publicPath}
                target="_blank"
                className="px-3 py-1.5 text-[12px] font-semibold bg-sage-soft hover:bg-sage text-foreground rounded-md no-underline transition-colors inline-flex items-center gap-1"
                aria-label="View live page"
              >
                <ExternalLink size={12} />
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
