const variants: Record<string, string> = {
  confirmed: 'bg-status-confirmed-bg text-status-confirmed',
  paid: 'bg-status-confirmed-bg text-status-confirmed',
  completed: 'bg-status-confirmed-bg text-status-confirmed',
  available: 'bg-status-confirmed-bg text-status-confirmed',
  pending: 'bg-status-pending-bg text-status-pending',
  cancelled: 'bg-status-cancelled-bg text-status-cancelled',
  failed: 'bg-status-cancelled-bg text-status-cancelled',
  'checked-in': 'bg-status-checked-in-bg text-status-checked-in',
  occupied: 'bg-status-checked-in-bg text-status-checked-in',
  reserved: 'bg-status-checked-in-bg text-status-checked-in',
  blocked: 'bg-status-blocked-bg text-status-blocked',
  maintenance: 'bg-status-maintenance-bg text-status-maintenance',
  'not-ready': 'bg-status-maintenance-bg text-status-maintenance',
  new: 'bg-sage-soft text-sage-deep',
  contacted: 'bg-status-pending-bg text-status-pending',
  closed: 'bg-status-blocked-bg text-status-blocked',
  website: 'bg-sage-soft text-sage-deep',
  booking_com: 'bg-status-checked-in-bg text-status-checked-in',
  mmt: 'bg-status-maintenance-bg text-status-maintenance',
  airbnb: 'bg-status-cancelled-bg text-status-cancelled',
  agoda: 'bg-status-pending-bg text-status-pending',
  goibibo: 'bg-sage-soft text-accent-deep',
  manual: 'bg-status-blocked-bg text-status-blocked',
}

export function StatusBadge({ value }: { value: string }) {
  const cls =
    variants[value.toLowerCase()] || 'bg-sage-soft text-muted-foreground'
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${cls} font-admin`}
    >
      {value.replace(/_/g, ' ').replace(/-/g, ' ')}
    </span>
  )
}
