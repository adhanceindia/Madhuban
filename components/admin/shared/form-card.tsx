type FormCardProps = {
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function FormCard({ title, description, children, footer }: FormCardProps) {
  return (
    <div className="bg-card rounded-2xl shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
      {(title || description) && (
        <div className="px-6 pt-5 pb-4 border-b border-border/50">
          {title && <h2 className="text-[14px] font-semibold text-foreground">{title}</h2>}
          {description && <p className="text-[12px] text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
      <div className="p-6 space-y-4">{children}</div>
      {footer && <div className="px-6 py-4 border-t border-border/50 bg-sage-soft/30 rounded-b-2xl">{footer}</div>}
    </div>
  )
}
