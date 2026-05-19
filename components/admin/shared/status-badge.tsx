const variants: Record<string, string> = {
  confirmed: 'bg-green-50 text-green-700 border-green-200',
  paid: 'bg-green-50 text-green-700 border-green-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-violet-50 text-violet-700 border-violet-200',
  closed: 'bg-gray-50 text-gray-600 border-gray-200',
  website: 'bg-blue-50 text-blue-700 border-blue-200',
  booking_com: 'bg-blue-50 text-blue-700 border-blue-200',
  mmt: 'bg-orange-50 text-orange-700 border-orange-200',
  manual: 'bg-gray-50 text-gray-600 border-gray-200',
}

export function StatusBadge({ value }: { value: string }) {
  const cls = variants[value] || 'bg-gray-50 text-gray-600 border-gray-200'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${cls}`}>
      {value.replace(/_/g, ' ')}
    </span>
  )
}
