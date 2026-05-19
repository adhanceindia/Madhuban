import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type PageHeaderProps = {
  title: string
  subtitle?: string
  backHref?: string
  backLabel?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, backHref, backLabel = 'Back', actions }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground mb-2 no-underline"
        >
          <ArrowLeft size={14} />
          {backLabel}
        </Link>
      )}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="min-w-0">
          <h1 className="text-[24px] font-bold text-foreground tracking-tight">{title}</h1>
          {subtitle && <p className="text-[13px] text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>
    </div>
  )
}
