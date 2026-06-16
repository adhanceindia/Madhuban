import { getDb } from '@/db/client'
import { auditLog } from '@/db/schema'

type LogAuditParams = {
  user_id: number | null
  action: string
  entity_type: string
  entity_id?: string | number
  old_value?: Record<string, unknown>
  new_value?: Record<string, unknown>
}

// Keys whose values must never be persisted to the audit log in cleartext.
const SECRET_KEY_PATTERN = /(_secret|_key|password|working_key|salt)/i

/**
 * Replace values of secret-looking keys with '[REDACTED]'. Nested plain objects
 * are handled one level deep so diffs like `{ gateways: { razorpay_key_secret } }`
 * are scrubbed too.
 */
function redactSecrets(
  value: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (!value) return null
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(value)) {
    if (SECRET_KEY_PATTERN.test(k)) {
      out[k] = '[REDACTED]'
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      const nested = v as Record<string, unknown>
      const nestedOut: Record<string, unknown> = {}
      for (const [nk, nv] of Object.entries(nested)) {
        nestedOut[nk] = SECRET_KEY_PATTERN.test(nk) ? '[REDACTED]' : nv
      }
      out[k] = nestedOut
    } else {
      out[k] = v
    }
  }
  return out
}

export async function logAudit(params: LogAuditParams) {
  try {
    const db = getDb()
    await db.insert(auditLog).values({
      user_id: params.user_id,
      action: params.action,
      entity_type: params.entity_type,
      entity_id: params.entity_id?.toString(),
      old_value: redactSecrets(params.old_value),
      new_value: redactSecrets(params.new_value),
    })
  } catch (error) {
    console.error('[audit] Failed to log:', error)
  }
}
