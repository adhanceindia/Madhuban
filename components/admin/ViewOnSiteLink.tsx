'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

export const ViewOnSiteLink: React.FC = () => {
  const slug = useFormFields(([fields]) => fields?.slug?.value as string | undefined)

  if (!slug) {
    return (
      <p className="text-muted-foreground text-sm italic">
        Save the room with a slug to see the preview link.
      </p>
    )
  }

  return (
    <a
      href={`/rooms/${slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary-light text-green-800 font-semibold text-sm no-underline border border-green-200 hover:bg-green-100 transition-colors"
    >
      View on Site →
    </a>
  )
}

export default ViewOnSiteLink
