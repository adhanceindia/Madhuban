import Link from 'next/link'
import { Plus } from 'lucide-react'

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action?: { label: string; href: string }
}) {
  return (
    <div className="text-center py-10 px-4 font-admin">
      <div className="text-sage-deep/40 mb-3 flex justify-center">{icon}</div>
      <div className="text-[13px] font-semibold text-foreground mb-1">{title}</div>
      <div className="text-[12px] text-muted-foreground mb-4 max-w-xs mx-auto">{description}</div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg no-underline transition-colors"
        >
          <Plus size={14} /> {action.label}
        </Link>
      )}
    </div>
  )
}
