'use client'

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
        <div className="flex-1">
          {label && <div className="text-[13px] font-medium text-foreground">{label}</div>}
          {description && (
            <div className="text-[11px] text-muted-foreground mt-0.5">{description}</div>
          )}
        </div>
        <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
      </div>
    )
  }
  return <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
}

function ToggleSwitch({ checked, onChange, disabled }: { checked: boolean; onChange: (n: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
        checked ? 'bg-accent-deep' : 'bg-border'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
