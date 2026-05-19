import { forwardRef } from 'react'

export const inputClass =
  'w-full px-3 py-2 text-[13px] bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-deep/30 focus:border-accent-deep text-foreground placeholder:text-muted-foreground/60 disabled:opacity-50 disabled:cursor-not-allowed'

type FieldProps = {
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export function Field({ label, hint, error, required, children }: FieldProps) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </span>
        {hint && <span className="text-[10px] text-muted-foreground/70">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
    </label>
  )
}

export const TextInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function TextInput(props, ref) {
    return <input ref={ref} {...props} className={`${inputClass} ${props.className || ''}`} />
  },
)

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea(props, ref) {
    return <textarea ref={ref} {...props} className={`${inputClass} ${props.className || ''}`} />
  },
)

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select(props, ref) {
    return (
      <select ref={ref} {...props} className={`${inputClass} cursor-pointer ${props.className || ''}`}>
        {props.children}
      </select>
    )
  },
)

/** Two-column form row */
export function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
}
