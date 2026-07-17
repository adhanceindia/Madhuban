'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { strongPassword } from '@/lib/schemas/users'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  // hasRecovery: arrived via the recovery email link → an active session exists.
  const [hasRecovery, setHasRecovery] = useState(false)

  // Request-email state
  const [email, setEmail] = useState('')
  const [requestSent, setRequestSent] = useState(false)
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestError, setRequestError] = useState('')

  // Set-new-password state
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [updated, setUpdated] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient('admin')

    // The recovery link establishes a session (PASSWORD_RECOVERY event). Detect
    // either the event or an already-restored session.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setHasRecovery(true)
        setChecking(false)
      }
    })

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session) setHasRecovery(true)
      })
      .finally(() => setChecking(false))

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault()
    setRequestError('')
    setRequestLoading(true)

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setRequestError(data.error || 'Something went wrong. Please try again.')
      setRequestLoading(false)
      return
    }

    setRequestSent(true)
    setRequestLoading(false)
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setUpdateError('')

    if (password !== confirm) {
      setUpdateError('Passwords do not match')
      return
    }

    const result = strongPassword.safeParse(password)
    if (!result.success) {
      setUpdateError(result.error.issues[0]?.message || 'Password is too weak')
      return
    }

    setUpdateLoading(true)
    const supabase = createSupabaseBrowserClient('admin')
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setUpdateError(error.message || 'Could not update password')
      setUpdateLoading(false)
      return
    }

    setUpdated(true)
    setUpdateLoading(false)
    setTimeout(() => {
      router.push('/admin')
      router.refresh()
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 font-admin">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Madhuban Garden</h1>
          <p className="text-sm text-muted-foreground mt-1">Reset Password</p>
        </div>

        {checking ? (
          <div className="h-40 rounded-lg bg-muted animate-pulse" />
        ) : hasRecovery ? (
          updated ? (
            <div className="p-3 rounded-lg bg-primary-light text-primary text-sm text-center">
              Password updated. Redirecting…
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              {updateError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {updateError}
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="At least 12 characters"
                />
              </div>

              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-foreground mb-1.5">
                  Confirm password
                </label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Re-enter your new password"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Use at least 12 characters with an uppercase letter, a lowercase letter, a number, and a symbol.
              </p>

              <button
                type="submit"
                disabled={updateLoading}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {updateLoading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          )
        ) : requestSent ? (
          <div className="space-y-4 text-center">
            <div className="p-3 rounded-lg bg-primary-light text-primary text-sm">
              If an account exists for that email, a password reset link has been sent.
            </div>
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleRequest} className="space-y-4">
            {requestError && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {requestError}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@madhubangarden.com"
              />
            </div>

            <button
              type="submit"
              disabled={requestLoading}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {requestLoading ? 'Sending…' : 'Send reset link'}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
