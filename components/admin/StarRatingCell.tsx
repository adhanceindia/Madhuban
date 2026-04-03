'use client'

import React from 'react'

type Props = {
  cellData?: number
}

export const StarRatingCell: React.FC<Props> = ({ cellData }) => {
  const rating = cellData ?? 0
  const stars = Array.from({ length: 5 }, (_, i) => (i < rating ? '★' : '☆')).join('')

  return (
    <span className="text-base tracking-wider text-gold">
      {stars}
    </span>
  )
}

export default StarRatingCell
