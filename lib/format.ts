/**
 * Shared formatting helpers used across the admin panel.
 * Keep all currency / date / number formatting consistent here.
 */

export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatINRCompact(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '—'
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount}`
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-IN').format(value)
}

export function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '—'
  const date = typeof dateStr === 'string'
    ? new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00')
    : dateStr
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateShort(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '—'
  const date = typeof dateStr === 'string'
    ? new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00')
    : dateStr
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function formatDateTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '—'
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatDateRange(start: string | Date, end: string | Date): string {
  return `${formatDateShort(start)} → ${formatDateShort(end)}`
}

export function formatRelativeTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '—'
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  if (isNaN(date.getTime())) return '—'

  const diffMs = Date.now() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return formatDate(date)
}

export function nightsBetween(checkIn: string | Date, checkOut: string | Date): number {
  const ci = typeof checkIn === 'string' ? new Date(checkIn + 'T00:00:00') : checkIn
  const co = typeof checkOut === 'string' ? new Date(checkOut + 'T00:00:00') : checkOut
  return Math.max(1, Math.ceil((co.getTime() - ci.getTime()) / 86400000))
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return toISODate(d)
}
