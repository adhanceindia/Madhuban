// lib/sanitize.ts
export function escapeHtml(input: unknown): string {
  return String(input ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!),
  )
}

/** Strip CR/LF to prevent email header injection in subjects. */
export function stripHeader(input: unknown): string {
  return String(input ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, 120)
}
