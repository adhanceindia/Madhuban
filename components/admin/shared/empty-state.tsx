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
    <div className="text-center py-10 px-4">
      <div className="text-muted-foreground/40 mb-3 flex justify-center">{icon}</div>
      <div className="text-sm font-semibold text-foreground mb-1">{title}</div>
      <div className="text-xs text-muted-foreground mb-4">{description}</div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-primary text-white rounded-lg no-underline"
        >
          <Plus size={14} /> {action.label}
        </Link>
      )}
    </div>
  )
}
