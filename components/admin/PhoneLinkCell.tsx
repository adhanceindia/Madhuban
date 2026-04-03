'use client'

import React from 'react'

type Props = {
  cellData?: string
}

export const PhoneLinkCell: React.FC<Props> = ({ cellData }) => {
  if (!cellData) return <span>—</span>

  return (
    <a
      href={`tel:${cellData}`}
      className="text-blue-600 no-underline hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      {cellData}
    </a>
  )
}

export default PhoneLinkCell
