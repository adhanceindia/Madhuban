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

export async function logAudit(params: LogAuditParams) {
  try {
    const db = getDb()
    await db.insert(auditLog).values({
      user_id: params.user_id,
      action: params.action,
      entity_type: params.entity_type,
      entity_id: params.entity_id?.toString(),
      old_value: params.old_value || null,
      new_value: params.new_value || null,
    })
  } catch (error) {
    console.error('[audit] Failed to log:', error)
  }
}
