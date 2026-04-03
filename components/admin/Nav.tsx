import { NavWrapper, NavHamburger } from '@payloadcms/next/client'
import { Logout } from '@payloadcms/ui'
import React from 'react'

import { NavClient } from './NavClient'

const baseClass = 'nav'

export default async function Nav(props: Record<string, unknown>) {
  // Extract user info from Payload's ServerProps
  const user = props?.user as Record<string, unknown> | undefined
  const userName = (user?.name as string) || ''
  const userEmail = (user?.email as string) || ''
  const userRole = (user?.role as string) || 'staff'

  return (
    <NavWrapper baseClass={baseClass}>
      <nav className={`${baseClass}__wrap`}>
        <NavClient
          userName={userName}
          userEmail={userEmail}
          userRole={userRole}
        />
        <div className={`${baseClass}__controls`}>
          <Logout />
        </div>
      </nav>
      <div className={`${baseClass}__header`}>
        <div className={`${baseClass}__header-content`}>
          <NavHamburger baseClass={baseClass} />
        </div>
      </div>
    </NavWrapper>
  )
}
