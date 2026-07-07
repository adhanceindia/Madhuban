'use client'

import { Switch } from '@/components/ui/switch'

type ToggleProps = {
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
  label?: string
  description?: string
}

export function Toggle({ checked, onChange, disabled, label, description }: ToggleProps) {
  if (label || description) {
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-0.5">
          {label && <div className="text-[13px] font-medium text-foreground">{label}</div>}
          {description && (
            <div className="text-[11px] text-muted-foreground">{description}</div>
          )}
        </div>
        <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
      </div>
    )
  }
  return <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
}
