'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, Loader2, QrCode, ShieldCheck, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

import { FormCard } from '@/components/admin/shared/form-card'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

// Minimal shape of a Supabase MFA factor (the `Factor` type is not re-exported
// from @supabase/supabase-js; we only need these fields).
type Factor = {
  id: string
  friendly_name?: string
  factor_type: string
  status: string
}

type Enrollment = {
  factorId: string
  qrCode: string
  secret: string
}

export function MfaCard() {
  const [loading, setLoading] = useState(true)
  const [factors, setFactors] = useState<Factor[]>([])

  // Active enrollment-in-progress (TOTP secret shown, awaiting verification)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [enrolling, setEnrolling] = useState(false)
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const loadFactors = useCallback(async () => {
    const supabase = createSupabaseBrowserClient('admin')
    const { data, error } = await supabase.auth.mfa.listFactors()
    if (error) {
      toast.error(error.message || 'Could not load MFA factors')
      setLoading(false)
      return
    }
    setFactors(data?.all ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadFactors()
  }, [loadFactors])

  async function startEnrollment() {
    setEnrolling(true)
    const supabase = createSupabaseBrowserClient('admin')
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
    setEnrolling(false)
    if (error || !data) {
      toast.error(error?.message || 'Could not start enrollment')
      return
    }
    setEnrollment({
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    })
    setCode('')
  }

  async function cancelEnrollment() {
    if (!enrollment) return
    const supabase = createSupabaseBrowserClient('admin')
    // Best-effort removal of the unverified factor.
    try {
      await supabase.auth.mfa.unenroll({ factorId: enrollment.factorId })
    } catch {
      /* ignore */
    }
    setEnrollment(null)
    setCode('')
    await loadFactors()
  }

  async function verifyEnrollment(e: React.FormEvent) {
    e.preventDefault()
    if (!enrollment) return
    setVerifying(true)
    const supabase = createSupabaseBrowserClient('admin')
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: enrollment.factorId,
      code: code.trim(),
    })
    setVerifying(false)
    if (error) {
      toast.error(error.message || 'Invalid code, please try again')
      return
    }
    toast.success('Authenticator app added')
    setEnrollment(null)
    setCode('')
    await loadFactors()
  }

  async function unenroll(factorId: string) {
    setRemovingId(factorId)
    const supabase = createSupabaseBrowserClient('admin')
    const { error } = await supabase.auth.mfa.unenroll({ factorId })
    setRemovingId(null)
    if (error) {
      toast.error(error.message || 'Could not remove factor')
      return
    }
    toast.success('Authenticator removed')
    await loadFactors()
  }

  return (
    <FormCard
      title="Two-factor authentication"
      description="Add an authenticator app (TOTP) for an extra layer of security on your account. Optional."
    >
      {loading ? (
        <div className="h-24 rounded-lg bg-muted animate-pulse" />
      ) : (
        <div className="space-y-4">
          {factors.length > 0 && (
            <ul className="space-y-2">
              {factors.map((factor) => (
                <li
                  key={factor.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ShieldCheck size={16} className="text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-foreground truncate">
                        {factor.friendly_name || 'Authenticator app'}
                      </p>
                      <p className="text-[11px] text-muted-foreground capitalize">
                        {factor.factor_type} · {factor.status}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => unenroll(factor.id)}
                    disabled={removingId === factor.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors disabled:opacity-50"
                  >
                    {removingId === factor.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          {enrollment ? (
            <div className="rounded-lg border border-border bg-sage-soft/30 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-foreground">Scan with your authenticator app</h3>
                <button
                  type="button"
                  onClick={cancelEnrollment}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Cancel enrollment"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={enrollment.qrCode}
                  alt="TOTP QR code"
                  className="h-44 w-44 rounded-lg bg-white p-2 border border-border"
                />
                <div className="text-center">
                  <p className="text-[11px] text-muted-foreground mb-1">Or enter this code manually:</p>
                  <code className="text-[12px] font-mono break-all text-foreground">{enrollment.secret}</code>
                </div>
              </div>

              <form onSubmit={verifyEnrollment} className="space-y-3">
                <div>
                  <label htmlFor="mfa-code" className="block text-[12px] font-medium text-foreground mb-1.5">
                    Enter the 6-digit code
                  </label>
                  <input
                    id="mfa-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="123456"
                  />
                </div>
                <button
                  type="submit"
                  disabled={verifying}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-primary text-primary-foreground rounded-lg transition-colors hover:bg-primary-600 disabled:opacity-50"
                >
                  {verifying ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {verifying ? 'Verifying…' : 'Verify & enable'}
                </button>
              </form>
            </div>
          ) : (
            <button
              type="button"
              onClick={startEnrollment}
              disabled={enrolling}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg transition-colors disabled:opacity-50"
            >
              {enrolling ? <Loader2 size={14} className="animate-spin" /> : <QrCode size={14} />}
              {enrolling ? 'Preparing…' : 'Add authenticator app'}
            </button>
          )}
        </div>
      )}
    </FormCard>
  )
}
