'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

type ConfirmDialogProps = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open && !loading) onCancel()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, loading, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 font-admin"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={() => !loading && onCancel()}
      />
      <div className="relative bg-card rounded-2xl shadow-xl max-w-sm w-full p-6">
        <div className="flex items-start gap-3 mb-4">
          {destructive && (
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-destructive" />
            </div>
          )}
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
            <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-3.5 py-2 text-[12px] font-semibold bg-sage-soft hover:bg-sage text-foreground rounded-lg transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-[12px] font-semibold rounded-lg transition-colors disabled:opacity-50 ${
              destructive
                ? 'bg-destructive hover:bg-destructive/90 text-white'
                : 'bg-accent hover:bg-accent-deep text-foreground'
            }`}
          >
            {loading ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
