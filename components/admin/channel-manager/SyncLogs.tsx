import { Clock, User, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import { ICAL_SOURCE_META, type IcalSource } from '@/lib/ical/types'

type SyncLog = {
  id: number
  source: IcalSource
  feed_url: string
  room_id: number | null
  started_at: string
  finished_at: string | null
  status: 'success' | 'error' | 'partial'
  synced_count: number
  removed_count: number
  error: string | null
  triggered_by: 'cron' | 'manual'
}

const STATUS_STYLES: Record<
  SyncLog['status'],
  { icon: typeof CheckCircle2; cls: string; label: string }
> = {
  success: { icon: CheckCircle2, cls: 'text-status-confirmed', label: 'OK' },
  error: { icon: XCircle, cls: 'text-status-cancelled', label: 'Failed' },
  partial: {
    icon: AlertTriangle,
    cls: 'text-status-pending',
    label: 'Partial',
  },
}

export function SyncLogs({ logs }: { logs: SyncLog[] }) {
  if (logs.length === 0) {
    return (
      <p className="text-[12px] italic text-muted-foreground">
        No sync runs yet. Syncs run automatically every 30 minutes, or trigger
        one manually above.
      </p>
    )
  }

  return (
    <div className="space-y-1.5">
      {logs.map((log) => {
        const Status = STATUS_STYLES[log.status]
        const sourceLabel = ICAL_SOURCE_META[log.source]?.label ?? log.source
        const TriggerIcon = log.triggered_by === 'manual' ? User : Clock
        return (
          <div
            key={log.id}
            className="flex items-start gap-3 border-b border-border/50 py-1.5 last:border-0"
          >
            <Status.icon
              size={14}
              className={`${Status.cls} mt-0.5 flex-shrink-0`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-semibold text-foreground">
                  {sourceLabel}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {log.room_id === null ? 'all rooms' : `room #${log.room_id}`}
                </span>
                <span className={`text-[10px] font-semibold ${Status.cls}`}>
                  {Status.label}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/70">
                  <TriggerIcon size={10} /> {log.triggered_by}
                </span>
              </div>
              {log.status === 'success' ? (
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  +{log.synced_count} synced / −{log.removed_count} removed ·{' '}
                  <span title={formatDateTime(log.started_at)}>
                    {formatRelativeTime(log.started_at)}
                  </span>
                </div>
              ) : (
                <div
                  className="mt-0.5 truncate text-[11px] text-status-cancelled/90"
                  title={log.error || ''}
                >
                  {log.error || 'Sync failed'}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
