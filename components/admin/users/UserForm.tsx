'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Trash2, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'

import { FormCard } from '@/components/admin/shared/form-card'
import { Field, FormRow, TextInput, Select } from '@/components/admin/shared/form-field'
import { Toggle } from '@/components/admin/shared/toggle'
import { ConfirmDialog } from '@/components/admin/shared/confirm-dialog'
import { ROLE_LABELS } from '@/lib/schemas/users'
import type { User, UserRole } from '@/db/schema/users'

type UserFormProps = {
  user?: User
  currentUserId?: number
}

export function UserForm({ user, currentUserId }: UserFormProps) {
  const router = useRouter()
  const isEdit = !!user
  const isSelf = isEdit && user.id === currentUserId

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [resettingPwd, setResettingPwd] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPwdDialog, setShowPwdDialog] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: (user?.role || 'front_desk') as UserRole,
    is_active: user?.is_active ?? true,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const url = isEdit ? `/api/admin/users/${user.id}` : '/api/admin/users'
      const method = isEdit ? 'PATCH' : 'POST'
      const payload = isEdit
        ? { name: form.name, role: form.role, is_active: form.is_active }
        : form
      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Save failed')
        return
      }
      toast.success(isEdit ? 'User updated' : 'User created')
      router.push('/admin/users')
      router.refresh()
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!isEdit) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Delete failed')
        return
      }
      toast.success('User deleted')
      router.push('/admin/users')
      router.refresh()
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  async function handlePasswordReset() {
    if (!isEdit || !newPassword) return
    setResettingPwd(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/password`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Password reset failed')
        return
      }
      toast.success('Password updated')
      setShowPwdDialog(false)
      setNewPassword('')
    } finally {
      setResettingPwd(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[640px] space-y-5">
      <FormCard title="Account details">
        <FormRow>
          <Field label="Name" required>
            <TextInput
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Anjali Sharma"
            />
          </Field>
          <Field label="Email" required>
            <TextInput
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={isEdit}
              placeholder="anjali@madhubangarden.com"
            />
          </Field>
        </FormRow>

        {!isEdit && (
          <Field label="Password" required hint="Min 8 characters">
            <TextInput
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={8}
            />
          </Field>
        )}

        <Field label="Role" required>
          <Select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
            disabled={isSelf}
          >
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        {isEdit && (
          <Toggle
            checked={form.is_active}
            onChange={(v) => setForm({ ...form, is_active: v })}
            disabled={isSelf}
            label="Active"
            description={
              isSelf
                ? "You cannot deactivate your own account."
                : 'Inactive users cannot sign in.'
            }
          />
        )}
      </FormCard>

      {isEdit && !isSelf && (
        <FormCard title="Reset password" description="Set a new password for this user.">
          <button
            type="button"
            onClick={() => setShowPwdDialog(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold bg-sage-soft hover:bg-sage text-foreground rounded-lg transition-colors"
          >
            <KeyRound size={14} /> Set new password
          </button>
        </FormCard>
      )}

      <div className="flex items-center justify-between pt-2">
        {isEdit && !isSelf ? (
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 size={14} /> Delete user
          </button>
        ) : (
          <div />
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg transition-colors disabled:opacity-50"
        >
          <Save size={14} /> {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create user'}
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        destructive
        title={`Delete ${user?.name || 'user'}?`}
        message="This removes the staff account from both the database and Supabase Auth. They will no longer be able to sign in."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />

      {showPwdDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-admin">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => !resettingPwd && setShowPwdDialog(false)}
          />
          <div className="relative bg-card rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-[15px] font-semibold text-foreground mb-3">Set new password</h3>
            <p className="text-[12px] text-muted-foreground mb-4">
              The user will need to sign in again with this password.
            </p>
            <Field label="New password" required hint="Min 8 characters">
              <TextInput
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                autoFocus
              />
            </Field>
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowPwdDialog(false)
                  setNewPassword('')
                }}
                disabled={resettingPwd}
                className="px-3.5 py-2 text-[12px] font-semibold bg-sage-soft hover:bg-sage text-foreground rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={resettingPwd || newPassword.length < 8}
                className="px-4 py-2 text-[12px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg transition-colors disabled:opacity-50"
              >
                {resettingPwd ? 'Updating...' : 'Update password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
