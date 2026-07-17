import { NextRequest, NextResponse } from 'next/server'
import { ZodError, ZodType, ZodTypeDef } from 'zod'
import { getSession, type SessionUser } from './auth'
import { canAccess } from './permissions'
import { logAudit } from './audit'
import type { UserRole } from '@/db/schema/users'

/**
 * Centralized Route Handler factory. Every admin API route should be wrapped
 * with this to enforce: session check, RBAC, zod validation, error catching,
 * and audit logging.
 */

type HandlerArgs<TBody, TParams> = {
  session: SessionUser
  body: TBody
  params: TParams
  searchParams: URLSearchParams
  request: NextRequest
}

type AuditConfig = {
  action: string
  entityType: string
  entityIdFrom?: 'params' | 'body' | 'result'
  entityIdKey?: string
}

type HandlerOptions<TBody, TParams, TResult> = {
  /** Required roles (uses canAccess if `module` is also provided). */
  auth?: UserRole[]
  /** Module key for permissions.ts canAccess() lookup. */
  module?: string
  /** Zod schema for the request body (skipped for GET/DELETE). */
  schema?: ZodType<TBody, ZodTypeDef, unknown>
  /** Whether to write to audit log on success. */
  audit?: AuditConfig
  /** The actual handler. */
  handler: (args: HandlerArgs<TBody, TParams>) => Promise<TResult>
}

// Mirrors the `RouteContext` type Next.js generates and type-checks route
// handlers against. Params are cast to the handler's TParams internally.
type NextRouteContext = {
  params: Promise<Record<string, string | string[] | undefined>>
}

export function apiHandler<TBody = unknown, TParams = Record<string, string>, TResult = unknown>(
  options: HandlerOptions<TBody, TParams, TResult>,
) {
  return async (request: NextRequest, ctx: NextRouteContext): Promise<NextResponse> => {
    try {
      // 1. Session check
      const session = await getSession('admin')
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // 1b. CSRF: same-origin enforcement for state-changing methods
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        const origin = request.headers.get('origin')
        const host = request.headers.get('host')
        if (origin && new URL(origin).host !== host) {
          return NextResponse.json({ error: 'Cross-origin request blocked' }, { status: 403 })
        }
      }

      // 2. RBAC — module-based check
      if (options.module && !canAccess(session.role, options.module)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      // 3. RBAC — explicit role check (overrides/augments module check)
      if (options.auth && !options.auth.includes(session.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      // 4. Resolve params
      const params = ((await ctx?.params) ?? {}) as unknown as TParams
      const searchParams = request.nextUrl.searchParams

      // 5. Validate body (when applicable)
      let body = {} as TBody
      if (options.schema && request.method !== 'GET' && request.method !== 'DELETE') {
        let rawBody: unknown
        try {
          rawBody = await request.json()
        } catch {
          return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
        }
        const parsed = options.schema.safeParse(rawBody)
        if (!parsed.success) {
          return NextResponse.json(
            { error: parsed.error.issues[0]?.message || 'Validation failed', issues: parsed.error.issues },
            { status: 400 },
          )
        }
        body = parsed.data
      }

      // 6. Run handler
      const result = await options.handler({ session, body, params, searchParams, request })

      // 7. Write audit log
      if (options.audit) {
        let entityId: string | number | undefined
        if (options.audit.entityIdFrom === 'params' && options.audit.entityIdKey) {
          entityId = (params as Record<string, string>)[options.audit.entityIdKey]
        } else if (options.audit.entityIdFrom === 'body' && options.audit.entityIdKey) {
          entityId = (body as Record<string, string | number>)[options.audit.entityIdKey]
        } else if (options.audit.entityIdFrom === 'result' && options.audit.entityIdKey) {
          entityId = (result as Record<string, string | number>)[options.audit.entityIdKey]
        }
        await logAudit({
          user_id: session.id,
          action: options.audit.action,
          entity_type: options.audit.entityType,
          entity_id: entityId,
          new_value: body as Record<string, unknown>,
        })
      }

      return NextResponse.json(result)
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: error.issues[0]?.message || 'Validation failed' },
          { status: 400 },
        )
      }
      console.error('[api-handler] Error:', error)
      const message = error instanceof Error ? error.message : 'Internal server error'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }
}
