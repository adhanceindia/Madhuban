'use client'

import React from 'react'

const statusClasses: Record<string, string> = {
  new: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  closed: 'bg-green-100 text-green-800',
}

type Props = {
  cellData?: string
}

export const StatusBadgeCell: React.FC<Props> = ({ cellData }) => {
  const status = cellData ?? 'new'
  const cls = statusClasses[status] ?? statusClasses.new

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-xl text-xs font-semibold capitalize ${cls}`}>
      {status}
    </span>
  )
}

export default StatusBadgeCell
